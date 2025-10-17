'use client';

import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
  }
};

// Background animations
interface AnimatedBackgroundProps {
  className?: string;
}

export function AnimatedBackground({ className }: AnimatedBackgroundProps) {
  return (
    <div className={className}>
      <motion.div
        animate={{
          y: [-20, 20, -20],
          scale: [1, 1.1, 1],
          rotate: [0, 3, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 right-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-coria-primary/8 via-leaf/6 to-transparent blur-3xl"
        aria-hidden
      />
      <motion.div
        animate={{
          y: [20, -20, 20],
          scale: [1, 1.05, 1],
          rotate: [0, -2, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute -bottom-24 left-16 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-sky/8 via-lime/6 to-transparent blur-3xl"
        aria-hidden
      />
    </div>
  );
}

// Hero section animations
interface AnimatedHeroContentProps {
  children: React.ReactNode;
}

export function AnimatedHeroContent({ children }: AnimatedHeroContentProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-4xl text-center"
    >
      {children}
    </motion.div>
  );
}

// Section header animation
interface AnimatedSectionHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedSectionHeader({ children, className }: AnimatedSectionHeaderProps) {
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

// Card animation with hover effects
interface AnimatedCardProps {
  children: React.ReactNode;
  index?: number;
}

export function AnimatedCard({ children, index = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{
        y: -8,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  );
}

// Form animation
interface AnimatedFormProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedForm({ children, className }: AnimatedFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Timeline phase animation
interface AnimatedTimelinePhaseProps {
  children: React.ReactNode;
  index: number;
}

export function AnimatedTimelinePhase({ children, index }: AnimatedTimelinePhaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="relative"
    >
      {children}
    </motion.div>
  );
}

// Individual hero content pieces with delays
interface AnimatedHeroItemProps {
  children: React.ReactNode;
  delay?: number;
}

export function AnimatedHeroItem({ children, delay = 0 }: AnimatedHeroItemProps) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
