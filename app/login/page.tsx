'use client'

import {FormEvent, useState} from 'react'
import {useRouter} from 'next/navigation'
import {loginUser} from '../../services/authApi'

export default function LoginPage() {
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Prevent multiple requests from rapid clicks
    if (isLoading) {
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const data = await loginUser({
        username,
        password,
      })

      // Store the token for authenticated API requests
      localStorage.setItem('token', data.accessToken)

      // Go to products page after successful login
      router.push('/products')
    } catch {
      setError('Invalid username or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-4xl font-bold text-red-500">
          Product Admin
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="mb-1 block font-medium text-black"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={event => setUsername(event.target.value)}
              placeholder="Enter username"
              className="w-full rounded-lg border-none p-3 outline-none focus:ring-2 text-black"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block font-medium text-black"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Enter password"
              className="w-full rounded-lg border-none p-3 outline-none focus:ring-2 text-black"
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-black p-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  )
}