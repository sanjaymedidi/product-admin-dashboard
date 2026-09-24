'use client'

import {useEffect, useState} from 'react'
import {useParams, useRouter} from 'next/navigation'

import Navbar from '../../../components/Navbar'
import {
  getProductById,
  deleteProduct,
} from '../../../services/productApi'

interface Review {
  rating: number
  comment: string
  date: string
  reviewerName: string
  reviewerEmail: string
}

interface Product {
  id: number
  title: string
  description: string
  category: string
  price: number
  rating: number
  stock: number
  brand?: string
  thumbnail: string
  images: string[]
  reviews?: Review[]
}

export default function ProductDetailsPage() {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string

  const [product, setProduct] =
    useState<Product | null>(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [isDeleting, setIsDeleting] =
    useState(false)

  const [error, setError] = useState('')

  /*
    Check whether user is logged in
  */
  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      router.replace('/login')
    }
  }, [router])

  /*
    Load product details
  */
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true)
        setError('')

        const data = await getProductById(id)

        setProduct(data)
      } catch {
        setError('Product not found')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      loadProduct()
    }
  }, [id])

  /*
    Delete product
  */
  const handleDelete = async () => {
    /*
      Prevent multiple delete requests
    */
    if (isDeleting) {
      return
    }

    /*
      Ask user for confirmation
    */
    const confirmed = window.confirm(
      'Are you sure you want to delete this product?',
    )

    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      await deleteProduct(id)

      /*
        DummyJSON returns a successful
        response for the simulated delete.

        After deletion, go back to
        the products page.
      */
      router.push('/products')
    } catch {
      setError(
        'Failed to delete product. Please try again.',
      )

      setIsDeleting(false)
    }
  }

  /*
    Loading state
  */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">

        <Navbar />

        <main className="p-6">

          <div className="rounded-lg bg-white p-8 text-center shadow">

            <p className="text-lg text-gray-700">
              Loading product...
            </p>

          </div>

        </main>

      </div>
    )
  }

  /*
    Product not found
  */
  if (error && !product) {
    return (
      <div className="min-h-screen bg-gray-100">

        <Navbar />

        <main className="p-6">

          <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 text-center shadow">

            <h2 className="text-2xl font-bold text-gray-900">
              Product Not Found
            </h2>

            <p className="mt-2 text-gray-600">
              The product you are looking for does not exist.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push('/products')
              }
              className="mt-6 rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
            >
              Back to Products
            </button>

          </div>

        </main>

      </div>
    )
  }

  /*
    Main product details page
  */
  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <main className="p-4 sm:p-6">

        {/* Back button */}

        <button
          type="button"
          onClick={() =>
            router.push('/products')
          }
          className="mb-6 rounded-lg bg-white px-5 py-3 text-gray-700 shadow hover:bg-gray-50"
        >
          ← Back to Products
        </button>

        <div className="rounded-xl bg-white p-6 shadow">

          <div className="grid gap-8 lg:grid-cols-2">

            {/* Product Images */}

            <div>

              <div className="flex items-center justify-center rounded-xl bg-gray-100 p-6">

                <img
                  src={
                    product?.images?.[0] ||
                    product?.thumbnail
                  }
                  alt={product?.title}
                  className="h-80 w-full object-contain sm:h-96"
                />

              </div>

              {product?.images &&
                product.images.length > 1 && (
                  <div className="mt-4 grid grid-cols-4 gap-3">

                    {product.images
                      .slice(0, 4)
                      .map((image, index) => (
                        <div
                          key={image}
                          className="rounded-lg bg-gray-100 p-2"
                        >
                          <img
                            src={image}
                            alt={`${product.title} ${
                              index + 1
                            }`}
                            className="h-20 w-full object-contain"
                          />
                        </div>
                      ))}

                  </div>
                )}

            </div>

            {/* Product Information */}

            <div>

              <p className="text-sm font-medium uppercase text-gray-500">
                {product?.category}
              </p>

              <h1 className="mt-2 text-3xl font-bold text-gray-900">
                {product?.title}
              </h1>

              {product?.brand && (
                <p className="mt-2 text-gray-600">
                  Brand: {product.brand}
                </p>
              )}

              {/* Price, rating and stock */}

              <div className="mt-5 flex flex-wrap items-center gap-4">

                <p className="text-3xl font-bold text-gray-900">
                  ${product?.price}
                </p>

                <p className="rounded-lg bg-yellow-100 px-3 py-2 font-medium text-yellow-800">
                  ⭐ {product?.rating}
                </p>

                <p
                  className={`rounded-lg px-3 py-2 font-medium ${
                    product &&
                    product.stock > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {product &&
                  product.stock > 0
                    ? `${product.stock} in stock`
                    : 'Out of stock'}
                </p>

              </div>

              {/* Description */}

              <div className="mt-6">

                <h2 className="text-xl font-semibold text-gray-900">
                  Description
                </h2>

                <p className="mt-2 leading-7 text-gray-600">
                  {product?.description}
                </p>

              </div>

              {/* Delete error */}

              {error && (
                <div className="mt-6 rounded-lg bg-red-100 p-4 text-red-700">
                  {error}
                </div>
              )}

              {/* Action buttons */}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                {/* Edit */}

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() =>
                    router.push(
                      `/products/edit/${product?.id}`,
                    )
                  }
                  className="rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Edit Product
                </button>

                {/* Delete */}

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting
                    ? 'Deleting...'
                    : 'Delete Product'}
                </button>

                {/* Back */}

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() =>
                    router.push('/products')
                  }
                  className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back to Products
                </button>

              </div>

            </div>

          </div>

          {/* Reviews */}

          <div className="mt-10 border-t pt-8">

            <h2 className="text-2xl font-bold text-gray-900">
              Reviews
            </h2>

            {!product?.reviews ||
            product.reviews.length === 0 ? (
              <p className="mt-4 text-gray-600">
                No reviews available.
              </p>
            ) : (
              <div className="mt-5 space-y-4">

                {product.reviews.map(
                  (review, index) => (
                    <div
                      key={`${review.reviewerEmail}-${index}`}
                      className="rounded-lg border p-4"
                    >

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                          <p className="font-semibold text-gray-900">
                            {review.reviewerName}
                          </p>

                          <p className="text-sm text-gray-500">
                            {review.reviewerEmail}
                          </p>

                        </div>

                        <p className="font-medium">
                          ⭐ {review.rating}
                        </p>

                      </div>

                      <p className="mt-3 text-gray-700">
                        {review.comment}
                      </p>

                      <p className="mt-2 text-sm text-gray-500">
                        {new Date(
                          review.date,
                        ).toLocaleDateString()}
                      </p>

                    </div>
                  ),
                )}

              </div>
            )}

          </div>

        </div>

      </main>

    </div>
  )
}