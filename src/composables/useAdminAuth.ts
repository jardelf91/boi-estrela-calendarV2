import { ref, computed } from 'vue'

declare global {
  interface Window {
    google: any
  }
}

const BIOMETRIC_KEY = 'boi_admin_cred'
const SESSION_ADMIN_KEY = 'boi_admin'
const SESSION_TOKEN_KEY = 'boi_gtoken'
const SESSION_EXPIRY_KEY = 'boi_gtoken_exp'

// Restaura sessão ao carregar a página
const storedAdmin = localStorage.getItem(SESSION_ADMIN_KEY) === '1'
const storedToken = localStorage.getItem(SESSION_TOKEN_KEY)
const storedExpiry = parseInt(localStorage.getItem(SESSION_EXPIRY_KEY) ?? '0', 10)
const tokenStillValid = !!storedToken && Date.now() < storedExpiry

const isAdmin = ref(storedAdmin)
const accessToken = ref<string | null>(tokenStillValid ? storedToken : null)
let tokenExpiry = tokenStillValid ? storedExpiry : 0

function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve()
      return
    }
    if (document.getElementById('gsi-script')) {
      let attempts = 0
      const check = setInterval(() => {
        attempts++
        if (window.google?.accounts?.oauth2) {
          clearInterval(check)
          resolve()
        } else if (attempts > 50) {
          clearInterval(check)
          reject(new Error('Timeout ao carregar Google Identity Services'))
        }
      }, 100)
      return
    }
    const script = document.createElement('script')
    script.id = 'gsi-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Falha ao carregar Google Identity Services'))
    document.head.appendChild(script)
  })
}

export async function isBiometricAvailable(): Promise<boolean> {
  if (!window.PublicKeyCredential) return false
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

export function hasBiometricRegistered(): boolean {
  return !!localStorage.getItem(BIOMETRIC_KEY)
}

export async function registerBiometric(): Promise<void> {
  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'Boi Estrela Admin' },
      user: {
        id: new TextEncoder().encode('boi-estrela-admin'),
        name: 'admin',
        displayName: 'Admin',
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },
        { alg: -257, type: 'public-key' },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
    },
  })) as PublicKeyCredential

  const id = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)))
  localStorage.setItem(BIOMETRIC_KEY, id)
}

export async function authenticateWithBiometric(): Promise<boolean> {
  const stored = localStorage.getItem(BIOMETRIC_KEY)
  if (!stored) return false
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32))
    const rawId = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0))
    await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{ id: rawId, type: 'public-key' }],
        userVerification: 'required',
        timeout: 60000,
      },
    })
    isAdmin.value = true
    localStorage.setItem(SESSION_ADMIN_KEY, '1')
    return true
  } catch {
    return false
  }
}

export function useAdminAuth() {
  function validatePin(pin: string): boolean {
    if (pin === import.meta.env.VITE_ADMIN_PIN) {
      isAdmin.value = true
      localStorage.setItem(SESSION_ADMIN_KEY, '1')
      return true
    }
    return false
  }

  async function connectGoogle(): Promise<void> {
    if (!window.google?.accounts?.oauth2) {
      await loadGisScript()
    }
    return new Promise((resolve, reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
        scope: 'https://www.googleapis.com/auth/calendar.events',
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error))
            return
          }
          accessToken.value = response.access_token
          tokenExpiry = Date.now() + response.expires_in * 1000
          localStorage.setItem(SESSION_TOKEN_KEY, response.access_token)
          localStorage.setItem(SESSION_EXPIRY_KEY, String(tokenExpiry))
          resolve()
        },
      })
      client.requestAccessToken({ prompt: 'select_account' })
    })
  }

  function logout() {
    if (accessToken.value && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(accessToken.value)
    }
    isAdmin.value = false
    accessToken.value = null
    tokenExpiry = 0
    localStorage.removeItem(SESSION_ADMIN_KEY)
    localStorage.removeItem(SESSION_TOKEN_KEY)
    localStorage.removeItem(SESSION_EXPIRY_KEY)
  }

  const isTokenValid = computed(() => !!accessToken.value && Date.now() < tokenExpiry)

  return { isAdmin, accessToken, isTokenValid, validatePin, connectGoogle, logout }
}
