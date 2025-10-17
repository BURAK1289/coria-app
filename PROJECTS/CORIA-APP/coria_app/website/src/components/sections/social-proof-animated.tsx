'use client';

import { motion } from 'framer-motion';

interface AnimatedProofCardProps {
  children: React.ReactNode;
  index: number;
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export function AnimatedProofCard({ children, index }: AnimatedProofCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: index * 0.08 }}
      className="flex h-full flex-col gap-4 rounded-[28px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm p-6 text-left shadow-lg"
    >
      {children}
    </motion.div>
  );
}
