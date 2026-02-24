/**
 * Base44 API client – wired to your backend.
 *
 * All entities expose:
 *   - list()    -> GET    /resource
 *   - create()  -> POST   /resource
 *   - get(id)   -> GET    /resource/:id
 *   - update(id, data) -> PUT /resource/:id
 *   - delete(id)       -> DELETE /resource/:id
 *
 * Base URL is read from Vite env:
 *   VITE_API_BASE_URL=http://localhost:5000
 */

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000'

/**
 * Helper that unwraps the common `{ success, data }` shape
 * used by the backend. Adjust if your responses differ.
 */
async function handleResponse(response) {
  const json = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      (json && (json.message || json.error)) ||
      `Request failed with status ${response.status}`
    throw new Error(message)
  }

  // Most endpoint return { success, data, ... }
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data
  }

  return json
}

function createResourceClient(path) {
  const basePath = path.startsWith('/') ? path : `/${path}`

  return {
    async list(params) {
      const url = new URL(`${API_BASE}${basePath}`)
      if (params != null) {
        if (typeof params === 'string') {
          url.searchParams.set('sort', params)
        } else if (typeof params === 'object') {
          Object.entries(params).forEach(([key, value]) => {
            if (value != null) url.searchParams.set(key, String(value))
          })
        }
      }

      const res = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      })
      return handleResponse(res)
    },

    async create(payload) {
      const res = await fetch(`${API_BASE}${basePath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload ?? {}),
      })
      return handleResponse(res)
    },

    async get(id) {
      if (!id) throw new Error('id is required for get()')
      const res = await fetch(`${API_BASE}${basePath}/${id}`, {
        method: 'GET',
        credentials: 'include',
      })
      return handleResponse(res)
    },

    async update(id, payload) {
      if (!id) throw new Error('id is required for update()')
      const res = await fetch(`${API_BASE}${basePath}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload ?? {}),
      })
      return handleResponse(res)
    },

    async delete(id) {
      if (!id) throw new Error('id is required for delete()')
      const res = await fetch(`${API_BASE}${basePath}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      return handleResponse(res)
    },
  }
}

// Map your logical entities to real backend routes.
// Adjust the paths below if your backend uses different URLs.
export const base44 = {
  entities: {
    // Existing backend route: /api/apartments
    Apartment: createResourceClient('/api/apartments'),

    // The following assume you will create matching backend routes.
    // e.g. /api/apartment-reservations, /api/clients, etc.
    ApartmentReservation: createResourceClient('/api/apartment-reservations'),
    Client: createResourceClient('/api/clients'),
    Sale: createResourceClient('/api/sales'),
    Payment: createResourceClient('/api/payments'),
    Receipt: createResourceClient('/api/receipts'),
    DefaultedSale: createResourceClient('/api/defaulted-sales'),
  },
}
