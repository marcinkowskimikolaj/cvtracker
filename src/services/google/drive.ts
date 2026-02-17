import type { DriveFolderValidation, FileType, ProfileId } from '../../types'

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder'

interface DriveItem {
  id: string
  name: string
  mimeType: string
  webViewLink?: string
}

async function driveRequest<T>(
  accessToken: string,
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers || {}),
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Błąd Drive API (${response.status}): ${text}`)
  }

  return (await response.json()) as T
}

export async function listChildren(accessToken: string, parentId: string): Promise<DriveItem[]> {
  const query = encodeURIComponent(`'${parentId}' in parents and trashed = false`)
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,webViewLink)&pageSize=1000`
  const payload = await driveRequest<{ files?: DriveItem[] }>(accessToken, url)
  return payload.files ?? []
}

function resolveFileTypeFolder(fileType: FileType): string {
  switch (fileType) {
    case 'cv':
      return 'cv'
    case 'cover_letter':
      return 'cover-letters'
    case 'recommendation':
      return 'recommendations'
    case 'reference_letter':
      return 'recommendations'
    case 'other':
      return 'other'
    default:
      return 'other'
  }
}

async function findFolderByName(
  accessToken: string,
  parentId: string,
  folderName: string,
): Promise<DriveItem | null> {
  const query = encodeURIComponent(
    `'${parentId}' in parents and trashed = false and mimeType = '${FOLDER_MIME_TYPE}' and name = '${folderName}'`,
  )
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType)&pageSize=1`
  const payload = await driveRequest<{ files?: DriveItem[] }>(accessToken, url)
  return payload.files?.[0] ?? null
}

export async function resolveUploadFolderId(
  accessToken: string,
  rootFolderId: string,
  profileId: ProfileId,
  fileType: FileType,
): Promise<string> {
  const profileFolder = await findFolderByName(accessToken, rootFolderId, profileId)
  if (!profileFolder) {
    throw new Error(`Brakuje folderu profilu: ${profileId}`)
  }

  const targetName = resolveFileTypeFolder(fileType)
  const typeFolder = await findFolderByName(accessToken, profileFolder.id, targetName)

  if (!typeFolder) {
    throw new Error(`Brakuje folderu typu pliku: ${profileId}/${targetName}`)
  }

  return typeFolder.id
}

export async function uploadFile(params: {
  accessToken: string
  file: File
  fileName: string
  parentFolderId: string
}): Promise<{ driveFileId: string; driveUrl: string }> {
  const boundary = `cvtracker-${Date.now()}`
  const metadata = {
    name: params.fileName,
    parents: [params.parentFolderId],
  }

  const delimiter = `--${boundary}`
  const closeDelimiter = `--${boundary}--`

  const body = new Blob([
    `${delimiter}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
    `${delimiter}\r\nContent-Type: ${params.file.type || 'application/octet-stream'}\r\n\r\n`,
    params.file,
    `\r\n${closeDelimiter}`,
  ])

  const url =
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink'

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Błąd uploadu do Drive (${response.status}): ${text}`)
  }

  const payload = (await response.json()) as { id?: string; webViewLink?: string }

  if (!payload.id) {
    throw new Error('Drive nie zwrócił ID pliku po uploadzie.')
  }

  return {
    driveFileId: payload.id,
    driveUrl: payload.webViewLink ?? `https://drive.google.com/file/d/${payload.id}/view`,
  }
}

export async function deleteFile(accessToken: string, driveFileId: string): Promise<void> {
  const url = `https://www.googleapis.com/drive/v3/files/${driveFileId}`
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Błąd usuwania pliku z Drive (${response.status}): ${text}`)
  }
}

export async function validateDriveStructure(
  accessToken: string,
  rootFolderId: string,
): Promise<DriveFolderValidation> {
  const required: Array<{ profile: ProfileId; folders: string[] }> = [
    { profile: 'mikolaj', folders: ['cv', 'cover-letters', 'recommendations', 'other'] },
    { profile: 'emilka', folders: ['cv', 'cover-letters', 'recommendations', 'other'] },
  ]

  const missingFolders: string[] = []
  const rootChildren = await listChildren(accessToken, rootFolderId)

  required.forEach(({ profile }) => {
    const profileFolder = rootChildren.find(
      (item) => item.mimeType === FOLDER_MIME_TYPE && item.name === profile,
    )

    if (!profileFolder) {
      missingFolders.push(profile)
    }
  })

  for (const { profile, folders } of required) {
    const profileFolder = rootChildren.find(
      (item) => item.mimeType === FOLDER_MIME_TYPE && item.name === profile,
    )

    if (!profileFolder) {
      folders.forEach((folder) => missingFolders.push(`${profile}/${folder}`))
      continue
    }

    const profileChildren = await listChildren(accessToken, profileFolder.id)
    folders.forEach((folder) => {
      const exists = profileChildren.some(
        (item) => item.mimeType === FOLDER_MIME_TYPE && item.name === folder,
      )
      if (!exists) {
        missingFolders.push(`${profile}/${folder}`)
      }
    })
  }

  return {
    rootExists: true,
    missingFolders,
  }
}
