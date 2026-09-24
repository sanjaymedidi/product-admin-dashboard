'use client'

import {FormEvent, useState} from 'react'
import {useRouter} from 'next/navigation'

import Navbar from '../../../components/Navbar'
import {addProduct} from '../../../services/productApi'

interface FormData {
  title: string
  description: string
  category: string
  price: string
  stock: string
  brand: string
}

export default function AddProductPage() {
  const router = useRouter()

  const [formData, setFormData] =
    useState<FormData>({
      title: '',
      description: '',
      category: '',
      price: '',
      stock: '',
      brand: '',
    })

  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)

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
      const createdProduct = await addProduct({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        brand: formData.brand.trim(),
      })

      console.log('Created product:', createdProduct)

      setSuccess(true)

      setTimeout(() => {
        router.push('/products')
      }, 1000)
    } catch {
      setError('Failed to add product. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <main className="p-4 sm:p-6">

        <div className="mx-auto max-w-3xl">

          <button
            type="button"
            onClick={() => router.push('/products')}
            className="mb-6 rounded-lg bg-white px-5 py-3 text-gray-700 shadow hover:bg-gray-50"
          >
            ← Back to Products
          </button>

          <div className="rounded-xl bg-white p-6 shadow">

            <h1 className="text-3xl font-bold text-gray-900">
              Add Product
            </h1>

            <p className="mt-1 text-gray-600">
              Create a new product
            </p>

            {error && (
              <div className="mt-6 rounded-lg bg-red-100 p-4 text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-6 rounded-lg bg-green-100 p-4 text-green-700">
                Product added successfully. Redirecting...
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >

              {/* Title */}

              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block font-medium text-orange-500"
                >
                  Product Title
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter product title"
                  className="w-full rounded-lg border p-3 outline-none focus:ring-2 text-black"
                />
              </div>

              {/* Description */}

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block font-medium text-orange-500"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  rows={5}
                  className="w-full rounded-lg border p-3 outline-none focus:ring-2 text-black"
                />
              </div>

              {/* Category */}

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block font-medium text-orange-500"
                >
                  Category
                </label>

                <input
                  id="category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Example: beauty"
                  className="w-full rounded-lg border p-3 outline-none focus:ring-2 text-black"
                />
              </div>

              {/* Price + Stock */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block font-medium text-orange-500"
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
                    placeholder="0.00"
                    className="w-full rounded-lg border p-3 outline-none focus:ring-2 text-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    className="mb-2 block font-medium text-orange-500"
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
                    placeholder="0"
                    className="w-full rounded-lg border p-3 outline-none focus:ring-2 text-black"
                  />
                </div>

              </div>

              {/* Brand */}

              <div>
                <label
                  htmlFor="brand"
                  className="mb-2 block font-medium text-orange-500"
                >
                  Brand
                </label>

                <input
                  id="brand"
                  name="brand"
                  type="text"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Enter brand"
                  className="w-full rounded-lg border p-3 outline-none focus:ring-2 text-black"
                />
              </div>

              {/* Buttons */}

              <div className="flex flex-col gap-3 pt-3 sm:flex-row">

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving
                    ? 'Saving...'
                    : 'Save Product'}
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() =>
                    router.push('/products')
                  }
                  className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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