import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Mail, 
  Palette, 
  Type, 
  Layout, 
  Image, 
  Save, 
  Eye, 
  Send,
  Download,
  Upload,
  Copy,
  Trash2,
  Plus,
  Settings,
  Smartphone,
  Monitor,
  Tablet,
  Zap,
  CheckCircle,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Link,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Quote
} from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  description: string
  category: 'welcome' | 'order' | 'promotional' | 'notification' | 'custom'
  subject: string
  html: string
  text: string
  theme: {
    colors: {
      primary: string
      secondary: string
      accent: string
      background: string
      text: string
      muted: string
    }
    typography: {
      fontFamily: string
      fontSize: number
      lineHeight: number
    }
    layout: {
      width: number
      padding: number
      borderRadius: number
    }
  }
  variables: Array<{
    name: string
    description: string
    defaultValue: string
    required: boolean
  }>
  createdAt: string
  updatedAt: string
  isActive: boolean
}

interface EmailTemplateBuilderProps {
  onTemplateSave?: (template: EmailTemplate) => void
  onTemplateSend?: (template: EmailTemplate, recipients: string[]) => void
  onTemplateExport?: (template: EmailTemplate) => void
  currentTheme?: any
}

export function EmailTemplateBuilder({
  onTemplateSave,
  onTemplateSend,
  onTemplateExport,
  currentTheme
}: EmailTemplateBuilderProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isEditing, setIsEditing] = useState(false)
  const [newTemplate, setNewTemplate] = useState<Partial<EmailTemplate>>({
    name: '',
    description: '',
    category: 'custom',
    subject: '',
    html: '',
    text: '',
    theme: {
      colors: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#34d399',
        background: '#ffffff',
        text: '#111827',
        muted: '#6b7280'
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 16,
        lineHeight: 1.5
      },
      layout: {
        width: 600,
        padding: 20,
        borderRadius: 8
      }
    },
    variables: [],
    isActive: true
  })

  // Mock templates - in production, this would come from an API
  useEffect(() => {
    const mockTemplates: EmailTemplate[] = [
      {
        id: 'welcome-1',
        name: 'Welcome Email',
        description: 'Welcome new users to Little Harvest',
        category: 'welcome',
        subject: 'Welcome to Little Harvest!',
        html: `
          <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
            <div style="background: #10b981; padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Little Harvest!</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Nutritious meals for little ones</p>
            </div>
            <div style="padding: 30px;">
              <h2 style="color: #111827; margin: 0 0 20px 0;">Hello {{firstName}}!</h2>
              <p style="color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for joining Little Harvest! We're excited to help you provide nutritious meals for your little ones.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{shopUrl}}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Start Shopping
                </a>
              </div>
            </div>
            <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
              <p style="margin: 0;">© 2024 Little Harvest. All rights reserved.</p>
            </div>
          </div>
        `,
        text: 'Welcome to Little Harvest! Thank you for joining us. Visit our shop to start shopping for nutritious meals for your little ones.',
        theme: {
          colors: {
            primary: '#10b981',
            secondary: '#059669',
            accent: '#34d399',
            background: '#ffffff',
            text: '#111827',
            muted: '#6b7280'
          },
          typography: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 16,
            lineHeight: 1.5
          },
          layout: {
            width: 600,
            padding: 20,
            borderRadius: 8
          }
        },
        variables: [
          { name: 'firstName', description: 'User first name', defaultValue: 'there', required: true },
          { name: 'shopUrl', description: 'Shop URL', defaultValue: 'https://littleharvest.com/shop', required: true }
        ],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        isActive: true
      },
      {
        id: 'order-confirmation',
        name: 'Order Confirmation',
        description: 'Confirm order details and delivery information',
        category: 'order',
        subject: 'Order Confirmation - {{orderNumber}}',
        html: `
          <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
            <div style="background: #10b981; padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed!</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Order #{{orderNumber}}</p>
            </div>
            <div style="padding: 30px;">
              <h2 style="color: #111827; margin: 0 0 20px 0;">Thank you for your order!</h2>
              <p style="color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">
                We've received your order and are preparing it for delivery.
              </p>
              <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #111827; margin: 0 0 15px 0;">Order Details</h3>
                <p style="color: #6b7280; margin: 5px 0;"><strong>Order Number:</strong> {{orderNumber}}</p>
                <p style="color: #6b7280; margin: 5px 0;"><strong>Total:</strong> {{orderTotal}}</p>
                <p style="color: #6b7280; margin: 5px 0;"><strong>Delivery Date:</strong> {{deliveryDate}}</p>
              </div>
            </div>
            <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
              <p style="margin: 0;">© 2024 Little Harvest. All rights reserved.</p>
            </div>
          </div>
        `,
        text: 'Order Confirmed! Order #{{orderNumber}} - Total: {{orderTotal}} - Delivery: {{deliveryDate}}',
        theme: {
          colors: {
            primary: '#10b981',
            secondary: '#059669',
            accent: '#34d399',
            background: '#ffffff',
            text: '#111827',
            muted: '#6b7280'
          },
          typography: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 16,
            lineHeight: 1.5
          },
          layout: {
            width: 600,
            padding: 20,
            borderRadius: 8
          }
        },
        variables: [
          { name: 'orderNumber', description: 'Order number', defaultValue: 'LH-12345', required: true },
          { name: 'orderTotal', description: 'Order total amount', defaultValue: 'R299.99', required: true },
          { name: 'deliveryDate', description: 'Expected delivery date', defaultValue: 'Tomorrow', required: true }
        ],
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
        isActive: true
      }
    ]
    setTemplates(mockTemplates)
  }, [])

  const categories = [
    { id: 'welcome', name: 'Welcome', icon: Mail },
    { id: 'order', name: 'Order', icon: FileText },
    { id: 'promotional', name: 'Promotional', icon: Zap },
    { id: 'notification', name: 'Notification', icon: AlertCircle },
    { id: 'custom', name: 'Custom', icon: Settings }
  ]

  const handleSaveTemplate = () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.html) return

    const template: EmailTemplate = {
      id: selectedTemplate?.id || `template-${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description || '',
      category: newTemplate.category as any,
      subject: newTemplate.subject,
      html: newTemplate.html,
      text: newTemplate.text || '',
      theme: newTemplate.theme!,
      variables: newTemplate.variables || [],
      createdAt: selectedTemplate?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isActive: newTemplate.isActive !== false
    }

    if (selectedTemplate) {
      setTemplates(templates.map(t => t.id === selectedTemplate.id ? template : t))
    } else {
      setTemplates([...templates, template])
    }

    onTemplateSave?.(template)
    setIsEditing(false)
    setSelectedTemplate(template)
  }

  const handleCreateTemplate = () => {
    setNewTemplate({
      name: '',
      description: '',
      category: 'custom',
      subject: '',
      html: '',
      text: '',
      theme: currentTheme || {
        colors: {
          primary: '#10b981',
          secondary: '#059669',
          accent: '#34d399',
          background: '#ffffff',
          text: '#111827',
          muted: '#6b7280'
        },
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 16,
          lineHeight: 1.5
        },
        layout: {
          width: 600,
          padding: 20,
          borderRadius: 8
        }
      },
      variables: [],
      isActive: true
    })
    setSelectedTemplate(null)
    setIsEditing(true)
  }

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setNewTemplate(template)
    setIsEditing(true)
  }

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId))
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null)
      setIsEditing(false)
    }
  }

  const handleExportTemplate = (template: EmailTemplate) => {
    const dataStr = JSON.stringify(template, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `${template.name.replace(/\s+/g, '-').toLowerCase()}-template.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    onTemplateExport?.(template)
  }

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile':
        return '375px'
      case 'tablet':
        return '768px'
      default:
        return '100%'
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Template Builder Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Email Template Builder
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create and customize email templates with your theme
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
          </Button>
          <Button
            onClick={handleCreateTemplate}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Template</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Templates</span>
              </CardTitle>
              <CardDescription>
                Manage your email templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => {
                    setSelectedTemplate(template)
                    setIsEditing(false)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {template.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {template.category}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditTemplate(template)
                        }}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExportTemplate(template)
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTemplate(template.id)
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-2 space-y-6">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Template Editor</span>
                </CardTitle>
                <CardDescription>
                  {selectedTemplate ? 'Edit template' : 'Create new template'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="content" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="design">Design</TabsTrigger>
                    <TabsTrigger value="variables">Variables</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="templateName">Template Name</Label>
                        <Input
                          id="templateName"
                          value={newTemplate.name}
                          onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                          placeholder="Welcome Email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="templateCategory">Category</Label>
                        <Select
                          value={newTemplate.category}
                          onValueChange={(value: any) => setNewTemplate({ ...newTemplate, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center space-x-2">
                                  <category.icon className="h-4 w-4" />
                                  <span>{category.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="templateDescription">Description</Label>
                      <Input
                        id="templateDescription"
                        value={newTemplate.description}
                        onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                        placeholder="Brief description of this template"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailSubject">Email Subject</Label>
                      <Input
                        id="emailSubject"
                        value={newTemplate.subject}
                        onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                        placeholder="Welcome to Little Harvest!"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailHtml">HTML Content</Label>
                      <Textarea
                        id="emailHtml"
                        value={newTemplate.html}
                        onChange={(e) => setNewTemplate({ ...newTemplate, html: e.target.value })}
                        placeholder="<div>Your HTML content here...</div>"
                        rows={12}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailText">Plain Text Content</Label>
                      <Textarea
                        id="emailText"
                        value={newTemplate.text}
                        onChange={(e) => setNewTemplate({ ...newTemplate, text: e.target.value })}
                        placeholder="Plain text version of your email"
                        rows={4}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="design" className="space-y-4">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Theme Colors</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(newTemplate.theme?.colors || {}).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <Label htmlFor={key} className="capitalize text-sm">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </Label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                id={key}
                                value={value}
                                onChange={(e) => setNewTemplate({
                                  ...newTemplate,
                                  theme: {
                                    ...newTemplate.theme!,
                                    colors: { ...newTemplate.theme!.colors, [key]: e.target.value }
                                  }
                                })}
                                className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                              />
                              <Input
                                value={value}
                                onChange={(e) => setNewTemplate({
                                  ...newTemplate,
                                  theme: {
                                    ...newTemplate.theme!,
                                    colors: { ...newTemplate.theme!.colors, [key]: e.target.value }
                                  }
                                })}
                                className="flex-1 text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Typography</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fontFamily">Font Family</Label>
                          <Select
                            value={newTemplate.theme?.typography.fontFamily}
                            onValueChange={(value) => setNewTemplate({
                              ...newTemplate,
                              theme: {
                                ...newTemplate.theme!,
                                typography: { ...newTemplate.theme!.typography, fontFamily: value }
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Inter, system-ui, sans-serif">Inter</SelectItem>
                              <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                              <SelectItem value="Open Sans, sans-serif">Open Sans</SelectItem>
                              <SelectItem value="Lato, sans-serif">Lato</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="fontSize">Font Size: {newTemplate.theme?.typography.fontSize}px</Label>
                          <Slider
                            value={[newTemplate.theme?.typography.fontSize || 16]}
                            onValueChange={([value]) => setNewTemplate({
                              ...newTemplate,
                              theme: {
                                ...newTemplate.theme!,
                                typography: { ...newTemplate.theme!.typography, fontSize: value }
                              }
                            })}
                            min={12}
                            max={24}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Layout</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emailWidth">Width: {newTemplate.theme?.layout.width}px</Label>
                          <Slider
                            value={[newTemplate.theme?.layout.width || 600]}
                            onValueChange={([value]) => setNewTemplate({
                              ...newTemplate,
                              theme: {
                                ...newTemplate.theme!,
                                layout: { ...newTemplate.theme!.layout, width: value }
                              }
                            })}
                            min={400}
                            max={800}
                            step={20}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="emailPadding">Padding: {newTemplate.theme?.layout.padding}px</Label>
                          <Slider
                            value={[newTemplate.theme?.layout.padding || 20]}
                            onValueChange={([value]) => setNewTemplate({
                              ...newTemplate,
                              theme: {
                                ...newTemplate.theme!,
                                layout: { ...newTemplate.theme!.layout, padding: value }
                              }
                            })}
                            min={10}
                            max={50}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="variables" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Template Variables</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNewTemplate({
                          ...newTemplate,
                          variables: [...(newTemplate.variables || []), {
                            name: '',
                            description: '',
                            defaultValue: '',
                            required: false
                          }]
                        })}
                      >
                        <Plus className="h-3 w-3" />
                        Add Variable
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {(newTemplate.variables || []).map((variable, index) => (
                        <div key={index} className="p-3 border rounded-lg space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor={`var-name-${index}`}>Variable Name</Label>
                              <Input
                                id={`var-name-${index}`}
                                value={variable.name}
                                onChange={(e) => {
                                  const newVariables = [...(newTemplate.variables || [])]
                                  newVariables[index] = { ...variable, name: e.target.value }
                                  setNewTemplate({ ...newTemplate, variables: newVariables })
                                }}
                                placeholder="firstName"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`var-default-${index}`}>Default Value</Label>
                              <Input
                                id={`var-default-${index}`}
                                value={variable.defaultValue}
                                onChange={(e) => {
                                  const newVariables = [...(newTemplate.variables || [])]
                                  newVariables[index] = { ...variable, defaultValue: e.target.value }
                                  setNewTemplate({ ...newTemplate, variables: newVariables })
                                }}
                                placeholder="John"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`var-desc-${index}`}>Description</Label>
                            <Input
                              id={`var-desc-${index}`}
                              value={variable.description}
                              onChange={(e) => {
                                const newVariables = [...(newTemplate.variables || [])]
                                newVariables[index] = { ...variable, description: e.target.value }
                                setNewTemplate({ ...newTemplate, variables: newVariables })
                              }}
                              placeholder="User's first name"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={variable.required}
                                onCheckedChange={(checked) => {
                                  const newVariables = [...(newTemplate.variables || [])]
                                  newVariables[index] = { ...variable, required: checked }
                                  setNewTemplate({ ...newTemplate, variables: newVariables })
                                }}
                              />
                              <Label htmlFor={`var-required-${index}`}>Required</Label>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newVariables = (newTemplate.variables || []).filter((_, i) => i !== index)
                                setNewTemplate({ ...newTemplate, variables: newVariables })
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setSelectedTemplate(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveTemplate}
                    disabled={!newTemplate.name || !newTemplate.subject || !newTemplate.html}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Template Selected
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Select a template from the list or create a new one to start editing.
                </p>
                <Button onClick={handleCreateTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Template
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && selectedTemplate && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Email Preview</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant={previewMode === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor className="h-3 w-3" />
                </Button>
                <Button
                  variant={previewMode === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('tablet')}
                >
                  <Tablet className="h-3 w-3" />
                </Button>
                <Button
                  variant={previewMode === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <CardDescription>
              Preview how your email will look to recipients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="bg-gray-100 dark:bg-gray-800 p-4"
                style={{ width: getPreviewWidth() }}
              >
                <div 
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.html }}
                  style={{ 
                    maxWidth: '100%',
                    margin: '0 auto'
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default EmailTemplateBuilder
