'use client';

import { motion } from 'framer-motion';

interface AnimatedPersonaCardProps {
  children: React.ReactNode;
  index: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export function AnimatedPersonaCard({ children, index }: AnimatedPersonaCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.08 }}
    >
      {children}
    </motion.div>
  );
}
