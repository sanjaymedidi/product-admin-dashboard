import api from '../lib/axios'

export interface LoginCredentials {
  username: string
  password: string
}

export const loginUser = async (
  credentials: LoginCredentials,
) => {
  const response = await api.post('/auth/login', credentials)

  return response.data
}