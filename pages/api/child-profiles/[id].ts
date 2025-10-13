import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../src/lib/auth'
import { supabaseAdmin } from '../../../src/lib/supabaseClient'
import { logger } from '../../../src/lib/logger'
import { withAPIRateLimit, RATE_LIMITS } from '../../../src/lib/rate-limit'
import { withCSRFProtection } from '../../../src/lib/csrf'
import { validateWithJoi, validationSchemas } from '../../../src/lib/joi-validation'

export default withAPIRateLimit(
  RATE_LIMITS.GENERAL,
  (req) => req.user?.id || req.ip
)(async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const userId = session.user.id
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Child profile ID is required' })
    }

    switch (req.method) {
      case 'GET':
        return await getChildProfile(req, res, userId, id)
      case 'PUT':
        return await updateChildProfile(req, res, userId, id)
      case 'DELETE':
        return await deleteChildProfile(req, res, userId, id)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('Child profile API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method,
      childProfileId: req.query.id
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
})

async function getChildProfile(req: NextApiRequest, res: NextApiResponse, userId: string, childProfileId: string) {
  try {
    // Get child profile and verify ownership
    const { data: childProfile, error: childProfileError } = await supabaseAdmin
      .from('ChildProfile')
      .select(`
        *,
        profile:Profile(
          userId
        )
      `)
      .eq('id', childProfileId)
      .eq('isActive', true)
      .single()

    if (childProfileError && childProfileError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch child profile: ${childProfileError.message}`)
    }

    if (!childProfile || childProfile.profile?.userId !== userId) {
      return res.status(404).json({ error: 'Child profile not found' })
    }

    // Transform response
    const response = {
      id: childProfile.id,
      name: childProfile.name,
      dateOfBirth: childProfile.dateOfBirth,
      gender: childProfile.gender,
      allergies: childProfile.allergies ? JSON.parse(childProfile.allergies) : [],
      dietaryRequirements: childProfile.dietaryRequirements ? JSON.parse(childProfile.dietaryRequirements) : [],
      foodPreferences: childProfile.foodPreferences ? JSON.parse(childProfile.foodPreferences) : [],
      medicalNotes: childProfile.medicalNotes,
      isActive: childProfile.isActive,
      createdAt: childProfile.createdAt,
      updatedAt: childProfile.updatedAt
    }

    logger.info('Child profile retrieved', { userId, childProfileId })

    res.status(200).json({ childProfile: response })

  } catch (error) {
    logger.error('Get child profile error', { 
      error: error instanceof Error ? error.message : 'Unknown error', 
      userId,
      childProfileId 
    })
    res.status(500).json({ error: 'Failed to retrieve child profile' })
  }
}

async function updateChildProfile(req: NextApiRequest, res: NextApiResponse, userId: string, childProfileId: string) {
  try {
    const validation = validateWithJoi(validationSchemas.childProfile)(req.body)

    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.errors 
      })
    }

    const { name, dateOfBirth, gender, allergies, dietaryRequirements, foodPreferences, medicalNotes } = validation.data

    // Verify child profile ownership
    const { data: existingProfile, error: existingError } = await supabaseAdmin
      .from('ChildProfile')
      .select(`
        *,
        profile:Profile(
          userId
        )
      `)
      .eq('id', childProfileId)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch child profile: ${existingError.message}`)
    }

    if (!existingProfile || existingProfile.profile?.userId !== userId) {
      return res.status(404).json({ error: 'Child profile not found' })
    }

    // Update child profile
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('ChildProfile')
      .update({
        name,
        dateOfBirth: new Date(dateOfBirth).toISOString(),
        gender,
        allergies: allergies ? JSON.stringify(allergies) : null,
        dietaryRequirements: dietaryRequirements ? JSON.stringify(dietaryRequirements) : null,
        foodPreferences: foodPreferences ? JSON.stringify(foodPreferences) : null,
        medicalNotes,
        updatedAt: new Date().toISOString()
      })
      .eq('id', childProfileId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update child profile: ${updateError.message}`)
    }

    // Transform response
    const response = {
      id: updatedProfile.id,
      name: updatedProfile.name,
      dateOfBirth: updatedProfile.dateOfBirth,
      gender: updatedProfile.gender,
      allergies: updatedProfile.allergies ? JSON.parse(updatedProfile.allergies) : [],
      dietaryRequirements: updatedProfile.dietaryRequirements ? JSON.parse(updatedProfile.dietaryRequirements) : [],
      foodPreferences: updatedProfile.foodPreferences ? JSON.parse(updatedProfile.foodPreferences) : [],
      medicalNotes: updatedProfile.medicalNotes,
      isActive: updatedProfile.isActive,
      createdAt: updatedProfile.createdAt,
      updatedAt: updatedProfile.updatedAt
    }

    logger.info('Child profile updated', { 
      userId, 
      childProfileId,
      childName: updatedProfile.name 
    })

    res.status(200).json({ 
      message: 'Child profile updated successfully',
      childProfile: response
    })

  } catch (error) {
    logger.error('Update child profile error', { 
      error: error instanceof Error ? error.message : 'Unknown error', 
      userId,
      childProfileId,
      body: req.body 
    })
    res.status(500).json({ error: 'Failed to update child profile' })
  }
}

async function deleteChildProfile(req: NextApiRequest, res: NextApiResponse, userId: string, childProfileId: string) {
  try {
    // Verify child profile ownership
    const { data: existingProfile, error: existingError } = await supabaseAdmin
      .from('ChildProfile')
      .select(`
        *,
        profile:Profile(
          userId
        )
      `)
      .eq('id', childProfileId)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch child profile: ${existingError.message}`)
    }

    if (!existingProfile || existingProfile.profile?.userId !== userId) {
      return res.status(404).json({ error: 'Child profile not found' })
    }

    // Soft delete by setting isActive to false
    const { data: deletedProfile, error: deleteError } = await supabaseAdmin
      .from('ChildProfile')
      .update({
        isActive: false,
        updatedAt: new Date().toISOString()
      })
      .eq('id', childProfileId)
      .select()
      .single()

    if (deleteError) {
      throw new Error(`Failed to delete child profile: ${deleteError.message}`)
    }

    logger.info('Child profile deleted', { 
      userId, 
      childProfileId,
      childName: deletedProfile.name 
    })

    res.status(200).json({ message: 'Child profile deleted successfully' })

  } catch (error) {
    logger.error('Delete child profile error', { 
      error: error instanceof Error ? error.message : 'Unknown error', 
      userId,
      childProfileId 
    })
    res.status(500).json({ error: 'Failed to delete child profile' })
  }
}
