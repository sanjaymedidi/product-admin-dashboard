'use client'

import {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'

import Navbar from '../../components/Navbar'
import Pagination from '../../components/Pagination'
import SearchBar from '../../components/SearchBar'

import {
  getProducts,
  searchProducts,
  getProductsByCategory,
} from '../../services/productApi'

import {getCategories} from '../../services/categoryApi'

import {
  applyLocalChanges,
  getAddedProductsForDisplay,
} from '../../utils/localProducts'

interface Product {
  id: number
  title: string
  category: string
  price: number
  rating: number
  stock: number
  thumbnail: string
}

const validLimits = [10, 20, 50]

const validSorts = [
  'price-asc',
  'price-desc',
  'rating-asc',
  'rating-desc',
  'title-asc',
  'title-desc',
]

const getInitialNumber = (
  parameter: string,
  defaultValue: number,
) => {
  if (typeof window === 'undefined') {
    return defaultValue
  }

  const value = Number(
    new URLSearchParams(
      window.location.search,
    ).get(parameter),
  )

  return Number.isInteger(value) && value > 0
    ? value
    : defaultValue
}

const getInitialString = (
  parameter: string,
) => {
  if (typeof window === 'undefined') {
    return ''
  }

  return (
    new URLSearchParams(
      window.location.search,
    ).get(parameter) || ''
  )
}

export default function ProductsPage() {
  const router = useRouter()

  const [products, setProducts] =
    useState<Product[]>([])

  const [categories, setCategories] =
    useState<string[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] = useState('')

  const [page, setPage] = useState(() => {
    return getInitialNumber('page', 1)
  })

  const [limit, setLimit] = useState(() => {
    const value = getInitialNumber(
      'limit',
      10,
    )

    return validLimits.includes(value)
      ? value
      : 10
  })

  const [total, setTotal] = useState(0)

  const [search, setSearch] = useState(() => {
    return getInitialString('search')
  })

  const [category, setCategory] = useState(() => {
    return getInitialString('category')
  })

  const [sortBy, setSortBy] = useState(() => {
    const value = getInitialString('sort')

    return validSorts.includes(value)
      ? value
      : ''
  })

  /*
    Check login
  */
  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      router.replace('/login')
    }
  }, [router])

  /*
    Keep page, search, filter,
    sort and page size in URL
  */
  useEffect(() => {
    const params = new URLSearchParams()

    params.set('page', String(page))
    params.set('limit', String(limit))

    if (search.trim()) {
      params.set('search', search.trim())
    }

    if (category) {
      params.set('category', category)
    }

    if (sortBy) {
      params.set('sort', sortBy)
    }

    window.history.replaceState(
      null,
      '',
      `/products?${params.toString()}`,
    )
  }, [
    page,
    limit,
    search,
    category,
    sortBy,
  ])

  /*
    Load categories
  */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories()

        const categoryNames = data.map(
          (item: {slug: string}) =>
            item.slug,
        )

        setCategories(categoryNames)

        if (
          category &&
          !categoryNames.includes(category)
        ) {
          setCategory('')
          setPage(1)
        }
      } catch {
        console.error(
          'Failed to load categories',
        )
      }
    }

    loadCategories()
  }, [category])

  /*
    Load products
  */
  useEffect(() => {
    const controller =
      new AbortController()

    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        setError('')

        let data

        /*
          Search has priority over
          category filtering.
        */
        if (search.trim()) {
          data = await searchProducts({
            query: search.trim(),
            limit,
            skip: (page - 1) * limit,
            signal: controller.signal,
          })
        } else if (category) {
          data =
            await getProductsByCategory({
              category,
              limit,
              skip: (page - 1) * limit,
              signal: controller.signal,
            })
        } else {
          data = await getProducts({
            limit,
            skip: (page - 1) * limit,
            signal: controller.signal,
          })
        }

        /*
          Validate page number.
        */
        const totalPages = Math.ceil(
          data.total / limit,
        )

        if (
          data.total > 0 &&
          page > totalPages
        ) {
          setPage(totalPages)
          return
        }

        if (
          data.total === 0 &&
          page !== 1
        ) {
          setPage(1)
          return
        }

        /*
          Apply local changes.

          This handles:
          - Edited products
          - Deleted products
        */
        let newProducts: Product[] =
          applyLocalChanges(
            data.products,
          )

        /*
          Add locally-created products
          to the first normal products page.

          We don't add them to search/category
          results because DummyJSON cannot
          search our local products.
        */
        const localAddedProducts =
          getAddedProductsForDisplay()

        if (
          page === 1 &&
          !search.trim() &&
          !category
        ) {
          newProducts = [
            ...localAddedProducts,
            ...newProducts,
          ]
        }

        /*
          Client-side sorting
        */
        if (sortBy) {
          newProducts = [
            ...newProducts,
          ].sort((a, b) => {
            switch (sortBy) {
              case 'price-asc':
                return a.price - b.price

              case 'price-desc':
                return b.price - a.price

              case 'rating-asc':
                return a.rating - b.rating

              case 'rating-desc':
                return b.rating - a.rating

              case 'title-asc':
                return a.title.localeCompare(
                  b.title,
                )

              case 'title-desc':
                return b.title.localeCompare(
                  a.title,
                )

              default:
                return 0
            }
          })
        }

        setProducts(newProducts)

        /*
          Include locally added products
          in the displayed total.
        */
        const addedCount =
          !search.trim() && !category
            ? localAddedProducts.length
            : 0

        setTotal(
          data.total + addedCount,
        )
      } catch (error) {
        /*
          Ignore cancelled requests.

          This prevents an old search request
          from replacing the latest result.
        */
        if (
          error instanceof Error &&
          error.name === 'CanceledError'
        ) {
          return
        }

        setError(
          'Failed to load products',
        )
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setIsLoading(false)
        }
      }
    }

    /*
      500ms debounce for search.
    */
    const timer = setTimeout(() => {
      fetchProducts()
    }, 500)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [
    search,
    category,
    sortBy,
    page,
    limit,
  ])

  /*
    Search
  */
  const handleSearchChange = (
    value: string,
  ) => {
    setSearch(value)
    setPage(1)
  }

  /*
    Category
  */
  const handleCategoryChange = (
    value: string,
  ) => {
    setCategory(value)
    setPage(1)
  }

  /*
    Sorting
  */
  const handleSortChange = (
    value: string,
  ) => {
    setSortBy(value)
    setPage(1)
  }

  /*
    Page size
  */
  const handleLimitChange = (
    newLimit: number,
  ) => {
    setLimit(newLimit)
    setPage(1)
  }

  /*
    Page
  */
  const handlePageChange = (
    newPage: number,
  ) => {
    setPage(newPage)
  }

  /*
    Retry
  */
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <main className="p-4 sm:p-6">

        {/* Header */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="text-3xl font-bold text-gray-900">
              Products
            </h2>

            <p className="mt-1 text-gray-600">
              Manage your products
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                '/products/add',
              )
            }
            className="w-full rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800 sm:w-auto"
          >
            + Add Product
          </button>

        </div>

        {/* Search / Filter / Sort */}

        <SearchBar
          value={search}
          onChange={
            handleSearchChange
          }
          category={category}
          categories={categories}
          onCategoryChange={
            handleCategoryChange
          }
          sortBy={sortBy}
          onSortChange={
            handleSortChange
          }
        />

        {/* Loading */}

        {isLoading && (
          <div className="rounded-lg bg-white p-8 text-center shadow">

            <p className="text-lg text-gray-700">
              Loading products...
            </p>

          </div>
        )}

        {/* Error */}

        {!isLoading && error && (
          <div className="rounded-lg bg-white p-8 text-center shadow">

            <p className="mb-4 text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={handleRetry}
              className="rounded-lg bg-black px-5 py-2 text-white hover:bg-gray-800"
            >
              Retry
            </button>

          </div>
        )}

        {/* Empty */}

        {!isLoading &&
          !error &&
          products.length === 0 && (
            <div className="rounded-lg bg-white p-8 text-center shadow">

              <p className="text-gray-600">
                No products found.
              </p>

            </div>
          )}

        {/* Products */}

        {!isLoading &&
          !error &&
          products.length > 0 && (
            <>

              {/* Desktop Table */}

              <div className="hidden overflow-x-auto rounded-lg bg-white shadow md:block">

                <table className="w-full min-w-[800px]">

                  <thead className="bg-gray-100">

                    <tr>

                      <th className="p-4 text-left text-orange-500">
                        Product
                      </th>

                      <th className="p-4 text-left text-orange-500">
                        Category
                      </th>

                      <th className="p-4 text-left text-orange-500">
                        Price
                      </th>

                      <th className="p-4 text-left text-orange-500">
                        Rating
                      </th>

                      <th className="p-4 text-left text-orange-500">
                        Stock
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {products.map(
                      product => (
                        <tr
                          key={
                            product.id
                          }
                          className="border-t hover:bg-gray-50"
                        >

                          <td className="p-4">

                            <div className="flex items-center gap-4">

                              <img
                                src={
                                  product.thumbnail
                                }
                                alt={
                                  product.title
                                }
                                className="h-14 w-14 rounded-lg object-cover"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/products/${product.id}`,
                                  )
                                }
                                className="text-left font-medium text-gray-900 hover:underline"
                              >
                                {
                                  product.title
                                }
                              </button>

                            </div>

                          </td>

                          <td className="p-4 capitalize text-gray-700">
                            {
                              product.category
                            }
                          </td>

                          <td className="p-4 text-gray-700">
                            $
                            {
                              product.price
                            }
                          </td>

                          <td className="p-4 text-gray-700">
                            ⭐{' '}
                            {
                              product.rating
                            }
                          </td>

                          <td className="p-4 text-gray-700">
                            {
                              product.stock
                            }
                          </td>

                        </tr>
                      ),
                    )}

                  </tbody>

                </table>

              </div>

              {/* Mobile Cards */}

              <div className="space-y-4 md:hidden">

                {products.map(
                  product => (
                    <div
                      key={
                        product.id
                      }
                      className="rounded-xl bg-white p-4 shadow"
                    >

                      <div className="flex items-center gap-4">

                        <img
                          src={
                            product.thumbnail
                          }
                          alt={
                            product.title
                          }
                          className="h-20 w-20 shrink-0 rounded-lg object-cover"
                        />

                        <div className="min-w-0 flex-1">

                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/products/${product.id}`,
                              )
                            }
                            className="text-left text-lg font-semibold text-gray-900 hover:underline"
                          >
                            {
                              product.title
                            }
                          </button>

                          <p className="mt-1 text-sm capitalize text-gray-500">
                            {
                              product.category
                            }
                          </p>

                        </div>

                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">

                        <div className="rounded-lg bg-gray-50 p-3">

                          <p className="text-xs text-gray-500">
                            Price
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            $
                            {
                              product.price
                            }
                          </p>

                        </div>

                        <div className="rounded-lg bg-gray-50 p-3">

                          <p className="text-xs text-gray-500">
                            Rating
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            ⭐{' '}
                            {
                              product.rating
                            }
                          </p>

                        </div>

                        <div className="rounded-lg bg-gray-50 p-3">

                          <p className="text-xs text-gray-500">
                            Stock
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {
                              product.stock
                            }
                          </p>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/products/${product.id}`,
                          )
                        }
                        className="mt-4 w-full rounded-lg bg-black py-2 font-medium text-white hover:bg-gray-800"
                      >
                        View Product
                      </button>

                    </div>
                  ),
                )}

              </div>

              {/* Pagination */}

              <Pagination
                page={page}
                total={total}
                limit={limit}
                onPageChange={
                  handlePageChange
                }
                onLimitChange={
                  handleLimitChange
                }
              />

            </>
          )}

      </main>

    </div>
  )
}