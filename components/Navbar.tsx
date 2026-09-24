'use client'

import {useRouter} from 'next/navigation'

export default function Navbar() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.replace('/login')
  }

  return (
    <nav className="flex items-center justify-between bg-white px-6 py-4 shadow">
      <h1 className="text-3xl text-red-500 font-bold sans-serif">Product Admin</h1>

      <button
        type="button"
        onClick={handleLogout}
        className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
      >
        Logout
      </button>
    </nav>
  )
}