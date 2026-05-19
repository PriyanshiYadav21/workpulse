import { useMemo, useState } from 'react';
import {
  DndContext, PointerSensor, useSensor, useSensors,
  closestCorners, DragOverlay, useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { statusLabel } from '../ui/Badge';

const COLUMNS = ['todo', 'in_progress', 'review', 'done'];

function Column({ id, items, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`glass rounded-2xl p-3 flex flex-col gap-3 min-h-[60vh] transition-all ${
        isOver ? 'ring-2 ring-brand-500/40 bg-brand-200/70' : ''
      }`}
    >
      <div className="flex items-center justify-between px-2 py-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {statusLabel[id]}
        </p>
        <span className="text-xs font-semibold bg-white/60 dark:bg-white/10 rounded-full px-2 py-0.5">
          {items.length}
        </span>
      </div>
      <SortableContext items={items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 flex-1">
          {items.map((t) => <TaskCard key={t.id} task={t} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard({ tasks, onChange, onEdit, onDelete }) {
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const grouped = useMemo(() => {
    const g = { todo: [], in_progress: [], review: [], done: [] };
    for (const t of tasks) (g[t.status] || g.todo).push(t);
    return g;
  }, [tasks]);

  const findTask = (id) => tasks.find((t) => t.id === id);
  const findColumnForTask = (id) =>
    COLUMNS.find((c) => grouped[c].some((t) => t.id === id));

  const onDragStart = (event) => setActiveId(event.active.id);

  const onDragEnd = (event) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeTask = findTask(active.id);
    if (!activeTask) return;

    const overId = over.id;
    const targetColumn = COLUMNS.includes(overId)
      ? overId
      : findColumnForTask(overId);
    if (!targetColumn) return;

    let next = [...tasks];

    if (activeTask.status !== targetColumn) {
      next = next.map((t) =>
        t.id === activeTask.id ? { ...t, status: targetColumn } : t
      );
    }

    if (!COLUMNS.includes(overId) && active.id !== over.id) {
      const colTasks = next.filter((t) => t.status === targetColumn);
      const oldIdx = colTasks.findIndex((t) => t.id === active.id);
      const newIdx = colTasks.findIndex((t) => t.id === over.id);
      if (oldIdx !== -1 && newIdx !== -1) {
        const reordered = arrayMove(colTasks, oldIdx, newIdx);
        const others = next.filter((t) => t.status !== targetColumn);
        next = [...others, ...reordered];
      }
    }

    const withPositions = next.map((t) => {
      if (t.status !== targetColumn) return t;
      const col = next.filter((x) => x.status === targetColumn);
      const idx = col.findIndex((x) => x.id === t.id);
      return { ...t, position: idx };
    });

    onChange?.(withPositions);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((c) => (
          <Column key={c} id={c} items={grouped[c]} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
      <DragOverlay>
        {activeId ? <TaskCard task={findTask(activeId)} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
