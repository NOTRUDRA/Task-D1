const API_BASE_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:5000')
    .replace(/\/+$/, '')

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('authToken')

  const headers = {
    ...options.headers,
  }

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const endpoint = path.startsWith('/')
    ? path
    : `/${path}`

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  )

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(
      data.message || `Request failed with status ${response.status}`
    )

    error.status = response.status

    throw error
  }

  return data
}