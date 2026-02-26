import React, { memo } from 'react'

const ProgressBar = memo(function ProgressBar({ value = 0, color = '#4ecdc4', slim = false }) {
  return (
    <div className={slim ? 'progress-bar-sm' : 'progress-bar'}>
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: `linear-gradient(90deg, ${color}, ${color}bb)` }} />
    </div>
  )
})

export default ProgressBar
