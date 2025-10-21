# 🌱 Harviz & Co - Fresh Baby Food Delivery

A modern, full-stack e-commerce application for fresh baby food delivery built with Next.js 14, TypeScript, and Supabase.

## ✨ Features

### 🛒 **E-commerce Core**
- **Product Catalog** - Browse baby food products by age group and texture
- **Shopping Cart** - Persistent cart with database storage
- **Order Management** - Complete order lifecycle from cart to delivery
- **User Profiles** - Customer profiles with child information and addresses

### 🔐 **Authentication & Security**
- **Multi-provider Auth** - Email, Google OAuth, and development credentials
- **Role-based Access** - Admin and customer roles with proper permissions
- **Input Sanitization** - XSS protection and data validation
- **Rate Limiting** - API protection against abuse
- **File Upload Security** - Secure image uploads with validation

### ⚡ **Performance & Optimization**
- **Intelligent Caching** - In-memory cache with TTL for faster responses
- **Image Optimization** - Automatic WebP conversion and responsive images
- **Database Optimization** - Optimized queries with selective field loading
- **Bundle Optimization** - Webpack optimization for smaller bundles

### 🎨 **User Experience**
- **Modern UI** - Built with Radix UI and Tailwind CSS
- **Responsive Design** - Mobile-first approach
- **Loading States** - Comprehensive loading indicators
- **Error Handling** - Graceful error boundaries and user feedback

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- SQLite (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd little-harvest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-app-password"
   EMAIL_FROM="noreply@harvizco.com"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### **Frontend**
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Framer Motion** for animations

### **Backend**
- **Next.js API Routes** for serverless functions
- **Prisma ORM** with SQLite database
- **NextAuth.js** for authentication
- **Zod** for input validation

### **Database Schema**
```
User → Profile → Addresses
User → Cart → CartItems → Product + PortionSize
User → Orders → OrderItems → Product + PortionSize
Product → Prices → PortionSize
Product → AgeGroup + Texture
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── cart/          # Cart management
│   │   ├── products/      # Product operations
│   │   ├── orders/        # Order processing
│   │   └── admin/         # Admin-only endpoints
│   ├── admin/             # Admin dashboard
│   ├── products/          # Product pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   └── profile/           # User profile
├── components/            # Reusable components
│   ├── ui/                # Base UI components
│   ├── error-boundary.tsx # Error handling
│   ├── file-upload.tsx    # File upload component
│   └── product-*.tsx      # Product-related components
├── lib/                   # Utilities and configurations
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Database client
│   ├── cache.ts           # Caching system
│   ├── rate-limit.ts      # Rate limiting
│   ├── security.ts        # Security utilities
│   ├── image-utils.ts     # Image optimization
│   ├── types.ts           # TypeScript definitions
│   └── validations.ts     # Zod schemas
└── middleware.ts          # Route protection
```

## 🔧 Development

### **Available Scripts**

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes
npm run db:migrate       # Create migration
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database
```

### **Development Features**

- **Hot Reload** - Instant updates during development
- **TypeScript** - Full type safety
- **ESLint** - Code quality enforcement
- **Prisma Studio** - Visual database management

## 🔐 Authentication

### **Providers**
- **Email** - Magic link authentication
- **Google OAuth** - Social login
- **Development** - Quick login for testing (dev only)

### **Roles**
- **ADMIN** - Full access to admin dashboard and product management
- **CUSTOMER** - Access to shopping, cart, and profile features

### **Protected Routes**
- `/admin/*` - Admin only
- `/profile/*` - Authenticated users
- `/cart/*` - Authenticated users
- `/checkout/*` - Authenticated users
- `/orders/*` - Authenticated users

## 🛒 API Endpoints

### **Products**
```
GET    /api/products              # List products with filters
GET    /api/products/[slug]       # Get product by slug
GET    /api/products/related      # Get related products
GET    /api/products/[slug]/reviews # Get product reviews
POST   /api/products/[slug]/reviews # Create product review
```

### **Cart**
```
GET    /api/cart                  # Get user's cart
POST   /api/cart                  # Add item to cart
PUT    /api/cart                  # Update cart item quantity
DELETE /api/cart                  # Remove item from cart
```

### **Orders**
```
GET    /api/orders                # Get user's orders
POST   /api/orders                # Create new order
```

### **Admin**
```
GET    /api/admin/products        # List all products (admin)
POST   /api/admin/products        # Create product (admin)
GET    /api/admin/orders           # List all orders (admin)
PUT    /api/admin/orders           # Update order status (admin)
GET    /api/admin/stats            # Get dashboard statistics (admin)
```

### **File Upload**
```
POST   /api/upload                # Upload product images (admin)
```

## 🎨 UI Components

### **Base Components**
- `Button` - Styled button with variants
- `Card` - Container with header, content, footer
- `Input` - Form input with validation
- `Select` - Dropdown selection
- `Badge` - Status indicators
- `Loading` - Loading spinners and skeletons

### **Feature Components**
- `ProductGrid` - Product listing with filters
- `ProductDetails` - Product information display
- `ProductReviews` - Customer reviews
- `FileUpload` - Drag-and-drop file upload
- `ErrorBoundary` - Error handling wrapper

## ⚡ Performance Features

### **Caching**
- **In-memory cache** with TTL for frequently accessed data
- **Cache invalidation** on data updates
- **Selective caching** for different data types

### **Image Optimization**
- **WebP conversion** for smaller file sizes
- **Responsive images** with multiple sizes
- **Lazy loading** with blur placeholders
- **Next.js Image** component optimization

### **Database Optimization**
- **Selective field loading** to reduce data transfer
- **Optimized queries** with proper includes
- **Parallel queries** where possible
- **Proper indexing** on frequently queried fields

## 🔒 Security Features

### **Input Validation**
- **Zod schemas** for all API inputs
- **XSS protection** with DOMPurify
- **SQL injection prevention** (Prisma handles this)
- **File type validation** with magic bytes

### **Rate Limiting**
- **Per-endpoint limits** based on operation type
- **User-based limiting** for authenticated requests
- **IP-based limiting** for anonymous requests
- **Graceful degradation** with proper headers

### **File Upload Security**
- **File type validation** based on content
- **File size limits** to prevent abuse
- **Secure filename generation** to prevent conflicts
- **Image optimization** to remove metadata

## 🚀 Deployment

### **Environment Setup**
1. Set up production database (PostgreSQL recommended)
2. Configure environment variables
3. Set up email service (SendGrid, AWS SES, etc.)
4. Configure Google OAuth credentials
5. Set up file storage (AWS S3, Cloudinary, etc.)

### **Build Process**
```bash
npm run build
npm run start
```

### **Environment Variables**
See `env.example` for complete list of required variables.

## 🧪 Testing

### **Manual Testing**
- Use development login for quick access
- Test all user flows (browse, cart, checkout)
- Test admin functions (product management)
- Test error scenarios

### **Development Accounts**
- `admin@harvizco.com` - Admin access
- `customer@example.com` - Customer access

## 📊 Monitoring

### **Performance Metrics**
- API response times
- Database query performance
- Cache hit rates
- Image optimization savings

### **Error Tracking**
- Client-side errors via ErrorBoundary
- Server-side errors in console
- API error responses with proper status codes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for healthy baby nutrition**
