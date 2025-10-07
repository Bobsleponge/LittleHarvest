import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../src/lib/auth'
import { prisma } from '../../../src/lib/prisma'
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
    const childProfile = await prisma.childProfile.findFirst({
      where: {
        id: childProfileId,
        profile: {
          userId
        },
        isActive: true
      }
    })

    if (!childProfile) {
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
    const existingProfile = await prisma.childProfile.findFirst({
      where: {
        id: childProfileId,
        profile: {
          userId
        }
      }
    })

    if (!existingProfile) {
      return res.status(404).json({ error: 'Child profile not found' })
    }

    // Update child profile
    const updatedProfile = await prisma.childProfile.update({
      where: { id: childProfileId },
      data: {
        name,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        allergies: allergies ? JSON.stringify(allergies) : null,
        dietaryRequirements: dietaryRequirements ? JSON.stringify(dietaryRequirements) : null,
        foodPreferences: foodPreferences ? JSON.stringify(foodPreferences) : null,
        medicalNotes,
        updatedAt: new Date()
      }
    })

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
    const existingProfile = await prisma.childProfile.findFirst({
      where: {
        id: childProfileId,
        profile: {
          userId
        }
      }
    })

    if (!existingProfile) {
      return res.status(404).json({ error: 'Child profile not found' })
    }

    // Soft delete by setting isActive to false
    await prisma.childProfile.update({
      where: { id: childProfileId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    logger.info('Child profile deleted', { 
      userId, 
      childProfileId,
      childName: existingProfile.name 
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
