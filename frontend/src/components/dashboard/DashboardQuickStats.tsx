import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Card } from '../Card'
import { dashboardSectionStaggerVariants, getDashboardTileVariants } from '../../lib/dashboardMotion'
import { formatNumberPl } from '../../lib/currency'
import { formatTodoDueSummary, todoDateStatus, type TodoItem } from '../../lib/todoDomain'
import { useTodoDueLabels } from '../../lib/useTodoDueLabels'

/** How many open tasks the dashboard card lists; the rest are summarised as "+N more". */
const TODO_PREVIEW_LIMIT = 4

function formatEventDate(dateStr: string, locale: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return dateStr
  return new Date(y, m - 1, d).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
}

export type DashboardQuickStatsProps = {
  upcomingEvents: { id: string; title: string; date: string; time?: string; color?: string }[]
  /** Open tasks, already sorted (overdue and today first). */
  openTodos: TodoItem[]
  onToggleTodo: (id: string) => void
  goals: { id: string; name: string; target: number; current: number; unit?: string }[]
  habitsToday: { done: number; total: number }
  reduceMotion: boolean | null
}

const TILE_BASE = 6

export function DashboardQuickStats({
  upcomingEvents,
  openTodos,
  onToggleTodo,
  goals,
  habitsToday,
  reduceMotion,
}: DashboardQuickStatsProps) {
  const { t, i18n } = useTranslation('dashboard')
  const locale = i18n.language === 'pl' ? 'pl-PL' : 'en-US'
  const dueLabels = useTodoDueLabels()
  const previewTodos = openTodos.slice(0, TODO_PREVIEW_LIMIT)
  const hiddenTodos = openTodos.length - previewTodos.length
  return (
    <motion.div
      variants={dashboardSectionStaggerVariants}
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 items-stretch"
    >
      <motion.div variants={getDashboardTileVariants(reduceMotion, TILE_BASE + 0)} className="min-w-0 flex">
        <Card title={t('upcomingEvents')} className="border-(--accent)/20 p-4 sm:p-5 flex flex-col h-full w-full" animateEntrance={false}>
          <div className="flex-1 min-h-0">
            {upcomingEvents.length > 0 ? (
              <ul className="space-y-2.5">
                {upcomingEvents.map((ev) => (
                  <li key={ev.id} className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: ev.color ?? 'var(--accent)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        to="/calendar"
                        className="block truncate text-[15px] font-medium text-(--text-primary) outline-none transition-colors hover:text-(--accent) focus:outline-none"
                      >
                        {ev.title}
                      </Link>
                      <p className="mt-0.5 text-sm tabular-nums text-(--text-muted)">
                        {formatEventDate(ev.date, locale)} {ev.time && `• ${ev.time}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-(--text-muted) text-sm">{t('noUpcomingEvents')}</p>
            )}
          </div>
          <Link
            to="/calendar"
            className="mt-auto pt-2 inline-block text-sm text-(--accent) hover:underline outline-none focus:outline-none"
          >
            {t('viewCalendar')}
          </Link>
        </Card>
      </motion.div>
      <motion.div variants={getDashboardTileVariants(reduceMotion, TILE_BASE + 1)} className="min-w-0 flex">
        <Card
          title={openTodos.length > 0 ? t('todoTitleCount', { count: openTodos.length }) : t('todoTitle')}
          className="border-(--warning)/20 p-4 sm:p-5 flex flex-col h-full w-full"
          animateEntrance={false}
        >
          <div className="flex-1 min-h-0">
            {previewTodos.length > 0 ? (
              <ul className="space-y-2.5">
                {previewTodos.map((todo) => {
                  const status = todoDateStatus(todo.dueDate)
                  return (
                    <li key={todo.id} className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleTodo(todo.id)}
                        className="mt-0.5 size-[18px] shrink-0 rounded-full border-2 border-(--text-muted)/50 transition-colors hover:border-(--positive) hover:bg-(--positive)/20"
                        aria-label={t('markTodoDone', { text: todo.text })}
                        title={t('markTodoDone', { text: todo.text })}
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          to="/todo"
                          className="line-clamp-2 text-[15px] font-medium leading-snug text-(--text-primary) outline-none transition-colors [overflow-wrap:anywhere] hover:text-(--accent) focus:outline-none"
                          title={todo.text}
                        >
                          {todo.text}
                        </Link>
                        {(todo.dueDate || todo.dueTime) && (
                          <p
                            className={`mt-0.5 truncate text-sm tabular-nums ${
                              status === 'overdue' ? 'text-(--danger)' : 'text-(--text-muted)'
                            }`}
                            title={status === 'overdue' ? t('overdue') : undefined}
                          >
                            {formatTodoDueSummary(todo.dueDate, todo.dueTime, dueLabels)}
                          </p>
                        )}
                      </div>
                    </li>
                  )
                })}
                {hiddenTodos > 0 && (
                  <li className="pl-[26px] text-sm text-(--text-muted)">{t('moreTodos', { count: hiddenTodos })}</li>
                )}
              </ul>
            ) : (
              <p className="text-(--text-muted) text-sm">{t('noOpenTodos')}</p>
            )}
          </div>
          <Link
            to="/todo"
            className="mt-auto pt-2 inline-block text-sm text-(--accent) hover:underline outline-none focus:outline-none"
          >
            {t('viewTodo')}
          </Link>
        </Card>
      </motion.div>
      <motion.div variants={getDashboardTileVariants(reduceMotion, TILE_BASE + 2)} className="min-w-0 flex">
        <Card title={t('activeGoals')} className="border-(--accent)/20 p-4 sm:p-5 flex flex-col h-full w-full" animateEntrance={false}>
          <div className="flex-1 min-h-0">
            {goals.length > 0 ? (
              <div className="space-y-2.5">
                {goals.slice(0, 3).map((g) => {
                  const pct = Math.min(100, (g.current / g.target) * 100)
                  return (
                    <div key={g.id} className="space-y-1">
                      <p className="truncate text-[15px] font-medium text-(--text-primary)">{g.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-(--bg-card) overflow-hidden">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-(--accent) to-(--positive) transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm text-(--text-muted) shrink-0 tabular-nums">
                          {formatNumberPl(g.current)}/{formatNumberPl(g.target)} {g.unit ?? ''}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-(--text-muted) text-sm">{t('noActiveGoals')}</p>
            )}
          </div>
          <Link
            to="/habits"
            className="mt-auto pt-2 inline-block text-sm text-(--accent) hover:underline outline-none focus:outline-none"
          >
            {goals.length > 0 ? t('viewGoals') : t('addGoal')}
          </Link>
        </Card>
      </motion.div>
      <motion.div variants={getDashboardTileVariants(reduceMotion, TILE_BASE + 3)} className="min-w-0 flex">
        <Card title={t('habitsToday')} className="border-(--positive)/20 p-4 sm:p-5 flex flex-col h-full w-full" animateEntrance={false}>
          <div className="flex-1 min-h-0">
            {habitsToday.total > 0 ? (
              <>
                <p className="text-2xl sm:text-3xl font-bold text-(--positive) font-display tabular-nums">
                  {habitsToday.done}/{habitsToday.total}
                </p>
                <p className="text-sm text-(--text-muted) mt-1">{t('checkedOffToday')}</p>
                <div className="mt-2 h-1.5 rounded-full bg-(--bg-dark) overflow-hidden">
                  <div
                    className="h-full rounded-full bg-(--positive) transition-all"
                    style={{ width: `${habitsToday.total > 0 ? (habitsToday.done / habitsToday.total) * 100 : 0}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-(--text-muted) text-sm">{t('noHabits')}</p>
            )}
          </div>
          <Link
            to="/habits"
            className="mt-auto pt-2 inline-block text-sm text-(--accent) hover:underline outline-none focus:outline-none"
          >
            {t('viewHabits')}
          </Link>
        </Card>
      </motion.div>
    </motion.div>
  )
}
