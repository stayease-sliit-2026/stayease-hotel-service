import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

// Attach stored JWT token to every request when available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function getErrorMessage(error) {
  return error?.response?.data?.message || error.message || 'Request failed'
}

export async function listHotels(params = {}) {
  try {
    const response = await api.get('/hotels', { params })
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function getHotelById(hotelId) {
  try {
    const response = await api.get(`/hotels/${hotelId}`)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function listHotelRooms(hotelId) {
  try {
    const response = await api.get(`/hotels/${hotelId}/rooms`)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function createHotel(payload) {
  try {
    const response = await api.post('/hotels', payload)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function updateHotel(hotelId, payload) {
  try {
    const response = await api.put(`/hotels/${hotelId}`, payload)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function deleteHotel(hotelId) {
  try {
    const response = await api.delete(`/hotels/${hotelId}`)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function addRoomToHotel(hotelId, payload) {
  try {
    const response = await api.post(`/hotels/${hotelId}/rooms`, payload)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function updateRoom(hotelId, roomId, payload) {
  try {
    const response = await api.put(`/hotels/${hotelId}/rooms/${roomId}`, payload)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function deleteRoom(hotelId, roomId) {
  try {
    const response = await api.delete(`/hotels/${hotelId}/rooms/${roomId}`)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export { BASE_URL }
