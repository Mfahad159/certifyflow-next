"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import JSZip from 'jszip'
import { jsPDF } from 'jspdf'
import QRCode from 'qrcode';
import html2canvas from 'html2canvas'
import { v4 as uuidv4 } from 'uuid'
import { Canvas, FabricImage, IText, Rect, Circle, Triangle, ActiveSelection, StaticCanvas, Shadow, Point, Line } from 'fabric'
import { useRouter, useParams, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'
import { campaignService } from '@/lib/campaignService.client'
import { templateService } from '@/lib/templateService'
import { storageService } from '@/lib/storageService'
import { templates as CANVAS_PRESETS } from '@/lib/templates'
import { Loader } from '../../ui/loader'

import { toast } from 'sonner'
import { usePinch } from '@use-gesture/react'
import EmailBatchModal from '../shared/EmailBatchModal'

// Import Sub-components
import Toolbar from './components/Toolbar'
import SidebarLeft from './components/SidebarLeft'
import PropertiesPanel from './components/PropertiesPanel'
import HistoryBar from './components/HistoryBar'
import EditorCanvas from './components/Canvas'
import ShortcutsModal from './components/ShortcutsModal'
import UnsavedDialog from './components/UnsavedDialog'
import EmailTemplateModal from '../shared/EmailTemplateModal'


export default function Editor({ campaignType: initialCampaignType = 'generate_only' }) {
  const navigate = useRouter()
  const pathname = usePathname()
  const { campaignId, templateId } = useParams()

  // Determine editor mode based on URL or parameters
  const isTemplateMode = pathname.includes('/templates/')
  const [campaignType, setCampaignType] = useState(initialCampaignType)
  const isEmailSendEnabled = !isTemplateMode && campaignType === 'generate_send'

  const canvasRef = useRef(null)
  const fabricRef = useRef(null) // Fabric Canvas instance
  const panningRef = useRef({ active: false, startX: 0, startY: 0, initialPanX: 0, initialPanY: 0 })
  const lastTouchDistance = useRef(0)
  const syncTimeoutRef = useRef(null)
  const arrowKeyHistoryTimeout = useRef(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [names, setNames] = useState(['Demo Name'])
  const [previewName, setPreviewName] = useState('Demo Name')
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(null)
  const [csvData, setCsvData] = useState([])
  const [csvColumns, setCsvColumns] = useState([])

  // State for text fields (layers)
  // We sync this with Fabric objects
  const [textFields, setTextFields] = useState([])

  const [selectedFieldId, setSelectedFieldId] = useState(null)
  const [campaignName, setCampaignName] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 })

  // Advanced Editor State
  const [history, setHistory] = useState([])
  const [historyStep, setHistoryStep] = useState(-1)
  const [previewRowIndex, setPreviewRowIndex] = useState(0)
  const [showGrid, setShowGrid] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [certificates, setCertificates] = useState([])

  const [sendingEmails, setSendingEmails] = useState(false)
  const [emailsSent, setEmailsSent] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingWork, setIsSavingWork] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)

  const initialDataRef = useRef(null)
  const isModifying = useRef(false)
  const hasLoaded = useRef(false)

  const [lastSavedTime, setLastSavedTime] = useState(null)
  const [dbTemplates, setDbTemplates] = useState([])
  const [isFetchingTemplates, setIsFetchingTemplates] = useState(false)

  // Use useMemo for derived state to avoid extra re-renders (Vercel Best Practices)
  const hasUnsavedChanges = React.useMemo(() => {
    if (!initialDataRef.current || isLoading) return false
    const currentData = JSON.stringify({
      textFields,
      campaignName,
      csvData,
      csvColumns
    })
    return currentData !== initialDataRef.current
  }, [textFields, campaignName, csvData, csvColumns, isLoading, lastSavedTime])

  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const modificationTimeout = useRef(null)
  const needsInitialSync = useRef(false)
  const zoomRafRef = useRef(null)
  const canvasPanRef = useRef({ x: 0, y: 0 })
  const autoSaveTimeoutRef = useRef(null)

  // Keep ref in sync for event listeners
  useEffect(() => {
    canvasPanRef.current = canvasPan
  }, [canvasPan])
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailConfig, setEmailConfig] = useState(null)

  // Batch sending states
  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [batchProgress, setBatchProgress] = useState(0)
  const [batchIdx, setBatchIdx] = useState(0)
  const [batchIsPaused, setBatchIsPaused] = useState(false)
  const batchIsPausedRef = useRef(false)
  const [batchIsCompleted, setBatchIsCompleted] = useState(false)

  // --- HISTORY MANAGEMENT ---
  const isHistoryAction = useRef(false)
  const lastHistoryState = useRef(null)

  const addToHistory = useCallback((newState) => {
    // Clone state to prevent reference issues in history
    const stateStr = JSON.stringify(newState)
    if (stateStr === lastHistoryState.current) return

    lastHistoryState.current = stateStr

    // Prefer structuredClone if available for perf, fallback to JSON parse
    const clonedState = typeof structuredClone === 'function'
      ? structuredClone(newState)
      : JSON.parse(stateStr)

    const newHistory = history.slice(0, historyStep + 1)
    newHistory.push(clonedState)
    if (newHistory.length > 50) newHistory.shift()

    setHistory(newHistory)
    setHistoryStep(newHistory.length - 1)
  }, [history, historyStep])

  // Canvas Actions
  const moveLayer = useCallback((id, direction) => {
    setTextFields(prev => {
      const index = prev.findIndex(f => f.id === id)
      if (index === -1) return prev

      let newFields = [...prev]
      const item = newFields.splice(index, 1)[0]

      if (direction === 'up') {
        const nextIdx = Math.min(newFields.length, index + 1)
        newFields.splice(nextIdx, 0, item)
      } else if (direction === 'down') {
        const nextIdx = Math.max(0, index - 1)
        newFields.splice(nextIdx, 0, item)
      } else if (direction === 'front') {
        newFields.push(item)
      } else if (direction === 'back') {
        newFields.unshift(item)
      }

      addToHistory(newFields)
      return newFields
    })
  }, [addToHistory])

  const handleDragStart = useCallback((e, index) => {
    e.dataTransfer.setData('text/plain', index)
    e.currentTarget.style.opacity = '0.4'
  }, [])

  const handleDragEnd = useCallback((e) => {
    e.currentTarget.style.opacity = '1'
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e, toIndex) => {
    e.preventDefault()
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (isNaN(fromIndex) || fromIndex === toIndex) return

    setTextFields(prev => {
      const newFields = [...prev]
      const [movedItem] = newFields.splice(fromIndex, 1)
      newFields.splice(toIndex, 0, movedItem)
      addToHistory(newFields)
      return newFields
    })
  }, [addToHistory])

  const addShape = useCallback((type, customWidth, customHeight) => {
    const id = uuidv4()
    let shape = {
      id,
      type,
      x: uploadedImage ? Math.round(uploadedImage.width / 2) - (customWidth ? customWidth / 2 : 50) : 100,
      y: uploadedImage ? Math.round(uploadedImage.height / 2) - (customHeight ? customHeight / 2 : 50) : 100,
      width: customWidth || 100,
      height: customHeight || 100,
      color: '#A098FF',
      opacity: 1,
      locked: false
    }

    if (type === 'circle') shape.radius = 50

    setTextFields(prev => {
      const newFields = [...prev, shape]
      addToHistory(newFields)
      return newFields
    })
    setSelectedFieldId(id)
  }, [uploadedImage, addToHistory])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])

  // Track initial data for unsaved changes comparison
  useEffect(() => {
    if (!initialDataRef.current && !isLoading && (campaignId || isTemplateMode)) {
      initialDataRef.current = JSON.stringify({
        textFields,
        campaignName,
        csvData,
        csvColumns
      })
    }
  }, [textFields, campaignName, csvData, csvColumns, isLoading, campaignId, isTemplateMode])

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Fetch library templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsFetchingTemplates(true)
        const { data: { user } } = await supabase.auth.getUser()

        const [pubTemplates, privTemplates] = await Promise.all([
          templateService.getPublicTemplates(),
          user ? templateService.getUserTemplates(user.id) : Promise.resolve([])
        ])

        // Combine them with source markers
        const allTemplates = [
          ...pubTemplates.map(t => ({ ...t, source: 'public' })),
          ...privTemplates.map(t => ({ ...t, source: 'private' }))
        ]

        setDbTemplates(allTemplates)
      } catch (error) {
        console.error('Error fetching library templates:', error)
      } finally {
        setIsFetchingTemplates(false)
      }
    }

    fetchTemplates()
  }, [])

  // Helper to refresh signed URLs for image fields
  const refreshImageFields = useCallback(async (fields) => {
    if (!fields) return []
    return Promise.all(fields.map(async f => {
      if (f.type === 'image' && f.path) {
        try {
          const signedUrl = await storageService.getSignedUrl(f.path)
          return { ...f, src: signedUrl }
        } catch (err) {
          console.error('Error refreshing asset URL:', err)
          return f
        }
      }
      return f
    }))
  }, [])

  // Load campaign from database if campaignId is provided
  useEffect(() => {
    const loadCampaign = async () => {
      if (hasLoaded.current) return

      const minLoadTime = new Promise(resolve => setTimeout(resolve, 3000))

      // CASE 1: Editing an existing template
      if (templateId) {
        setIsLoading(true)
        try {
          const [data, _] = await Promise.all([
            templateService.getPrivateTemplate(templateId),
            minLoadTime
          ])

          if (data) {
            setCampaignName(data.name)

            if (data.template_data && data.template_data.textFields) {
              const fields = data.template_data.textFields
              const refreshedFields = await refreshImageFields(fields)
              setTextFields(refreshedFields)
              setHistory([JSON.parse(JSON.stringify(refreshedFields))])
              setHistoryStep(0)
              lastHistoryState.current = JSON.stringify(refreshedFields)
              needsInitialSync.current = true
            }

            // Create a default white background if no image uploaded
            const canvas = document.createElement('canvas')
            canvas.width = 800
            canvas.height = 600
            const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            const bgImg = await loadImage(canvas.toDataURL('image/png'))
            setUploadedImage(bgImg)
          }
        } catch (error) {
          console.error('Error loading template:', error)
          toast.error('Failed to load template')
        } finally {
          setIsLoading(false)
          hasLoaded.current = true
        }
        return
      }

      // CASE 2: Creating a new template
      if (isTemplateMode && !templateId) {
        setIsLoading(true)
        await minLoadTime
        setCampaignName('Untitled Template')

        // Default blank canvas
        const canvas = document.createElement('canvas')
        canvas.width = 800
        canvas.height = 600
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        const bgImg = await loadImage(canvas.toDataURL('image/png'))
        setUploadedImage(bgImg)

        setIsLoading(false)
        hasLoaded.current = true
        return
      }

      // CASE 3: Loading a campaign (Existing functionality)
      if (campaignId) {
        setIsLoading(true)
        try {
          const [{ data, error }, { data: certs, error: certError }] = await Promise.all([
            supabase
              .from('campaigns')
              .select('*, public_templates(*), private_templates(*)')
              .eq('id', campaignId)
              .single(),
            supabase
              .from('certificates')
              .select('*')
              .eq('campaign_id', campaignId),
            minLoadTime
          ])

          if (error) throw error
          if (certError) console.error('Error loading certs:', certError)

          if (certs) setCertificates(certs)

          if (data) {
            setCampaignName(data.name)
            setCampaignType(data.type)

            if (data.csv_data) {
              const { headers, data: csvRows } = data.csv_data
              setCsvColumns(headers)
              setCsvData(csvRows)
              const names = csvRows.map(row => row[headers[0]] || '')
              setNames(names)
              if (names.length > 0) {
                setPreviewName(names[0])
                setPreviewRowIndex(0)
              }
            }

            if (data.canvas_config && data.canvas_config.textFields) {
              const fields = data.canvas_config.textFields
              const fieldsWithIds = fields.map((f, idx) => ({
                ...f,
                id: f.id || `restored_${Date.now()}_${idx}`
              }))
              const refreshedFields = await refreshImageFields(fieldsWithIds)
              setTextFields(refreshedFields)
              setHistory([JSON.parse(JSON.stringify(refreshedFields))])
              setHistoryStep(0)
              lastHistoryState.current = JSON.stringify(refreshedFields)
              needsInitialSync.current = true
            }

            if (data.public_template_id || data.private_template_id) {
              const tId = data.public_template_id || data.private_template_id
              const template = data.public_templates || data.private_templates || templates.find(t => String(t.id) === String(tId))

              if (template) {
                const isJsonTemplate = template.template_data && template.template_data.textFields
                if (isJsonTemplate) {
                  const canvas = document.createElement('canvas')
                  canvas.width = template.template_data.canvas_width || 800
                  canvas.height = template.template_data.canvas_height || 600
                  const ctx = canvas.getContext('2d')
                  ctx.fillStyle = template.template_data.background_color || '#FFFFFF'
                  ctx.fillRect(0, 0, canvas.width, canvas.height)
                  const bgImg = await loadImage(canvas.toDataURL('image/png'))
                  setUploadedImage(bgImg)

                  if (!data.canvas_config || !data.canvas_config.textFields) {
                    const newFields = template.template_data.textFields.map(f => ({
                      ...f,
                      id: `template_${Date.now()}_${Math.random()}`
                    }))
                    setTextFields(newFields)
                    setHistory([JSON.parse(JSON.stringify(newFields))])
                    setHistoryStep(0)
                    lastHistoryState.current = JSON.stringify(newFields)
                    needsInitialSync.current = true
                  }
                } else {
                  const { img: bgImg, detectedFields } = await generateTemplateBackground(template)
                  setUploadedImage(bgImg)
                  if (!data.canvas_config || !data.canvas_config.textFields) {
                    if (detectedFields.length > 0) {
                      const newFields = detectedFields.map(f => ({ ...f, id: `auto_${Date.now()}_${Math.random()}` }))
                      setTextFields(newFields)
                      setHistory([JSON.parse(JSON.stringify(newFields))])
                      setHistoryStep(0)
                      lastHistoryState.current = JSON.stringify(newFields)
                    }
                  }
                }
              }
            } else {
              const canvas = document.createElement('canvas')
              canvas.width = 800
              canvas.height = 600
              const ctx = canvas.getContext('2d')
              ctx.fillStyle = '#FFFFFF'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
              const bgImg = await loadImage(canvas.toDataURL('image/png'))
              setUploadedImage(bgImg)
            }
          }
        } catch (error) {
          console.error('Error loading campaign:', error)
          toast.error('Failed to load campaign')
        } finally {
          setIsLoading(false)
          hasLoaded.current = true
        }
      } else {
        await minLoadTime
        setIsLoading(false)
      }
    }

    loadCampaign()
  }, [campaignId, templateId, isTemplateMode, refreshImageFields])


  const handleLogout = async () => {
    await signOut()
    navigate.push('/')
  }

  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [isUiPanning, setIsUiPanning] = useState(false)

  const handleSaveWork = useCallback(async (isAutoSave = false) => {
    if (!campaignId && !isTemplateMode) {
      if (!isAutoSave) toast.error('No project to save')
      return
    }

    if (isAutoSave) {
      setIsAutoSaving(true)
    } else {
      setIsSavingWork(true)
    }

    try {
      const sanitizedFields = textFields.map(f => {
        if (f.type === 'image') {
          const { src, image, ...rest } = f
          return rest
        }
        return f
      })

      if (isTemplateMode) {
        const html = mapJsonToHtml(sanitizedFields)

        if (templateId) {
          await templateService.updateTemplate(templateId, {
            name: campaignName,
            template_data: {
              textFields: sanitizedFields,
              html_content: html // Store snapshot in JSON
            }
          })
        } else {
          const newTemplate = await templateService.createTemplate({
            user_id: user.id,
            name: campaignName || 'Untitled Template',
            template_data: {
              textFields: sanitizedFields,
              html_content: html
            },
            category: 'custom'
          })
          // Update URL to the new template ID
          navigate.push(`/dashboard/templates/edit/${newTemplate.id}`, { replace: true })
          toast.success('Template created successfully')
        }
      } else {
        await campaignService.updateCampaign(campaignId, {
          canvas_config: {
            textFields: sanitizedFields
          },
          csv_data: {
            headers: csvColumns,
            data: csvData
          }
        })
      }

      initialDataRef.current = JSON.stringify({
        textFields,
        campaignName,
        csvData,
        csvColumns
      })
      setLastSavedTime(new Date())
      if (!isAutoSave && (templateId || campaignId)) toast.success('Work saved successfully')
    } catch (error) {
      console.error('Error saving work:', error)
      if (!isAutoSave) toast.error('Failed to save work')
    } finally {
      setIsAutoSaving(false)
      setIsSavingWork(false)
    }
  }, [campaignId, templateId, isTemplateMode, textFields, csvColumns, csvData, campaignName, user, navigate])

  const handleWorkspaceWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setZoomLevel(prev => Math.min(3, Math.max(0.25, prev + delta)))
    } else {
      // Normal scroll translates to pan when space is held or just pass through
      if (isSpacePressed) {
        e.preventDefault()
        setCanvasPan(prev => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY
        }))
      }
    }
  }, [isSpacePressed])

  // Effect to handle non-passive events and global gestures
  useEffect(() => {
    const workspace = document.getElementById('editor-workspace')
    if (!workspace) return

    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
      }
    }

    const preventSafariZoom = (e) => {
      e.preventDefault()
    }

    const handleNativePointerDown = (e) => {
      const isMiddleClick = e.button === 1
      const isRightClick = e.button === 2
      const isWorkspaceTarget = e.target === workspace || e.target.id === 'editor-workspace'

      const shouldPan = isWorkspaceTarget || isSpacePressed || isMiddleClick || isRightClick

      if (shouldPan) {
        if (isRightClick || isMiddleClick || isSpacePressed) {
          e.stopPropagation()
        }

        setIsUiPanning(true)
        panningRef.current.active = true
        panningRef.current.startX = e.clientX
        panningRef.current.startY = e.clientY
        panningRef.current.initialPanX = canvasPanRef.current.x
        panningRef.current.initialPanY = canvasPanRef.current.y

        window.addEventListener('pointermove', handleWorkspacePointerMove)
        window.addEventListener('pointerup', handleWorkspacePointerUp)

        if (fabricRef.current && (isSpacePressed || isMiddleClick || isRightClick)) {
          fabricRef.current.discardActiveObject()
          fabricRef.current.requestRenderAll()
        }
      }
    }

    workspace.addEventListener('pointerdown', handleNativePointerDown, { capture: true })
    document.addEventListener('gesturestart', preventSafariZoom)
    document.addEventListener('gesturechange', preventSafariZoom)

    return () => {
      workspace.removeEventListener('pointerdown', handleNativePointerDown, { capture: true })
      document.removeEventListener('gesturestart', preventSafariZoom)
      document.removeEventListener('gesturechange', preventSafariZoom)
    }
  }, [isSpacePressed, isLoading])

  const handleWorkspacePointerMove = (e) => {
    if (!panningRef.current.active) return
    const deltaX = e.clientX - panningRef.current.startX
    const deltaY = e.clientY - panningRef.current.startY
    setCanvasPan({
      x: panningRef.current.initialPanX + deltaX,
      y: panningRef.current.initialPanY + deltaY
    })
  }

  const handleWorkspacePointerUp = () => {
    panningRef.current.active = false
    setIsUiPanning(false)
    window.removeEventListener('pointermove', handleWorkspacePointerMove)
    window.removeEventListener('pointerup', handleWorkspacePointerUp)
  }





  const undo = useCallback(() => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1
      const prevState = history[prevStep]
      isHistoryAction.current = true
      isModifying.current = false // Reset any active geometry locks
      setHistoryStep(prevStep)
      setTextFields(prevState)
      lastHistoryState.current = JSON.stringify(prevState)
    }
  }, [history, historyStep])

  const redo = useCallback(() => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1
      const nextState = history[nextStep]
      isHistoryAction.current = true
      isModifying.current = false // Reset any active geometry locks
      setHistoryStep(nextStep)
      setTextFields(nextState)
      lastHistoryState.current = JSON.stringify(nextState)
    }
  }, [history, historyStep])

  // Snapshot history on textFields changes
  useEffect(() => {
    if (isHistoryAction.current) {
      isHistoryAction.current = false
      return
    }

    const timer = setTimeout(() => {
      addToHistory(textFields)
    }, 300) // Debounce snapshots

    return () => clearTimeout(timer)
  }, [textFields, addToHistory])

  // Record history on change (debounced manually or via specific actions)
  // We'll call addToHistory manually in specific actions to avoid state churn



  const duplicateLayer = useCallback((id) => {
    setTextFields(prev => {
      const field = prev.find(f => f.id === id)
      if (!field) return prev

      // Prevent duplicating unique fields
      if (field.type === 'uuid' || field.type === 'qrcode') {
        toast.error(`Only one ${field.type.toUpperCase()} allowed per certificate`)
        return prev
      }

      const newField = {
        ...field,
        id: Date.now(),
        x: field.x + 20,
        y: field.y + 20
      }
      const newFields = [...prev, newField]
      addToHistory(newFields)
      setSelectedFieldId(newField.id)
      return newFields
    })
  }, [addToHistory])

  // Initialize Fabric Data Sync
  useEffect(() => {
    if (!canvasRef.current || !uploadedImage) return

    // Dispose old canvas if exists
    if (fabricRef.current) {
      fabricRef.current.dispose()
    }

    const canvas = new Canvas(canvasRef.current, {
      width: uploadedImage.width,
      height: uploadedImage.height,
      selection: true,
      preserveObjectStacking: true,
      renderOnAddRemove: true,
      backgroundColor: 'transparent'
    })

    fabricRef.current = canvas
    setCanvasReady(true)
    console.log('✅ Canvas is ready')

    // Force initial sync if fields were loaded before canvas is ready
    if (needsInitialSync.current) {
      console.log('🔄 [FORCE-SYNC] Triggering initial sync after canvas ready')
      needsInitialSync.current = false
      // Small delay to ensure canvas is fully initialized
      setTimeout(() => {
        setTextFields(prev => [...prev]) // Force re-render
      }, 100)
    }
    // Ensure modification lock is false on initialization
    isModifying.current = false

    // Set background with reserved ID
    const bg = new FabricImage(uploadedImage, {
      id: 'canvas-background',
      originX: 'left',
      originY: 'top',
      selectable: false,
      evented: false,
      scaleX: 1,
      scaleY: 1,
      opacity: 1
    })
    canvas.add(bg)
    canvas.sendObjectToBack(bg)

    // Set initial zoom
    canvas.setZoom(zoomLevel)
    canvas.requestRenderAll()

    // Event listeners
    canvas.on('selection:created', (e) => {
      const active = e.selected?.[0]
      if (active?.id) setSelectedFieldId(active.id)
    })
    canvas.on('selection:updated', (e) => {
      const active = e.selected?.[0]
      if (active?.id) setSelectedFieldId(active.id)
    })
    canvas.on('selection:cleared', () => setSelectedFieldId(null))

    canvas.on('object:moving', (e) => {
      isModifying.current = true
      if (modificationTimeout.current) clearTimeout(modificationTimeout.current)

      const obj = e.target
      if (!obj || !uploadedImage) return

      const canvasWidth = uploadedImage.width
      const canvasHeight = uploadedImage.height
      const centerX = canvasWidth / 2
      const centerY = canvasHeight / 2
      const snapDist = 10

      // Clear existing guidelines
      const guides = canvas.getObjects().filter(o => o.id === 'guide-line')
      guides.forEach(g => canvas.remove(g))

      const objCenter = obj.getCenterPoint()
      let snappedX = false
      let snappedY = false

      // Snap to Center X
      if (Math.abs(objCenter.x - centerX) < snapDist) {
        obj.setPositionByOrigin(new Point(centerX, objCenter.y), 'center', 'center')
        snappedX = true

        // Draw Vertical Guide
        const vLine = new Line([centerX, 0, centerX, canvasHeight], {
          id: 'guide-line',
          stroke: '#00FFFF', // Cyan for visibility
          strokeWidth: 1,
          selectable: false,
          evented: false,
          strokeDashArray: [5, 5],
          opacity: 0.8
        })
        canvas.add(vLine)
      }

      // Snap to Center Y
      if (Math.abs(objCenter.y - centerY) < snapDist) {
        obj.setPositionByOrigin(new Point(objCenter.x, centerY), 'center', 'center')
        snappedY = true

        // Draw Horizontal Guide
        const hLine = new Line([0, centerY, canvasWidth, centerY], {
          id: 'guide-line',
          stroke: '#00FFFF',
          strokeWidth: 1,
          selectable: false,
          evented: false,
          strokeDashArray: [5, 5],
          opacity: 0.8
        })
        canvas.add(hLine)
      }

      if (snappedX || snappedY) {
        canvas.requestRenderAll()
      }
    })

    canvas.on('object:scaling', () => {
      isModifying.current = true
      if (modificationTimeout.current) clearTimeout(modificationTimeout.current)
    })

    canvas.on('object:rotating', () => {
      isModifying.current = true
      if (modificationTimeout.current) clearTimeout(modificationTimeout.current)
    })

    canvas.on('object:modified', (e) => {
      // Clear guidelines
      const guides = canvas.getObjects().filter(o => o.id === 'guide-line')
      guides.forEach(g => canvas.remove(g))
      canvas.requestRenderAll()

      const target = e.target
      if (!target) return

      // Lock sync for 500ms to prevent coordinate conflicts
      isModifying.current = true
      if (modificationTimeout.current) clearTimeout(modificationTimeout.current)

      // Update React state with final positions
      const modifiedObjects = target.type === 'activeSelection' ? target.getObjects() : [target]

      setTextFields(prev => prev.map(f => {
        const matchingObj = modifiedObjects.find(obj => String(obj.id) === String(f.id))
        if (matchingObj) {
          const obj = matchingObj
          const isText = obj.type === 'i-text' || obj.type === 'text'

          // Use direct object properties (Fabric handles group coordinate conversion)
          const newX = obj.left
          const newY = obj.top
          const newScaleX = obj.scaleX
          const newScaleY = obj.scaleY
          const newAngle = obj.angle || 0

          // Normalize Font Size for text objects
          let newFontSize = f.fontSize
          let finalScaleX = newScaleX
          let finalScaleY = newScaleY
          let newWidth = (obj.width || 0) * newScaleX
          let newHeight = (obj.height || 0) * newScaleY
          let newRadius = f.radius

          if (isText) {
            // Absorb scale into font size for text
            newFontSize = Math.round((obj.fontSize || f.fontSize) * newScaleX)
            finalScaleX = 1
            finalScaleY = 1
            // Reset the object scale on canvas immediately
            obj.set({ fontSize: newFontSize, scaleX: 1, scaleY: 1 })
            obj.setCoords()
          } else if (['rect', 'triangle', 'circle'].includes(obj.type)) {
            // Shape normalization: Absorb scale into dimensions
            finalScaleX = 1
            finalScaleY = 1
            if (obj.type === 'circle') {
              newRadius = Math.round((obj.radius || 50) * newScaleX)
              newWidth = newRadius * 2
              newHeight = newRadius * 2
              obj.set({ radius: newRadius, scaleX: 1, scaleY: 1 })
            } else {
              newWidth = Math.round((obj.width || 0) * newScaleX)
              newHeight = Math.round((obj.height || 0) * newScaleY)
              obj.set({ width: newWidth, height: newHeight, scaleX: 1, scaleY: 1 })
            }
            obj.setCoords()
          }

          return {
            ...f,
            x: newX,
            y: newY,
            fontSize: newFontSize,
            scaleX: finalScaleX,
            scaleY: finalScaleY,
            rotation: newAngle,
            width: newWidth,
            height: newHeight,
            size: f.type === 'qrcode' ? newWidth : f.size,
            radius: newRadius,
            color: obj.fill,
            opacity: obj.opacity,
            charSpacing: obj.charSpacing,
            lineHeight: obj.lineHeight
          }
        }
        return f
      }))

      // Release lock after a delay
      modificationTimeout.current = setTimeout(() => {
        isModifying.current = false
        canvas.requestRenderAll()
      }, 200)

      // Add to history
      setTimeout(() => {
        setTextFields(current => {
          addToHistory(current)
          return current
        })
      }, 600)
    })

    // Immediate sync pass after initialization
    setCanvasReady(true)

    return () => {
      canvas.dispose()
      fabricRef.current = null
      setCanvasReady(false)
    }

  }, [uploadedImage])

  // Pinch-to-Zoom using @use-gesture/react and Fabric.js zoomToPoint
  const bind = usePinch(
    ({ origin: [ox, oy], offset: [scale], memo }) => {
      const canvas = fabricRef.current
      if (!canvas || !canvasRef.current) return memo

      // Lock all canvas objects during pinch to prevent interference
      canvas.getObjects().forEach(obj => {
        if (obj.id !== 'canvas-background') {
          obj.set({
            selectable: false,
            evented: false,
            hasControls: false,
            hasBorders: false
          })
        }
      })

      // Calculate new zoom level with constraints
      const newZoom = Math.min(3, Math.max(0.25, scale))

      // Cancel any pending zoom update
      if (zoomRafRef.current) {
        cancelAnimationFrame(zoomRafRef.current)
      }

      // Batch zoom updates using requestAnimationFrame for smooth rendering
      zoomRafRef.current = requestAnimationFrame(() => {
        setZoomLevel(newZoom)
      })

      return memo
    },
    {
      eventOptions: { passive: false },
      scaleBounds: { min: 0.25, max: 3 },
      rubberband: true,
      from: () => [zoomLevel, 0]
    }
  )

  // Unlock objects after pinch ends
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    const unlockObjects = () => {
      canvas.getObjects().forEach(obj => {
        if (obj.id !== 'canvas-background') {
          const field = textFields.find(f => String(f.id) === String(obj.id))
          obj.set({
            selectable: !field?.locked,
            evented: !field?.locked,
            hasControls: true,
            hasBorders: true
          })
        }
      })
      canvas.requestRenderAll()
    }

    // Unlock after a short delay to ensure pinch has ended
    const timeout = setTimeout(unlockObjects, 100)
    return () => clearTimeout(timeout)
  }, [zoomLevel, textFields])

  // Auto-save when user stops interacting
  useEffect(() => {
    // Don't auto-save if there are no unsaved changes or if already saving
    const canSave = campaignId || isTemplateMode
    if (!hasUnsavedChanges || isSavingWork || isAutoSaving || !canSave) return

    // Clear any existing auto-save timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Set new auto-save timeout (3 seconds after last change)
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleSaveWork(true) // true = auto-save mode
    }, 3000)

    // Cleanup
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [textFields, campaignName, csvData, csvColumns, hasUnsavedChanges, isSavingWork, isAutoSaving, campaignId, isTemplateMode, templateId, handleSaveWork])

  // No longer using internal Fabric zoom to prevent clipping
  // Panning and Scaling are handled via CSS transforms on the canvas element

  // Sync State -> Fabric
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas || !canvasReady) return
    console.log('🔄 [SYNC] State -> Fabric:', textFields.length, 'fields')

    // NOTE: We do NOT skip sync here based on isModifying. 
    // We allow the loop to run so that text/content updates (which are not geometry) 
    // can happen even if a geometry lock is active (e.g. stale lock on load).
    // Geometry updates are guarded individually inside the loop.

    // Debounce sync to prevent UI lag on rapid updates
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)

    syncTimeoutRef.current = setTimeout(async () => {
      const canvasObjectsMap = new Map(canvas.getObjects().map(o => [String(o.id), o]))
      let needsRender = false

      // Maintain order: Background is at index 0, fields follow
      for (let idx = 0; idx < textFields.length; idx++) {
        const field = textFields[idx]
        let obj = canvasObjectsMap.get(String(field.id))
        const originX = field.textAlign === 'center' ? 'center' : (field.textAlign === 'right' ? 'right' : 'left')

        if (!obj) {
          needsRender = true
          // CREATE NEW OBJECTS
          if (field.type === 'image' && field.src) {
            try {
              const img = await FabricImage.fromURL(field.src)
              img.set({
                left: field.x, top: field.y,
                id: field.id,
                originX: 'left', originY: 'top',
                scaleX: (field.width || 100) / img.width,
                scaleY: (field.height || 100) / img.height
              })
              canvas.add(img)
              obj = img
            } catch (err) { console.error('Asset load error:', err) }
          } else if (field.type === 'qrcode') {
            try {
              const url = await QRCode.toDataURL('https://certifyflow.com')
              const img = await FabricImage.fromURL(url)
              img.set({
                left: field.x, top: field.y,
                id: field.id,
                originX: 'left', originY: 'top',
                scaleX: (field.size || 100) / img.width,
                scaleY: (field.size || 100) / img.height,
                objectCaching: false
              })
              canvas.add(img)
              obj = img
            } catch (err) { console.error('QR error:', err) }
          } else if (['rect', 'circle', 'triangle'].includes(field.type)) {
            const common = {
              left: field.x, top: field.y,
              fill: field.color || '#A098FF',
              id: field.id,
              opacity: field.opacity ?? 1,
              selectable: !field.locked,
              evented: !field.locked,
              strokeUniform: true,
              strokeWidth: 0
            }
            if (field.type === 'rect') obj = new Rect({ ...common, width: field.width || 100, height: field.height || 100 })
            else if (field.type === 'circle') obj = new Circle({ ...common, radius: (field.radius || 50) })
            else if (field.type === 'triangle') obj = new Triangle({ ...common, width: field.width || 100, height: field.height || 100 })
            canvas.add(obj)
          } else {
            // Text Content Sync
            let textVal = ''
            if (field.type === 'staticText') {
              textVal = field.text || ''
              if (textVal === '{Date}') {
                textVal = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              }
            } else if (field.type === 'uuid') {
              const rowIdx = (previewRowIndex >= 0 && previewRowIndex < csvData.length) ? previewRowIndex : 0
              const row = csvData[rowIdx]
              if (row) {
                const email = row?.Email || row?.email || ''
                const name = row?.[csvColumns[0]] || ''
                const cert = certificates.find(c => (email && c.recipient_email === email) || (name && c.recipient_name === name))
                textVal = cert ? cert.certificate_uuid.split('-')[0].toUpperCase() : 'ID: XXXXXXXX'
              } else { textVal = 'ID: XXXXXXXX' }
            } else {
              const rowIdx = (previewRowIndex >= 0 && previewRowIndex < csvData.length) ? previewRowIndex : 0
              const row = csvData[rowIdx]
              const actualKey = row ? Object.keys(row).find(k => k.toLowerCase() === field.column?.toLowerCase()) : undefined
              const rawDataValue = actualKey ? row[actualKey] : undefined
              textVal = (row && rawDataValue !== undefined && rawDataValue !== '') 
                ? formatFieldValue(rawDataValue) 
                : `{${field.column}}`
            }

            const textObj = new IText(textVal || 'Text', {
              left: field.x, top: field.y,
              fontSize: field.fontSize,
              fill: field.color,
              fontFamily: field.fontFamily,
              fontWeight: field.bold ? 'bold' : 'normal',
              fontStyle: field.italic ? 'italic' : 'normal',
              textAlign: field.textAlign,
              originX: originX, originY: 'top',
              id: field.id,
              charSpacing: field.charSpacing || 0,
              lineHeight: field.lineHeight || 1.16,
              paintFirst: 'stroke'
            })
            canvas.add(textObj)
            obj = textObj
          }
        } else {
          // UPDATE EXISTING
          const isSelfModifying = isModifying.current && selectedFieldId === field.id
          if (!isSelfModifying) {
            if (Math.abs(obj.left - field.x) > 0.5) { obj.set('left', field.x); needsRender = true }
            if (Math.abs(obj.top - field.y) > 0.5) { obj.set('top', field.y); needsRender = true }

            if (field.type === 'image' || field.type === 'qrcode') {
              const targetW = field.size || field.width || 100
              const targetH = field.size || field.height || 100
              if (Math.abs(obj.width * obj.scaleX - targetW) > 1) {
                obj.set({ scaleX: targetW / obj.width, scaleY: targetH / obj.height })
                needsRender = true
              }
            } else if (['rect', 'circle', 'triangle'].includes(field.type)) {
              if (field.type === 'rect' || field.type === 'triangle') {
                if (Math.abs(obj.width - (field.width || 100)) > 1) { obj.set('width', field.width || 100); needsRender = true }
                if (Math.abs(obj.height - (field.height || 100)) > 1) { obj.set('height', field.height || 100); needsRender = true }
              } else if (field.type === 'circle') {
                if (Math.abs(obj.radius - (field.radius || 50)) > 1) { obj.set('radius', field.radius || 50); needsRender = true }
              }
            }
            if (obj.fill !== field.color) { obj.set('fill', field.color); needsRender = true }
            if (obj.opacity !== (field.opacity ?? 1)) { obj.set('opacity', field.opacity ?? 1); needsRender = true }
          }

          if (obj instanceof IText || obj.type === 'i-text' || obj.type === 'IText') {
            let textVal = ''
            if (field.type === 'staticText') {
              textVal = field.text || ''
              if (textVal === '{Date}') {
                textVal = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              }
            } else if (field.type === 'uuid') {
              const rowIdx = (previewRowIndex >= 0 && previewRowIndex < csvData.length) ? previewRowIndex : 0
              const row = csvData[rowIdx]
              if (row) {
                const email = row?.Email || row?.email || ''
                const name = row?.[csvColumns[0]] || ''
                const cert = certificates.find(c => (email && c.recipient_email === email) || (name && c.recipient_name === name))
                textVal = cert ? cert.certificate_uuid.split('-')[0].toUpperCase() : 'ID: XXXXXXXX'
              } else { textVal = 'ID: XXXXXXXX' }
            } else {
              const rowIdx = (previewRowIndex >= 0 && previewRowIndex < csvData.length) ? previewRowIndex : 0
              const row = csvData[rowIdx]
              const actualKey = row ? Object.keys(row).find(k => k.toLowerCase() === field.column?.toLowerCase()) : undefined
              const rawDataValue = actualKey ? row[actualKey] : undefined
              textVal = (row && rawDataValue !== undefined && rawDataValue !== '') 
                ? formatFieldValue(rawDataValue) 
                : `{${field.column}}`
              
              console.log('[Canvas] Rendering field:', field.column || field.id, '→ textVal:', textVal, '| row value:', rawDataValue)
              console.log('[Canvas] Current data row:', row)
            }

            if (obj.text !== textVal) { obj.set('text', textVal); needsRender = true }
            if (obj.fontSize !== field.fontSize) { obj.set('fontSize', field.fontSize); needsRender = true }
            if (obj.fill !== field.color) { obj.set('fill', field.color); needsRender = true }
            if (obj.fontFamily !== field.fontFamily) { obj.set('fontFamily', field.fontFamily); needsRender = true }
            const weight = field.bold ? 'bold' : 'normal'
            if (obj.fontWeight !== weight) { obj.set('fontWeight', weight); needsRender = true }
            if (obj.textAlign !== field.textAlign) { obj.set('textAlign', field.textAlign); needsRender = true }
            if (obj.originX !== originX) { obj.set('originX', originX); needsRender = true }
          }
        }

        // Correctly maintain ordering: Background is at 0, components follow
        if (obj) {
          const currentObjIdx = canvas.getObjects().indexOf(obj)
          if (currentObjIdx !== idx + 1) {
            canvas.moveObjectTo(obj, idx + 1)
            needsRender = true
          }
        }
      }

      // REMOVE DELETED OBJECTS
      canvas.getObjects().forEach(obj => {
        if (!obj.id || obj.id === 'canvas-background') return
        if (!textFields.find(f => String(f.id) === String(obj.id))) {
          canvas.remove(obj)
          needsRender = true
        }
      })

      if (needsRender) canvas.requestRenderAll()
    }, 50)

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    }
  }, [textFields, canvasReady, isLoading, csvData, previewRowIndex, csvColumns, certificates])

  // Sync Selection: React State -> Fabric
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    // If nothing selected in state, discard canvas selection
    if (!selectedFieldId) {
      canvas.discardActiveObject()
      canvas.requestRenderAll()
      return
    }

    // If canvas already has the correct selection, do nothing
    const active = canvas.getActiveObject()
    if (active && String(active.id) === String(selectedFieldId)) return

    // Find object and select it
    const obj = canvas.getObjects().find(o => String(o.id) === String(selectedFieldId))
    if (obj) {
      canvas.setActiveObject(obj)
      canvas.requestRenderAll()
    }
  }, [selectedFieldId])

  const handleImage = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        setUploadedImage(img)
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }, [])



  const handleCSV = useCallback((e) => {
    const f = e.target.files[0]
    if (!f) return
    const r = new FileReader()
    r.onload = (ev) => {
      const text = ev.target.result
      const rows = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

      if (rows.length === 0) return

      // Parse CSV with headers
      const headers = rows[0].split(',').map(h => h.replace(/^\uFEFF/, '').trim())
      const data = rows.slice(1).map(row => {
        const values = row.split(',')
        const obj = {}
        headers.forEach((header, idx) => {
          obj[header] = values[idx] ? values[idx].trim() : ''
        })
        return obj
      })

      setCsvColumns(headers)
      setCsvData(data)

      // Keep backward compatibility with names array
      const names = data.map(row => row[headers[0]] || '')
      setNames(names)
      setPreviewName(names[0])
      console.log('[Editor] CSV data parsed and set:', data.length, data[0])
    }
    r.readAsText(f)
  }, [uploadedImage, textFields])

  const saveImages = useCallback(async () => {
    if (!uploadedImage) return alert('Upload an image first')
    if (csvData.length === 0) return alert('Upload CSV data first')
    setSaving(true)

    try {
      // 1. PRE-FETCH FIXED ASSETS (Assets that don't change per row)
      const assetMap = new Map()
      const imageFields = textFields.filter(f => f.type === 'image' && f.src)
      for (const field of imageFields) {
        try {
          const img = await FabricImage.fromURL(field.src)
          assetMap.set(field.id, img)
        } catch (err) { console.error('Failed to pre-fetch image:', field.src) }
      }

      const zip = new JSZip()
      const multiplier = 2
      const canvasEl = document.createElement('canvas')
      canvasEl.width = uploadedImage.width * multiplier
      canvasEl.height = uploadedImage.height * multiplier

      const staticCanvas = new StaticCanvas(canvasEl, {
        width: uploadedImage.width * multiplier,
        height: uploadedImage.height * multiplier,
        backgroundVpt: false
      })
      staticCanvas.setZoom(multiplier)

      const bg = new FabricImage(uploadedImage, { originX: 'left', originY: 'top' })

      // 2. MAIN BATCH LOOP
      for (let idx = 0; idx < csvData.length; idx++) {
        const row = csvData[idx]
        const email = row?.Email || row?.email || ''
        const name = row?.[csvColumns[0]] || ''

        let existingCert = certificates.find(c =>
          (email && c.recipient_email === email) || (name && c.recipient_name === name)
        )

        let certificateUuid = existingCert?.certificate_uuid
        if (!certificateUuid) {
          certificateUuid = uuidv4()
          if (user && campaignId) {
            supabase.from('certificates').insert({
              certificate_uuid: certificateUuid, campaign_id: campaignId, user_id: user.id,
              recipient_data: row, recipient_name: name, recipient_email: email, status: 'generated'
            }).then(() => {
              setCertificates(prev => [...prev, { certificate_uuid: certificateUuid, recipient_email: email, recipient_name: name }])
            })
          }
        }

        const verificationUrl = `https://certifyflow.com/verify/${certificateUuid}`

        staticCanvas.clear()
        staticCanvas.add(bg)

        for (const field of textFields) {
          if (field.type === 'image') {
            const cachedImg = assetMap.get(field.id)
            if (cachedImg) {
              const img = new FabricImage(cachedImg.getElement(), {
                left: field.x, top: field.y,
                scaleX: (field.width || 100) / cachedImg.width,
                scaleY: (field.height || 100) / cachedImg.height,
                originX: 'left', originY: 'top',
                angle: field.rotation || 0
              })
              staticCanvas.add(img)
            }
          } else if (field.type === 'qrcode') {
            const qrDataUrl = await QRCode.toDataURL(verificationUrl, { width: field.size || 100, margin: 1 })
            const qrImg = await FabricImage.fromURL(qrDataUrl)
            qrImg.set({
              left: field.x, top: field.y,
              scaleX: (field.size || 100) / qrImg.width,
              scaleY: (field.size || 100) / qrImg.height,
              originX: 'left', originY: 'top',
              angle: field.rotation || 0
            })
            staticCanvas.add(qrImg)
          } else if (['rect', 'circle', 'triangle'].includes(field.type)) {
            const common = {
              left: field.x, top: field.y,
              fill: field.color || "#A098FF",
              opacity: field.opacity ?? 1,
              scaleX: field.scaleX || 1,
              scaleY: field.scaleY || 1,
              angle: field.rotation || 0,
              originX: "left", originY: "top"
            }
            let shapeObj;
            if (field.type === "rect") shapeObj = new Rect({ ...common, width: field.width || 100, height: field.height || 100 })
            else if (field.type === "circle") shapeObj = new Circle({ ...common, radius: field.radius || ((field.width || 100) / 2) })
            else if (field.type === "triangle") shapeObj = new Triangle({ ...common, width: field.width || 100, height: field.height || 100 })
            if (shapeObj) staticCanvas.add(shapeObj)
          } else {
            let text = ""
            if (field.type === "uuid") text = certificateUuid.split("-")[0].toUpperCase()
            else if (field.type === "staticText") text = field.text || ""
            else {
              const actualKey = row ? Object.keys(row).find(k => k.toLowerCase() === field.column?.toLowerCase()) : undefined
              text = (actualKey ? row[actualKey] : undefined) || ""
            }
            const originX = field.textAlign === "center" ? "center" : (field.textAlign === "right" ? "right" : "left")
            const obj = new IText(text, {
              left: field.x, top: field.y,
              fontSize: field.fontSize,
              fill: field.color,
              fontFamily: field.fontFamily || "Arial",
              fontWeight: field.bold ? "bold" : "normal",
              fontStyle: field.italic ? "italic" : "normal",
              textAlign: field.textAlign,
              originX: originX, originY: "top",
              scaleX: field.scaleX || 1, scaleY: field.scaleY || 1,
              angle: field.rotation || 0
            })
            staticCanvas.add(obj)
          }
        }

        staticCanvas.renderAll()
        const dataUrl = canvasEl.toDataURL('image/png')
        const base64Data = dataUrl.split(',')[1]
        const filename = row[csvColumns[0]] || `certificate_${idx + 1}`
        zip.file(`${filename}.png`, base64Data, { base64: true })

        // Yield to UI thread every 10 rows to prevent freezing
        if (idx % 10 === 0) await new Promise(r => setTimeout(r, 0))
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const link = document.createElement('a')
      link.download = 'certificates.zip'
      link.href = URL.createObjectURL(zipBlob)
      link.click()
      URL.revokeObjectURL(link.href)
      staticCanvas.dispose()
      toast.success('Batch export complete')
    } catch (err) {
      console.error('Export failed:', err)
      toast.error('Export failed')
    } finally { setSaving(false) }
  }, [uploadedImage, csvData, csvColumns, textFields, certificates, user, campaignId])

  // Helper function to load image from data URL
  // Helper to format values (especially dates)
  function formatFieldValue(value) {
    if (!value) return ''
    const valStr = String(value)

    // Check if it's a date string (Y-m-d or ISO with time)
    // Looking for patterns like 2025-11-17 or ISO 8601
    const dateRegex = /^\d{4}-\d{2}-\d{2}/
    if (dateRegex.test(valStr)) {
      const date = new Date(valStr)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })
      }
    }
    return valStr
  }
  // --- JSON TEMPLATE TO HTML MAPPER ---
  // This function converts our canvas JSON (textFields) into a beautiful HTML representation.
  function mapJsonToHtml(fields, bgImage = null) {
    const styles = `
      @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Outfit:wght@300;400;600&display=swap");
      .cert-container { 
        position: relative; 
        width: 800px; 
        height: 600px; 
        background: #fff; 
        overflow: hidden; 
        font-family: "Outfit", sans-serif;
        color: #1a202c;
      }
      .cert-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; }
      .cert-layer { position: absolute; z-index: 2; display: flex; transform-origin: top left; }
      .cert-text { white-space: pre-wrap; line-height: 1.2; }
      .cert-shape { z-index: 1.5; }
    `;

    const layers = fields.map(f => {
      const commonStyle = `
        left: ${f.x}px; 
        top: ${f.y}px; 
        opacity: ${f.opacity ?? 1}; 
        transform: rotate(${f.rotation || 0}deg) scale(${f.scaleX || 1}, ${f.scaleY || 1});
      `;

      if (["rect", "circle", "triangle"].includes(f.type)) {
        let shapeStyle = commonStyle + `background-color: ${f.color || "#A098FF"};`;
        if (f.type === "rect") {
          shapeStyle += `width: ${f.width || 100}px; height: ${f.height || 100}px;`;
        } else if (f.type === "circle") {
          const r = f.radius || 50;
          shapeStyle += `width: ${r * 2}px; height: ${r * 2}px; border-radius: 50%; margin-left: -${r}px; margin-top: -${r}px;`;
        } else if (f.type === "triangle") {
          shapeStyle += `width: 0; height: 0; background: transparent; border-left: ${(f.width || 100) / 2}px solid transparent; border-right: ${(f.width || 100) / 2}px solid transparent; border-bottom: ${f.height || 100}px solid ${f.color || "#A098FF"};`;
        }
        return `<div class="cert-layer cert-shape" style="${shapeStyle}"></div>`;
      }

      if (f.type === "image" || f.type === "qrcode") {
        const src = f.type === "qrcode" ? "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://certifyflow.com" : f.src;
        const sizeStyle = f.type === "qrcode" ? `width: ${f.size || 100}px; height: ${f.size || 100}px;` : `width: ${f.width || 100}px; height: ${f.height || 100}px;`;
        return `<div class="cert-layer" style="${commonStyle}${sizeStyle}"><img src="${src}" style="width: 100%; height: 100%; object-fit: contain;" /></div>`;
      }

      // Text types
      const originX = f.textAlign === "center" ? "-50%" : (f.textAlign === "right" ? "-100%" : "0");
      const textStyle = commonStyle + `
        color: ${f.color || "#000"};
        font-size: ${f.fontSize || 16}px;
        font-family: ${f.fontFamily || "Arial"};
        font-weight: ${f.bold ? "bold" : "normal"};
        font-style: ${f.italic ? "italic" : "normal"};
        text-align: ${f.textAlign || "left"};
        letter-spacing: ${(f.charSpacing || 0) / 1000}em;
        line-height: ${f.lineHeight || 1.16};
        transform: translate(${originX}, 0) rotate(${f.rotation || 0}deg) scale(${f.scaleX || 1}, ${f.scaleY || 1});
      `;

      let textContent = f.type === "staticText" ? f.text : `{${f.column}}`;
      if (textContent === "{Date}") textContent = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

      return `<div class="cert-layer cert-text" style="${textStyle}">${textContent || ""}</div>`;
    }).join("");

    return `
      <html>
        <head><style>${styles}</style></head>
        <body>
          <div class="cert-container">
            ${bgImage ? `<img src="${bgImage}" class="cert-bg" />` : ""}
            ${layers}
          </div>
        </body>
      </html>
    `;
  }


  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  // Generate a high-fidelity background image from HTML/CSS and detect placeholder positions
  async function generateTemplateBackground(template) {
    console.log('Rendering template & detecting text elements...')

    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '-9999px'
    container.style.width = '800px'
    container.style.height = '600px'

    const detectedFields = []

    // Convert {{placeholders}} to invisible spans we can measure
    // Placeholders will be rendered as Fabric.js layers, not baked into background
    // Static text remains visible and gets baked into the background image
    const htmlSource = template.template_data?.html_content || template.html_content || ''
    const cssSource = template.template_data?.css_content || template.css_content || ''

    const htmlWithDetectors = htmlSource
      .replace(/\{\{([^}]+)\}\}/g, (match, col) => {
        return `<span class="placeholder-detector" data-column="${col}" data-type="placeholder" style="visibility: hidden; display: inline-block;">${match}</span>`
      })
      .replace(/<(h[1-6]|p|span|div)([^>]*)>/gi, (match, tag, attrs) => {
        if (match.toLowerCase().includes('placeholder-detector')) return match
        if (attrs.toLowerCase().includes('class=')) {
          return `<${tag}${attrs.replace(/class=["']/i, '$&static-text-detector ')}>`
        }
        return `<${tag}${attrs} class="static-text-detector">`
      })

    const tempDiv = document.createElement('div')
    tempDiv.style.width = '800px'
    tempDiv.style.height = '600px'
    tempDiv.innerHTML = htmlWithDetectors

    const styleEl = document.createElement('style')
    styleEl.textContent = `
       @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Outfit:wght@300;400;600&display=swap');
       ${cssSource}
       .art-cert { width: 800px !important; height: 600px !important; margin: 0 !important; }
    `

    container.appendChild(styleEl)
    container.appendChild(tempDiv)
    document.body.appendChild(container)

    try {
      if (document.fonts) await document.fonts.ready
      await new Promise(resolve => setTimeout(resolve, 500)) // Time for layout

      const containerRect = tempDiv.getBoundingClientRect()

      // First, detect placeholders
      const detectors = tempDiv.querySelectorAll('.placeholder-detector')
      detectors.forEach(el => {
        const rect = el.getBoundingClientRect()
        const style = window.getComputedStyle(el)
        detectedFields.push({
          column: el.getAttribute('data-column'),
          type: 'text',
          x: rect.left - containerRect.left + (rect.width / 2),
          y: rect.top - containerRect.top + (rect.height / 2),
          fontSize: parseInt(style.fontSize) || 40,
          color: style.color || '#000000',
          fontFamily: style.fontFamily?.split(',')[0].replace(/['"]/g, '') || 'Arial',
          bold: style.fontWeight === 'bold' || parseInt(style.fontWeight) >= 700,
          italic: style.fontStyle === 'italic',
          textAlign: 'center'
        })
      })

      // Now detect all other text elements (h1, h2, h3, p, span, etc.)
      const textSelectors = '.static-text-detector'
      const textElements = tempDiv.querySelectorAll(textSelectors)

      textElements.forEach(el => {
        // Check if this element contains a placeholder
        if (el.querySelector('.placeholder-detector')) return

        const textContent = el.innerText.trim()

        // Only add if there's actual text content and it's not a placeholder
        if (textContent && textContent.length > 0 && !textContent.includes('{{')) {
          // Avoid adding parent if children were added - check if any child is also a detector
          const childDetectors = el.querySelectorAll('.static-text-detector')
          if (childDetectors.length > 0) return

          const rect = el.getBoundingClientRect()
          const style = window.getComputedStyle(el)

          // Skip if element is too small or invisible
          if (rect.width < 2 || rect.height < 2) return
          if (style.display === 'none' || style.visibility === 'hidden') return

          // Get text alignment
          let textAlign = style.textAlign || 'center'
          if (textAlign === 'start' || textAlign === '-webkit-center') textAlign = 'center'

          // Convert RGB color to hex
          let hexColor = '#000000'
          if (style.color) {
            const rgb = style.color.match(/\d+/g)
            if (rgb && rgb.length >= 3) {
              hexColor = '#' + rgb.slice(0, 3).map(x => {
                const hex = parseInt(x).toString(16)
                return hex.length === 1 ? '0' + hex : hex
              }).join('')
            }
          }

          detectedFields.push({
            type: 'staticText',
            text: textContent,
            x: rect.left - containerRect.left + (rect.width / 2),
            y: rect.top - containerRect.top + (rect.height / 2),
            fontSize: parseInt(style.fontSize) || 16,
            color: hexColor,
            fontFamily: style.fontFamily?.split(',')[0].replace(/['"]/g, '') || 'Arial',
            bold: style.fontWeight === 'bold' || parseInt(style.fontWeight) >= 700,
            italic: style.fontStyle === 'italic',
            textAlign: textAlign
          })
        }
      })

      console.log('Detected text elements:', detectedFields.length, 'total')
      console.log('- Placeholders:', detectedFields.filter(f => f.type === 'text').length)
      console.log('- Static text:', detectedFields.filter(f => f.type === 'staticText').length)

      // Hide all detected text elements before capturing background
      const allDetectors = tempDiv.querySelectorAll('.placeholder-detector, .static-text-detector')
      allDetectors.forEach(el => {
        el.style.visibility = 'hidden'
      })
      const canvas = await html2canvas(tempDiv, {
        width: 800,
        height: 600,
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false
      })

      const img = await loadImage(canvas.toDataURL('image/png'))
      document.body.removeChild(container)
      return { img, detectedFields }
    } catch (error) {
      console.error('Hybrid rendering failed:', error)
      if (container.parentNode) document.body.removeChild(container)

      const canvas = document.createElement('canvas')
      canvas.width = 800; canvas.height = 600
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 800, 600)
      const fallbackImg = await loadImage(canvas.toDataURL())
      return { img: fallbackImg, detectedFields: [] }
    }
  }

  // Send certificates via email
  async function sendCertificatesViaEmail(config) {
    if (!uploadedImage) return alert('Upload an image first')
    if (csvData.length === 0) return alert('Upload CSV data first')

    // Check email settings
    const emailProvider = localStorage.getItem('emailProvider')
    const apiKey = localStorage.getItem('emailApiKey')
    const fromEmail = localStorage.getItem('fromEmail')
    const fromName = localStorage.getItem('fromName')

    if (!apiKey || !fromEmail) {
      if (confirm('Email provider not configured. Go to Settings?')) {
        navigate.push('/dashboard/email-settings')
      }
      return
    }

    // Check if CSV has email column
    const emailColumn = csvColumns.find(col => col.toLowerCase().includes('email'))
    if (!emailColumn) {
      return alert('CSV must have an "Email" column to send certificates')
    }

    // Reset batch state
    setBatchModalOpen(true)
    setBatchProgress(0)
    setBatchIdx(0)
    setBatchIsPaused(false)
    batchIsPausedRef.current = false
    setBatchIsCompleted(false)
    setSendingEmails(true)
    setEmailsSent(0)

    // Update campaign status to processing
    if (campaignId) {
      await campaignService.updateCampaign(campaignId, { status: 'processing' })
    }

    try {
      // Use StaticCanvas for export to ensure consistency with editor
      const multiplier = 2
      const canvasEl = document.createElement('canvas')
      canvasEl.width = uploadedImage.width * multiplier
      canvasEl.height = uploadedImage.height * multiplier

      const staticCanvas = new StaticCanvas(canvasEl, {
        width: uploadedImage.width * multiplier,
        height: uploadedImage.height * multiplier,
        backgroundVpt: false
      })
      staticCanvas.setZoom(multiplier)

      const bg = new FabricImage(uploadedImage, {
        originX: 'left', originY: 'top'
      })

      let successCount = 0;
      const total = csvData.length;

      for (let idx = 0; idx < total; idx++) {
        // Pause check
        while (batchIsPausedRef.current) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }

        setBatchIdx(idx + 1)
        const row = csvData[idx]
        const recipientEmail = row[emailColumn]

        if (!recipientEmail) {
          console.warn(`Skipping row ${idx}: no email`)
          continue
        }

        const certificateUuid = uuidv4()
        const verificationUrl = `https://certifyflow.com/verify/${certificateUuid}`

        staticCanvas.clear()
        staticCanvas.add(bg)

        // Draw all fields
        for (const field of textFields) {
          if (field.type === 'image' && field.src) {
            const img = await FabricImage.fromURL(field.src)
            img.set({
              left: field.x, top: field.y,
              scaleX: (field.width || 100) / img.width,
              scaleY: (field.height || 100) / img.height,
              originX: 'left', originY: 'top',
              angle: field.rotation || 0
            })
            staticCanvas.add(img)
          } else if (field.type === 'qrcode') {
            const qrDataUrl = await QRCode.toDataURL(verificationUrl, { width: field.size || 100, margin: 1 })
            const qrImg = await FabricImage.fromURL(qrDataUrl)
            qrImg.set({
              left: field.x, top: field.y,
              scaleX: (field.size || 100) / qrImg.width,
              scaleY: (field.size || 100) / qrImg.height,
              originX: 'left', originY: 'top',
              angle: field.rotation || 0
            })
            staticCanvas.add(qrImg)
          } else if (['rect', 'circle', 'triangle'].includes(field.type)) {
            const common = {
              left: field.x, top: field.y,
              fill: field.color || "#A098FF",
              opacity: field.opacity ?? 1,
              scaleX: field.scaleX || 1,
              scaleY: field.scaleY || 1,
              angle: field.rotation || 0,
              originX: "left", originY: "top"
            }
            let shapeObj;
            if (field.type === "rect") {
              shapeObj = new Rect({ ...common, width: field.width || 100, height: field.height || 100 })
            } else if (field.type === "circle") {
              shapeObj = new Circle({ ...common, radius: field.radius || ((field.width || 100) / 2) })
            } else if (field.type === "triangle") {
              shapeObj = new Triangle({ ...common, width: field.width || 100, height: field.height || 100 })
            }
            if (shapeObj) staticCanvas.add(shapeObj)
          } else {
            // Text
            let text = ""
            if (field.type === "uuid") {
              text = certificateUuid.split("-")[0].toUpperCase()
            } else if (field.type === "staticText") {
              text = field.text || ""
            } else {
              const actualKey = row ? Object.keys(row).find(k => k.toLowerCase() === field.column?.toLowerCase()) : undefined
              text = (actualKey ? row[actualKey] : undefined) || ""
            }
            const originX = field.textAlign === "center" ? "center" : (field.textAlign === "right" ? "right" : "left")
            const obj = new IText(text, {
              left: field.x, top: field.y,
              fontSize: field.fontSize,
              fill: field.color,
              fontFamily: field.fontFamily || "Arial",
              fontWeight: field.bold ? "bold" : "normal",
              fontStyle: field.italic ? "italic" : "normal",
              textAlign: field.textAlign,
              originX: originX,
              originY: "top",
              scaleX: field.scaleX || 1,
              scaleY: field.scaleY || 1,
              angle: field.rotation || 0
            })
            staticCanvas.add(obj)
          }
        }

        staticCanvas.renderAll()
        const certificateDataUrl = canvasEl.toDataURL('image/png')
        const recipientName = row[csvColumns[0]] || 'Recipient'

        // Send email
        try {
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: recipientEmail,
              from: fromEmail,
              fromName: fromName,
              subject: config?.subject || `Your Certificate - ${recipientName}`,
              templateId: config?.templateId,
              brandName: config?.brandName || fromName || 'BulkCerts',
              logoUrl: config?.logoUrl || 'https://i.ibb.co/3yhthnMj/Frame-1-6.png',
              accentColor: config?.accentColor || '#6b55fd',
              html: `
                <div style="font-family: sans-serif; text-align: center; padding: 40px; background-color: #fafafa;">
                  <img src="${config?.logoUrl || 'https://i.ibb.co/3yhthnMj/Frame-1-6.png'}" style="height: 48px; margin-bottom: 24px;" />
                  <h1 style="color: #111;">Congratulations ${recipientName}!</h1>
                  <p style="color: #666;">Your certificate for ${config?.subject || `Your Certificate - ${recipientName}`} is ready.</p>
                  <div style="margin: 32px 0;">
                    <img src="${certificateDataUrl}" alt="Certificate" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
                  </div>
                  <a href="${verificationUrl}" style="background-color: ${config?.accentColor || '#6b55fd'}; color: white; padding: 12px 24px; border-radius: 100px; text-decoration: none; font-weight: bold; display: inline-block;">Verify Certificate</a>
                  <p style="margin-top: 40px; font-size: 10px; color: #aaa;">© 2026 ${config?.brandName || fromName || 'BulkCerts'}</p>
                </div>
              `,
              image: certificateDataUrl,
              name: recipientName,
              provider: emailProvider,
              apiKey: apiKey,
              fromEmail: fromEmail
            })
          })

          if (response.ok) {
            successCount++;
            setEmailsSent(successCount);
          }

          // Save certificate to database
          if (user && campaignId) {
            await supabase.from('certificates').insert({
              certificate_uuid: certificateUuid,
              campaign_id: campaignId,
              user_id: user.id,
              recipient_data: row,
              recipient_name: recipientName,
              recipient_email: recipientEmail,
              verification_url: verificationUrl,
              status: 'sent'
            })

            // Update campaign progress
            await campaignService.updateCampaign(campaignId, {
              emails_sent: successCount,
              certificates_generated: idx + 1
            })
          }
        } catch (err) {
          console.error(`Error sending email to ${recipientEmail}:`, err)
        }

        setBatchProgress(Math.round(((idx + 1) / total) * 100))
        await new Promise(resolve => setTimeout(resolve, 200)) // Small delay
      }

      setBatchIsCompleted(true)
      if (campaignId) {
        await campaignService.updateCampaign(campaignId, { status: 'completed' })
      }
      toast.success(`Successfully sent ${successCount} certificates!`)
    } catch (err) {
      console.error('Error sending certificates:', err)
      toast.error('Error sending certificates.')
      if (campaignId) {
        await campaignService.updateCampaign(campaignId, { status: 'failed' })
      }
    } finally {
      setSendingEmails(false)
    }
  }

  async function handlePrint() {
    if (!uploadedImage) { toast.error('Upload image first'); return }
    if (csvData.length === 0) { toast.error('Upload CSV data first'); return }

    setSaving(true)

    try {
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        toast.error('Popup blocked. Please allow popups.')
        return
      }

      printWindow.document.write('<html><head><title>Print Certificates</title>')
      printWindow.document.write('<style>')
      printWindow.document.write(`
        @media print { 
          @page { margin: 0; }
          body { margin: 0; -webkit-print-color-adjust: exact; }
          .certificate-page { break-after: always; page-break-after: always; width: 100vw; height: 100vh; display: flex; justify-content: center; align-items: center; overflow: hidden; }
          img { width: 100%; height: 100%; object-fit: contain; }
        }
        body { margin: 0; background: #eee; font-family: sans-serif; }
        .certificate-page { margin: 20px auto; background: white; display: flex; justify-content: center; align-items: center; max-width: 1000px; }
        img { max-width: 100%; }
        .controls { position: fixed; top: 20px; right: 20px; background: white; padding: 10px; border-radius: 8px; z-index: 100; }
        .btn { background: #000; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; }
        @media print { .controls { display: none; } }
      `)
      printWindow.document.write('</style></head><body>')

      printWindow.document.write('<div class="controls"><button class="btn" onclick="window.print()">Print Certificates</button></div>')

      // Use StaticCanvas for consistency with high resolution for print
      const multiplier = 2
      const canvasEl = document.createElement('canvas')
      canvasEl.width = uploadedImage.width * multiplier
      canvasEl.height = uploadedImage.height * multiplier

      const staticCanvas = new StaticCanvas(canvasEl, {
        width: uploadedImage.width * multiplier,
        height: uploadedImage.height * multiplier,
        backgroundVpt: false
      })
      staticCanvas.setZoom(multiplier)

      const bg = new FabricImage(uploadedImage, {
        originX: 'left', originY: 'top'
      })
      staticCanvas.add(bg)

      for (let idx = 0; idx < csvData.length; idx++) {
        const row = csvData[idx]
        const email = row?.Email || row?.email || ''
        const name = row?.[csvColumns[0]] || ''

        let existingCert = certificates.find(c =>
          (email && c.recipient_email === email) ||
          (name && c.recipient_name === name)
        )

        let certificateUuid = existingCert?.certificate_uuid
        if (!certificateUuid) {
          certificateUuid = uuidv4()
          // Persist to DB
          if (user && campaignId) {
            supabase.from('certificates').insert({
              certificate_uuid: certificateUuid,
              campaign_id: campaignId,
              user_id: user.id,
              recipient_data: row,
              recipient_name: name,
              recipient_email: email,
              status: 'generated'
            }).then(() => {
              setCertificates(prev => [...prev, { certificate_uuid: certificateUuid, recipient_email: email, recipient_name: name }])
            })
          }
        }

        const verificationUrl = `https://certifyflow.com/verify/${certificateUuid}`

        staticCanvas.clear()
        staticCanvas.add(bg)

        for (const field of textFields) {
          if (field.type === 'image' && field.src) {
            const img = await FabricImage.fromURL(field.src)
            img.set({
              left: field.x, top: field.y,
              scaleX: (field.width || 100) / img.width,
              scaleY: (field.height || 100) / img.height,
              originX: 'left', originY: 'top'
            })
            staticCanvas.add(img)
          } else if (field.type === 'qrcode') {
            const qrDataUrl = await QRCode.toDataURL(verificationUrl, { width: field.size, margin: 1 })
            const qrImg = await FabricImage.fromURL(qrDataUrl)
            qrImg.set({
              left: field.x, top: field.y,
              scaleX: field.size / qrImg.width,
              scaleY: field.size / qrImg.height,
              originX: 'left', originY: 'top'
            })
            staticCanvas.add(qrImg)
          } else if (["rect", "circle", "triangle"].includes(field.type)) {
            const common = {
              left: field.x, top: field.y,
              fill: field.color || "#A098FF",
              opacity: field.opacity ?? 1,
              scaleX: field.scaleX || 1,
              scaleY: field.scaleY || 1,
              angle: field.rotation || 0,
              originX: "left", originY: "top"
            }
            let shapeObj;
            if (field.type === "rect") {
              shapeObj = new Rect({ ...common, width: field.width || 100, height: field.height || 100 })
            } else if (field.type === "circle") {
              shapeObj = new Circle({ ...common, radius: field.radius || ((field.width || 100) / 2) })
            } else if (field.type === "triangle") {
              shapeObj = new Triangle({ ...common, width: field.width || 100, height: field.height || 100 })
            }
            if (shapeObj) staticCanvas.add(shapeObj)
          } else {
            // Text
            let text = ""
            if (field.type === "uuid") {
              text = certificateUuid.split("-")[0].toUpperCase()
            } else if (field.type === "staticText") {
              text = field.text
            } else {
              const actualKey = row ? Object.keys(row).find(k => k.toLowerCase() === field.column?.toLowerCase()) : undefined
              text = (actualKey ? row[actualKey] : undefined) || ""
            }
            const originX = field.textAlign === "center" ? "center" : (field.textAlign === "right" ? "right" : "left")
            const obj = new IText(text, {
              left: field.x, top: field.y,
              fontSize: field.fontSize,
              fill: field.color,
              fontFamily: field.fontFamily || "Arial",
              fontWeight: field.bold ? "bold" : "normal",
              fontStyle: field.italic ? "italic" : "normal",
              textAlign: field.textAlign,
              originX: originX,
              originY: "top",
              scaleX: field.scaleX || 1,
              scaleY: field.scaleY || 1,
              angle: field.rotation || 0
            })
            staticCanvas.add(obj)
          }
        }

        staticCanvas.renderAll()
        const imgData = canvasEl.toDataURL('image/png')
        printWindow.document.write(`<div class="certificate-page"><img src="${imgData}" /></div>`)

        // Yield to UI thread occasionally
        if (idx % 5 === 0) await new Promise(r => setTimeout(r, 0))
      }

      staticCanvas.dispose()

      printWindow.document.write('</body></html>')
      printWindow.document.close()

    } catch (err) {
      console.error(err)
      toast.error('Failed to generate print preview')
    } finally {
      setSaving(false)
    }
  }

  async function exportAsPDF() {
    if (!uploadedImage) { toast.error('Upload image first'); return }
    if (csvData.length === 0) { toast.error('Upload CSV data first'); return }
    try {
      const pdf = new jsPDF('l', 'px', [uploadedImage.width, uploadedImage.height])

      // Use StaticCanvas for consistency with high resolution for PDF
      const multiplier = 2
      const canvasEl = document.createElement('canvas')
      canvasEl.width = uploadedImage.width * multiplier
      canvasEl.height = uploadedImage.height * multiplier

      const staticCanvas = new StaticCanvas(canvasEl, {
        width: uploadedImage.width * multiplier,
        height: uploadedImage.height * multiplier,
        backgroundVpt: false
      })
      staticCanvas.setZoom(multiplier)

      const bg = new FabricImage(uploadedImage, {
        originX: 'left', originY: 'top'
      })
      staticCanvas.add(bg)

      for (let idx = 0; idx < csvData.length; idx++) {
        const row = csvData[idx]
        const email = row?.Email || row?.email || ''
        const name = row?.[csvColumns[0]] || ''

        let existingCert = certificates.find(c =>
          (email && c.recipient_email === email) ||
          (name && c.recipient_name === name)
        )

        let certificateUuid = existingCert?.certificate_uuid
        if (!certificateUuid) {
          certificateUuid = uuidv4()
          // Persist to DB
          if (user && campaignId) {
            supabase.from('certificates').insert({
              certificate_uuid: certificateUuid,
              campaign_id: campaignId,
              user_id: user.id,
              recipient_data: row,
              recipient_name: name,
              recipient_email: email,
              status: 'generated'
            }).then(() => {
              setCertificates(prev => [...prev, { certificate_uuid: certificateUuid, recipient_email: email, recipient_name: name }])
            })
          }
        }

        const verificationUrl = `https://certifyflow.com/verify/${certificateUuid}`

        staticCanvas.clear()
        staticCanvas.add(bg)

        // Draw all fields
        for (const field of textFields) {
          if (field.type === 'image' && field.src) {
            const img = await FabricImage.fromURL(field.src)
            img.set({
              left: field.x, top: field.y,
              scaleX: (field.width || 100) / img.width,
              scaleY: (field.height || 100) / img.height,
              originX: 'left', originY: 'top'
            })
            staticCanvas.add(img)
          } else if (field.type === 'qrcode') {
            const qrDataUrl = await QRCode.toDataURL(verificationUrl, { width: field.size, margin: 1 })
            const qrImg = await FabricImage.fromURL(qrDataUrl)
            qrImg.set({
              left: field.x, top: field.y,
              scaleX: field.size / qrImg.width,
              scaleY: field.size / qrImg.height,
              originX: 'left', originY: 'top'
            })
            staticCanvas.add(qrImg)
          } else if (["rect", "circle", "triangle"].includes(field.type)) {
            const common = {
              left: field.x, top: field.y,
              fill: field.color || "#A098FF",
              opacity: field.opacity ?? 1,
              scaleX: field.scaleX || 1,
              scaleY: field.scaleY || 1,
              angle: field.rotation || 0,
              originX: "left", originY: "top"
            }
            let shapeObj;
            if (field.type === "rect") {
              shapeObj = new Rect({ ...common, width: field.width || 100, height: field.height || 100 })
            } else if (field.type === "circle") {
              shapeObj = new Circle({ ...common, radius: field.radius || ((field.width || 100) / 2) })
            } else if (field.type === "triangle") {
              shapeObj = new Triangle({ ...common, width: field.width || 100, height: field.height || 100 })
            }
            if (shapeObj) staticCanvas.add(shapeObj)
          } else {
            // Text
            let text = ""
            if (field.type === "uuid") {
              text = certificateUuid.split("-")[0].toUpperCase()
            } else if (field.type === "staticText") {
              text = field.text
            } else {
              const actualKey = row ? Object.keys(row).find(k => k.toLowerCase() === field.column?.toLowerCase()) : undefined
              text = (actualKey ? row[actualKey] : undefined) || ""
            }
            const originX = field.textAlign === "center" ? "center" : (field.textAlign === "right" ? "right" : "left")
            const obj = new IText(text, {
              left: field.x, top: field.y,
              fontSize: field.fontSize,
              fill: field.color,
              fontFamily: field.fontFamily || "Arial",
              fontWeight: field.bold ? "bold" : "normal",
              fontStyle: field.italic ? "italic" : "normal",
              textAlign: field.textAlign,
              originX: originX,
              originY: "top",
              scaleX: field.scaleX || 1,
              scaleY: field.scaleY || 1,
              angle: field.rotation || 0
            })
            staticCanvas.add(obj)
          }
        }

        staticCanvas.renderAll()
        const imgData = canvasEl.toDataURL('image/png')

        if (idx > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, 0, uploadedImage.width, uploadedImage.height)

        // Yield to UI thread
        if (idx % 5 === 0) await new Promise(r => setTimeout(r, 0))
      }

      staticCanvas.dispose()

      pdf.save('certificates.pdf')
      toast.success('PDF exported')
    }
    catch (err) {
      console.error(err)
      toast.error('PDF export failed')
    }
  }



  const removeTextField = useCallback((id) => {
    setTextFields(prev => {
      const newFields = prev.filter(f => f.id !== id)
      addToHistory(newFields)
      return newFields
    })
  }, [addToHistory])

  const updateTextField = useCallback((id, updates) => {
    setTextFields(fields => fields.map(f => f.id === id ? { ...f, ...updates } : f))
  }, [])

  const addTextField = useCallback((columnName) => {
    const col = columnName || (csvColumns.length > 0 ? csvColumns[0] : null)
    if (!col && !columnName) return toast.error('Load CSV first')

    const newId = Date.now()
    const newField = {
      id: newId,
      type: 'text',
      column: col,
      x: uploadedImage ? Math.round(uploadedImage.width / 2) : 100,
      y: uploadedImage ? Math.round(uploadedImage.height / 2) : 200,
      fontSize: 40,
      color: '#ffffff',
      fontFamily: 'Arial',
      bold: false,
      italic: false,
      textAlign: 'center'
    }
    setTextFields(prev => {
      const newFields = [...prev, newField]
      addToHistory(newFields)
      return newFields
    })
    setSelectedFieldId(newId)
  }, [uploadedImage, csvColumns, addToHistory])

  const addQRCode = useCallback(() => {
    const newId = Date.now()
    setTextFields(prev => {
      const hasQR = prev.some(f => f.type === 'qrcode')
      if (hasQR) {
        toast.error('Only one QR code allowed per certificate')
        return prev
      }

      const newField = {
        id: newId,
        type: 'qrcode',
        x: uploadedImage ? Math.round(uploadedImage.width / 2) - 50 : 50,
        y: uploadedImage ? Math.round(uploadedImage.height / 2) - 50 : 50,
        size: 100
      }
      const newFields = [...prev, newField]
      addToHistory(newFields)
      setSelectedFieldId(newId)
      return newFields
    })
  }, [uploadedImage, addToHistory])

  const addDate = useCallback(() => {
    const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    const newId = Date.now()
    const newField = {
      id: newId,
      type: 'staticText',
      text: today,
      x: uploadedImage ? Math.round(uploadedImage.width / 2) : 100,
      y: uploadedImage ? Math.round(uploadedImage.height / 2) : 200,
      fontSize: 32,
      color: '#ffffff',
      fontFamily: 'Arial',
      bold: false,
      italic: false,
      textAlign: 'center'
    }
    setTextFields(prev => {
      const newFields = [...prev, newField]
      addToHistory(newFields)
      return newFields
    })
    setSelectedFieldId(newId)
  }, [uploadedImage, addToHistory])

  const addUUIDField = useCallback(() => {
    const newId = Date.now()
    setTextFields(prev => {
      const hasUUID = prev.some(f => f.type === 'uuid')
      if (hasUUID) {
        toast.error('Only one UUID field allowed per certificate')
        return prev
      }

      const newField = {
        id: newId,
        type: 'uuid',
        x: uploadedImage ? Math.round(uploadedImage.width / 2) : 100,
        y: uploadedImage ? Math.round(uploadedImage.height / 2) : 200,
        fontSize: 24,
        color: '#ffffff',
        fontFamily: 'Arial',
        bold: true,
        italic: false,
        textAlign: 'center'
      }
      const newFields = [...prev, newField]
      addToHistory(newFields)
      setSelectedFieldId(newId)
      return newFields
    })
  }, [uploadedImage, addToHistory])

  const addStaticText = useCallback(() => {
    const newId = Date.now()
    const newField = {
      id: newId,
      type: 'staticText',
      text: 'Custom Text',
      x: uploadedImage ? Math.round(uploadedImage.width / 2) : 100,
      y: uploadedImage ? Math.round(uploadedImage.height / 2) : 200,
      fontSize: 40,
      color: '#ffffff',
      fontFamily: 'Arial',
      bold: false,
      italic: false,
      textAlign: 'center'
    }
    setTextFields(prev => {
      const newFields = [...prev, newField]
      addToHistory(newFields)
      return newFields
    })
    setSelectedFieldId(newId)
  }, [uploadedImage, addToHistory])

  const handleLogoUpload = useCallback(async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const toastId = toast.loading('Uploading asset...')

    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = async () => {
        try {
          // Compress image to save space
          const maxDim = 800
          let w = img.width
          let h = img.height
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = (h / w) * maxDim
              w = maxDim
            } else {
              w = (w / h) * maxDim
              h = maxDim
            }
          }

          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, w, h)

          // Convert to Blob for upload
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.8))

          // Upload to Supabase Storage
          const storagePath = `campaigns/${campaignId || 'unsaved'}/asset_${Date.now()}.webp`
          const { path, signedUrl } = await storageService.uploadAsset(blob, storagePath)

          const newId = Date.now()
          const newField = {
            id: newId,
            type: 'image',
            path: path,
            src: signedUrl,
            x: uploadedImage ? Math.round(uploadedImage.width / 2) - (w / 4) : 50,
            y: uploadedImage ? Math.round(uploadedImage.height / 2) - (h / 4) : 50,
            width: w / 2,
            height: h / 2
          }

          setTextFields(prev => {
            const newFields = [...prev, newField]
            addToHistory(newFields)
            return newFields
          })
          setSelectedFieldId(newId)
          toast.success('Asset uploaded successfully', { id: toastId })
        } catch (err) {
          console.error('Upload error:', err)
          toast.error(err.message || 'Failed to upload asset', { id: toastId })
        }
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }, [campaignId, uploadedImage, addToHistory])

  function loadDemoCSV() {
    fetch('/demo.csv')
      .then(res => res.text())
      .then(text => {
        const rows = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

        if (rows.length === 0) return

        // Parse CSV with headers
        const headers = rows[0].split(',').map(h => h.replace(/^\uFEFF/, '').trim())
        const data = rows.slice(1).map(row => {
          const values = row.split(',')
          const obj = {}
          headers.forEach((header, idx) => {
            obj[header] = values[idx] ? values[idx].trim() : ''
          })
          return obj
        })

        setCsvColumns(headers)
        setCsvData(data)

        // Keep backward compatibility with names array
        const names = data.map(row => row[headers[0]] || '')
        setNames(names)
        setPreviewName(names[0])

        toast.success('Demo CSV loaded')
      })
      .catch(err => console.error(err))
  }

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (((e.ctrlKey || e.metaKey) && e.key === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
        e.preventDefault()
        redo()
        return
      }

      // Save: Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSaveWork()
        return
      }

      // Clone: Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        if (selectedFieldId) duplicateLayer(selectedFieldId)
        return
      }

      // Space pan
      if (e.code === 'Space') {
        if (!isSpacePressed) {
          setIsSpacePressed(true)
          document.body.style.cursor = 'grab'
        }
        // Prevent scrolling if not typing
        e.preventDefault()
        return
      }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedFieldId) {
          e.preventDefault()
          removeTextField(selectedFieldId)
          setSelectedFieldId(null)
        }
      }

      // Initializing nudge amount
      const nudge = e.shiftKey ? 10 : 1
      if (!selectedFieldId) return

      // Arrows
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        const canvas = fabricRef.current

        if (!selectedFieldId || !canvas) return

        // CRITICAL: Block sync effect from overriding our changes
        isModifying.current = true

        const obj = canvas.getObjects().find(o => String(o.id) === String(selectedFieldId))
        if (!obj) return

        let newX = obj.left
        let newY = obj.top

        if (e.key === 'ArrowUp') newY -= nudge
        if (e.key === 'ArrowDown') newY += nudge
        if (e.key === 'ArrowLeft') newX -= nudge
        if (e.key === 'ArrowRight') newX += nudge

        obj.set({ left: newX, top: newY })
        obj.setCoords()
        canvas.requestRenderAll()

        if (arrowKeyHistoryTimeout.current) clearTimeout(arrowKeyHistoryTimeout.current)

        arrowKeyHistoryTimeout.current = setTimeout(() => {
          setTextFields(prev => {
            const updated = prev.map(f => f.id === selectedFieldId ? { ...f, x: newX, y: newY } : f)
            addToHistory(updated)
            return updated
          })
          isModifying.current = false
        }, 300)
      }
    }

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false)
        document.body.style.cursor = 'default'
      }
    }

    const abortController = new AbortController()
    window.addEventListener('keydown', handleKeyDown, { signal: abortController.signal })
    window.addEventListener('keyup', handleKeyUp, { signal: abortController.signal })
    return () => abortController.abort()
  }, [selectedFieldId, undo, redo, handleSaveWork, duplicateLayer, removeTextField, isSpacePressed, addToHistory])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader size={120} color="#6b55fd" className="mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background text-foreground no-scrollbar">

      <Toolbar
        campaignName={campaignName}
        hasUnsavedChanges={hasUnsavedChanges}
        isSavingWork={isSavingWork}
        isAutoSaving={isAutoSaving}
        lastSavedTime={lastSavedTime}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
        leftSidebarOpen={leftSidebarOpen}
        setLeftSidebarOpen={setLeftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
        setRightSidebarOpen={setRightSidebarOpen}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        user={user}
        handleSaveWork={handleSaveWork}
        handleLogout={handleLogout}
        setShowUnsavedDialog={setShowUnsavedDialog}
        navigate={navigate}
        isTemplateMode={isTemplateMode}
      />

      {/* Main Editor Layout */}
      <div className="h-screen relative overflow-hidden bg-transparent">
        <EditorCanvas
          uploadedImage={uploadedImage}
          canvasPan={canvasPan}
          zoomLevel={zoomLevel}
          isUiPanning={isUiPanning}
          isSpacePressed={isSpacePressed}
          handleWorkspaceWheel={handleWorkspaceWheel}
          bind={bind}
          canvasRef={canvasRef}
        />

        <SidebarLeft
          leftSidebarOpen={leftSidebarOpen}
          CANVAS_PRESETS={CANVAS_PRESETS}
          dbTemplates={dbTemplates}
          isFetchingTemplates={isFetchingTemplates}
          setTextFields={setTextFields}
          textFields={textFields}
          addStaticText={addStaticText}
          addTextField={addTextField}
          addToHistory={addToHistory}
          handleLogoUpload={handleLogoUpload}
          setUploadedImage={setUploadedImage}
          addQRCode={addQRCode}
          addDate={addDate}
          addUUIDField={addUUIDField}
          addShape={addShape}
          uploadedImage={uploadedImage}
          handleCSV={handleCSV}
          csvData={csvData}
          loadDemoCSV={loadDemoCSV}
          csvColumns={csvColumns}
          selectedFieldId={selectedFieldId}
          setSelectedFieldId={setSelectedFieldId}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          moveLayer={moveLayer}
          removeTextField={removeTextField}
          isTemplateMode={isTemplateMode}
        />

        <PropertiesPanel
          rightSidebarOpen={rightSidebarOpen}
          textFields={textFields}
          selectedFieldId={selectedFieldId}
          setSelectedFieldId={setSelectedFieldId}
          updateTextField={updateTextField}
          removeTextField={removeTextField}
          moveLayer={moveLayer}
          csvColumns={csvColumns}
          isEmailSendEnabled={isEmailSendEnabled}
          saveImages={saveImages}
          sendCertificatesViaEmail={() => setIsEmailModalOpen(true)}
          handlePrint={handlePrint}
          exportAsPDF={exportAsPDF}
          saving={saving}
          uploadedImage={uploadedImage}
          csvData={csvData}
          sendingEmails={sendingEmails}
          emailsSent={emailsSent}
          addToHistory={addToHistory}
          setTextFields={setTextFields}
          duplicateLayer={duplicateLayer}
          isTemplateMode={isTemplateMode}
        />

        <HistoryBar
          undo={undo}
          redo={redo}
          historyStep={historyStep}
          history={history}
          csvData={csvData}
          previewRowIndex={previewRowIndex}
          setPreviewRowIndex={setPreviewRowIndex}
          selectedFieldId={selectedFieldId}
          setSelectedFieldId={setSelectedFieldId}
          textFields={textFields}
          setTextFields={setTextFields}
          addToHistory={addToHistory}
          setShowShortcuts={setShowShortcuts}
        />
      </div>

      {showShortcuts && <ShortcutsModal setShowShortcuts={setShowShortcuts} />}

      <UnsavedDialog
        showUnsavedDialog={showUnsavedDialog}
        setShowUnsavedDialog={setShowUnsavedDialog}
        isSavingWork={isSavingWork}
        navigate={navigate}
        handleSaveWork={handleSaveWork}
      />

      <EmailTemplateModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        campaignName={campaignName}
        onSend={sendCertificatesViaEmail}
      />

      <EmailBatchModal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        progress={batchProgress}
        currentIdx={batchIdx}
        total={csvData.length}
        isPaused={batchIsPaused}
        onTogglePause={() => {
          const newState = !batchIsPaused
          setBatchIsPaused(newState)
          batchIsPausedRef.current = newState
        }}
        isCompleted={batchIsCompleted}
      />
    </div>
  )
}