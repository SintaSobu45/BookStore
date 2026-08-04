import { API_BASE_URL } from './api'

// Get all books
export const getBooks = async () => {
  const response = await fetch(`${API_BASE_URL}/Book`)

  if (!response.ok) {
    throw new Error('Failed to fetch books')
  }

  return await response.json()
}

// Get book by ID
export const getBookById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/Book/${id}`)

  if (!response.ok) {
    throw new Error('Book not found')
  }

  return await response.json()
}

// Add book
export const createBook = async (bookData) => {
  const response = await fetch(`${API_BASE_URL}/Book`, {
    method: 'POST',
    body: bookData
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to create book'
    )
  }

  return data
}

// Update book
export const updateBook = async (id, bookData) => {
  const response = await fetch(`${API_BASE_URL}/Book/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookData)
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to update book'
    )
  }

  return data
}

// Delete book
export const deleteBook = async (id) => {
  const response = await fetch(`${API_BASE_URL}/Book/${id}`, {
    method: 'DELETE'
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to delete book'
    )
  }

  return data
}