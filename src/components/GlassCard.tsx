import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
  onClick?: () => void
}

/**
 * GlassCard — 毛玻璃 Bento 卡片容器
 * 用于仪表盘和详情页的统一卡片样式
 *
 * 修改入口:
 *   - 调整 .glass 样式在 src/index.css @layer components
 *   - 调整 .bento-card 样式在 src/index.css @layer components
 */
export default function GlassCard({
  children,
  className,
  hoverable = false,
  onClick,
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass bento-card',
        hoverable && 'cursor-pointer hover:shadow-glass-hover',
        onClick && 'cursor-pointer',
        className
      )}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}
