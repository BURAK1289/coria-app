'use client';

import { motion } from 'framer-motion';

interface AnimatedDemoCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedDemoCard({ children, delay = 0, className }: AnimatedDemoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
