import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { Slider } from '../ui/slider'
import { Badge } from '../ui/badge'
import { 
  FlaskConical, 
  Play, 
  Pause, 
  Stop, 
  BarChart3, 
  Users, 
  Target, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  Zap,
  Calendar,
  Settings,
  Download,
  Share2
} from 'lucide-react'

interface ABTest {
  id: string
  name: string
  description: string
  status: 'draft' | 'running' | 'paused' | 'completed'
  themeA: {
    id: string
    name: string
    colors: any
  }
  themeB: {
    id: string
    name: string
    colors: any
  }
  trafficSplit: number // Percentage for theme A (0-100)
  metrics: {
    primary: 'conversion' | 'engagement' | 'satisfaction' | 'performance'
    secondary: string[]
  }
  startDate: string
  endDate?: string
  participants: number
  results: {
    themeA: {
      participants: number
      conversions: number
      conversionRate: number
      engagement: number
      satisfaction: number
      performance: number
    }
    themeB: {
      participants: number
      conversions: number
      conversionRate: number
      engagement: number
      satisfaction: number
      performance: number
    }
    statisticalSignificance: number
    winner?: 'A' | 'B' | 'inconclusive'
  }
  createdAt: string
  createdBy: string
}

interface ThemeABTestingProps {
  themes: Array<{
    id: string
    name: string
    colors: any
  }>
  onTestCreate?: (test: ABTest) => void
  onTestUpdate?: (testId: string, updates: Partial<ABTest>) => void
  onTestDelete?: (testId: string) => void
}

export function ThemeABTesting({ 
  themes, 
  onTestCreate, 
  onTestUpdate, 
  onTestDelete 
}: ThemeABTestingProps) {
  const [tests, setTests] = useState<ABTest[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null)
  const [newTest, setNewTest] = useState<Partial<ABTest>>({
    name: '',
    description: '',
    status: 'draft',
    trafficSplit: 50,
    metrics: {
      primary: 'conversion',
      secondary: []
    },
    startDate: new Date().toISOString().split('T')[0],
    participants: 0,
    results: {
      themeA: {
        participants: 0,
        conversions: 0,
        conversionRate: 0,
        engagement: 0,
        satisfaction: 0,
        performance: 0
      },
      themeB: {
        participants: 0,
        conversions: 0,
        conversionRate: 0,
        engagement: 0,
        satisfaction: 0,
        performance: 0
      },
      statisticalSignificance: 0,
      winner: undefined
    }
  })

  // Mock data - in production, this would come from an API
  useEffect(() => {
    const mockTests: ABTest[] = [
      {
        id: 'test-1',
        name: 'Nature vs Default Theme',
        description: 'Testing nature theme against default theme for conversion rates',
        status: 'running',
        themeA: themes[0] || { id: 'default', name: 'Default Theme', colors: {} },
        themeB: themes[1] || { id: 'nature', name: 'Nature Theme', colors: {} },
        trafficSplit: 50,
        metrics: {
          primary: 'conversion',
          secondary: ['engagement', 'satisfaction']
        },
        startDate: '2024-01-10',
        participants: 1250,
        results: {
          themeA: {
            participants: 625,
            conversions: 89,
            conversionRate: 14.2,
            engagement: 78,
            satisfaction: 4.2,
            performance: 85
          },
          themeB: {
            participants: 625,
            conversions: 112,
            conversionRate: 17.9,
            engagement: 82,
            satisfaction: 4.5,
            performance: 88
          },
          statisticalSignificance: 95,
          winner: 'B'
        },
        createdAt: '2024-01-10',
        createdBy: 'Admin User'
      },
      {
        id: 'test-2',
        name: 'Minimal vs Bold Theme',
        description: 'Comparing minimal and bold themes for user engagement',
        status: 'completed',
        themeA: themes[2] || { id: 'minimal', name: 'Minimal Theme', colors: {} },
        themeB: themes[3] || { id: 'bold', name: 'Bold Theme', colors: {} },
        trafficSplit: 60,
        metrics: {
          primary: 'engagement',
          secondary: ['satisfaction', 'performance']
        },
        startDate: '2024-01-05',
        endDate: '2024-01-12',
        participants: 890,
        results: {
          themeA: {
            participants: 534,
            conversions: 67,
            conversionRate: 12.5,
            engagement: 85,
            satisfaction: 4.6,
            performance: 89
          },
          themeB: {
            participants: 356,
            conversions: 45,
            conversionRate: 12.6,
            engagement: 78,
            satisfaction: 4.1,
            performance: 82
          },
          statisticalSignificance: 87,
          winner: 'A'
        },
        createdAt: '2024-01-05',
        createdBy: 'Admin User'
      }
    ]
    setTests(mockTests)
  }, [themes])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4" />
      case 'paused':
        return <Pause className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'draft':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getWinnerIcon = (winner?: string) => {
    switch (winner) {
      case 'A':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'B':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'inconclusive':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const handleCreateTest = () => {
    if (!newTest.name || !newTest.themeA || !newTest.themeB) return

    const test: ABTest = {
      id: `test-${Date.now()}`,
      name: newTest.name,
      description: newTest.description || '',
      status: 'draft',
      themeA: newTest.themeA,
      themeB: newTest.themeB,
      trafficSplit: newTest.trafficSplit || 50,
      metrics: newTest.metrics || { primary: 'conversion', secondary: [] },
      startDate: newTest.startDate || new Date().toISOString().split('T')[0],
      participants: 0,
      results: {
        themeA: {
          participants: 0,
          conversions: 0,
          conversionRate: 0,
          engagement: 0,
          satisfaction: 0,
          performance: 0
        },
        themeB: {
          participants: 0,
          conversions: 0,
          conversionRate: 0,
          engagement: 0,
          satisfaction: 0,
          performance: 0
        },
        statisticalSignificance: 0,
        winner: undefined
      },
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Current User'
    }

    setTests([...tests, test])
    onTestCreate?.(test)
    setShowCreateForm(false)
    setNewTest({
      name: '',
      description: '',
      status: 'draft',
      trafficSplit: 50,
      metrics: {
        primary: 'conversion',
        secondary: []
      },
      startDate: new Date().toISOString().split('T')[0],
      participants: 0
    })
  }

  const handleTestAction = (testId: string, action: 'start' | 'pause' | 'stop') => {
    const test = tests.find(t => t.id === testId)
    if (!test) return

    let newStatus: ABTest['status']
    switch (action) {
      case 'start':
        newStatus = 'running'
        break
      case 'pause':
        newStatus = 'paused'
        break
      case 'stop':
        newStatus = 'completed'
        break
      default:
        return
    }

    const updatedTest = { ...test, status: newStatus }
    setTests(tests.map(t => t.id === testId ? updatedTest : t))
    onTestUpdate?.(testId, { status: newStatus })
  }

  return (
    <div className="space-y-6">
      {/* A/B Testing Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Theme A/B Testing
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Test different themes to optimize user experience
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2"
        >
          <FlaskConical className="h-4 w-4" />
          <span>Create Test</span>
        </Button>
      </div>

      {/* Test Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Tests
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {tests.length}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <FlaskConical className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Tests
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {tests.filter(t => t.status === 'running').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Play className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Participants
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {tests.reduce((sum, test) => sum + test.participants, 0).toLocaleString()}
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completed Tests
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {tests.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        {tests.map((test) => (
          <Card key={test.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <Badge className={getStatusColor(test.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(test.status)}
                      <span className="capitalize">{test.status}</span>
                    </div>
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  {test.results.winner && (
                    <div className="flex items-center space-x-1">
                      {getWinnerIcon(test.results.winner)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Winner: Theme {test.results.winner}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTest(test)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    {test.status === 'running' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestAction(test.id, 'pause')}
                      >
                        <Pause className="h-3 w-3" />
                      </Button>
                    )}
                    {test.status === 'paused' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestAction(test.id, 'start')}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                    {test.status === 'running' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestAction(test.id, 'stop')}
                      >
                        <Stop className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <CardDescription>{test.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Test Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Theme A
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: test.themeA.colors?.primary || '#10b981' }} />
                    <span className="text-sm">{test.themeA.name}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Theme B
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: test.themeB.colors?.primary || '#059669' }} />
                    <span className="text-sm">{test.themeB.name}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Traffic Split
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${test.trafficSplit}%` }}
                      />
                    </div>
                    <span className="text-sm">{test.trafficSplit}% / {100 - test.trafficSplit}%</span>
                  </div>
                </div>
              </div>

              {/* Test Results */}
              {test.status === 'completed' && test.results && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Test Results
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Theme A ({test.themeA.name})
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Participants:</span>
                          <span>{test.results.themeA.participants}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversion Rate:</span>
                          <span>{test.results.themeA.conversionRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Engagement:</span>
                          <span>{test.results.themeA.engagement}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Satisfaction:</span>
                          <span>{test.results.themeA.satisfaction}/5</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Theme B ({test.themeB.name})
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Participants:</span>
                          <span>{test.results.themeB.participants}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversion Rate:</span>
                          <span>{test.results.themeB.conversionRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Engagement:</span>
                          <span>{test.results.themeB.engagement}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Satisfaction:</span>
                          <span>{test.results.themeB.satisfaction}/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Statistical Significance: {test.results.statisticalSignificance}%
                      </span>
                      {test.results.winner && (
                        <Badge className={test.results.winner === 'inconclusive' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                          {test.results.winner === 'inconclusive' ? 'Inconclusive' : `Theme ${test.results.winner} Wins`}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Test Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create A/B Test</CardTitle>
              <CardDescription>
                Set up a new theme comparison test
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="testName">Test Name</Label>
                  <Input
                    id="testName"
                    value={newTest.name}
                    onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                    placeholder="Theme Comparison Test"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="primaryMetric">Primary Metric</Label>
                  <Select
                    value={newTest.metrics?.primary}
                    onValueChange={(value: any) => setNewTest({ 
                      ...newTest, 
                      metrics: { ...newTest.metrics!, primary: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversion">Conversion Rate</SelectItem>
                      <SelectItem value="engagement">User Engagement</SelectItem>
                      <SelectItem value="satisfaction">User Satisfaction</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="testDescription">Description</Label>
                <Input
                  id="testDescription"
                  value={newTest.description}
                  onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                  placeholder="Describe what you're testing..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="themeA">Theme A</Label>
                  <Select
                    value={newTest.themeA?.id}
                    onValueChange={(value) => {
                      const theme = themes.find(t => t.id === value)
                      setNewTest({ ...newTest, themeA: theme })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Theme A" />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map(theme => (
                        <SelectItem key={theme.id} value={theme.id}>
                          {theme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="themeB">Theme B</Label>
                  <Select
                    value={newTest.themeB?.id}
                    onValueChange={(value) => {
                      const theme = themes.find(t => t.id === value)
                      setNewTest({ ...newTest, themeB: theme })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Theme B" />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map(theme => (
                        <SelectItem key={theme.id} value={theme.id}>
                          {theme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trafficSplit">
                  Traffic Split: {newTest.trafficSplit}% / {100 - (newTest.trafficSplit || 50)}%
                </Label>
                <Slider
                  value={[newTest.trafficSplit || 50]}
                  onValueChange={([value]) => setNewTest({ ...newTest, trafficSplit: value })}
                  min={10}
                  max={90}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTest}
                  disabled={!newTest.name || !newTest.themeA || !newTest.themeB}
                >
                  Create Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ThemeABTesting
