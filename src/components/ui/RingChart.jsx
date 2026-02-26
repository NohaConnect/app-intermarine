import React, { memo } from 'react'

const RingChart = memo(function RingChart({ value, size = 120, stroke = 8, color = '#4ecdc4' }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="ring-chart">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke}
          stroke="rgba(200,192,175,0.06)" />
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke}
          stroke={color} strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-black text-white">{value}%</div>
          <div className="text-[9px] font-bold uppercase tracking-widest"
            style={{ color: 'rgba(200,192,175,0.4)' }}>Concluído</div>
        </div>
      </div>
    </div>
  )
})

export default RingChart
