import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { FiCalendar, FiMessageCircle, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Badge, { priorityTone } from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { formatDate, isOverdue } from '../../utils/date';
import { cn } from '../../utils/cn';

export default function TaskCard({ task, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const overdue = task.status !== 'done' && isOverdue(task.deadline);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      className={cn(
        'group glass rounded-2xl p-4 shadow-md cursor-grab active:cursor-grabbing select-none',
        'hover:shadow-glow transition-shadow'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm leading-snug flex-1">{task.title}</p>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onEdit?.(task); }}
            className="h-7 w-7 grid place-items-center rounded-lg hover:bg-white/10"
          >
            <FiEdit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onDelete?.(task); }}
            className="h-7 w-7 grid place-items-center rounded-lg hover:bg-brand-200/70 text-brand-700"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{task.description}</p>
      )}

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <Badge tone={priorityTone[task.priority]}>{task.priority}</Badge>
        {task.category && <Badge tone="cyan">{task.category}</Badge>}
        {task.deadline && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[11px] font-medium',
              overdue ? 'text-brand-700' : 'text-slate-500'
            )}
          >
            <FiCalendar className="h-3 w-3" />
            {formatDate(task.deadline)}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        {task.assigned_to_name ? (
          <div className="flex items-center gap-1.5">
            <Avatar name={task.assigned_to_name} src={task.assigned_to_avatar} size={6} />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {task.assigned_to_name}
            </span>
          </div>
        ) : <span className="text-xs text-slate-400">Unassigned</span>}
        <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
          <FiMessageCircle className="h-3 w-3" /> #{task.id}
        </span>
      </div>
    </motion.div>
  );
}
