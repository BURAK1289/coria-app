'use client';

import { motion } from 'framer-motion';

interface AnimatedCTACardProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedCTACard({ children, className }: AnimatedCTACardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
