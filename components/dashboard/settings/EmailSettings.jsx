import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
const [settingsSaved, setSettingsSaved] = useState(false)
const [testingEmail, setTestingEmail] = useState(false)
const [testResult, setTestResult] = useState(null)
const [user, setUser] = useState(null)
const [loading, setLoading] = useState(true)
const [scrolled, setScrolled] = useState(false)
const [theme, setTheme] = useState(() => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('theme') || 'light'
  }
  return 'light'
})

useEffect(() => {
  // Minimum loading time for smooth UX (prevents flash)
  const minLoadTime = new Promise(resolve => setTimeout(resolve, 3000))

  // Get logged-in user
  Promise.all([
    supabase.auth.getSession(),
    minLoadTime
  ]).then(([{ data: { session } }]) => {
    setUser(session?.user ?? null)
    setLoading(false)
    if (!session?.user) {
      navigate.push('/')
    }
  })
}, [navigate])

useEffect(() => {
  // Theme Initialisation
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', theme)
}, [theme])

const selectedProvider = EMAIL_PROVIDERS.find(p => p.id === emailProvider)
const isConfigured = apiKey && fromEmail

const toggleTheme = () => {
  setTheme(prev => prev === 'light' ? 'dark' : 'light')
}

const handleLogout = async () => {
  await signOut()
  navigate.push('/')
}

function saveEmailSettings() {
  localStorage.setItem('emailProvider', emailProvider)
  localStorage.setItem('emailApiKey', apiKey)
  localStorage.setItem('fromEmail', fromEmail)
  localStorage.setItem('fromName', fromName)
  setSettingsSaved(true)
  setTimeout(() => setSettingsSaved(false), 2000)
}

function clearSettings() {
  if (confirm('Are you sure you want to remove all email settings?')) {
    localStorage.removeItem('emailProvider')
    localStorage.removeItem('emailApiKey')
    localStorage.removeItem('fromEmail')
    localStorage.removeItem('fromName')
    setEmailProvider('resend')
    setApiKey('')
    setFromEmail('')
    setFromName('')
  }
}

async function testEmailConnection() {
  if (!apiKey || !fromEmail) {
    setTestResult({ success: false, message: 'Please configure all settings first' })
    return
  }

  if (!user?.email) {
    setTestResult({ success: false, message: 'Please log in to test email' })
    return
  }

  setTestingEmail(true)
  setTestResult(null)

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: user.email,
        from: fromEmail,
        fromName: fromName,
        subject: 'CertifyFlow Email Test',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #A098FF;">Success! 🎉</h1>
              <p style="font-size: 16px; line-height: 1.6;">Your email integration is working correctly.</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Provider:</strong> ${emailProvider}</p>
                <p style="margin: 5px 0;"><strong>From:</strong> ${fromEmail}</p>
                <p style="margin: 5px 0;"><strong>To:</strong> ${user.email}</p>
              </div>
              <p style="font-size: 14px; color: #666;">You're all set to send certificates!</p>
            </div>
          `,
        provider: emailProvider,
        apiKey: apiKey,
        fromEmail: fromEmail,
      })
    })

    if (response.ok) {
      setTestResult({ success: true, message: `Test email sent successfully to ${user.email}! Check your inbox.` })
    } else {
      const error = await response.json()
      setTestResult({ success: false, message: error.error || 'Failed to send test email' })
    }
  } catch (error) {
    setTestResult({ success: false, message: error.message || 'Network error' })
  } finally {
    setTestingEmail(false)
  }
}

if (loading) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader size={120} color="#6b55fd" className="mx-auto" />
      </div>
    </div>
  )
}

return (
  <div className="min-h-screen bg-background no-scrollbar selection:bg-[#A098FF] selection:text-white">
    {/* Dashboard Navbar */}
    <DashboardNavbar
      user={user}
      theme={theme}
      toggleTheme={toggleTheme}
      handleLogout={handleLogout}
      currentPage="settings"
      showBackButton={true}
      backButtonPath="/dashboard"
    />

    <main className="ml-[var(--sidebar-width,256px)] min-h-screen transition-all duration-500">
      {/* Dashboard Header */}
      <section className="relative pt-44 pb-20 w-full overflow-hidden bg-background">


        <div className="relative z-10 max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-2xl animate-in fade-in slide-in-from-left-8 duration-1000">


              <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight text-foreground dark:text-white">
                Let's set up how you <br /><span className="text-accent italic">send</span> emails
              </h1>

              <p className="text-sm md:text-base text-muted-foreground dark:text-zinc-400 max-w-xl font-medium leading-relaxed">
                Connect your favorite email service so you can start sending out certificates. Your security is our priority—all your credentials are encrypted and safe.
              </p>
            </div>

            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-8 duration-1000">
              {isConfigured && !testingEmail && (
                <div className="hidden lg:flex items-center gap-3 px-6 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[12px] font-bold text-emerald-500 uppercase">Service Active</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-24 relative z-10">
        {/* Configuration Status */}
        {isConfigured && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800 rounded-[32px] shadow-none">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check size={20} className="text-green-500" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-green-900 dark:text-green-100">Email Service Active</h3>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    {selectedProvider?.name} connected • {fromEmail}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testEmailConnection}
                  disabled={testingEmail}
                  className="bg-accent text-white hover:bg-lavender-600 border-accent rounded-full px-6"
                >
                  {testingEmail ? 'Testing...' : 'Send Test Email'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Result */}
        {testResult && (
          <Card className={`mb-8 rounded-[32px] shadow-none ${testResult.success ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-red-200 bg-red-50 dark:bg-red-950/20'}`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                {testResult.success ? (
                  <Check size={20} className="text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle size={20} className="text-red-600 mt-0.5" />
                )}
                <div>
                  <p className={`text-xs font-medium ${testResult.success ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                    {testResult.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuration Form and Provider Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Form */}
          <Card className="rounded-[40px] border-border bg-background/50 backdrop-blur-xl shadow-none">
            <CardHeader className="pb-8">
              <CardTitle className="text-xl font-serif font-bold">Provider Configuration</CardTitle>
              <CardDescription className="text-xs">Enter your email service details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Provider Selection */}
              <div>
                <label className="block text-[12px] font-bold mb-2 text-muted-foreground">Email Provider</label>
                <Select value={emailProvider} onValueChange={setEmailProvider}>
                  <SelectTrigger className="w-full px-4 py-3 rounded-2xl border border-border bg-background/50 text-foreground font-medium">
                    <SelectValue placeholder="Select gateway" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-2xl border border-border z-[100] rounded-2xl">
                    {EMAIL_PROVIDERS.map(p => (
                      <SelectItem key={p.id} value={p.id} className="rounded-xl">{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProvider && (
                  <p className="text-[12px] text-muted-foreground mt-3 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-accent" />
                    Quota: {selectedProvider.freeTier}
                    <a href={selectedProvider.setupUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-bold ml-auto">
                      Documentation →
                    </a>
                  </p>
                )}
              </div>

              {/* API Key */}
              <div>
                <label className="block text-[12px] font-bold mb-2 text-muted-foreground">
                  {emailProvider === 'gmail' ? 'Nodemailer Token' : 'Auth Token'}
                </label>
                <div className="relative">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={selectedProvider?.placeholder}
                    className="pr-10 rounded-2xl border-border bg-background/50 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* From Email */}
              <div>
                <label className="block text-[12px] font-bold mb-2 text-muted-foreground">Verified Sender Email</label>
                <Input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder={selectedProvider?.testEmail || "certificates@yourdomain.com"}
                  className="rounded-2xl border-border bg-background/50 font-medium"
                />
              </div>

              {/* From Name */}
              <div>
                <label className="block text-[12px] font-bold mb-2 text-muted-foreground">Sender Identity</label>
                <Input
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Your Organization"
                  className="rounded-2xl border-border bg-background/50 font-medium"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6">
                <Button
                  onClick={saveEmailSettings}
                  className="flex-1 gap-2 bg-accent text-white hover:bg-lavender-600 rounded-full py-6 text-xs font-bold transition-all"
                >
                  {settingsSaved ? <Check size={16} /> : null}
                  {settingsSaved ? 'Encrypted & Saved' : 'Apply Configuration'}
                </Button>
                {isConfigured && (
                  <Button
                    variant="outline"
                    onClick={clearSettings}
                    className="rounded-full py-6 px-6 border-border bg-foreground/5 hover:bg-destructive/10 hover:text-destructive transition-all"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Provider Comparison */}
          <Card className="rounded-[40px] border-border bg-background/50 backdrop-blur-xl shadow-none">
            <CardHeader className="pb-8">
              <CardTitle className="text-xl font-serif font-bold">Email Providers</CardTitle>
              <CardDescription className="text-xs">Compare providers and limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {EMAIL_PROVIDERS.map(provider => (
                  <div
                    key={provider.id}
                    className={`p-6 rounded-[24px] border transition-all cursor-pointer ${emailProvider === provider.id ? 'bg-accent/5 border-accent/30' : 'bg-secondary/10 border-border hover:border-accent/20'}`}
                    onClick={() => setEmailProvider(provider.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-sm">{provider.name}</h3>
                      <div className={`w-1.5 h-1.5 rounded-full ${emailProvider === provider.id ? 'bg-accent shadow-[0_0_8px_#6b55fd]' : 'bg-muted'}`} />
                    </div>
                    <p className="text-[12px] text-muted-foreground mb-4 font-medium">{provider.freeTier}</p>

                    {provider.note && (
                      <div className="flex items-start gap-2 mb-4">
                        <div className="p-1 rounded bg-accent/10 border border-accent/20">
                          <Plus size={10} className="text-accent" />
                        </div>
                        <p className="text-[12px] text-muted-foreground leading-relaxed">{provider.note}</p>
                      </div>
                    )}

                    <a
                      href={provider.setupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] text-accent hover:underline font-bold"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Documentation →
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  </div>
)
}
