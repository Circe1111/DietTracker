import { cn } from '@/lib/utils'

interface CircularProgressProps {
  /** 0-100 的百分比 */
  value: number
  /** SVG 尺寸 */
  size?: number
  /** 环的粗细 */
  strokeWidth?: number
  /** 环的颜色（支持 CSS 颜色字符串和渐变 ID） */
  color?: string
  /** 底色环的颜色 */
  trackColor?: string
  /** 环形中间的大文字 */
  label?: string
  /** 大文字下方的副标题 */
  sublabel?: string
  /** 高亮模式 — 超过 100% 时变红 */
  warnAt?: number
}

/**
 * CircularProgress — 环形进度指示器（SVG）
 * 用于仪表盘展示剩余热量预算、运动完成度等
 *
 * 修改入口:
 *   - color 默认值修改环色
 *   - trackColor 默认值修改底色
 *   - warnAt 设置警戒阈值
 */
export default function CircularProgress({
  value,
  size = 140,
  strokeWidth = 10,
  color = 'hsl(158,56%,39%)',
  trackColor = 'hsl(var(--muted))',
  label,
  sublabel,
  warnAt = 100,
}: CircularProgressProps) {
  const clamped = Math.min(value, 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference
  const warn = value > warnAt
  const fillColor = warn ? 'hsl(var(--destructive))' : color

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size}
        className={cn('-rotate-90', warn && 'animate-pulse')}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
          style={{ filter: warn ? undefined : 'drop-shadow(0 0 4px currentColor)' }}
        />
      </svg>
      {/* 中心文字 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
        {label && (
          <span
            className={cn(
              'text-display text-foreground',
              warn && 'text-destructive'
            )}
          >
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-caption text-muted-foreground mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  )
}
