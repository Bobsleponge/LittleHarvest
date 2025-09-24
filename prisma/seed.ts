import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create Age Groups
  const ageGroups = await Promise.all([
    prisma.ageGroup.upsert({
      where: { name: '6-8 months' },
      update: {},
      create: {
        name: '6-8 months',
        minMonths: 6,
        maxMonths: 8,
      },
    }),
    prisma.ageGroup.upsert({
      where: { name: '9-12 months' },
      update: {},
      create: {
        name: '9-12 months',
        minMonths: 9,
        maxMonths: 12,
      },
    }),
    prisma.ageGroup.upsert({
      where: { name: '12-24 months' },
      update: {},
      create: {
        name: '12-24 months',
        minMonths: 12,
        maxMonths: 24,
      },
    }),
    prisma.ageGroup.upsert({
      where: { name: '24-48 months' },
      update: {},
      create: {
        name: '24-48 months',
        minMonths: 24,
        maxMonths: 48,
      },
    }),
  ])

  console.log('✅ Age groups created')

  // Create Textures
  const textures = await Promise.all([
    prisma.texture.upsert({
      where: { name: 'Puree' },
      update: {},
      create: { name: 'Puree' },
    }),
    prisma.texture.upsert({
      where: { name: 'Lumpy' },
      update: {},
      create: { name: 'Lumpy' },
    }),
    prisma.texture.upsert({
      where: { name: 'Toddler' },
      update: {},
      create: { name: 'Toddler' },
    }),
  ])

  console.log('✅ Textures created')

  // Create Portion Sizes
  const portionSizes = await Promise.all([
    prisma.portionSize.upsert({
      where: { name: '130g' },
      update: {},
      create: { name: '130g', grams: 130 },
    }),
    prisma.portionSize.upsert({
      where: { name: '160g' },
      update: {},
      create: { name: '160g', grams: 160 },
    }),
    prisma.portionSize.upsert({
      where: { name: '220g' },
      update: {},
      create: { name: '220g', grams: 220 },
    }),
  ])

  console.log('✅ Portion sizes created')

  // Create Products
  const products = await Promise.all([
    // 6-8 months products
    prisma.product.upsert({
      where: { slug: 'beef-butternut-lentil-puree' },
      update: {},
      create: {
        name: 'Beef & Butternut Lentil Puree',
        slug: 'beef-butternut-lentil-puree',
        description: 'Nutritious puree with tender beef, sweet butternut squash, and protein-rich lentils. Perfect for introducing meat to your little one.',
        ageGroupId: ageGroups[0].id,
        textureId: textures[0].id,
        contains: 'beef,lentils',
        mayContain: 'gluten',
        imageUrl: '/images/products/beef-butternut-lentil.jpg',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'chicken-sweet-potato-carrot' },
      update: {},
      create: {
        name: 'Chicken, Sweet Potato & Carrot',
        slug: 'chicken-sweet-potato-carrot',
        description: 'Mild chicken with naturally sweet vegetables. A great first protein option for your baby.',
        ageGroupId: ageGroups[0].id,
        textureId: textures[0].id,
        contains: 'chicken',
        mayContain: '',
        imageUrl: '/images/products/chicken-sweet-potato-carrot.jpg',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'fish-vegetable-medley' },
      update: {},
      create: {
        name: 'Fish & Vegetable Medley',
        slug: 'fish-vegetable-medley',
        description: 'Omega-3 rich fish with a variety of vegetables. Excellent for brain development.',
        ageGroupId: ageGroups[0].id,
        textureId: textures[0].id,
        contains: 'fish',
        mayContain: 'milk',
        imageUrl: '/images/products/fish-vegetable-medley.jpg',
      },
    }),

    // 9-12 months products
    prisma.product.upsert({
      where: { slug: 'lamb-mash-potato-peas' },
      update: {},
      create: {
        name: 'Lamb Mash with Potato & Peas',
        slug: 'lamb-mash-potato-peas',
        description: 'Iron-rich lamb with creamy mashed potato and sweet peas. Perfect for growing appetites.',
        ageGroupId: ageGroups[1].id,
        textureId: textures[1].id,
        contains: 'lamb',
        mayContain: 'milk',
        imageUrl: '/images/products/lamb-mash-potato-peas.jpg',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'turkey-rice-broccoli' },
      update: {},
      create: {
        name: 'Turkey, Rice & Broccoli',
        slug: 'turkey-rice-broccoli',
        description: 'Lean turkey with brown rice and nutrient-dense broccoli. A complete meal in one.',
        ageGroupId: ageGroups[1].id,
        textureId: textures[1].id,
        contains: 'turkey',
        mayContain: 'gluten',
        imageUrl: '/images/products/turkey-rice-broccoli.jpg',
      },
    }),

    // 12-24 months products
    prisma.product.upsert({
      where: { slug: 'beef-stew-vegetables' },
      update: {},
      create: {
        name: 'Beef Stew with Mixed Vegetables',
        slug: 'beef-stew-vegetables',
        description: 'Hearty beef stew with chunky vegetables. Perfect for toddlers who love texture.',
        ageGroupId: ageGroups[2].id,
        textureId: textures[2].id,
        contains: 'beef',
        mayContain: 'gluten',
        imageUrl: '/images/products/beef-stew-vegetables.jpg',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'chicken-pasta-primitive' },
      update: {},
      create: {
        name: 'Chicken Pasta Primavera',
        slug: 'chicken-pasta-primitive',
        description: 'Tender chicken with pasta and fresh vegetables. A toddler favorite!',
        ageGroupId: ageGroups[2].id,
        textureId: textures[2].id,
        contains: 'chicken,gluten',
        mayContain: 'eggs',
        imageUrl: '/images/products/chicken-pasta-primitive.jpg',
      },
    }),
  ])

  console.log('✅ Products created')

  // Create Prices for all products and portion sizes
  const prices = []
  for (const product of products) {
    for (const portionSize of portionSizes) {
      const basePrice = 45 // Base price in ZAR
      const sizeMultiplier = portionSize.grams / 130 // 130g is base size
      const price = Math.round(basePrice * sizeMultiplier)
      
      prices.push(
        prisma.price.upsert({
          where: {
            productId_portionSizeId: {
              productId: product.id,
              portionSizeId: portionSize.id,
            },
          },
          update: {},
          create: {
            productId: product.id,
            portionSizeId: portionSize.id,
            amountZar: price,
          },
        })
      )
    }
  }

  await Promise.all(prices)
  console.log('✅ Prices created')

  // Create Packages
  const packages = await Promise.all([
    prisma.package.upsert({
      where: { slug: 'weekly-stage-pack-6-8m' },
      update: {},
      create: {
        name: 'Weekly Stage Pack (6-8 months)',
        slug: 'weekly-stage-pack-6-8m',
        description: 'A week\'s worth of nutritious meals perfect for 6-8 month olds. Includes 7 different purees.',
      },
    }),
    prisma.package.upsert({
      where: { slug: 'weekly-stage-pack-9-12m' },
      update: {},
      create: {
        name: 'Weekly Stage Pack (9-12 months)',
        slug: 'weekly-stage-pack-9-12m',
        description: 'A week\'s worth of lumpy textures perfect for 9-12 month olds. Includes 7 different meals.',
      },
    }),
    prisma.package.upsert({
      where: { slug: 'weekly-stage-pack-12-24m' },
      update: {},
      create: {
        name: 'Weekly Stage Pack (12-24 months)',
        slug: 'weekly-stage-pack-12-24m',
        description: 'A week\'s worth of toddler meals perfect for 12-24 month olds. Includes 7 different meals.',
      },
    }),
  ])

  console.log('✅ Packages created')

  // Create Package Items
  const packageItems = []
  
  // Weekly Stage Pack 6-8m
  const pack6_8m = packages[0]
  const products6_8m = products.slice(0, 3) // First 3 products are 6-8m
  for (let i = 0; i < products6_8m.length; i++) {
    packageItems.push(
      prisma.packageItem.upsert({
        where: {
          packageId_productId_portionSizeId: {
            packageId: pack6_8m.id,
            productId: products6_8m[i].id,
            portionSizeId: portionSizes[0].id, // 130g
          },
        },
        update: {},
        create: {
          packageId: pack6_8m.id,
          productId: products6_8m[i].id,
          portionSizeId: portionSizes[0].id,
          quantity: i === 0 ? 3 : 2, // First product gets 3, others get 2
        },
      })
    )
  }

  // Weekly Stage Pack 9-12m
  const pack9_12m = packages[1]
  const products9_12m = products.slice(3, 5) // Next 2 products are 9-12m
  for (let i = 0; i < products9_12m.length; i++) {
    packageItems.push(
      prisma.packageItem.upsert({
        where: {
          packageId_productId_portionSizeId: {
            packageId: pack9_12m.id,
            productId: products9_12m[i].id,
            portionSizeId: portionSizes[1].id, // 160g
          },
        },
        update: {},
        create: {
          packageId: pack9_12m.id,
          productId: products9_12m[i].id,
          portionSizeId: portionSizes[1].id,
          quantity: 3,
        },
      })
    )
  }

  // Weekly Stage Pack 12-24m
  const pack12_24m = packages[2]
  const products12_24m = products.slice(5, 7) // Last 2 products are 12-24m
  for (let i = 0; i < products12_24m.length; i++) {
    packageItems.push(
      prisma.packageItem.upsert({
        where: {
          packageId_productId_portionSizeId: {
            packageId: pack12_24m.id,
            productId: products12_24m[i].id,
            portionSizeId: portionSizes[2].id, // 220g
          },
        },
        update: {},
        create: {
          packageId: pack12_24m.id,
          productId: products12_24m[i].id,
          portionSizeId: portionSizes[2].id,
          quantity: 3,
        },
      })
    )
  }

  await Promise.all(packageItems)
  console.log('✅ Package items created')

  // Create Admin Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@tinytastes.co.za' },
    update: {},
    create: {
      email: 'admin@tinytastes.co.za',
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@tinytastes.co.za' },
    update: {},
    create: {
      email: 'manager@tinytastes.co.za',
      name: 'Manager User',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  // Create Admin Profiles
  await prisma.profile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+27 82 123 4567',
    },
  })

  await prisma.profile.upsert({
    where: { userId: managerUser.id },
    update: {},
    create: {
      userId: managerUser.id,
      firstName: 'Manager',
      lastName: 'User',
      phone: '+27 82 987 6543',
    },
  })

  console.log('✅ Admin users created')

  // Create Sample Customers
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'Jane Smith',
      role: 'CUSTOMER',
      emailVerified: new Date(),
    },
  })

  const parentUser = await prisma.user.upsert({
    where: { email: 'parent@example.com' },
    update: {},
    create: {
      email: 'parent@example.com',
      name: 'John Doe',
      role: 'CUSTOMER',
      emailVerified: new Date(),
    },
  })

  // Create Customer Profiles
  const customerProfile = await prisma.profile.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: {
      userId: customerUser.id,
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+27 83 456 7890',
      childName: 'Emma',
      childDob: new Date('2023-06-15'), // 6 months old
    },
  })

  const parentProfile = await prisma.profile.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: {
      userId: parentUser.id,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+27 84 321 9876',
      childName: 'Alex',
      childDob: new Date('2023-03-10'), // 9 months old
    },
  })

  // Create Sample Addresses
  await prisma.address.create({
    data: {
      profileId: customerProfile.id,
      type: 'SHIPPING',
      street: '123 Main Street',
      city: 'Ballito',
      province: 'KwaZulu-Natal',
      postalCode: '4420',
      country: 'South Africa',
      isDefault: true,
    },
  })

  await prisma.address.create({
    data: {
      profileId: parentProfile.id,
      type: 'SHIPPING',
      street: '456 Oak Avenue',
      city: 'Cape Town',
      province: 'Western Cape',
      postalCode: '8001',
      country: 'South Africa',
      isDefault: true,
    },
  })

  console.log('✅ Sample customers created')

  console.log('🎉 Database seeded successfully!')
  console.log('')
  console.log('Available accounts:')
  console.log('')
  console.log('Admin accounts:')
  console.log('  - admin@tinytastes.co.za (Admin User)')
  console.log('  - manager@tinytastes.co.za (Manager User)')
  console.log('')
  console.log('Customer accounts:')
  console.log('  - customer@example.com (Jane Smith - Emma, 6 months)')
  console.log('  - parent@example.com (John Doe - Alex, 9 months)')
  console.log('')
  console.log('Next steps:')
  console.log('1. Run: npm run dev')
  console.log('2. Visit: http://localhost:3000')
  console.log('3. For quick testing, visit: http://localhost:3000/dev-login')
  console.log('4. Or sign in normally at: http://localhost:3000/auth/signin')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

