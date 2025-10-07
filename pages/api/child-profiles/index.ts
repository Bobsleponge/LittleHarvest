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

    switch (req.method) {
      case 'GET':
        return await getChildProfiles(req, res, userId)
      case 'POST':
        return await createChildProfile(req, res, userId)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('Child profiles API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
})

async function getChildProfiles(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    // Get user's profile and children
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    // Transform child profiles for frontend
    const childProfiles = profile.children.map(child => ({
      id: child.id,
      name: child.name,
      dateOfBirth: child.dateOfBirth,
      gender: child.gender,
      allergies: child.allergies ? JSON.parse(child.allergies) : [],
      dietaryRequirements: child.dietaryRequirements ? JSON.parse(child.dietaryRequirements) : [],
      foodPreferences: child.foodPreferences ? JSON.parse(child.foodPreferences) : [],
      medicalNotes: child.medicalNotes,
      isActive: child.isActive,
      createdAt: child.createdAt,
      updatedAt: child.updatedAt
    }))

    logger.info('Child profiles retrieved', { userId, count: childProfiles.length })

    res.status(200).json({ childProfiles })

  } catch (error) {
    logger.error('Get child profiles error', { 
      error: error instanceof Error ? error.message : 'Unknown error', 
      userId 
    })
    res.status(500).json({ error: 'Failed to retrieve child profiles' })
  }
}

async function createChildProfile(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    logger.info('Creating child profile', { userId, body: req.body })
    
    const validation = validateWithJoi(validationSchemas.childProfile)(req.body)

    if (!validation.success) {
      logger.error('Child profile validation failed', { 
        userId, 
        body: req.body, 
        errors: validation.errors 
      })
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.errors 
      })
    }

    const { name, dateOfBirth, gender, allergies, dietaryRequirements, foodPreferences, medicalNotes } = validation.data

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId }
    })

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    // Create child profile
    const childProfile = await prisma.childProfile.create({
      data: {
        profileId: profile.id,
        name,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        allergies: allergies ? JSON.stringify(allergies) : null,
        dietaryRequirements: dietaryRequirements ? JSON.stringify(dietaryRequirements) : null,
        foodPreferences: foodPreferences ? JSON.stringify(foodPreferences) : null,
        medicalNotes
      }
    })

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

    logger.info('Child profile created', { 
      userId, 
      childProfileId: childProfile.id,
      childName: childProfile.name 
    })

    res.status(201).json({ 
      message: 'Child profile created successfully',
      childProfile: response
    })

  } catch (error) {
    logger.error('Create child profile error', { 
      error: error instanceof Error ? error.message : 'Unknown error', 
      userId,
      body: req.body 
    })
    res.status(500).json({ error: 'Failed to create child profile' })
  }
}
