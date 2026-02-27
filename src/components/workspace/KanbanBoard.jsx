import React, { memo, useState, useCallback } from 'react'
import {
  DndContext, DragOverlay, useDroppable, useDraggable,
  PointerSensor, TouchSensor, useSensor, useSensors, closestCorners
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, User, Calendar } from 'lucide-react'
import { PriorityBadge, FrenteBadge, ObjetivoBadge } from '../ui/Badges'
import ProgressBar from '../ui/ProgressBar'
import { isOverdue, formatDate } from '../../lib/constants'

// ─── Droppable Column ──────────────────────────────────
function DroppableColumn({ id, color, label, count, children, accent }) {
  const { isOver, setNodeRef } = useDroppable({ id: `column-${id}` })

  return (
    <div className="min-w-[260px] sm:min-w-[280px] max-w-[320px] flex-shrink-0">
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-3 px-2 py-2 rounded-lg"
        style={{ background: 'rgba(200,192,175,0.03)' }}>
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
        <span className="text-xs font-bold text-white/70 uppercase tracking-wider truncate">{label}</span>
        <span className="text-xs font-bold ml-auto px-2 py-0.5 rounded flex-shrink-0"
          style={{ background: 'rgba(200,192,175,0.06)', color: 'rgba(200,192,175,0.4)' }}>
          {count}
        </span>
      </div>

      {/* Drop Zone */}
      <div ref={setNodeRef}
        className="space-y-2.5 min-h-[80px] rounded-xl p-1.5 transition-all duration-200"
        style={{
          background: isOver ? `rgba(${accent},0.06)` : 'transparent',
          border: isOver ? `2px dashed rgba(${accent},0.35)` : '2px dashed transparent',
        }}>
        {children}
        {count === 0 && (
          <div className="text-center py-8 text-xs" style={{ color: 'rgba(200,192,175,0.2)' }}>
            Arraste cards aqui
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Draggable Card ────────────────────────────────────
function DraggableCard({ item, config, frenteCores, borderColor, onItemClick, frentesIMCores, showFrente }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id.toString(),
  })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    borderLeftColor: borderColor,
    opacity: isDragging ? 0.3 : 1,
    transition: isDragging ? 'none' : 'all 0.2s',
  }

  const title = item[config.titleField]

  return (
    <div ref={setNodeRef} style={style} {...attributes}
      className="glass-card p-3 card-hover border-l-4 touch-none"
      onClick={() => !isDragging && onItemClick(item.id)}>

      {/* Title Row with drag handle */}
      <div className="flex items-center gap-2 mb-2">
        <div {...listeners} className="cursor-grab active:cursor-grabbing touch-none p-1 -m-1 flex-shrink-0">
          <GripVertical size={14} style={{ color: 'rgba(200,192,175,0.2)' }} />
        </div>
        <span className="text-sm font-bold text-white/90 flex-1 truncate">{title}</span>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5 flex-wrap mb-2 ml-6">
        <PriorityBadge priority={item.prioridade} config={config} />
        {showFrente && <FrenteBadge frente={item.frente} frenteCores={frenteCores} />}
        {config.hasObjetivo && <ObjetivoBadge objetivo={item.objetivo_intermarine} frentesIMCores={frentesIMCores} />}
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between mt-2 ml-6">
        <span className="text-xs flex items-center gap-1 truncate" style={{ color: 'rgba(200,192,175,0.4)' }}>
          <User size={10} /> {item.dono}
        </span>
        {item.deadline && (
          <span className="text-xs flex items-center gap-1 flex-shrink-0"
            style={{ color: isOverdue(item.deadline) && item.status !== config.doneStatus ? '#e74c5e' : 'rgba(200,192,175,0.4)' }}>
            <Calendar size={10} /> {formatDate(item.deadline)}
          </span>
        )}
      </div>

      {/* Progress */}
      {item.progresso > 0 && (
        <div className="mt-2.5 ml-6">
          <ProgressBar value={item.progresso} color={frenteCores?.[item.frente] || config.accent} slim />
        </div>
      )}
    </div>
  )
}

// ─── Card Overlay (ghost while dragging) ───────────────
function CardOverlay({ item, config }) {
  const title = item?.[config.titleField]
  if (!item) return null
  return (
    <div className="glass-card p-3 border-l-4 shadow-2xl w-[280px] opacity-90"
      style={{ borderLeftColor: config.accent, transform: 'rotate(2deg)' }}>
      <div className="flex items-center gap-2">
        <GripVertical size={14} style={{ color: 'rgba(200,192,175,0.3)' }} />
        <span className="text-sm font-bold text-white/90 truncate">{title}</span>
      </div>
    </div>
  )
}

// ─── Main KanbanBoard ──────────────────────────────────
const KanbanBoard = memo(function KanbanBoard({
  items,
  config,
  groups,           // e.g. PLANO_STATUS or frenteNames
  getGroupKey,      // (item) => groupName (e.g. item.status or item.frente)
  getGroupColor,    // (group) => color string
  getBorderColor,   // (item, group) => border color for card
  frenteNames,
  frenteCores,
  frentesIMCores,
  showFrente = true,
  onMove,           // (itemId, targetGroup) => Promise
  onItemClick,
}) {
  const [activeId, setActiveId] = useState(null)

  // Sensors: pointer (desktop) + touch (mobile) with activation constraints
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 6 },
  })
  const sensors = useSensors(pointerSensor, touchSensor)

  const activeItem = activeId ? items.find(i => i.id.toString() === activeId) : null

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id)
  }, [])

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const itemId = active.id
    // over.id is "column-{groupName}"
    const targetGroup = over.id.replace('column-', '')
    const item = items.find(i => i.id.toString() === itemId)
    if (!item) return

    const currentGroup = getGroupKey(item)
    if (currentGroup !== targetGroup) {
      onMove(itemId, targetGroup)
    }
  }, [items, getGroupKey, onMove])

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
  }, [])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}>

      <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1"
        style={{ WebkitOverflowScrolling: 'touch' }}>
        {groups.map(group => {
          const groupItems = items.filter(i => getGroupKey(i) === group)
          const color = getGroupColor(group)

          return (
            <DroppableColumn key={group} id={group} color={color}
              label={group} count={groupItems.length} accent={config.accentRgb}>
              {groupItems.map(item => (
                <DraggableCard key={item.id} item={item} config={config}
                  frenteCores={frenteCores} frentesIMCores={frentesIMCores}
                  borderColor={getBorderColor ? getBorderColor(item, group) : color}
                  onItemClick={onItemClick}
                  showFrente={showFrente} />
              ))}
            </DroppableColumn>
          )
        })}
      </div>

      {/* Drag overlay — renders above everything */}
      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeItem ? <CardOverlay item={activeItem} config={config} /> : null}
      </DragOverlay>
    </DndContext>
  )
})

export default KanbanBoard
