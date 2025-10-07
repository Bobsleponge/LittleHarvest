import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding ingredients...')

  const ingredients = [
    {
      name: 'Organic Bananas',
      category: 'Fruits',
      unit: 'kg',
      currentStock: 15.5,
      minStock: 5,
      maxStock: 50,
      unitCost: 12.50,
      supplier: 'Fresh Farms Co.',
      status: 'active',
      notes: 'Ripe bananas for puree'
    },
    {
      name: 'Sweet Potatoes',
      category: 'Vegetables',
      unit: 'kg',
      currentStock: 8.2,
      minStock: 3,
      maxStock: 30,
      unitCost: 8.75,
      supplier: 'Organic Harvest',
      status: 'active',
      notes: 'Organic sweet potatoes'
    },
    {
      name: 'Rolled Oats',
      category: 'Grains',
      unit: 'kg',
      currentStock: 2.1,
      minStock: 5,
      maxStock: 25,
      unitCost: 15.00,
      supplier: 'Healthy Grains Ltd',
      status: 'active',
      notes: 'Gluten-free oats'
    },
    {
      name: 'Chicken Breast',
      category: 'Proteins',
      unit: 'kg',
      currentStock: 0,
      minStock: 2,
      maxStock: 15,
      unitCost: 45.00,
      supplier: 'Premium Proteins',
      status: 'active',
      notes: 'Free-range chicken'
    },
    {
      name: 'Carrots',
      category: 'Vegetables',
      unit: 'kg',
      currentStock: 12.8,
      minStock: 4,
      maxStock: 20,
      unitCost: 6.50,
      supplier: 'Garden Fresh',
      status: 'active',
      notes: 'Baby carrots'
    },
    {
      name: 'Mixed Berries',
      category: 'Fruits',
      unit: 'kg',
      currentStock: 1.5,
      minStock: 3,
      maxStock: 12,
      unitCost: 35.00,
      supplier: 'Berry Farms',
      status: 'active',
      notes: 'Frozen mixed berries'
    },
    {
      name: 'Organic Apples',
      category: 'Fruits',
      unit: 'kg',
      currentStock: 18.3,
      minStock: 6,
      maxStock: 40,
      unitCost: 14.00,
      supplier: 'Fresh Farms Co.',
      status: 'active',
      notes: 'Granny Smith apples'
    },
    {
      name: 'Brown Rice',
      category: 'Grains',
      unit: 'kg',
      currentStock: 5.2,
      minStock: 2,
      maxStock: 20,
      unitCost: 18.50,
      supplier: 'Healthy Grains Ltd',
      status: 'active',
      notes: 'Organic brown rice'
    },
    {
      name: 'Beef',
      category: 'Proteins',
      unit: 'kg',
      currentStock: 3.1,
      minStock: 2,
      maxStock: 10,
      unitCost: 85.00,
      supplier: 'Premium Proteins',
      status: 'active',
      notes: 'Grass-fed beef'
    },
    {
      name: 'Lentils',
      category: 'Grains',
      unit: 'kg',
      currentStock: 4.5,
      minStock: 2,
      maxStock: 15,
      unitCost: 22.00,
      supplier: 'Healthy Grains Ltd',
      status: 'active',
      notes: 'Red lentils'
    },
    {
      name: 'Butternut Squash',
      category: 'Vegetables',
      unit: 'kg',
      currentStock: 6.8,
      minStock: 3,
      maxStock: 25,
      unitCost: 12.00,
      supplier: 'Organic Harvest',
      status: 'active',
      notes: 'Fresh butternut squash'
    },
    {
      name: 'Fish',
      category: 'Proteins',
      unit: 'kg',
      currentStock: 2.3,
      minStock: 1,
      maxStock: 8,
      unitCost: 65.00,
      supplier: 'Ocean Fresh',
      status: 'active',
      notes: 'Fresh white fish'
    },
    {
      name: 'Lamb',
      category: 'Proteins',
      unit: 'kg',
      currentStock: 1.8,
      minStock: 1,
      maxStock: 6,
      unitCost: 95.00,
      supplier: 'Premium Proteins',
      status: 'active',
      notes: 'Free-range lamb'
    },
    {
      name: 'Potatoes',
      category: 'Vegetables',
      unit: 'kg',
      currentStock: 10.2,
      minStock: 5,
      maxStock: 30,
      unitCost: 8.00,
      supplier: 'Garden Fresh',
      status: 'active',
      notes: 'Baby potatoes'
    },
    {
      name: 'Peas',
      category: 'Vegetables',
      unit: 'kg',
      currentStock: 3.5,
      minStock: 2,
      maxStock: 12,
      unitCost: 15.00,
      supplier: 'Garden Fresh',
      status: 'active',
      notes: 'Fresh green peas'
    },
    {
      name: 'Turkey',
      category: 'Proteins',
      unit: 'kg',
      currentStock: 2.7,
      minStock: 1,
      maxStock: 8,
      unitCost: 55.00,
      supplier: 'Premium Proteins',
      status: 'active',
      notes: 'Free-range turkey'
    },
    {
      name: 'Broccoli',
      category: 'Vegetables',
      unit: 'kg',
      currentStock: 4.1,
      minStock: 2,
      maxStock: 15,
      unitCost: 16.00,
      supplier: 'Garden Fresh',
      status: 'active',
      notes: 'Fresh broccoli florets'
    },
    {
      name: 'Pasta',
      category: 'Grains',
      unit: 'kg',
      currentStock: 8.5,
      minStock: 3,
      maxStock: 25,
      unitCost: 12.50,
      supplier: 'Healthy Grains Ltd',
      status: 'active',
      notes: 'Whole wheat pasta'
    }
  ]

  // Clear existing ingredients first
  await prisma.ingredient.deleteMany({})
  
  // Create all ingredients
  await prisma.ingredient.createMany({
    data: ingredients
  })

  console.log(`✅ Created ${ingredients.length} ingredients`)
  console.log('🎉 Ingredients seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding ingredients:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
