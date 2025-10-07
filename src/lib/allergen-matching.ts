/**
 * Enhanced allergen matching utility
 * Provides intelligent matching between child allergies and product ingredients
 */

export interface AllergenMatch {
  allergen: string
  ingredient: string
  matchType: 'exact' | 'partial' | 'synonym'
  confidence: 'high' | 'medium' | 'low'
}

export interface AllergenConflict {
  allergen: string
  conflictingIngredients: string[]
  severity: 'critical' | 'high' | 'moderate' | 'low'
}

// Common allergen synonyms and variations
const ALLERGEN_SYNONYMS: Record<string, string[]> = {
  'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'lactose', 'whey', 'casein'],
  'nuts': ['almond', 'walnut', 'cashew', 'pistachio', 'pecan', 'hazelnut', 'macadamia', 'brazil nut'],
  'peanuts': ['peanut', 'groundnut', 'arachis'],
  'eggs': ['egg', 'egg white', 'egg yolk', 'albumen', 'lecithin'],
  'soy': ['soybean', 'soya', 'tofu', 'tempeh', 'miso', 'soy sauce'],
  'wheat': ['flour', 'bread', 'pasta', 'cereal', 'semolina', 'durum'],
  'fish': ['salmon', 'tuna', 'cod', 'haddock', 'mackerel', 'sardine'],
  'shellfish': ['shrimp', 'prawn', 'crab', 'lobster', 'mussel', 'oyster', 'scallop'],
  'sesame': ['sesame seed', 'tahini', 'halva'],
  'gluten': ['wheat', 'barley', 'rye', 'oats', 'flour', 'bread', 'pasta'],
  'corn': ['maize', 'cornstarch', 'corn syrup', 'popcorn'],
  'citrus': ['orange', 'lemon', 'lime', 'grapefruit', 'tangerine', 'mandarin']
}

// Severity mapping for allergens
const ALLERGEN_SEVERITY: Record<string, 'critical' | 'high' | 'moderate' | 'low'> = {
  'peanuts': 'critical',
  'tree nuts': 'critical',
  'nuts': 'critical',
  'dairy': 'high',
  'eggs': 'high',
  'fish': 'high',
  'shellfish': 'high',
  'soy': 'moderate',
  'wheat': 'moderate',
  'sesame': 'moderate',
  'gluten': 'moderate',
  'corn': 'low',
  'citrus': 'low'
}

/**
 * Enhanced allergen matching function
 * Checks for exact matches, partial matches, and synonyms
 */
export function findAllergenConflicts(
  childAllergies: string[],
  productIngredients: string[]
): AllergenConflict[] {
  const conflicts: AllergenConflict[] = []

  for (const allergy of childAllergies) {
    const normalizedAllergy = allergy.toLowerCase().trim()
    const conflictingIngredients: string[] = []
    let severity: 'critical' | 'high' | 'moderate' | 'low' = 'moderate'

    // Check severity
    severity = ALLERGEN_SEVERITY[normalizedAllergy] || 'moderate'

    // Check for exact matches
    for (const ingredient of productIngredients) {
      const normalizedIngredient = ingredient.toLowerCase().trim()
      
      // Exact match
      if (normalizedIngredient === normalizedAllergy) {
        conflictingIngredients.push(ingredient)
        continue
      }

      // Partial match (ingredient contains allergen)
      if (normalizedIngredient.includes(normalizedAllergy)) {
        conflictingIngredients.push(ingredient)
        continue
      }

      // Allergen contains ingredient (for cases like "nuts" matching "almond")
      if (normalizedAllergy.includes(normalizedIngredient)) {
        conflictingIngredients.push(ingredient)
        continue
      }

      // Synonym matching
      const synonyms = ALLERGEN_SYNONYMS[normalizedAllergy] || []
      for (const synonym of synonyms) {
        if (normalizedIngredient.includes(synonym) || synonym.includes(normalizedIngredient)) {
          conflictingIngredients.push(ingredient)
          break
        }
      }
    }

    // Add conflict if any ingredients match
    if (conflictingIngredients.length > 0) {
      conflicts.push({
        allergen: allergy,
        conflictingIngredients: [...new Set(conflictingIngredients)], // Remove duplicates
        severity
      })
    }
  }

  return conflicts
}

/**
 * Get allergen severity color for UI
 */
export function getAllergenSeverityColor(severity: 'critical' | 'high' | 'moderate' | 'low'): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-900 text-white'
    case 'high':
      return 'bg-red-700 text-white'
    case 'moderate':
      return 'bg-orange-500 text-white'
    case 'low':
      return 'bg-yellow-500 text-black'
    default:
      return 'bg-gray-500 text-white'
  }
}

/**
 * Get allergen severity icon
 */
export function getAllergenSeverityIcon(severity: 'critical' | 'high' | 'moderate' | 'low'): string {
  switch (severity) {
    case 'critical':
      return '🚨'
    case 'high':
      return '⚠️'
    case 'moderate':
      return '⚡'
    case 'low':
      return 'ℹ️'
    default:
      return '⚠️'
  }
}

/**
 * Check if a product is safe for a child based on their allergies
 */
export function isProductSafeForChild(
  childAllergies: string[],
  productIngredients: string[]
): { isSafe: boolean; conflicts: AllergenConflict[] } {
  const conflicts = findAllergenConflicts(childAllergies, productIngredients)
  
  return {
    isSafe: conflicts.length === 0,
    conflicts
  }
}

/**
 * Generate a user-friendly warning message for allergen conflicts
 */
export function generateAllergenWarning(conflicts: AllergenConflict[], childName: string): string {
  if (conflicts.length === 0) {
    return `✅ This meal is safe for ${childName}`
  }

  const criticalConflicts = conflicts.filter(c => c.severity === 'critical')
  const highConflicts = conflicts.filter(c => c.severity === 'high')
  
  if (criticalConflicts.length > 0) {
    return `🚨 CRITICAL WARNING: ${childName} is severely allergic to ${criticalConflicts.map(c => c.allergen).join(', ')} in this meal!`
  }
  
  if (highConflicts.length > 0) {
    return `⚠️ WARNING: ${childName} is allergic to ${highConflicts.map(c => c.allergen).join(', ')} in this meal!`
  }
  
  return `⚡ CAUTION: ${childName} may be sensitive to ${conflicts.map(c => c.allergen).join(', ')} in this meal.`
}
