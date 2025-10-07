import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Navigation from '../src/components/navigation'
import Footer from '../src/components/footer'

interface ChildProfile {
  id: string
  name: string
  dateOfBirth: string
  gender?: string
  allergies: string[]
  dietaryRequirements: string[]
  foodPreferences: {
    likes: string[]
    dislikes: string[]
  }
  medicalNotes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Allergen {
  id: string
  name: string
  description?: string
  severity: string
}

interface DietaryRequirement {
  id: string
  name: string
  description?: string
  category: string
}

export default function ChildProfilesPage() {
  const { data: session } = useSession()
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])
  const [allergens, setAllergens] = useState<Allergen[]>([])
  const [dietaryRequirements, setDietaryRequirements] = useState<DietaryRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProfile, setEditingProfile] = useState<ChildProfile | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    allergies: [] as string[],
    dietaryRequirements: [] as string[],
    foodPreferences: {
      likes: [] as string[],
      dislikes: [] as string[]
    },
    medicalNotes: '',
    customAllergy: '',
    customDietaryRequirement: ''
  })

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      const [childProfilesRes, allergensRes, dietaryRes] = await Promise.all([
        fetch('/api/child-profiles'),
        fetch('/api/allergens'),
        fetch('/api/dietary-requirements')
      ])

      const [childProfilesData, allergensData, dietaryData] = await Promise.all([
        childProfilesRes.json(),
        allergensRes.json(),
        dietaryRes.json()
      ])

      setChildProfiles(childProfilesData.childProfiles || [])
      setAllergens(allergensData.allergens || [])
      setDietaryRequirements(dietaryData.dietaryRequirements || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProfile = () => {
    setEditingProfile(null)
    setFormData({
      name: '',
      dateOfBirth: '',
      gender: '',
      allergies: [],
      dietaryRequirements: [],
      foodPreferences: { likes: [], dislikes: [] },
      medicalNotes: '',
      customAllergy: '',
      customDietaryRequirement: ''
    })
    setShowModal(true)
  }

  const handleEditProfile = (profile: ChildProfile) => {
    setEditingProfile(profile)
    setFormData({
      name: profile.name,
      dateOfBirth: profile.dateOfBirth.split('T')[0], // Format for date input
      gender: profile.gender || '',
      allergies: profile.allergies,
      dietaryRequirements: profile.dietaryRequirements,
      foodPreferences: profile.foodPreferences,
      medicalNotes: profile.medicalNotes || '',
      customAllergy: '',
      customDietaryRequirement: ''
    })
    setShowModal(true)
  }

  const handleSaveProfile = async () => {
    // Basic validation
    if (!formData.name.trim()) {
      alert('Please enter a name for the child')
      return
    }
    
    if (!formData.dateOfBirth) {
      alert('Please select a date of birth')
      return
    }

    try {
      const url = editingProfile 
        ? `/api/child-profiles/${editingProfile.id}`
        : '/api/child-profiles'
      
      const method = editingProfile ? 'PUT' : 'POST'

      // Prepare data for API (exclude custom fields)
      const apiData = {
        name: formData.name.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender || undefined,
        allergies: formData.allergies,
        dietaryRequirements: formData.dietaryRequirements,
        foodPreferences: formData.foodPreferences,
        medicalNotes: formData.medicalNotes || undefined
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      })

      if (response.ok) {
        setShowModal(false)
        fetchData() // Refresh the list
      } else {
        const error = await response.json()
        alert(`Failed to save profile: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile. Please try again.')
    }
  }

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this child profile?')) {
      return
    }

    try {
      const response = await fetch(`/api/child-profiles/${profileId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData() // Refresh the list
      } else {
        const error = await response.json()
        alert(`Failed to delete profile: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting profile:', error)
      alert('Failed to delete profile. Please try again.')
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - birth.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return `${diffDays} days old`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months !== 1 ? 's' : ''} old`
    } else {
      const years = Math.floor(diffDays / 365)
      const months = Math.floor((diffDays % 365) / 30)
      return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''} old`
    }
  }

  const addCustomAllergy = () => {
    if (formData.customAllergy.trim() && !formData.allergies.includes(formData.customAllergy.trim())) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, formData.customAllergy.trim()],
        customAllergy: ''
      })
    }
  }

  const addCustomDietaryRequirement = () => {
    if (formData.customDietaryRequirement.trim() && !formData.dietaryRequirements.includes(formData.customDietaryRequirement.trim())) {
      setFormData({
        ...formData,
        dietaryRequirements: [...formData.dietaryRequirements, formData.customDietaryRequirement.trim()],
        customDietaryRequirement: ''
      })
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
          <Link href="/dev-login" className="text-emerald-600 hover:text-emerald-700">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading child profiles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <Navigation currentPage="child-profiles" />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mb-6 shadow-lg">
            <span className="text-3xl">👶</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Child Profiles</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Manage your children's dietary needs and preferences with personalized care</p>
        </div>

        {/* Add Profile Button */}
        <div className="text-center mb-12">
          <button
            onClick={handleAddProfile}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex items-center mx-auto shadow-lg"
          >
            <span className="mr-3 text-xl">➕</span>
            Add Child Profile
          </button>
        </div>

        {/* Child Profiles Grid */}
        {childProfiles.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full mb-8 shadow-lg">
              <span className="text-6xl">👶</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No child profiles yet</h3>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">Add your first child profile to get started with personalized meal recommendations and allergy tracking.</p>
            <button
              onClick={handleAddProfile}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl shadow-lg"
            >
              <span className="mr-2">➕</span>
              Add Your First Child Profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {childProfiles.map((profile) => (
              <div key={profile.id} className="group bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
                
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-2xl flex items-center justify-center shadow-md">
                      <span className="text-2xl">
                        {profile.gender === 'FEMALE' ? '👧' : profile.gender === 'MALE' ? '👦' : '👶'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h3>
                      <p className="text-gray-600 font-medium">{calculateAge(profile.dateOfBirth)}</p>
                      {profile.gender && (
                        <p className="text-gray-500 text-sm font-medium">{profile.gender}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProfile(profile)}
                      className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                      title="Edit profile"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteProfile(profile.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete profile"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Allergies */}
                {profile.allergies.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-red-600 text-sm">⚠️</span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-800">Allergies</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.allergies.map((allergy, index) => (
                        <span key={index} className="px-3 py-1 bg-red-50 text-red-700 text-sm font-medium rounded-full border border-red-200">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dietary Requirements */}
                {profile.dietaryRequirements.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600 text-sm">🥗</span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-800">Dietary Requirements</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.dietaryRequirements.map((requirement, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
                          {requirement}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Food Preferences */}
                {(profile.foodPreferences.likes.length > 0 || profile.foodPreferences.dislikes.length > 0) && (
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-green-600 text-sm">😋</span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-800">Food Preferences</h4>
                    </div>
                    {profile.foodPreferences.likes.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs text-gray-500 font-medium">Likes:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.foodPreferences.likes.map((like, index) => (
                            <span key={index} className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
                              {like}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile.foodPreferences.dislikes.length > 0 && (
                      <div>
                        <span className="text-xs text-gray-500 font-medium">Dislikes:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.foodPreferences.dislikes.map((dislike, index) => (
                            <span key={index} className="px-3 py-1 bg-gray-50 text-gray-700 text-sm font-medium rounded-full border border-gray-200">
                              {dislike}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Medical Notes */}
                {profile.medicalNotes && (
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-purple-600 text-sm">🏥</span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-800">Medical Notes</h4>
                    </div>
                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">{profile.medicalNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <span className="text-xl">👶</span>
                  </div>
                  <h3 className="text-2xl font-bold">
                    {editingProfile ? 'Edit Child Profile' : 'Add Child Profile'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl flex items-center justify-center transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Basic Information */}
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-2xl border border-emerald-100">
                <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-emerald-600 text-sm">👤</span>
                  </div>
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Child's Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Enter child's name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Gender (Optional)</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {/* Allergies */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-2xl border border-red-100">
                <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-red-600 text-sm">⚠️</span>
                  </div>
                  Allergies
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {allergens.map((allergen) => (
                    <label key={allergen.id} className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-red-300 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allergies.includes(allergen.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              allergies: [...formData.allergies, allergen.name]
                            })
                          } else {
                            setFormData({
                              ...formData,
                              allergies: formData.allergies.filter(a => a !== allergen.name)
                            })
                          }
                        }}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{allergen.name}</span>
                    </label>
                  ))}
                </div>
                
                {/* Custom Allergy Input */}
                <div className="border-t border-red-200 pt-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Add Other Allergy</label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={formData.customAllergy}
                      onChange={(e) => setFormData({...formData, customAllergy: e.target.value})}
                      placeholder="Enter custom allergy..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      onKeyPress={(e) => e.key === 'Enter' && addCustomAllergy()}
                    />
                    <button
                      type="button"
                      onClick={addCustomAllergy}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Selected Allergies Display */}
                {formData.allergies.length > 0 && (
                  <div className="mt-6">
                    <h5 className="text-sm font-bold text-gray-700 mb-3">Selected Allergies:</h5>
                    <div className="flex flex-wrap gap-2">
                      {formData.allergies.map((allergy, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-full border border-red-200">
                          {allergy}
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              allergies: formData.allergies.filter(a => a !== allergy)
                            })}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dietary Requirements */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 text-sm">🥗</span>
                  </div>
                  Dietary Requirements
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {dietaryRequirements.map((requirement) => (
                    <label key={requirement.id} className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.dietaryRequirements.includes(requirement.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              dietaryRequirements: [...formData.dietaryRequirements, requirement.name]
                            })
                          } else {
                            setFormData({
                              ...formData,
                              dietaryRequirements: formData.dietaryRequirements.filter(r => r !== requirement.name)
                            })
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{requirement.name}</span>
                    </label>
                  ))}
                </div>
                
                {/* Custom Dietary Requirement Input */}
                <div className="border-t border-blue-200 pt-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Add Other Dietary Requirement</label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={formData.customDietaryRequirement}
                      onChange={(e) => setFormData({...formData, customDietaryRequirement: e.target.value})}
                      placeholder="Enter custom dietary requirement..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      onKeyPress={(e) => e.key === 'Enter' && addCustomDietaryRequirement()}
                    />
                    <button
                      type="button"
                      onClick={addCustomDietaryRequirement}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Selected Dietary Requirements Display */}
                {formData.dietaryRequirements.length > 0 && (
                  <div className="mt-6">
                    <h5 className="text-sm font-bold text-gray-700 mb-3">Selected Dietary Requirements:</h5>
                    <div className="flex flex-wrap gap-2">
                      {formData.dietaryRequirements.map((requirement, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
                          {requirement}
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              dietaryRequirements: formData.dietaryRequirements.filter(r => r !== requirement)
                            })}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Medical Notes */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-purple-600 text-sm">🏥</span>
                  </div>
                  Medical Notes (Optional)
                </h4>
                <textarea
                  value={formData.medicalNotes}
                  onChange={(e) => setFormData({...formData, medicalNotes: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                  placeholder="Any additional medical information or notes..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {editingProfile ? 'Update Profile' : 'Create Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
