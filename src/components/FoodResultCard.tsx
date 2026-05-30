import { useState } from 'react'
import { Check, Edit3, X } from 'lucide-react'
import GlassCard from '@/components/GlassCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { FoodRecognition, IngredientParse } from '@/lib/openai'
import type { FoodItem } from '@/data/foods'

interface FoodResultCardProps {
  /** 识别结果 */
  data: FoodRecognition | IngredientParse | FoodItem
  /** 可否编辑 */
  editable?: boolean
  /** 图片 base64（拍照识别时有） */
  imageBase64?: string
  /** 确认回调 */
  onConfirm: (data: FoodEntryData) => void
  /** 取消 */
  onCancel?: () => void
}

export interface FoodEntryData {
  name: string
  calories: number
  protein: number
  fat: number
  carbs: number
  portion: string
  imageBase64?: string
}

export default function FoodResultCard({
  data,
  editable = true,
  imageBase64,
  onConfirm,
  onCancel,
}: FoodResultCardProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(data.name)
  const [calories, setCalories] = useState(data.calories)
  const [protein, setProtein] = useState(data.protein)
  const [fat, setFat] = useState(data.fat)
  const [carbs, setCarbs] = useState(data.carbs)
  const [portion, setPortion] = useState(
    'portion' in data ? String(data.portion ?? '1份') : '1份'
  )

  const hasConfidence = 'confidence' in data && data.confidence !== undefined
  const confidence = hasConfidence ? (data as FoodRecognition).confidence * 100 : null

  const handleConfirm = () => {
    onConfirm({
      name: name || data.name,
      calories: calories ?? data.calories,
      protein: protein ?? data.protein,
      fat: fat ?? data.fat,
      carbs: carbs ?? data.carbs,
      portion,
      imageBase64,
    })
  }

  const NutritionCell = ({
    label,
    value,
    unit,
    color,
  }: {
    label: string
    value: number | string
    unit: string
    color: string
  }) =>
    editing ? (
      <div className="text-center">
        <div className="text-micro font-medium mb-1" style={{ color }}>
          {label}
        </div>
        <Input
          type="number"
          value={String(value)}
          onChange={(e) => {
            const v = parseInt(e.target.value) || 0
            switch (label) {
              case '热量':
                setCalories(v)
                break
              case '蛋白质':
                setProtein(v)
                break
              case '脂肪':
                setFat(v)
                break
              case '碳水':
                setCarbs(v)
                break
            }
          }}
          className="h-9 text-center text-caption"
        />
        <div className="text-micro text-muted-foreground mt-0.5">{unit}</div>
      </div>
    ) : (
      <div className="text-center">
        <div className="text-micro font-medium" style={{ color }}>
          {label}
        </div>
        <div className="text-card-title font-bold text-foreground">
          {value}
        </div>
        <div className="text-micro text-muted-foreground">{unit}</div>
      </div>
    )

  return (
    <GlassCard className="space-y-4 animate-scale-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        {imageBase64 ? (
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
            <img
              src={`data:image/jpeg;base64,${imageBase64}`}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 text-xl">
            🍽️
          </div>
        )}
        <div className="flex-1 min-w-0">
          {editing ? (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-body font-semibold"
            />
          ) : (
            <div className="text-body font-semibold truncate">
              {name || data.name}
            </div>
          )}
          {confidence !== null && (
            <div
              className={cn(
                'inline-flex items-center gap-1 text-micro px-2 py-0.5 rounded-full mt-1',
                confidence >= 80
                  ? 'bg-success/10 text-success'
                  : confidence >= 50
                    ? 'bg-warning/10 text-warning'
                    : 'bg-destructive/10 text-destructive'
              )}
            >
              <div
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  confidence >= 80
                    ? 'bg-success'
                    : confidence >= 50
                      ? 'bg-warning'
                      : 'bg-destructive'
                )}
              />
              置信度 {Math.round(confidence)}%
            </div>
          )}
        </div>
      </div>

      {/* Nutrition Grid */}
      <div className="grid grid-cols-4 gap-2 p-3 glass rounded-xl">
        <NutritionCell label="热量" value={calories} unit="kcal" color="#f87171" />
        <NutritionCell label="蛋白质" value={protein} unit="g" color="#60a5fa" />
        <NutritionCell label="脂肪" value={fat} unit="g" color="#fbbf24" />
        <NutritionCell label="碳水" value={carbs} unit="g" color="#34d399" />
      </div>

      {/* Portion */}
      <div className="flex items-center gap-2">
        <span className="text-caption text-muted-foreground">份量：</span>
        {editing ? (
          <Input
            value={portion}
            onChange={(e) => setPortion(e.target.value)}
            className="h-8 text-caption flex-1"
            placeholder="约200g"
          />
        ) : (
          <span className="text-caption">{portion}</span>
        )}
      </div>

      {/* Actions */}
      {editable && (
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(!editing)}
            className="rounded-xl flex-1"
          >
            {editing ? (
              <>
                <Check size={16} className="mr-1" /> 完成
              </>
            ) : (
              <>
                <Edit3 size={16} className="mr-1" /> 修改
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            className="rounded-xl flex-[2] bg-primary"
          >
            <Check size={16} className="mr-1" /> 确认录入
          </Button>
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="rounded-xl"
            >
              <X size={16} />
            </Button>
          )}
        </div>
      )}
    </GlassCard>
  )
}
