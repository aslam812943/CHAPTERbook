'use client';
import { m } from 'framer-motion';

export default function SectionEyebrow({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`flex items-center gap-3 text-xs font-semibold tracking-[0.25em] uppercase text-accent ${className}`}
    >
      <span className="h-px w-8 bg-accent/60" />
      {children}
    </m.div>
  );
}
