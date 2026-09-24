'use client'

import {FormEvent, useEffect, useState} from 'react'
import {useParams, useRouter} from 'next/navigation'

import Navbar from '../../../../components/Navbar'

import {
  getProductById,
  updateProduct,
} from '../../../../services/productApi'

interface FormData {
  title: string
  description: string
  category: string
  price: string
  stock: string
  brand: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string

  const [formData, setFormData] =
    useState<FormData>({
      title: '',
      description: '',
      category: '',
      price: '',
      stock: '',
      brand: '',
    })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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
    Load product
  */
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true)
        setError('')

        const product = await getProductById(id)

        setFormData({
          title: product.title || '',
          description: product.description || '',
          category: product.category || '',
          price: String(product.price ?? ''),
          stock: String(product.stock ?? ''),
          brand: product.brand || '',
        })
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

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    const {name, value} = event.target

    setFormData(previous => ({
      ...previous,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      return 'Product title is required'
    }

    if (!formData.description.trim()) {
      return 'Product description is required'
    }

    if (!formData.category.trim()) {
      return 'Category is required'
    }

    const price = Number(formData.price)

    if (
      formData.price === '' ||
      Number.isNaN(price) ||
      price <= 0
    ) {
      return 'Price must be greater than 0'
    }

    const stock = Number(formData.stock)

    if (
      formData.stock === '' ||
      Number.isNaN(stock) ||
      stock < 0 ||
      !Number.isInteger(stock)
    ) {
      return 'Stock must be a whole number and cannot be negative'
    }

    return ''
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (isSaving) {
      return
    }

    setError('')
    setSuccess(false)

    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    setIsSaving(true)

    try {
      const updatedProduct = await updateProduct(
        id,
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category.trim(),
          price: Number(formData.price),
          stock: Number(formData.stock),
          brand: formData.brand.trim(),
        },
      )

      console.log(
        'Updated product:',
        updatedProduct,
      )

      setSuccess(true)

      setTimeout(() => {
        router.push(`/products/${id}`)
      }, 1000)
    } catch {
      setError(
        'Failed to update product. Please try again.',
      )
    } finally {
      setIsSaving(false)
    }
  }

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

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-gray-100">

        <Navbar />

        <main className="p-6">

          <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 text-center shadow">

            <h2 className="text-2xl font-bold">
              Product Not Found
            </h2>

            <p className="mt-2 text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                router.push('/products')
              }
              className="mt-6 rounded-lg bg-black px-5 py-3 text-white"
            >
              Back to Products
            </button>

          </div>

        </main>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <main className="p-4 sm:p-6">

        <div className="mx-auto max-w-3xl">

          <button
            type="button"
            onClick={() =>
              router.push(`/products/${id}`)
            }
            className="mb-6 rounded-lg bg-white px-5 py-3 text-gray-700 shadow hover:bg-gray-50"
          >
            ← Back to Product
          </button>

          <div className="rounded-xl bg-white p-6 shadow">

            <h1 className="text-3xl font-bold text-gray-900">
              Edit Product
            </h1>

            <p className="mt-1 text-gray-600">
              Update product information
            </p>

            {error && (
              <div className="mt-6 rounded-lg bg-red-100 p-4 text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-6 rounded-lg bg-green-100 p-4 text-green-700">
                Product updated successfully. Redirecting...
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >

              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block font-medium"
                >
                  Product Title
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded-lg border p-3 outline-none focus:ring-2"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block font-medium"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full rounded-lg border p-3 outline-none focus:ring-2"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block font-medium"
                >
                  Category
                </label>

                <input
                  id="category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border p-3 outline-none focus:ring-2"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block font-medium"
                  >
                    Price
                  </label>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full rounded-lg border p-3 outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    className="mb-2 block font-medium"
                  >
                    Stock
                  </label>

                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full rounded-lg border p-3 outline-none focus:ring-2"
                  />
                </div>

              </div>

              <div>
                <label
                  htmlFor="brand"
                  className="mb-2 block font-medium"
                >
                  Brand
                </label>

                <input
                  id="brand"
                  name="brand"
                  type="text"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full rounded-lg border p-3 outline-none focus:ring-2"
                />
              </div>

              <div className="flex flex-col gap-3 pt-3 sm:flex-row">

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving
                    ? 'Saving...'
                    : 'Save Changes'}
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() =>
                    router.push(
                      `/products/${id}`,
                    )
                  }
                  className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>

      </main>

    </div>
  )
}