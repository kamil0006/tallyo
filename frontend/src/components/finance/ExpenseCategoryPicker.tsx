import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Palette, Plus, Trash2 } from 'lucide-react'
import { capitalizeFirstPl } from '../../lib/capitalizeFirst'
import { EXPENSE_CATEGORY_NONE } from '../../lib/expenseCategoryConstants'
import { ConfirmDialog } from '../ConfirmDialog'

/** Ready-made colours ordered by hue, so similar shades sit next to each other. Any other colour can be
 * picked with the custom colour button. */
const PRESET_COLORS = [
  // reds, oranges, yellows
  '#e57373', '#ff6b6b', '#e17055', '#ff8a65', '#ffb74d', '#c9a35c', '#ffd54f', '#ffeaa7',
  // greens, teals
  '#dce775', '#aed581', '#96ceb4', '#63b28f', '#00b894', '#2e8b6a', '#4ecdc4', '#4db6ac',
  // blues, purples
  '#4dd0e1', '#45b7d1', '#64b5f6', '#82a7cf', '#3f6fb5', '#7986cb', '#a29bfe', '#6c5ce7',
  // violets, pinks, neutrals
  '#9d4edd', '#b58cc4', '#ce93d8', '#fd79a8', '#f06292', '#a1887f', '#90a4ae', '#dfe6e9',
] as const

export const DEFAULT_NEW_EXPENSE_CATEGORY_COLOR: string = PRESET_COLORS[0]

export type CategoryOption = { id: string; name: string; label: string; color: string }

export interface ExpenseCategoryPickerProps {
  categories: CategoryOption[]
  category: string
  onCategoryChange: (name: string) => void
  onDeleteCategory?: (id: string) => void | Promise<void>
  onAddCategory?: (name: string, color: string) => void | Promise<void>
  showAddCategory: boolean
  setShowAddCategory: (v: boolean) => void
  newCategoryName: string
  setNewCategoryName: (v: string) => void
  newCategoryColor: string
  setNewCategoryColor: (v: string) => void
  onAddedCategory: (normalizedName: string) => void
}

function resolveSelectValue(category: string, categories: CategoryOption[]): string {
  if (category === EXPENSE_CATEGORY_NONE) return EXPENSE_CATEGORY_NONE
  return categories.some((c) => c.name === category) ? category : EXPENSE_CATEGORY_NONE
}

export function ExpenseCategoryPicker({
  categories,
  category,
  onCategoryChange,
  onDeleteCategory,
  onAddCategory,
  showAddCategory,
  setShowAddCategory,
  newCategoryName,
  setNewCategoryName,
  newCategoryColor,
  setNewCategoryColor,
  onAddedCategory,
}: ExpenseCategoryPickerProps) {
  const { t } = useTranslation('finances')
  const canManage = Boolean(onDeleteCategory || onAddCategory)
  // Colours already taken by other categories get a small dot, and a new category starts with a free one.
  const usedColors = new Set(categories.map((c) => c.color.toLowerCase()))
  const isCustomColor = !(PRESET_COLORS as readonly string[]).includes(newCategoryColor.toLowerCase())
  const firstFreeColor = PRESET_COLORS.find((c) => !usedColors.has(c)) ?? DEFAULT_NEW_EXPENSE_CATEGORY_COLOR
  const selectValue = resolveSelectValue(category, categories)
  const [deleteTarget, setDeleteTarget] = useState<CategoryOption | null>(null)

  return (
    <>
      <div className="space-y-2">
      <div>
        <label className="block text-base text-(--text-muted) font-display mb-1">{t('expenseCategoryPicker.categoryLabel')}</label>
        <select
          value={selectValue}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-(--bg-dark) border border-(--border) text-(--text-primary) text-sm font-display focus:border-(--accent) focus:outline-none"
        >
          <option value={EXPENSE_CATEGORY_NONE}>{t('expenseCategoryPicker.noneOption')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {capitalizeFirstPl(c.label)}
            </option>
          ))}
        </select>
      </div>

      {canManage && (
        <div className="rounded-md border border-(--accent)/12 bg-(--bg-dark)/40 p-2.5 space-y-2">
          <p className="text-sm text-(--text-muted) font-display leading-tight">{t('expenseCategoryPicker.categoryListLabel')}</p>

          {categories.length > 0 && onDeleteCategory && (
            <div className="flex flex-wrap gap-1">
              {categories.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex max-w-full items-center gap-0.5 rounded-md border border-(--border) bg-(--bg-card) pl-1.5 pr-0.5 py-0.5 text-xs"
                >
                  <span className="min-w-0 truncate font-medium" style={{ color: c.color }}>
                    {capitalizeFirstPl(c.label)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(c)}
                    className="shrink-0 rounded p-1 text-(--text-muted) hover:bg-red-500/15 hover:text-red-400 transition-colors"
                    title={t('common:delete')}
                    aria-label={t('expenseCategoryPicker.deleteCategoryAria', { label: c.label })}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {onAddCategory && (
            <div
              className={categories.length > 0 && onDeleteCategory ? 'space-y-2 border-t border-(--border)/60 pt-2' : ''}
            >
              {!showAddCategory ? (
                <button
                  type="button"
                  onClick={() => {
                    setNewCategoryColor(firstFreeColor)
                    setShowAddCategory(true)
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-(--border) py-1.5 text-sm text-(--text-muted) font-display transition-colors hover:border-(--accent)/35 hover:text-(--accent)"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  {t('expenseCategoryPicker.newCategory')}
                </button>
              ) : (
                <div className="space-y-2 rounded-md border border-(--border) bg-(--bg-card) p-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={t('expenseCategoryPicker.namePlaceholder')}
                    className="w-full px-2 py-1.5 rounded-md bg-(--bg-dark) border border-(--border) text-(--text-primary) text-sm focus:border-(--accent) focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((col) => {
                      const selected = newCategoryColor.toLowerCase() === col
                      const used = usedColors.has(col)
                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setNewCategoryColor(col)}
                          className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                            selected ? 'border-(--accent)' : 'border-transparent hover:ring-1 hover:ring-white/15'
                          }`}
                          style={{ backgroundColor: col }}
                          title={used ? t('expenseCategoryPicker.colorUsed', { color: col }) : col}
                          aria-label={t('expenseCategoryPicker.colorAria', { color: col })}
                        >
                          {selected ? (
                            <Check className="h-3.5 w-3.5 text-[#000000] drop-shadow-[0_0_2px_rgba(0,0,0,0.55)]" />
                          ) : (
                            used && <span className="h-1.5 w-1.5 rounded-full bg-black/45" aria-hidden />
                          )}
                        </button>
                      )
                    })}
                    {/* Custom colour: the native colour picker, shown as one more swatch. */}
                    <label
                      className={`relative flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-all ${
                        isCustomColor ? 'border-(--accent)' : 'border-dashed border-(--text-muted)/60 hover:border-(--accent)/60'
                      }`}
                      style={isCustomColor ? { backgroundColor: newCategoryColor } : undefined}
                      title={t('expenseCategoryPicker.customColor')}
                    >
                      {isCustomColor ? (
                        <Check className="h-3.5 w-3.5 text-[#000000] drop-shadow-[0_0_2px_rgba(0,0,0,0.55)]" />
                      ) : (
                        <Palette className="h-3.5 w-3.5 text-(--text-muted)" aria-hidden />
                      )}
                      <input
                        type="color"
                        value={newCategoryColor}
                        onChange={(e) => setNewCategoryColor(e.target.value.toLowerCase())}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        aria-label={t('expenseCategoryPicker.customColor')}
                      />
                    </label>
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCategory(false)
                        setNewCategoryName('')
                      }}
                      className="rounded-md border border-(--border) px-2.5 py-1 text-sm text-(--text-muted) hover:bg-(--bg-dark)"
                    >
                      {t('common:cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const raw = newCategoryName.trim()
                        if (!raw || !onAddCategory) return
                        await onAddCategory(raw, newCategoryColor)
                        onAddedCategory(capitalizeFirstPl(raw))
                        setShowAddCategory(false)
                        setNewCategoryName('')
                      }}
                      className="rounded-md bg-(--accent)/20 px-2.5 py-1 text-sm text-(--accent) font-display border border-(--accent)/30 hover:bg-(--accent)/28"
                    >
                      {t('expenseCategoryPicker.add')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      </div>

      <ConfirmDialog
        zBackdrop={10030}
        zPanel={10031}
        isOpen={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget || !onDeleteCategory) return
          const t = deleteTarget
          const remaining = categories.filter((x) => x.id !== t.id)
          void onDeleteCategory(t.id)
          if (category === t.name) onCategoryChange(remaining[0]?.name ?? EXPENSE_CATEGORY_NONE)
          setDeleteTarget(null)
        }}
        title={t('expenseCategoryPicker.deleteCategoryConfirmTitle')}
        description={t('expenseCategoryPicker.deleteCategoryConfirmDescription')}
        emphasis={deleteTarget ? capitalizeFirstPl(deleteTarget.label) : undefined}
        variant="danger"
        confirmLabel={t('common:delete')}
        cancelLabel={t('common:cancel')}
      />
    </>
  )
}
