'use client';

import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  className?: string;
}

export function AnimatedBackground({ className }: AnimatedBackgroundProps) {
  return (
    <div className={className}>
      {/* Transparent - Let BrandBackground show through */}
      <div className="absolute inset-0 bg-transparent" />
      {/* Floating Organic Shapes - Modern & Soft */}
      <motion.div
        animate={{
          y: [-10, 10, -10],
          scale: [1, 1.05, 1],
          rotate: [0, 2, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 right-20 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-coria-primary/6 via-leaf/4 to-transparent blur-3xl"
        aria-hidden
      />
      <motion.div
        animate={{
          y: [10, -10, 10],
          scale: [1, 1.08, 1],
          rotate: [0, -3, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-24 left-16 h-[360px] w-[360px] rounded-full bg-gradient-to-tr from-sky/6 via-lime/4 to-transparent blur-3xl"
        aria-hidden
      />
      <motion.div
        animate={{
          y: [-5, 5, -5],
          scale: [1, 1.03, 1],
          rotate: [0, 1, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute top-1/3 right-1/4 h-[240px] w-[240px] rounded-full bg-gradient-to-bl from-coral/4 via-gold/3 to-transparent blur-2xl"
        aria-hidden
      />
    </div>
  );
}

interface AnimatedContentProps {
  children: React.ReactNode;
  className?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export function AnimatedContent({ children, className }: AnimatedContentProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedPhoneMockupProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPhoneMockup({ children, className }: AnimatedPhoneMockupProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.3, duration: 0.8 }}
      className={className}
    >
      <motion.div
        animate={{
          y: [-6, 6, -6],
          rotate: [0, 0.5, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="relative w-full max-w-[320px] lg:max-w-[360px]"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

interface AnimatedScanOverlaysProps {
  className?: string;
}

export function AnimatedScanOverlays({ className }: AnimatedScanOverlaysProps) {
  return (
    <div className={className}>
      {/* Scanning Animation Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-coria-primary/20 to-transparent"
        animate={{
          y: ["-100%", "100%", "-100%"]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Barcode Detection Frame */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-48 h-32 border-2 border-coria-primary rounded-lg"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        {/* Corner indicators */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-coria-primary"></div>
        <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-coria-primary"></div>
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-coria-primary"></div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-coria-primary"></div>
      </motion.div>

      {/* Success Pulse Animation */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-coria-primary/30 rounded-full"
        animate={{
          scale: [0, 1.5, 0],
          opacity: [0, 0.8, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeOut",
          delay: 4
        }}
      />
    </div>
  );
}

export function AnimatedFloatingElements() {
  return (
    <>
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-coria-primary/40 to-leaf/40 rounded-full opacity-60 blur-sm"
        aria-hidden
      />
      <motion.div
        animate={{
          rotate: [360, 0],
          y: [0, -10, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-lime/40 to-sky/40 rounded-full opacity-50 blur-sm"
        aria-hidden
      />
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-coria-primary/20 via-transparent to-leaf/20 blur-xl"
        aria-hidden
      />
    </>
  );
}
