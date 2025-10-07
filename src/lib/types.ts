// Centralized type definitions for the Little Harvest application

// User and Authentication Types
export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'CUSTOMER'
  createdAt: Date
  updatedAt: Date
}

export interface Profile {
  id: string
  userId: string
  firstName: string
  lastName: string
  phone: string | null
  childName: string | null
  childDob: string | null
  createdAt: Date
  updatedAt: Date
  addresses: Address[]
}

export interface Address {
  id: string
  profileId: string
  street: string
  city: string
  province: string
  postalCode: string
  country: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// Product Types
export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  ageGroupId: string
  textureId: string
  contains: string
  mayContain: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  ageGroup: AgeGroup
  texture: Texture
  prices: Price[]
}

export interface AgeGroup {
  id: string
  name: string
  minMonths: number
  maxMonths: number
  createdAt: Date
  updatedAt: Date
}

export interface Texture {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface PortionSize {
  id: string
  name: string
  description?: string
  measurement?: string
  createdAt: Date
  updatedAt: Date
}

export interface Price {
  id: string
  productId: string
  portionSizeId: string
  amountZar: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  portionSize: PortionSize
}

// Cart Types
export interface Cart {
  id: string
  userId: string
  createdAt: Date
  updatedAt: Date
  items: CartItem[]
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  portionSizeId: string
  quantity: number
  createdAt: Date
  updatedAt: Date
  product: Product
  portionSize: PortionSize
  unitPrice: number
  lineTotal: number
}

// Order Types
export interface Order {
  id: string
  userId: string
  addressId: string
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
  totalZar: number
  notes: string | null
  createdAt: Date
  updatedAt: Date
  address: Address
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  portionSizeId: string
  quantity: number
  unitPriceZar: number
  lineTotalZar: number
  createdAt: Date
  updatedAt: Date
  product: Product
  portionSize: PortionSize
}

// Review Types
export interface Review {
  id: string
  productId: string
  userId: string
  rating: number
  comment: string
  createdAt: Date
  updatedAt: Date
  user: User
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface ProductFormData {
  name: string
  slug: string
  description: string
  ageGroupId: string
  textureId: string
  imageUrl: string | null
  contains: string
  mayContain: string
  isActive: boolean
}

export interface ProfileFormData {
  firstName: string
  lastName: string
  phone: string
  childName: string
  childDob: string
}

export interface CartItemFormData {
  productId: string
  portionSizeId: string
  quantity: number
}

// Dashboard Types
export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  pendingOrders: number
  completedOrders: number
}

// Search and Filter Types
export interface ProductFilters {
  age?: string
  texture?: string
  search?: string
  page?: number
}

// Component Props Types
export interface ProductGridProps {
  products: Product[]
  loading?: boolean
  error?: string
}

export interface ProductDetailsProps {
  product: Product
}

export interface ProductReviewsProps {
  productId: string
}

export interface RelatedProductsProps {
  currentProductId: string
  ageGroupId: string
}

export interface FileUploadProps {
  onFileSelect: (fileUrl: string) => void
  currentImageUrl?: string
  disabled?: boolean
}

// Error Types
export interface ApiError {
  error: string
  details?: string
  status?: number
}

// Loading States
export interface LoadingState {
  loading: boolean
  error: string | null
}
