import React, { memo } from 'react'
import { PriorityBadge, StatusBadge, ObjetivoBadge } from '../ui/Badges'
import ProgressBar from '../ui/ProgressBar'

/**
 * ListView — responsive table/card list
 * On mobile: renders as stacked cards instead of a table
 */
const ListView = memo(function ListView({
  items,
  config,
  frenteCores,
  frentesIMCores,
  onItemClick,
  isMobile,
}) {
  const titleField = config.titleField

  // ── Mobile: Card List ──
  if (isMobile) {
    return (
      <div className="space-y-2">
        {items.map(item => {
          const statusCfg = config.statusColors[config.normalizeStatus(item.status)]
          return (
            <div key={item.id}
              className="glass-card p-3 border-l-4 active:scale-[0.98] transition-transform"
              style={{ borderLeftColor: frenteCores?.[item.frente] || config.accent }}
              onClick={() => onItemClick(item.id)}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-sm font-bold text-white/90 truncate flex-1">{item[titleField]}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0"
                  style={{ background: statusCfg?.bg, color: statusCfg?.c }}>{config.normalizeStatus(item.status)}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <PriorityBadge priority={item.prioridade} config={config} />
                <span className="text-xs" style={{ color: frenteCores?.[item.frente] || '#4da8da' }}>{item.frente}</span>
                {config.hasObjetivo && <ObjetivoBadge objetivo={item.objetivo_intermarine} frentesIMCores={frentesIMCores} />}
              </div>
              {item.progresso > 0 && (
                <div className="mt-2">
                  <ProgressBar value={item.progresso} color={statusCfg?.c || config.accent} slim />
                </div>
              )}
            </div>
          )
        })}
        {items.length === 0 && (
          <div className="py-8 text-center text-xs" style={{ color: 'rgba(200,192,175,0.2)' }}>
            Nenhum item encontrado.
          </div>
        )}
      </div>
    )
  }

  // ── Desktop: Table ──
  const columns = [
    config.itemLabel,
    'Frente',
    ...(config.hasObjetivo ? ['Objetivo IM'] : []),
    'Prioridade',
    'Dono',
    'Status',
    'Progresso',
  ]

  return (
    <div className="glass-card overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
      <table className="w-full" style={{ minWidth: 580 }}>
        <thead>
          <tr style={{ background: 'rgba(200,192,175,0.02)' }}>
            {columns.map(h => (
              <th key={h} className="px-3 py-2.5 text-left text-xs font-bold tracking-widest uppercase"
                style={{ color: 'rgba(200,192,175,0.3)', borderBottom: '1px solid rgba(200,192,175,0.06)' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.id} className="cursor-pointer transition-colors"
              style={{ background: i % 2 === 0 ? 'rgba(200,192,175,0.01)' : 'transparent' }}
              onClick={() => onItemClick(item.id)}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,192,175,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(200,192,175,0.01)' : 'transparent'}>
              <td className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)' }}>
                <div className="text-sm font-semibold text-white/90">{item[titleField]}</div>
              </td>
              <td className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)' }}>
                <span className="text-xs px-2 py-0.5 rounded"
                  style={{ background: (frenteCores?.[item.frente] || '#4da8da') + '12', color: frenteCores?.[item.frente] || '#4da8da' }}>
                  {item.frente}
                </span>
              </td>
              {config.hasObjetivo && (
                <td className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)' }}>
                  <ObjetivoBadge objetivo={item.objetivo_intermarine} frentesIMCores={frentesIMCores} />
                </td>
              )}
              <td className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)' }}>
                <PriorityBadge priority={item.prioridade} config={config} />
              </td>
              <td className="px-3 py-2.5 text-xs" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)', color: 'rgba(200,192,175,0.5)' }}>
                {item.dono}
              </td>
              <td className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)' }}>
                <StatusBadge status={config.normalizeStatus(item.status)} config={config} />
              </td>
              <td className="px-3 py-2.5 w-24" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)' }}>
                <ProgressBar value={item.progresso || 0} color={config.statusColors[config.normalizeStatus(item.status)]?.c || config.accent} slim />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && (
        <div className="py-8 text-center text-xs" style={{ color: 'rgba(200,192,175,0.2)' }}>
          Nenhum item encontrado.
        </div>
      )}
    </div>
  )
})

export default ListView
