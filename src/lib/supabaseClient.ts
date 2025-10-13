import { createClient } from '@supabase/supabase-js'

// Supabase configuration - Connected to actual project
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://blvyyxkoxcrlgxggkqle.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsdnl5eGtveGNybGd4Z2drcWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTQxMDEsImV4cCI6MjA3NTgzMDEwMX0.2yqNHjmCpju2ZsZ4YbgnUYHTH2xoVqHhHZf16TkRDxg'

// Create Supabase client for client-side usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create Supabase client for server-side usage with service role key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase

// Helper function to handle Supabase errors consistently
export function handleSupabaseError(error: any, operation: string) {
  console.error(`Supabase ${operation} error:`, error)
  return {
    success: false,
    error: error?.message || 'Unknown error',
    details: error
  }
}

// Helper function for successful operations
export function handleSupabaseSuccess(data: any, operation: string) {
  console.log(`Supabase ${operation} success:`, data)
  return {
    success: true,
    data
  }
}

// Database operation helpers
export const db = {
  // User operations
  users: {
    findMany: async (filters?: any) => {
      let query = supabaseAdmin.from('User').select('*')
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      const { data, error } = await query
      if (error) throw new Error(`Failed to fetch users: ${error.message}`)
      return data
    },
    
    findUnique: async (id: string) => {
      const { data, error } = await supabaseAdmin.from('User').select('*').eq('id', id).single()
      if (error) throw new Error(`Failed to fetch user: ${error.message}`)
      return data
    },
    
    findByEmail: async (email: string) => {
      const { data, error } = await supabaseAdmin.from('User').select('*').eq('email', email).single()
      if (error && error.code !== 'PGRST116') throw new Error(`Failed to fetch user by email: ${error.message}`)
      return data
    },
    
    create: async (userData: any) => {
      const { data, error } = await supabaseAdmin.from('User').insert([userData]).select().single()
      if (error) throw new Error(`Failed to create user: ${error.message}`)
      return data
    },
    
    update: async (id: string, userData: any) => {
      const { data, error } = await supabaseAdmin.from('User').update(userData).eq('id', id).select().single()
      if (error) throw new Error(`Failed to update user: ${error.message}`)
      return data
    },
    
    delete: async (id: string) => {
      const { error } = await supabaseAdmin.from('User').delete().eq('id', id)
      if (error) throw new Error(`Failed to delete user: ${error.message}`)
      return true
    },
    
    count: async (filters?: any) => {
      let query = supabaseAdmin.from('User').select('*', { count: 'exact', head: true })
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      const { count, error } = await query
      if (error) throw new Error(`Failed to count users: ${error.message}`)
      return count || 0
    }
  },

  // Product operations
  products: {
    findMany: async (filters?: any) => {
      let query = supabaseAdmin.from('Product').select(`
        *,
        ageGroup:AgeGroup(*),
        texture:Texture(*),
        prices:Price(
          *,
          portionSize:PortionSize(*)
        )
      `)
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      const { data, error } = await query
      if (error) throw new Error(`Failed to fetch products: ${error.message}`)
      return data
    },
    
    findUnique: async (id: string) => {
      const { data, error } = await supabaseAdmin.from('Product').select(`
        *,
        ageGroup:AgeGroup(*),
        texture:Texture(*),
        prices:Price(
          *,
          portionSize:PortionSize(*)
        )
      `).eq('id', id).single()
      if (error) throw new Error(`Failed to fetch product: ${error.message}`)
      return data
    },
    
    create: async (productData: any) => {
      const { data, error } = await supabaseAdmin.from('Product').insert([productData]).select().single()
      if (error) throw new Error(`Failed to create product: ${error.message}`)
      return data
    },
    
    update: async (id: string, productData: any) => {
      const { data, error } = await supabaseAdmin.from('Product').update(productData).eq('id', id).select().single()
      if (error) throw new Error(`Failed to update product: ${error.message}`)
      return data
    },
    
    delete: async (id: string) => {
      const { error } = await supabaseAdmin.from('Product').delete().eq('id', id)
      if (error) throw new Error(`Failed to delete product: ${error.message}`)
      return true
    },
    
    count: async (filters?: any) => {
      let query = supabaseAdmin.from('Product').select('*', { count: 'exact', head: true })
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      const { count, error } = await query
      if (error) throw new Error(`Failed to count products: ${error.message}`)
      return count || 0
    }
  },

  // Order operations
  orders: {
    findMany: async (filters?: any, include?: string) => {
      let query = supabaseAdmin.from('Order').select(include || `
        *,
        items:OrderItem(
          *,
          product:Product(
            *,
            ageGroup:AgeGroup(*),
            texture:Texture(*)
          ),
          portionSize:PortionSize(*),
          package:Package(*)
        ),
        address:Address(*),
        user:User(id, name, email)
      `)
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      const { data, error } = await query
      if (error) throw new Error(`Failed to fetch orders: ${error.message}`)
      return data
    },
    
    findUnique: async (id: string) => {
      const { data, error } = await supabaseAdmin.from('Order').select(`
        *,
        items:OrderItem(
          *,
          product:Product(
            *,
            ageGroup:AgeGroup(*),
            texture:Texture(*)
          ),
          portionSize:PortionSize(*),
          package:Package(*)
        ),
        address:Address(*),
        user:User(id, name, email)
      `).eq('id', id).single()
      if (error) throw new Error(`Failed to fetch order: ${error.message}`)
      return data
    },
    
    create: async (orderData: any) => {
      const { data, error } = await supabaseAdmin.from('Order').insert([orderData]).select().single()
      if (error) throw new Error(`Failed to create order: ${error.message}`)
      return data
    },
    
    update: async (id: string, orderData: any) => {
      const { data, error } = await supabaseAdmin.from('Order').update(orderData).eq('id', id).select().single()
      if (error) throw new Error(`Failed to update order: ${error.message}`)
      return data
    },
    
    count: async (filters?: any) => {
      let query = supabaseAdmin.from('Order').select('*', { count: 'exact', head: true })
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      const { count, error } = await query
      if (error) throw new Error(`Failed to count orders: ${error.message}`)
      return count || 0
    }
  },

  // Inventory operations
  inventory: {
    findMany: async (filters?: any) => {
      let query = supabaseAdmin.from('Inventory').select(`
        *,
        product:Product(*),
        portionSize:PortionSize(*)
      `)
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      const { data, error } = await query
      if (error) throw new Error(`Failed to fetch inventory: ${error.message}`)
      return data
    },
    
    findUnique: async (productId: string, portionSizeId: string) => {
      const { data, error } = await supabaseAdmin.from('Inventory').select(`
        *,
        product:Product(*),
        portionSize:PortionSize(*)
      `).eq('productId', productId).eq('portionSizeId', portionSizeId).single()
      if (error && error.code !== 'PGRST116') throw new Error(`Failed to fetch inventory: ${error.message}`)
      return data
    },
    
    create: async (inventoryData: any) => {
      const { data, error } = await supabaseAdmin.from('Inventory').insert([inventoryData]).select().single()
      if (error) throw new Error(`Failed to create inventory: ${error.message}`)
      return data
    },
    
    update: async (productId: string, portionSizeId: string, inventoryData: any) => {
      const { data, error } = await supabaseAdmin.from('Inventory').update(inventoryData).eq('productId', productId).eq('portionSizeId', portionSizeId).select().single()
      if (error) throw new Error(`Failed to update inventory: ${error.message}`)
      return data
    },
    
    count: async (filters?: any) => {
      let query = supabaseAdmin.from('Inventory').select('*', { count: 'exact', head: true })
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      const { count, error } = await query
      if (error) throw new Error(`Failed to count inventory: ${error.message}`)
      return count || 0
    }
  },

  // Settings operations
  settings: {
    findMany: async (filters?: any) => {
      let query = supabaseAdmin.from('StoreSettings').select('*')
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      const { data, error } = await query
      if (error) throw new Error(`Failed to fetch settings: ${error.message}`)
      return data
    },
    
    findUnique: async (category: string, key: string) => {
      const { data, error } = await supabaseAdmin.from('StoreSettings').select('*').eq('category', category).eq('key', key).single()
      if (error && error.code !== 'PGRST116') throw new Error(`Failed to fetch setting: ${error.message}`)
      return data
    },
    
    upsert: async (settingData: any) => {
      const { data, error } = await supabaseAdmin.from('StoreSettings').upsert(settingData).select().single()
      if (error) throw new Error(`Failed to upsert setting: ${error.message}`)
      return data
    }
  },

  // Security operations
  securityEvents: {
    findMany: async (filters?: any) => {
      let query = supabaseAdmin.from('SecurityEvent').select('*')
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      const { data, error } = await query
      if (error) throw new Error(`Failed to fetch security events: ${error.message}`)
      return data
    },
    
    create: async (eventData: any) => {
      const { data, error } = await supabaseAdmin.from('SecurityEvent').insert([eventData]).select().single()
      if (error) throw new Error(`Failed to create security event: ${error.message}`)
      return data
    },
    
    count: async (filters?: any) => {
      let query = supabaseAdmin.from('SecurityEvent').select('*', { count: 'exact', head: true })
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      const { count, error } = await query
      if (error) throw new Error(`Failed to count security events: ${error.message}`)
      return count || 0
    }
  }
}

export default supabase
