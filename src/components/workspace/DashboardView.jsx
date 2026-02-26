import React, { memo } from 'react'
import { CheckCircle2, Zap, AlertTriangle, Target, Clock } from 'lucide-react'
import RingChart from '../ui/RingChart'
import ProgressBar from '../ui/ProgressBar'
import { PriorityBadge, ObjetivoBadge } from '../ui/Badges'
import { isOverdue, daysLeft } from '../../lib/constants'

const DashboardView = memo(function DashboardView({
  items,       // filtered items
  stats,       // { total, byStatus, done, pct, overdue, inProgress }
  config,
  frenteNames,
  frenteCores,
  frentesIMCores,
  onItemClick,
  isMobile,
  isLandscape,
}) {
  const titleField = config.titleField

  return (
    <div className="space-y-4">
      {/* Hero Progress Row */}
      <div className={`grid gap-3 sm:gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}>
        {/* Ring Chart Card */}
        <div className={`glass-card p-4 sm:p-5 flex items-center gap-4 sm:gap-6 ${isMobile ? '' : 'col-span-5'}`}>
          <RingChart value={stats.pct} size={isMobile ? 90 : 120} color={config.accent} />
          <div className="flex-1 space-y-3 min-w-0">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest"
                style={{ color: 'rgba(200,192,175,0.4)' }}>Progresso Geral</div>
              <div className="text-xs mt-1" style={{ color: 'rgba(200,192,175,0.3)' }}>{config.title}</div>
            </div>
            <div className="space-y-1.5">
              {config.statuses.map(s => (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: config.statusColors[s]?.c }} />
                  <span style={{ color: 'rgba(200,192,175,0.5)' }} className="flex-1 truncate">{s}</span>
                  <span className="font-bold text-white/80">{stats.byStatus[s] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stat Cards */}
        <div className={`grid grid-cols-2 gap-2 sm:gap-3 ${isMobile ? '' : 'col-span-4'}`}>
          {[
            { label: 'Concluídas', value: stats.done, color: '#4ecdc4', icon: CheckCircle2 },
            { label: config.inProgressStatus, value: stats.inProgress, color: '#4da8da', icon: Zap },
            { label: 'Atrasadas', value: stats.overdue, color: '#e74c5e', icon: AlertTriangle, highlight: stats.overdue > 0 },
            { label: 'Total', value: stats.total, color: config.accent, icon: Target },
          ].map(({ label, value, color, icon: Icon, highlight }) => (
            <div key={label} className="glass-card p-3 sm:p-4 border-l-4 flex flex-col justify-center"
              style={{ borderLeftColor: color }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={13} style={{ color }} />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate"
                  style={{ color: 'rgba(200,192,175,0.4)' }}>{label}</span>
              </div>
              <div className="text-xl sm:text-2xl font-black"
                style={{ color: highlight ? '#e74c5e' : 'white' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Deadlines */}
        <div className={`glass-card p-3 sm:p-4 ${isMobile ? '' : 'col-span-3'}`}>
          <div className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: 'rgba(200,192,175,0.4)' }}>
            <div className="flex items-center gap-1.5"><Clock size={12} /> Próximos Prazos</div>
          </div>
          <div className="space-y-2 max-h-[180px] overflow-y-auto">
            {items
              .filter(a => a.deadline && a.status !== config.doneStatus)
              .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
              .slice(0, 6)
              .map(item => {
                const dl = daysLeft(item.deadline)
                const isLate = dl !== null && dl < 0
                return (
                  <div key={item.id}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all active:scale-[0.98]"
                    style={{ background: isLate ? 'rgba(231,76,94,0.06)' : 'transparent' }}
                    onClick={() => onItemClick(item.id)}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: isLate ? '#e74c5e' : dl <= 3 ? '#c8c0af' : config.accent }} />
                    <span className="text-xs text-white/70 flex-1 truncate">{item[titleField]}</span>
                    <span className="text-[10px] font-bold flex-shrink-0"
                      style={{ color: isLate ? '#e74c5e' : dl <= 3 ? '#c8c0af' : 'rgba(200,192,175,0.4)' }}>
                      {isLate ? `${Math.abs(dl)}d atrás` : dl === 0 ? 'Hoje' : `${dl}d`}
                    </span>
                  </div>
                )
              })}
            {items.filter(a => a.deadline && a.status !== config.doneStatus).length === 0 && (
              <div className="text-xs py-4 text-center" style={{ color: 'rgba(200,192,175,0.2)' }}>Nenhum prazo pendente</div>
            )}
          </div>
        </div>
      </div>

      {/* Progress by Frente */}
      <div className={`grid gap-3 ${isLandscape ? 'grid-cols-2' : isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
        {frenteNames.map(frente => {
          const fItems = items.filter(a => a.frente === frente)
          if (fItems.length === 0) return null
          const done = fItems.filter(a => a.status === config.doneStatus).length
          const pct = Math.round(done / fItems.length * 100)
          const cor = frenteCores[frente] || config.accent
          return (
            <div key={frente} className="glass-card p-3 sm:p-4 card-hover border-l-4" style={{ borderLeftColor: cor }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cor }} />
                <span className="text-sm font-bold text-white/90 flex-1 truncate">{frente}</span>
                <span className="text-sm font-bold" style={{ color: cor }}>{pct}%</span>
              </div>
              <ProgressBar value={pct} color={cor} />
              <div className="mt-3 space-y-1.5">
                {fItems.map(item => (
                  <div key={item.id}
                    className="flex items-center gap-2 cursor-pointer rounded-lg p-1.5 -mx-1.5 transition-all active:scale-[0.98]"
                    onClick={() => onItemClick(item.id)}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,192,175,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: config.statusColors[config.normalizeStatus(item.status)]?.c }} />
                    <span className="text-xs sm:text-sm text-white/70 flex-1 truncate">{item[titleField]}</span>
                    <PriorityBadge priority={item.prioridade} config={config} />
                    {config.hasObjetivo && (
                      <ObjetivoBadge objetivo={item.objetivo_intermarine} frentesIMCores={frentesIMCores} />
                    )}
                    {isOverdue(item.deadline) && item.status !== config.doneStatus && (
                      <AlertTriangle size={12} className="flex-shrink-0" style={{ color: '#e74c5e' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

export default DashboardView
