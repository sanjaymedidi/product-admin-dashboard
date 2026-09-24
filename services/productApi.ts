import api from '../lib/axios'

import {
  getLocalProduct,
  isProductDeleted,
  saveAddedProduct,
  saveDeletedProduct,
  saveUpdatedProduct,
} from '../utils/localProducts'

interface GetProductsParams {
  limit: number
  skip: number
  signal?: AbortSignal
}

export const getProducts = async ({
  limit,
  skip,
  signal,
}: GetProductsParams) => {
  const response = await api.get('/products', {
    params: {
      limit,
      skip,
    },
    signal,
  })

  return response.data
}

interface SearchProductsParams {
  query: string
  limit: number
  skip: number
  signal?: AbortSignal
}

export const searchProducts = async ({
  query,
  limit,
  skip,
  signal,
}: SearchProductsParams) => {
  const response = await api.get('/products/search', {
    params: {
      q: query,
      limit,
      skip,
    },
    signal,
  })

  return response.data
}

export const getProductsByCategory = async ({
  category,
  limit,
  skip,
  signal,
}: {
  category: string
  limit: number
  skip: number
  signal?: AbortSignal
}) => {
  const response = await api.get(
    `/products/category/${category}`,
    {
      params: {
        limit,
        skip,
      },
      signal,
    },
  )

  return response.data
}

export const getProductById = async (
  id: string | number,
) => {
  const productId = Number(id)

  /*
    If the product was deleted locally,
    behave as if it does not exist.
  */
  if (isProductDeleted(productId)) {
    throw new Error('Product not found')
  }

  /*
    Check whether this product was added
    or edited in our application.
  */
  const localProduct = getLocalProduct(productId)

  if (localProduct) {
    return localProduct
  }

  const response = await api.get(
    `/products/${id}`,
  )

  return response.data
}

export const addProduct = async (
  product: object,
) => {
  const response = await api.post(
    '/products/add',
    product,
  )

  /*
    DummyJSON returns a simulated product
    with an ID.

    Save it locally so our application
    remembers it after refresh.
  */
  saveAddedProduct(response.data)

  return response.data
}

export const updateProduct = async (
  id: string | number,
  product: object,
) => {
  const response = await api.put(
    `/products/${id}`,
    product,
  )

  /*
    Save the updated product locally.
  */
  saveUpdatedProduct(response.data)

  return response.data
}

export const deleteProduct = async (
  id: string | number,
) => {
  const response = await api.delete(
    `/products/${id}`,
  )

  /*
    Remember the deletion locally.
  */
  saveDeletedProduct(Number(id))

  return response.data
}