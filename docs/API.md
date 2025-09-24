# 📚 Tiny Tastes API Documentation

## Overview

The Tiny Tastes API provides endpoints for managing products, orders, cart operations, and administrative functions. All endpoints return JSON responses and use standard HTTP status codes.

## Authentication

Most endpoints require authentication. Include the session cookie in your requests or use the development login endpoint for testing.

### Development Login
```bash
POST /api/dev-login
Content-Type: application/json

{
  "email": "admin@tinytastes.co.za"
}
```

## Base URL
```
http://localhost:3000/api
```

## Products API

### Get Products
Retrieve a paginated list of products with optional filtering.

```http
GET /products?age={ageGroupId}&texture={textureId}&search={query}&page={page}
```

**Query Parameters:**
- `age` (optional) - Filter by age group ID
- `texture` (optional) - Filter by texture ID  
- `search` (optional) - Search in product name and description
- `page` (optional) - Page number (default: 1)

**Response:**
```json
{
  "products": [
    {
      "id": "string",
      "name": "string",
      "slug": "string",
      "description": "string",
      "imageUrl": "string",
      "ageGroup": {
        "id": "string",
        "name": "string",
        "minMonths": 6,
        "maxMonths": 12
      },
      "texture": {
        "id": "string",
        "name": "string"
      },
      "prices": [
        {
          "id": "string",
          "amountZar": 45.99,
          "portionSize": {
            "id": "string",
            "name": "string",
            "grams": 120
          }
        }
      ],
      "contains": "string",
      "mayContain": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "totalPages": 5
  }
}
```

### Get Product by Slug
Retrieve detailed information about a specific product.

```http
GET /products/[slug]
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "description": "string",
  "imageUrl": "string",
  "ageGroup": { /* age group object */ },
  "texture": { /* texture object */ },
  "prices": [ /* prices array */ ],
  "contains": "string",
  "mayContain": "string",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Get Related Products
Get products in the same age group, excluding the current product.

```http
GET /products/related?ageGroup={ageGroupId}&exclude={productId}&limit={limit}
```

**Query Parameters:**
- `ageGroup` (required) - Age group ID
- `exclude` (required) - Product ID to exclude
- `limit` (optional) - Number of products to return (default: 4)

### Get Product Reviews
Retrieve reviews for a specific product.

```http
GET /products/[slug]/reviews
```

**Response:**
```json
{
  "reviews": [
    {
      "id": "string",
      "rating": 5,
      "comment": "string",
      "user": {
        "name": "string"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "averageRating": 4.5,
  "totalReviews": 10
}
```

### Create Product Review
Submit a review for a product.

```http
POST /products/[slug]/reviews
Content-Type: application/json

{
  "rating": 5,
  "comment": "Great product!"
}
```

## Cart API

### Get Cart
Retrieve the current user's cart.

```http
GET /cart
```

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "productId": "string",
      "portionSizeId": "string",
      "quantity": 2,
      "product": { /* product object */ },
      "portionSize": { /* portion size object */ },
      "unitPrice": 45.99,
      "lineTotal": 91.98
    }
  ]
}
```

### Add to Cart
Add an item to the cart or update quantity if already exists.

```http
POST /cart
Content-Type: application/json

{
  "productId": "string",
  "portionSizeId": "string",
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "item": { /* cart item object */ }
}
```

### Update Cart Item
Update the quantity of an item in the cart.

```http
PUT /cart
Content-Type: application/json

{
  "itemId": "string",
  "quantity": 3
}
```

### Remove from Cart
Remove an item from the cart.

```http
DELETE /cart
Content-Type: application/json

{
  "itemId": "string"
}
```

## Orders API

### Get Orders
Retrieve the current user's order history.

```http
GET /orders
```

**Response:**
```json
{
  "orders": [
    {
      "id": "string",
      "status": "DELIVERED",
      "totalZar": 150.00,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "address": { /* address object */ },
      "items": [ /* order items array */ ]
    }
  ]
}
```

### Create Order
Create a new order from the current cart.

```http
POST /orders
Content-Type: application/json

{
  "addressId": "string",
  "deliveryDate": "2024-01-15",
  "notes": "Please leave at front door"
}
```

**Response:**
```json
{
  "order": { /* order object */ },
  "success": true
}
```

## Admin API

### Get Admin Products
Retrieve all products for admin management.

```http
GET /admin/products?limit={limit}&offset={offset}
```

### Create Product
Create a new product (admin only).

```http
POST /admin/products
Content-Type: application/json

{
  "name": "string",
  "slug": "string",
  "description": "string",
  "ageGroupId": "string",
  "textureId": "string",
  "imageUrl": "string",
  "contains": "string",
  "mayContain": "string",
  "isActive": true
}
```

### Get Admin Orders
Retrieve all orders for admin management.

```http
GET /admin/orders?status={status}&limit={limit}&offset={offset}
```

### Update Order Status
Update the status of an order (admin only).

```http
PUT /admin/orders
Content-Type: application/json

{
  "orderId": "string",
  "status": "CONFIRMED"
}
```

### Get Dashboard Statistics
Retrieve statistics for the admin dashboard.

```http
GET /admin/stats
```

**Response:**
```json
{
  "stats": {
    "totalOrders": 150,
    "totalRevenue": 15000.00,
    "totalCustomers": 45,
    "totalProducts": 25,
    "pendingOrders": 5,
    "completedOrders": 120
  }
}
```

## File Upload API

### Upload Image
Upload a product image (admin only).

```http
POST /upload
Content-Type: multipart/form-data

file: [image file]
```

**Response:**
```json
{
  "success": true,
  "fileUrl": "/uploads/product-1234567890.webp",
  "fileName": "product-1234567890.webp",
  "optimized": true
}
```

## Profile API

### Get Profile
Retrieve the current user's profile.

```http
GET /profile
```

### Update Profile
Update the current user's profile.

```http
PUT /profile
Content-Type: application/json

{
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "childName": "string",
  "childDob": "2023-01-01"
}
```

## Addresses API

### Get Addresses
Retrieve the current user's addresses.

```http
GET /addresses
```

### Create Address
Add a new address to the user's profile.

```http
POST /addresses
Content-Type: application/json

{
  "type": "SHIPPING",
  "street": "string",
  "city": "string",
  "province": "string",
  "postalCode": "string",
  "country": "South Africa",
  "isDefault": false
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `413` - Payload Too Large (file too big)
- `415` - Unsupported Media Type (invalid file type)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Rate Limiting

API endpoints are rate limited. When rate limited, the response includes:

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 300
}
```

Headers:
- `X-RateLimit-Limit` - Request limit
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Reset timestamp
- `Retry-After` - Seconds to wait before retrying

## Data Models

### Product
```typescript
interface Product {
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
```

### Cart Item
```typescript
interface CartItem {
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
```

### Order
```typescript
interface Order {
  id: string
  userId: string
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
  totalZar: number
  notes: string | null
  deliveryDate: Date | null
  createdAt: Date
  updatedAt: Date
  address: Address
  items: OrderItem[]
}
```

## Examples

### Complete Shopping Flow

1. **Browse Products**
   ```bash
   curl "http://localhost:3000/api/products?age=age-group-id&page=1"
   ```

2. **Add to Cart**
   ```bash
   curl -X POST "http://localhost:3000/api/cart" \
     -H "Content-Type: application/json" \
     -d '{"productId": "product-id", "portionSizeId": "portion-id", "quantity": 1}'
   ```

3. **Create Order**
   ```bash
   curl -X POST "http://localhost:3000/api/orders" \
     -H "Content-Type: application/json" \
     -d '{"addressId": "address-id", "deliveryDate": "2024-01-15"}'
   ```

### Admin Product Management

1. **Create Product**
   ```bash
   curl -X POST "http://localhost:3000/api/admin/products" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Organic Carrot Puree",
       "slug": "organic-carrot-puree",
       "description": "Fresh organic carrots",
       "ageGroupId": "age-group-id",
       "textureId": "texture-id",
       "contains": "carrots",
       "mayContain": "none"
     }'
   ```

2. **Upload Product Image**
   ```bash
   curl -X POST "http://localhost:3000/api/upload" \
     -F "file=@product-image.jpg"
   ```
