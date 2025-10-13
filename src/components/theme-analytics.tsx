import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Clock, 
  Star,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap
} from 'lucide-react'

interface ThemeAnalytics {
  themeId: string
  themeName: string
  views: number
  applications: number
  popularity: number
  userSatisfaction: number
  performanceScore: number
  lastUsed: string
  trend: 'up' | 'down' | 'stable'
  category: string
}

interface AnalyticsData {
  totalThemes: number
  totalViews: number
  totalApplications: number
  averageSatisfaction: number
  topPerformingTheme: string
  mostPopularCategory: string
  themes: ThemeAnalytics[]
  dailyStats: Array<{
    date: string
    views: number
    applications: number
  }>
  categoryStats: Array<{
    category: string
    count: number
    popularity: number
  }>
}

interface ThemeAnalyticsProps {
  onExport?: () => void
  onRefresh?: () => void
}

export function ThemeAnalytics({ onExport, onRefresh }: ThemeAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [sortBy, setSortBy] = useState<'popularity' | 'views' | 'applications' | 'satisfaction'>('popularity')

  // Mock data - in production, this would come from an API
  useEffect(() => {
    const mockData: AnalyticsData = {
      totalThemes: 12,
      totalViews: 15420,
      totalApplications: 3420,
      averageSatisfaction: 4.2,
      topPerformingTheme: 'Nature Theme',
      mostPopularCategory: 'Business',
      themes: [
        {
          themeId: 'nature',
          themeName: 'Nature Theme',
          views: 3420,
          applications: 890,
          popularity: 95,
          userSatisfaction: 4.8,
          performanceScore: 92,
          lastUsed: '2024-01-15',
          trend: 'up',
          category: 'Nature'
        },
        {
          themeId: 'default',
          themeName: 'Default Theme',
          views: 2890,
          applications: 1200,
          popularity: 88,
          userSatisfaction: 4.5,
          performanceScore: 89,
          lastUsed: '2024-01-14',
          trend: 'stable',
          category: 'Business'
        },
        {
          themeId: 'sunset',
          themeName: 'Sunset Theme',
          views: 2100,
          applications: 450,
          popularity: 76,
          userSatisfaction: 4.2,
          performanceScore: 78,
          lastUsed: '2024-01-13',
          trend: 'up',
          category: 'Creative'
        },
        {
          themeId: 'minimal',
          themeName: 'Minimal Theme',
          views: 1890,
          applications: 380,
          popularity: 82,
          userSatisfaction: 4.6,
          performanceScore: 85,
          lastUsed: '2024-01-12',
          trend: 'down',
          category: 'Minimal'
        },
        {
          themeId: 'bold',
          themeName: 'Bold Theme',
          views: 1650,
          applications: 320,
          popularity: 71,
          userSatisfaction: 3.9,
          performanceScore: 72,
          lastUsed: '2024-01-11',
          trend: 'stable',
          category: 'Bold'
        }
      ],
      dailyStats: [
        { date: '2024-01-15', views: 450, applications: 89 },
        { date: '2024-01-14', views: 380, applications: 76 },
        { date: '2024-01-13', views: 420, applications: 84 },
        { date: '2024-01-12', views: 350, applications: 70 },
        { date: '2024-01-11', views: 290, applications: 58 },
        { date: '2024-01-10', views: 320, applications: 64 },
        { date: '2024-01-09', views: 280, applications: 56 }
      ],
      categoryStats: [
        { category: 'Business', count: 4, popularity: 85 },
        { category: 'Nature', count: 3, popularity: 78 },
        { category: 'Creative', count: 2, popularity: 72 },
        { category: 'Minimal', count: 2, popularity: 68 },
        { category: 'Bold', count: 1, popularity: 65 }
      ]
    }

    setTimeout(() => {
      setAnalyticsData(mockData)
      setLoading(false)
    }, 1000)
  }, [timeRange])

  const sortedThemes = analyticsData?.themes.sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return b.popularity - a.popularity
      case 'views':
        return b.views - a.views
      case 'applications':
        return b.applications - a.applications
      case 'satisfaction':
        return b.userSatisfaction - a.userSatisfaction
      default:
        return 0
    }
  }) || []

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400'
      case 'down':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 dark:text-gray-400">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Theme Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track theme performance and user engagement
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={onRefresh}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button
            variant="outline"
            onClick={onExport}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Analytics Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <Label htmlFor="timeRange">Time Range:</Label>
                <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <Label htmlFor="sortBy">Sort by:</Label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="views">Views</SelectItem>
                    <SelectItem value="applications">Applications</SelectItem>
                    <SelectItem value="satisfaction">Satisfaction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Themes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {analyticsData.totalThemes}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Views
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {analyticsData.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Applications
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {analyticsData.totalApplications.toLocaleString()}
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
                  Avg Satisfaction
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {analyticsData.averageSatisfaction.toFixed(1)}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Theme Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Theme Performance</span>
          </CardTitle>
          <CardDescription>
            Detailed performance metrics for each theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Theme
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Views
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Applications
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Popularity
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Satisfaction
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Performance
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedThemes.map((theme) => (
                  <tr key={theme.themeId} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {theme.themeName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {theme.category}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                      {theme.views.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                      {theme.applications.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${theme.popularity}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {theme.popularity}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-gray-900 dark:text-gray-100">
                          {theme.userSatisfaction.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${theme.performanceScore}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {theme.performanceScore}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(theme.trend)}
                        <span className={`text-sm ${getTrendColor(theme.trend)}`}>
                          {theme.trend}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Category Performance</span>
            </CardTitle>
            <CardDescription>
              Theme performance by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.categoryStats.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {category.category}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.count} themes
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${category.popularity}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                      {category.popularity}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Daily Activity</span>
            </CardTitle>
            <CardDescription>
              Views and applications over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.dailyStats.slice(0, 7).map((stat, index) => (
                <div key={stat.date} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(stat.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.views} views
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.applications} apps
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ThemeAnalytics
