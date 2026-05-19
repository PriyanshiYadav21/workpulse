import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function Card({ children, className, hover = false, ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.3 }}
      className={cn('card p-5', className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
