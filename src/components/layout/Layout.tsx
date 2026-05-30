import { Outlet, useLocation } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import BottomNav from './BottomNav'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'

export default function Layout() {
  const location = useLocation()
  const { dark, toggle } = useTheme()

  return (
    <div className="relative min-h-screen bg-background pb-20">
      {/* 安全区顶部占位 + 暗色模式切换 */}
      <div className="flex items-center justify-between px-4"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="h-[env(safe-area-inset-top,0px)]" />
        <button
          onClick={toggle}
          className="ml-auto glass rounded-xl p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={dark ? '切换亮色模式' : '切换暗色模式'}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
      {/* 页面内容 */}
      <main className="container max-w-md mx-auto pt-4 animate-fade-in">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {/* 底部导航 */}
      <BottomNav />
    </div>
  )
}
