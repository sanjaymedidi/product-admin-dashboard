```tsx
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
        setError('Unable to load products.')
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
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-blue-600">
              Administration
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Products
            </h1>

            <p className="mt-2 text-slate-500">
              Manage and monitor your product inventory.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push('/products/add')}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
            >
              + Add Product
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Search / Toolbar */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search products by name..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="text-slate-500">
              Loading products...
            </p>
          </div>
        )}

        {/* Products */}
        {!isLoading && !error && (
          <>
            {products.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-16 text-center shadow-sm">
                <div className="mb-4 text-5xl">
                  📦
                </div>

                <h2 className="text-xl font-semibold text-slate-900">
                  No products found
                </h2>

                <p className="mt-2 text-slate-500">
                  Try changing your search.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {products.map(product => (
                  <div
                    key={product.id}
                    className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >

                    {/* Image */}
                    <div className="relative flex h-52 items-center justify-center bg-slate-100 p-6">
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                      />

                      <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                        #{product.id}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5">

                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                        {product.category}
                      </span>

                      <h2 className="mt-3 line-clamp-2 min-h-[3.5rem] text-lg font-bold text-slate-900">
                        {product.title}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {product.description}
                      </p>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Price
                          </p>

                          <p className="mt-1 text-xl font-bold text-slate-900">
                            ${product.price}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Rating
                          </p>

                          <p className="mt-1 font-semibold text-amber-500">
                            ★ {product.rating}
                          </p>
                        </div>

                      </div>

                      <div className="mt-4">
                        {product.stock > 0 ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            ● {product.stock} in stock
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                            ● Out of stock
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
                        className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                      >
                        View Product
                      </button>

                    </div>
                  </div>
                ))}

              </div>
            )}

            {/* Pagination */}
            <div className="mt-10 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">

              <button
                type="button"
                disabled={page === 1}
                onClick={() =>
                  setPage(current => current - 1)
                }
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              <div className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                Page {page}
              </div>

              <button
                type="button"
                disabled={products.length < limit}
                onClick={() =>
                  setPage(current => current + 1)
                }
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>

            </div>
          </>
        )}

      </main>
    </div>
  )
}
```
