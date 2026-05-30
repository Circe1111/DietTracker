import { type ReactNode } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface BottomSheetProps {
  /** 是否打开 */
  open: boolean
  /** 切换回调 */
  onOpenChange: (open: boolean) => void
  /** 面板标题 */
  title?: string
  /** 面板描述（可选） */
  description?: string
  /** 面板内容 */
  children: ReactNode
  /** 额外 CSS */
  className?: string
}

/**
 * BottomSheet — 玻璃质感底部面板
 * 基于 shadcn/ui Sheet 组件，应用毛玻璃样式
 *
 * 修改入口:
 *   - 面板圆角、高度限制在 className 中覆盖
 *   - 毛玻璃程度在 .glass-strong 调整
 */
export default function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: BottomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          'glass-strong rounded-t-2xl max-h-[85vh] overflow-y-auto',
          'border-t border-white/20 dark:border-white/5',
          'px-6 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]',
          className
        )}
      >
        {title && (
          <SheetHeader className="mb-4">
            <SheetTitle className="text-card-title">{title}</SheetTitle>
            {description && (
              <SheetDescription>{description}</SheetDescription>
            )}
          </SheetHeader>
        )}
        {/* 拖拽手柄 */}
        <div className="flex justify-center -mt-1 mb-4">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="animate-slide-up">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
