import { API_BASE_URL } from './api'

// Add Story / Poetry
export const addStoryPoetry = async (storyPoetryData) => {
const response = await fetch(`${API_BASE_URL}/api/StoryPoetry`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${localStorage.getItem('token')}`
},
body: JSON.stringify(storyPoetryData)
})

return await response.json()
}

// Get My Story / Poetry
export const getMyStoryPoetry = async () => {
const response = await fetch(`${API_BASE_URL}/api/StoryPoetry/my`, {
headers: {
'Authorization': `Bearer ${localStorage.getItem('token')}`
}
})

return await response.json()
}

// Get Story / Poetry by ID
export const getStoryPoetryById = async (id) => {
const response = await fetch(`${API_BASE_URL}/api/StoryPoetry/${id}`, {
headers: {
'Authorization': `Bearer ${localStorage.getItem('token')}`
}
})

return await response.json()
}

// Update Story / Poetry
export const updateStoryPoetry = async (id, storyPoetryData) => {
const response = await fetch(`${API_BASE_URL}/api/StoryPoetry/${id}`, {
method: 'PUT',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${localStorage.getItem('token')}`
},
body: JSON.stringify(storyPoetryData)
})

return await response.json()
}

// Delete Story / Poetry
export const deleteStoryPoetry = async (id) => {
const response = await fetch(`${API_BASE_URL}/api/StoryPoetry/${id}`, {
method: 'DELETE',
headers: {
'Authorization': `Bearer ${localStorage.getItem('token')}`
}
})

return await response.json()
}

// Admin - Get All Story / Poetry
export const getAllStoryPoetry = async () => {
const response = await fetch(`${API_BASE_URL}/api/StoryPoetry/admin/all`, {
headers: {
'Authorization': `Bearer ${localStorage.getItem('token')}`
}
})

return await response.json()
}

// Admin - Approve Story / Poetry
export const approveStoryPoetry = async (id, adminRemarks) => {
const response = await fetch(
`${API_BASE_URL}/api/StoryPoetry/admin/${id}/approve`,
{
method: 'PUT',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${localStorage.getItem('token')}`
},
body: JSON.stringify(adminRemarks)
}
)

return await response.json()
}

// Admin - Reject Story / Poetry
export const rejectStoryPoetry = async (id, adminRemarks) => {
const response = await fetch(
`${API_BASE_URL}/api/StoryPoetry/admin/${id}/reject`,
{
method: 'PUT',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${localStorage.getItem('token')}`
},
body: JSON.stringify(adminRemarks)
}
)

return await response.json()
}
