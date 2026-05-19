import { cn } from '../../utils/cn';

const TONES = {
  slate: 'bg-[#f5e3b6]/80 text-[#6d4c24] dark:text-[#f7e2b0]',
  indigo: 'bg-[#f5e3b6]/80 text-[#6d4c24] dark:text-[#f7e2b0]',
  emerald: 'bg-[#f5e3b6]/80 text-[#6d4c24] dark:text-[#f7e2b0]',
  amber: 'bg-[#f5e3b6]/80 text-[#6d4c24] dark:text-[#f7e2b0]',
  rose: 'bg-[#f5e3b6]/80 text-[#6d4c24] dark:text-[#f7e2b0]',
  cyan: 'bg-[#f5e3b6]/80 text-[#6d4c24] dark:text-[#f7e2b0]',
  purple: 'bg-[#f5e3b6]/80 text-[#6d4c24] dark:text-[#f7e2b0]',
};

export default function Badge({ tone = 'slate', children, className }) {
  return <span className={cn('badge', TONES[tone] || TONES.slate, className)}>{children}</span>;
}

export const priorityTone = {
  low: 'slate',
  medium: 'cyan',
  high: 'amber',
  urgent: 'rose',
};

export const statusTone = {
  todo: 'slate',
  in_progress: 'indigo',
  review: 'purple',
  done: 'emerald',
};

export const statusLabel = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};
