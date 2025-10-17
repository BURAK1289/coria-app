'use client';

import { motion } from 'framer-motion';

interface AnimatedDemoSectionProps {
  children: React.ReactNode;
  delay?: number;
  id?: string;
}

export function AnimatedDemoSection({ children, delay = 0, id }: AnimatedDemoSectionProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}
