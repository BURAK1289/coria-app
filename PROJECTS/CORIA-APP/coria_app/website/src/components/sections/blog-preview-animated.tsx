'use client';

import { motion } from 'framer-motion';

interface AnimatedBlogCardProps {
  children: React.ReactNode;
}

export function AnimatedBlogCard({ children }: AnimatedBlogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
