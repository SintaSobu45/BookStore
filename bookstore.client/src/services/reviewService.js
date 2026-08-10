import { API_BASE_URL } from './api'

// Get all reviews
export const getReviews = async () => {
    const response = await fetch(`${API_BASE_URL}/api/Review`)

    if (!response.ok) {
        throw new Error('Failed to fetch reviews')
    }

    return await response.json()
}


// Get reviews for a specific book
export const getReviewsByBookId = async (bookId) => {
    const response = await fetch(`${API_BASE_URL}/api/Review/book/${bookId}`)

    if (!response.ok) {
        throw new Error('Failed to fetch book reviews')
    }

    return await response.json()
}


// Get review by ID
export const getReviewById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/Review/${id}`)

    if (!response.ok) {
        throw new Error('Review not found')
    }

    return await response.json()
}


// Add a review
export const addReview = async (reviewData) => {
    const response = await fetch(`${API_BASE_URL}/api/Review`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message || 'Failed to add review'
        )
    }

    return data
}


// Update a review
export const updateReview = async (id, reviewData) => {
    const response = await fetch(`${API_BASE_URL}/api/Review/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message || 'Failed to update review'
        )
    }

    return data
}


// Delete a review
export const deleteReview = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/Review/${id}`, {
        method: 'DELETE'
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message || 'Failed to delete review'
        )
    }

    return data
}