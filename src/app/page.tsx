'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Moon, Trophy, Check, Download, ExternalLink, Menu, X, Loader2 } from 'lucide-react'

// Utilities
const getTodayStr = () => {
  return new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' }).split(' ')[0]
}

const getToeicDays = () => {
  const todayStr = getTodayStr()
  const today = new Date(todayStr)
  const toeicDate = new Date('2026-07-12')
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.ceil((toeicDate.getTime() - today.getTime()) / msPerDay)
}

export default function DiaryApp() {
  const [date, setDate] = useState(getTodayStr())
  const [abstinence, setAbstinence] = useState<string>('')
  const [sleep, setSleep] = useState<string>('')
  const [reflection, setReflection] = useState<string>('')
  
  const [sleepAvg, setSleepAvg] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Fetch data when date changes
  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch recent data for defaults
        const recentRes = await fetch(`/api/logs/recent?date=${date}`)
        const recentData = await recentRes.json()
        
        // Fetch record for the date
        const recordRes = await fetch(`/api/logs?date=${date}`)
        const recordData = await recordRes.json()

        if (!isMounted) return

        if (recentData.sleepAvg !== null) {
          setSleepAvg(recentData.sleepAvg)
        } else {
          setSleepAvg(null)
        }

        if (recordData && !recordData.error) {
          setAbstinence(recordData.abstinence?.toString() || '')
          setSleep(recordData.sleep?.toString() || '')
          setReflection(recordData.reflection || '')
        } else {
          setAbstinence(recentData.abstinence !== null ? recentData.abstinence.toString() : '')
          setSleep('')
          setReflection('')
        }
      } catch (error) {
        console.error('Failed to fetch data', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => { isMounted = false }
  }, [date])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (abstinence === '' || !Number.isInteger(Number(abstinence)) || Number(abstinence) < 0) {
      alert('禁欲日数は0以上の整数を入力してください。')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          abstinence: Number(abstinence),
          sleep: Number(sleep),
          reflection
        })
      })

      if (res.ok) {
        alert('データベースに保存しました！')
      } else {
        alert('保存エラーが発生しました。')
      }
    } catch (error) {
      alert('通信エラーが発生しました。')
    } finally {
      setSaving(false)
    }
  }

  const toeicDays = getToeicDays()

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-slate-800 font-sans selection:bg-indigo-200">
      
      {/* Navigation & Header */}
      <header className="relative z-50 p-4 sm:p-6 flex justify-between items-center max-w-2xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight">DreamDiary</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Keep pushing forward.</p>
          </div>
        </div>

        {/* Menu Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2.5 bg-white/60 hover:bg-white backdrop-blur-md rounded-xl border border-slate-200/60 shadow-sm transition-all"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <AnimatePresence>
            {menuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-64 bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="p-2">
                  <a href="/api/export" className="flex items-center gap-3 p-3 text-sm font-medium hover:bg-indigo-50 rounded-xl transition-colors text-slate-700">
                    <Download className="w-4 h-4 text-indigo-500" />
                    CSVエクスポート
                  </a>
                  <a href="https://neon.tech" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 text-sm font-medium hover:bg-indigo-50 rounded-xl transition-colors text-slate-700">
                    <ExternalLink className="w-4 h-4 text-indigo-500" />
                    Neonコンソール (DB)
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-4 sm:px-6 pb-8">
        
        {/* Countdown Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 relative overflow-hidden bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl p-5 flex items-center justify-between shadow-sm"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <div>
            <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase mb-1">Target</p>
            <h2 className="text-xl font-bold">TOEICまで</h2>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black tracking-tighter text-slate-900">{toeicDays}</span>
            <span className="text-sm font-medium text-slate-500">days</span>
          </div>
        </motion.div>

        {/* Main Form */}
        <motion.form 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col gap-6"
        >
          {/* Glassmorphism Card */}
          <div className="flex-1 flex flex-col bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
            
            {loading && (
              <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
              
              {/* Date Input */}
              <div className="flex flex-col gap-2">
                <label htmlFor="date" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Date
                </label>
                <input 
                  type="date" 
                  id="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-slate-50/50 hover:bg-slate-100/50 focus:bg-white border border-slate-200/60 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all outline-none"
                />
              </div>

              {/* Abstinence Input */}
              <div className="flex flex-col gap-2">
                <label htmlFor="abstinence" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" /> Abstinence
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    id="abstinence" 
                    min="0" step="1" inputMode="numeric"
                    value={abstinence}
                    onChange={(e) => setAbstinence(e.target.value)}
                    required
                    placeholder="0"
                    className="w-full bg-slate-50/50 hover:bg-slate-100/50 focus:bg-white border border-slate-200/60 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-4 py-3.5 text-lg font-bold transition-all outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm pointer-events-none">days</span>
                </div>
              </div>

              {/* Sleep Input */}
              <div className="flex flex-col gap-2">
                <label htmlFor="sleep" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Moon className="w-3.5 h-3.5" /> Sleep</span>
                  {sleepAvg !== null && <span className="text-[10px] text-indigo-500 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">Avg {sleepAvg}h</span>}
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    id="sleep" 
                    step="0.5" inputMode="decimal"
                    value={sleep}
                    onChange={(e) => setSleep(e.target.value)}
                    required
                    placeholder="0.0"
                    className="w-full bg-slate-50/50 hover:bg-slate-100/50 focus:bg-white border border-slate-200/60 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-4 py-3.5 text-lg font-bold transition-all outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm pointer-events-none">hrs</span>
                </div>
              </div>

            </div>

            {/* Reflection */}
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="reflection" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reflection</label>
              <textarea 
                id="reflection" 
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                required
                placeholder="What did you learn today? What are you grateful for?"
                className="w-full flex-1 min-h-[160px] bg-slate-50/50 hover:bg-slate-100/50 focus:bg-white border border-slate-200/60 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-3xl p-5 text-sm leading-relaxed transition-all outline-none resize-none"
              />
            </div>
            
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={saving || loading}
            className="group relative w-full overflow-hidden rounded-3xl bg-slate-900 px-8 py-5 transition-all hover:scale-[1.01] hover:bg-slate-800 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none disabled:transform-none shadow-xl shadow-slate-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            <div className="relative flex items-center justify-center gap-3">
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                  <span className="text-white font-bold text-base tracking-wide">Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 text-white" />
                  <span className="text-white font-bold text-base tracking-wide">Save Entry</span>
                </>
              )}
            </div>
          </button>
        </motion.form>

      </main>
    </div>
  )
}
