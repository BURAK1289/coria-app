'use client';

import { motion } from 'framer-motion';

interface AnimatedMetricCardProps {
  children: React.ReactNode;
  index: number;
}

export function AnimatedMetricCard({ children, index }: AnimatedMetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="rounded-[28px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm p-6 text-center shadow-lg"
    >
      {children}
    </motion.div>
  );
}
