"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LogOut,
  User,
  ChevronDown,
  Settings,
  Plus,
  Moon,
  Sun,
  ArrowLeft,
  LayoutDashboard,
  FileText,
  Mail,
  Home,
  Monitor,
  Bell,
  MessageSquare,
  Users,
  CreditCard
} from 'lucide-react'

export default function DashboardSidebar({
  user,
  theme,
  toggleTheme,
  handleLogout,
  handleNewCampaign,
  currentPage = 'dashboard',
  showBackButton = false,
  backButtonPath = '/dashboard'
}) {
  const navigate = useRouter()
  const pathname = usePathname()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const dropdownRef = useRef(null)
  const sidebarRef = useRef(null)
  const logoRef = useRef(null)
  const navContainerRef = useRef(null)

  // Sync sidebar width with CSS variable for layout synchronization
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isExpanded ? '256px' : '80px')
  }, [isExpanded])

  // Debug logging with DOM measurements
  useEffect(() => {
    if (sidebarRef.current && logoRef.current && navContainerRef.current) {
      const sidebarRect = sidebarRef.current.getBoundingClientRect()
      const logoRect = logoRef.current.getBoundingClientRect()
      const navRect = navContainerRef.current.getBoundingClientRect()

      console.log('🔍 Sidebar State + DOM Measurements:', {
        isExpanded,
        sidebarWidth: `${sidebarRect.width}px`,
        logoPosition: {
          left: `${logoRect.left}px`,
          top: `${logoRect.top}px`,
          width: `${logoRect.width}px`,
          height: `${logoRect.height}px`
        },
        navPosition: {
          left: `${navRect.left}px`,
          top: `${navRect.top}px`,
          width: `${navRect.width}px`
        },
        timestamp: new Date().toISOString()
      })
    }
  }, [isExpanded])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'campaigns', label: 'Campaigns', icon: FileText, path: '/dashboard/campaigns' },
    { id: 'templates', label: 'Templates', icon: Monitor, path: '/dashboard/templates' },
    { id: 'send-email', label: 'Send Email', icon: Mail, path: '/dashboard/send-email' },
  ]

  const insightNavItems = [
    { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/settings' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/dashboard/messages' },
  ]

  return (
    <aside
      ref={sidebarRef}
      className={`fixed left-0 top-0 bottom-0 z-40 bg-background flex flex-col transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo Section - Fixed Height */}
      <div ref={logoRef} className="h-20 flex items-center px-5 flex-shrink-0">
        <div
          className="flex items-center gap-3 cursor-pointer w-full overflow-hidden"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Image src="/assest/logo.svg" alt="logo" className="h-6 w-6" width={40} height={40} />
          </div>
          <span
            className={`text-base font-serif font-bold text-foreground whitespace-nowrap transition-all duration-500 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}
          >
            CertifyFlow
          </span>
        </div>
      </div>

      {/* Navigation Section - Scrollable */}
      <div ref={navContainerRef} className="flex-1 px-5 overflow-y-auto overflow-x-hidden">
        {/* Main Navigation */}
        <div className="mb-6">
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`relative flex items-center gap-3 w-full min-h-[44px] font-medium text-[13px] cursor-pointer group transition-all duration-500 ease-in-out overflow-hidden rounded-xl ${currentPage === item.id
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                    }`}
                  title={!isExpanded ? item.label : ''}
                >
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                    <item.icon size={18} className="transition-colors duration-500" />
                  </div>
                  <span
                    className={`whitespace-nowrap transition-all duration-500 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute left-10 ml-3'
                      }`}
                  >
                    {item.label}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Insight Section */}
        <div className="mb-6">
          <div className="space-y-1">
            {insightNavItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`relative flex items-center gap-3 w-full min-h-[44px] font-medium text-[13px] cursor-pointer group transition-all duration-500 ease-in-out overflow-hidden rounded-xl ${currentPage === item.id
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                    }`}
                  title={!isExpanded ? item.label : ''}
                >
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                    <item.icon size={18} className="transition-colors duration-500" />
                  </div>
                  <span
                    className={`whitespace-nowrap transition-all duration-500 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute left-10 ml-3'
                      }`}
                  >
                    {item.label}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Section - Fixed Height */}
      <div className="flex-shrink-0 p-5 border-t border-border">
        {/* User Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center min-h-[44px] rounded-xl hover:bg-foreground/5 transition-all duration-300 overflow-hidden"
          >
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <User size={16} className="text-accent" />
              </div>
            </div>

            <div className={`flex-1 flex items-center justify-between min-w-0 transition-all duration-500 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}>
              <div className="flex-1 text-left min-w-0 ml-2">
                <p className="text-[13px] font-medium text-foreground truncate">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
              </div>
              <ChevronDown
                size={14}
                className={`text-muted-foreground transition-transform duration-200 flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''
                  }`}
              />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && isExpanded && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
              <button
                onClick={() => {
                  navigate('/dashboard/settings')
                  setIsDropdownOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-foreground/5 transition-colors text-left"
              >
                <Settings size={16} className="text-muted-foreground" />
                <span className="text-sm text-foreground">Settings</span>
              </button>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-foreground/5 transition-colors text-left"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">Dark Mode</span>
                  </>
                )}
              </button>
              <div className="border-t border-border"></div>
              <button
                onClick={() => {
                  handleLogout()
                  setIsDropdownOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-destructive/10 transition-colors text-left text-destructive"
              >
                <LogOut size={16} />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
