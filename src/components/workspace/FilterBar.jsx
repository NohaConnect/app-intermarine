import React, { memo, useState } from 'react'
import { Filter, ChevronDown, ChevronUp } from 'lucide-react'

const Select = memo(function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="select-dark">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
})

/**
 * FilterBar — responsive filter bar that collapses on mobile
 */
const FilterBar = memo(function FilterBar({
  filters,          // { frente, prioridade, dono, kanbanGroup? }
  setFilter,        // (key, value) => void
  frenteOptions,    // ['Todas', ...frenteNames]
  priorityOptions,  // ['Todas', 'Quick Win', ...]
  donoOptions,      // ['Todos', ...]
  showKanbanGroup = false,
  kanbanGroup,
  setKanbanGroup,
  isMobile = false,
}) {
  const [expanded, setExpanded] = useState(!isMobile)

  return (
    <div className="glass-card overflow-hidden">
      {/* Mobile toggle */}
      {isMobile && (
        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full px-3 py-2.5"
          style={{ color: 'rgba(200,192,175,0.4)' }}>
          <span className="text-xs font-bold tracking-widest uppercase flex items-center gap-1.5">
            <Filter size={12} /> Filtros
          </span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}

      {/* Filter controls */}
      {(expanded || !isMobile) && (
        <div className={`flex gap-2 items-center flex-wrap px-3 py-2 ${isMobile ? 'border-t' : ''}`}
          style={isMobile ? { borderColor: 'rgba(200,192,175,0.06)' } : {}}>
          {!isMobile && (
            <span className="text-xs font-bold tracking-widest uppercase flex items-center gap-1.5"
              style={{ color: 'rgba(200,192,175,0.3)' }}>
              <Filter size={11} /> Filtros
            </span>
          )}
          <Select value={filters.frente} onChange={v => setFilter('frente', v)} options={frenteOptions} />
          <Select value={filters.prioridade} onChange={v => setFilter('prioridade', v)} options={priorityOptions} />
          <Select value={filters.dono} onChange={v => setFilter('dono', v)} options={donoOptions} />
          {showKanbanGroup && (
            <Select value={kanbanGroup} onChange={setKanbanGroup}
              options={[{ v: 'status', l: 'Por Status' }, { v: 'frente', l: 'Por Frente' }].map(o => o.v)} />
          )}
        </div>
      )}
    </div>
  )
})

export default FilterBar
