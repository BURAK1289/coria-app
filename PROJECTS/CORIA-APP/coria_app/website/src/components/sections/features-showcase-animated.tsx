'use client';

import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
  }
};

interface AnimatedFeatureCardProps {
  children: React.ReactNode;
  index: number;
}

export function AnimatedFeatureCard({ children, index }: AnimatedFeatureCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: index * 0.1 }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedBackgroundProps {
  className?: string;
}

export function AnimatedBackground({ className }: AnimatedBackgroundProps) {
  return (
    <div className={className}>
      {/* Floating Background Elements */}
      <motion.div
        animate={{
          y: [-15, 15, -15],
          scale: [1, 1.05, 1],
          rotate: [0, 2, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gradient-to-br from-white/5 via-gray-100/3 to-transparent blur-3xl"
        aria-hidden
      />
      <motion.div
        animate={{
          y: [15, -15, 15],
          scale: [1, 1.08, 1],
          rotate: [0, -2, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-0 right-10 h-96 w-96 rounded-full bg-gradient-to-tr from-white/5 via-gray-100/3 to-transparent blur-3xl"
        aria-hidden
      />
    </div>
  );
}

interface AnimatedHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedHeader({ children, className }: AnimatedHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedCTAProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedCTA({ children, className }: AnimatedCTAProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className={className}
    >
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-coria-primary to-coria-primary-dark text-white font-semibold rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-300 touch-target"
        aria-label="CORIA'nın tüm özelliklerini keşfetmek için uygulamayı indirin"
      >
        {children}
      </motion.button>
    </motion.div>
  );
}
