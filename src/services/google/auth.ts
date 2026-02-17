import { APP_CONFIG } from '../../config'
import type { AuthUser } from '../../types'

interface TokenResponse {
  access_token: string
  expires_in?: number
  error?: string
  error_description?: string
}

interface TokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (options: {
            client_id: string
            scope: string
            callback: (response: TokenResponse) => void
          }) => TokenClient
          revoke: (token: string, callback?: () => void) => void
        }
      }
    }
  }
}

let scriptPromise: Promise<void> | null = null

function loadGoogleScript(): Promise<void> {
  if (scriptPromise) {
    return scriptPromise
  }

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Nie udało się załadować Google Identity Services.'))
    document.head.appendChild(script)
  })

  return scriptPromise
}

async function getUserProfile(accessToken: string): Promise<AuthUser> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Nie udało się pobrać danych użytkownika Google.')
  }

  const data = (await response.json()) as { email?: string; name?: string; picture?: string }

  if (!data.email || !data.name) {
    throw new Error('Brak wymaganych danych użytkownika Google.')
  }

  return {
    email: data.email.toLowerCase(),
    name: data.name,
    picture: data.picture,
  }
}

export async function login(): Promise<{
  accessToken: string
  email: string
  name: string
  picture?: string
  expiresInSeconds: number
}> {
  await loadGoogleScript()

  if (!window.google?.accounts.oauth2) {
    throw new Error('Google OAuth nie jest dostępny.')
  }

  const tokenResult = await new Promise<{ accessToken: string; expiresInSeconds: number }>((resolve, reject) => {
    const tokenClient = window.google?.accounts.oauth2.initTokenClient({
      client_id: APP_CONFIG.oauthClientId,
      scope: APP_CONFIG.oauthScopes.join(' '),
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error_description || 'Błąd logowania Google.'))
          return
        }

        if (!response.access_token) {
          reject(new Error('Google nie zwrócił tokenu dostępu.'))
          return
        }

        resolve({
          accessToken: response.access_token,
          expiresInSeconds: response.expires_in ?? 3600,
        })
      },
    })

    if (!tokenClient) {
      reject(new Error('Nie udało się utworzyć klienta OAuth.'))
      return
    }

    tokenClient.requestAccessToken({ prompt: 'consent' })
  })

  const user = await getUserProfile(tokenResult.accessToken)

  return {
    accessToken: tokenResult.accessToken,
    email: user.email,
    name: user.name,
    picture: user.picture,
    expiresInSeconds: tokenResult.expiresInSeconds,
  }
}

export function logout(accessToken?: string): void {
  if (!accessToken) {
    return
  }

  window.google?.accounts.oauth2.revoke(accessToken)
}
