import React, { memo } from 'react'
import { Plus } from 'lucide-react'

/**
 * PageHeader — workspace title + "New" button
 */
const PageHeader = memo(function PageHeader({ config, onNew, isMobile }) {
  const pad = isMobile ? 'px-3 py-2.5' : 'px-6 py-3'

  return (
    <div className={`${pad} border-b`}
      style={{ background: 'rgba(10,14,26,0.5)', backdropFilter: 'blur(20px)', borderBottomColor: `rgba(${config.accentRgb},0.1)` }}>
      <div className="flex items-center gap-3">
        <div className="min-w-0">
          <div className="text-sm font-bold tracking-widest uppercase" style={{ color: config.accent }}>
            {config.title}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(200,192,175,0.3)' }}>{config.subtitle}</div>
        </div>

        <button onClick={onNew}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 flex-shrink-0"
          style={{ background: `rgba(${config.accentRgb},0.12)`, color: config.accent }}>
          <Plus size={16} /> <span className="hidden xs:inline">Nov{config.id === 'noha' ? 'a' : 'a'}</span>
        </button>
      </div>
    </div>
  )
})

export default PageHeader
