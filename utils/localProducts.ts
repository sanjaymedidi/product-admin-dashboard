export interface LocalProduct {
  id: number
  title: string
  description: string
  category: string
  price: number
  rating: number
  stock: number
  brand?: string
  thumbnail: string
  images?: string[]
  reviews?: unknown[]
}

const ADDED_PRODUCTS_KEY = 'addedProducts'
const UPDATED_PRODUCTS_KEY = 'updatedProducts'
const DELETED_PRODUCTS_KEY = 'deletedProductIds'

const getAddedProducts = (): LocalProduct[] => {
  if (typeof window === 'undefined') {
    return []
  }

  const data = localStorage.getItem(
    ADDED_PRODUCTS_KEY,
  )

  if (!data) {
    return []
  }

  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

const getUpdatedProducts = (): LocalProduct[] => {
  if (typeof window === 'undefined') {
    return []
  }

  const data = localStorage.getItem(
    UPDATED_PRODUCTS_KEY,
  )

  if (!data) {
    return []
  }

  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

const getDeletedProductIds = (): number[] => {
  if (typeof window === 'undefined') {
    return []
  }

  const data = localStorage.getItem(
    DELETED_PRODUCTS_KEY,
  )

  if (!data) {
    return []
  }

  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

/*
  Save a newly added product
*/
export const saveAddedProduct = (
  product: LocalProduct,
) => {
  const products = getAddedProducts()

  const filteredProducts = products.filter(
    item => item.id !== product.id,
  )

  localStorage.setItem(
    ADDED_PRODUCTS_KEY,
    JSON.stringify([
      ...filteredProducts,
      product,
    ]),
  )
}

/*
  Save an edited product
*/
export const saveUpdatedProduct = (
  product: LocalProduct,
) => {
  const products = getUpdatedProducts()

  const filteredProducts = products.filter(
    item => item.id !== product.id,
  )

  localStorage.setItem(
    UPDATED_PRODUCTS_KEY,
    JSON.stringify([
      ...filteredProducts,
      product,
    ]),
  )
}

/*
  Mark a product as deleted
*/
export const saveDeletedProduct = (
  productId: number,
) => {
  const deletedIds = getDeletedProductIds()

  if (!deletedIds.includes(productId)) {
    deletedIds.push(productId)
  }

  localStorage.setItem(
    DELETED_PRODUCTS_KEY,
    JSON.stringify(deletedIds),
  )
}

/*
  Get one local product
*/
export const getLocalProduct = (
  productId: number,
): LocalProduct | null => {
  const addedProducts = getAddedProducts()

  const addedProduct = addedProducts.find(
    product => product.id === productId,
  )

  if (addedProduct) {
    return addedProduct
  }

  const updatedProducts = getUpdatedProducts()

  const updatedProduct = updatedProducts.find(
    product => product.id === productId,
  )

  if (updatedProduct) {
    return updatedProduct
  }

  return null
}

/*
  Check whether a product was deleted
*/
export const isProductDeleted = (
  productId: number,
) => {
  return getDeletedProductIds().includes(productId)
}

/*
  Apply local changes to API products
*/
export const applyLocalChanges = (
  products: LocalProduct[],
) => {
  const updatedProducts = getUpdatedProducts()
  const deletedIds = getDeletedProductIds()

  return products
    .filter(
      product => !deletedIds.includes(product.id),
    )
    .map(product => {
      const updatedProduct =
        updatedProducts.find(
          item => item.id === product.id,
        )

      return updatedProduct || product
    })
}

/*
  Get products that were added locally
*/
export const getAddedProductsForDisplay = () => {
  const deletedIds = getDeletedProductIds()

  return getAddedProducts().filter(
    product => !deletedIds.includes(product.id),
  )
}