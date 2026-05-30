import { NavLink, useLocation } from 'react-router-dom'
import { House, UtensilsCrossed, Dumbbell, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: House, label: '首页' },
  { to: '/food', icon: UtensilsCrossed, label: '饮食' },
  { to: '/exercise', icon: Dumbbell, label: '运动' },
  { to: '/settings', icon: Settings, label: '设置' },
]

export default function BottomNav() {
  const location = useLocation()
  // 隐藏导航页面：设置向导 / 全屏详情等
  const hideNav = ['/setup', '/circle'].some(p => location.pathname.startsWith(p))

  if (hideNav) return null

  return (
    <nav
      className="glass fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom,0px)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active =
            to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors duration-150 min-w-[64px]',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {active && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-primary" />
              )}
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 2}
                className={cn(
                  'transition-transform duration-200',
                  active && 'scale-110'
                )}
              />
              <span className={cn('text-micro', active && 'font-semibold')}>
                {label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
