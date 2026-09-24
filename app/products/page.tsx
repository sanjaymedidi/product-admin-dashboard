'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import Navbar from '../../components/Navbar'
import {
  getProducts,
  searchProducts,
} from '../../services/productApi'

interface Product {
  id: number
  title: string
  description: string
  category: string
  price: number
  rating: number
  stock: number
  thumbnail: string
}

interface ProductsResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}

export default function ProductsPage() {
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const limit = 12

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      router.replace('/login')
    }
  }, [router])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true)
        setError('')

        const skip = (page - 1) * limit

        let data: ProductsResponse

        if (search.trim()) {
          data = await searchProducts({
            query: search,
            limit,
            skip,
          })
        } else {
          data = await getProducts({
            limit,
            skip,
          })
        }

        setProducts(data.products)
      } catch (err) {
        console.error(err)
        setError('Failed to load products. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [page, search])

  const handleSearch = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearch(event.target.value)
    setPage(1)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.replace('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Product Dashboard
              </h1>

              <p className="mt-1 text-gray-600">
                Manage your products
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/products/add')}
                className="rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
              >
                + Add Product
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6 rounded-xl bg-white p-4 shadow">
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search products..."
              className="w-full rounded-lg border border-gray-300 p-3 text-black outline-none focus:border-black"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="rounded-xl bg-white p-10 text-center shadow">
              <p className="text-lg text-gray-600">
                Loading products...
              </p>
            </div>
          )}

          {/* Products */}
          {!isLoading && !error && (
            <>
              {products.length === 0 ? (
                <div className="rounded-xl bg-white p-10 text-center shadow">
                  <p className="text-lg text-gray-600">
                    No products found.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map(product => (
                    <div
                      key={product.id}
                      className="overflow-hidden rounded-xl bg-white shadow transition hover:shadow-lg"
                    >
                      {/* Image */}
                      <div className="flex h-48 items-center justify-center bg-gray-100 p-4">
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="h-full w-full object-contain"
                        />
                      </div>

                      {/* Details */}
                      <div className="p-5">
                        <p className="text-sm font-medium uppercase text-gray-500">
                          {product.category}
                        </p>

                        <h2 className="mt-2 line-clamp-2 text-lg font-bold text-gray-900">
                          {product.title}
                        </h2>

                        <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                          {product.description}
                        </p>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xl font-bold text-gray-900">
                            ${product.price}
                          </span>

                          <span className="rounded-lg bg-yellow-100 px-2 py-1 text-sm font-medium text-yellow-800">
                            ⭐ {product.rating}
                          </span>
                        </div>

                        <div className="mt-3">
                          {product.stock > 0 ? (
                            <span className="text-sm font-medium text-green-600">
                              {product.stock} in stock
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-red-600">
                              Out of stock
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/products/${product.id}`,
                            )
                          }
                          className="mt-5 w-full rounded-lg bg-black px-4 py-3 font-semibold text-white hover:bg-gray-800"
                        >
                          View Product
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() =>
                    setPage(current => current - 1)
                  }
                  className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous
                </button>

                <span className="font-medium text-gray-700">
                  Page {page}
                </span>

                <button
                  type="button"
                  disabled={products.length < limit}
                  onClick={() =>
                    setPage(current => current + 1)
                  }
                  className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
