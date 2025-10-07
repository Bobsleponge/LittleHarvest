import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding allergens and dietary requirements...')

  // Seed Allergens
  const allergens = [
    { name: 'Dairy', description: 'Milk and milk products', severity: 'HIGH' },
    { name: 'Eggs', description: 'Chicken eggs and egg products', severity: 'HIGH' },
    { name: 'Peanuts', description: 'Peanuts and peanut products', severity: 'CRITICAL' },
    { name: 'Tree Nuts', description: 'Almonds, walnuts, cashews, etc.', severity: 'CRITICAL' },
    { name: 'Soy', description: 'Soybeans and soy products', severity: 'MODERATE' },
    { name: 'Wheat', description: 'Wheat and wheat products', severity: 'MODERATE' },
    { name: 'Fish', description: 'Fish and fish products', severity: 'HIGH' },
    { name: 'Shellfish', description: 'Crustaceans and mollusks', severity: 'HIGH' },
    { name: 'Sesame', description: 'Sesame seeds and sesame products', severity: 'MODERATE' },
    { name: 'Gluten', description: 'Gluten-containing grains', severity: 'MODERATE' },
    { name: 'Corn', description: 'Corn and corn products', severity: 'LOW' },
    { name: 'Citrus', description: 'Oranges, lemons, limes, etc.', severity: 'LOW' }
  ]

  for (const allergen of allergens) {
    await prisma.allergen.upsert({
      where: { name: allergen.name },
      update: {},
      create: allergen
    })
  }

  console.log(`✅ Created ${allergens.length} allergens`)

  // Seed Dietary Requirements
  const dietaryRequirements = [
    // Dietary Restrictions
    { name: 'Vegetarian', description: 'No meat or fish', category: 'DIETARY_RESTRICTION' },
    { name: 'Vegan', description: 'No animal products', category: 'DIETARY_RESTRICTION' },
    { name: 'Lactose-Free', description: 'No dairy products', category: 'DIETARY_RESTRICTION' },
    { name: 'Gluten-Free', description: 'No gluten-containing foods', category: 'DIETARY_RESTRICTION' },
    { name: 'Nut-Free', description: 'No nuts or nut products', category: 'DIETARY_RESTRICTION' },
    { name: 'Egg-Free', description: 'No eggs or egg products', category: 'DIETARY_RESTRICTION' },
    { name: 'Soy-Free', description: 'No soy or soy products', category: 'DIETARY_RESTRICTION' },
    { name: 'Low Sodium', description: 'Reduced sodium content', category: 'DIETARY_RESTRICTION' },
    { name: 'Low Sugar', description: 'Reduced sugar content', category: 'DIETARY_RESTRICTION' },
    
    // Preferences
    { name: 'Organic Only', description: 'Prefer organic ingredients', category: 'PREFERENCE' },
    { name: 'Non-GMO', description: 'Prefer non-GMO ingredients', category: 'PREFERENCE' },
    { name: 'Halal', description: 'Halal-certified foods', category: 'PREFERENCE' },
    { name: 'Kosher', description: 'Kosher-certified foods', category: 'PREFERENCE' },
    
    // Medical
    { name: 'GERD-Friendly', description: 'Suitable for gastroesophageal reflux', category: 'MEDICAL' },
    { name: 'Diabetes-Friendly', description: 'Suitable for diabetes management', category: 'MEDICAL' },
    { name: 'High Fiber', description: 'High fiber content', category: 'MEDICAL' },
    { name: 'Iron-Rich', description: 'High iron content', category: 'MEDICAL' },
    { name: 'Calcium-Rich', description: 'High calcium content', category: 'MEDICAL' }
  ]

  for (const requirement of dietaryRequirements) {
    await prisma.dietaryRequirement.upsert({
      where: { name: requirement.name },
      update: {},
      create: requirement
    })
  }

  console.log(`✅ Created ${dietaryRequirements.length} dietary requirements`)

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
