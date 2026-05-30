import { cn } from '@/lib/utils'

interface MacroBarProps {
  /** 营养素名称 */
  label: string
  /** 实际摄入量 */
  current: number
  /** 目标量 */
  target: number
  /** 单位 */
  unit: string
  /** 进度条颜色 */
  color: string
  /** 紧凑模式 — 减少高度 */
  compact?: boolean
}

/**
 * MacroBar — 宏量营养素进度条
 * 显示蛋白质/脂肪/碳水实际 vs 目标的横向进度条
 *
 * 修改入口:
 *   - color 属性控制每种营养素的颜色
 *   - compact 模式用于卡片内的紧凑展示
 */
export default function MacroBar({
  label,
  current,
  target,
  unit,
  color,
  compact = false,
}: MacroBarProps) {
  const pct = target > 0 ? Math.min((current / target) * 100, 120) : 0
  const over = pct > 100

  return (
    <div className={cn('w-full', compact ? 'space-y-1' : 'space-y-1.5')}>
      {/* 标签行 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span
            className={cn(
              'text-caption font-medium',
              compact ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {label}
          </span>
        </div>
        <span className="text-micro text-muted-foreground tabular-nums">
          <span className={cn(over && 'text-destructive font-semibold')}>
            {current}
          </span>
          <span className="text-muted-foreground/60">
            {' '}
            / {target}
            {unit}
          </span>
        </span>
      </div>

      {/* 进度条 */}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          compact ? 'h-1.5' : 'h-2.5'
        )}
        style={{ backgroundColor: over ? 'hsl(var(--destructive)/0.15)' : 'hsl(var(--muted))' }}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            compact ? 'min-w-[4px]' : 'min-w-[6px]'
          )}
          style={{
            width: `${Math.min(pct, 100)}%`,
            backgroundColor: over ? 'hsl(var(--destructive))' : color,
          }}
        />
      </div>
    </div>
  )
}
