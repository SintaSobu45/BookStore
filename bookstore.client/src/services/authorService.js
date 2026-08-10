import { API_BASE_URL } from './api'

// Get all authors
export const getAuthors = async () => {
  const response = await fetch(`${API_BASE_URL}/api/Author`)

  if (!response.ok) {
    throw new Error('Failed to fetch authors')
  }

  return await response.json()
}

// Get author by ID
export const getAuthorById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/Author/${id}`)

  if (!response.ok) {
    throw new Error('Author not found')
  }

  return await response.json()
}

// Create author
export const createAuthor = async (authorData) => {
  const response = await fetch(`${API_BASE_URL}/api/Author`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(authorData)
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data || 'Failed to create author')
  }

  return data
}

// Update author
export const updateAuthor = async (id, authorData) => {
  const response = await fetch(`${API_BASE_URL}/api/Author/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(authorData)
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data || 'Failed to update author')
  }

  return data
}

// Delete author
export const deleteAuthor = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/Author/${id}`, {
    method: 'DELETE'
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data || 'Failed to delete author')
  }

  return data
}