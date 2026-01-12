import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { containerVariants, itemVariants, hoverLift } from '../lib/animations';

interface BentoItemProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
    colSpan?: 1 | 2 | 3 | 4;
    rowSpan?: 1 | 2;
}

export function BentoGrid({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={clsx("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6", className)}
        >
            {children}
        </motion.div>
    );
}

export function BentoItem({ children, title, className, colSpan = 1, rowSpan = 1 }: BentoItemProps) {
    const colSpans = {
        1: "md:col-span-1",
        2: "md:col-span-2",
        3: "md:col-span-3",
        4: "md:col-span-4",
    };

    const rowSpans = {
        1: "md:row-span-1",
        2: "md:row-span-2",
    };

    return (
        <motion.div
            variants={itemVariants}
            whileHover={hoverLift}
            className={clsx(
                "card-hover p-6 flex flex-col relative overflow-hidden group",
                colSpans[colSpan],
                rowSpans[rowSpan],
                className
            )}
        >
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {title && (
                <h3 className="text-lg font-bold text-text-primary mb-4 relative z-10">
                    {title}
                </h3>
            )}
            <div className="flex-1 relative z-10">
                {children}
            </div>
        </motion.div>
    );
}
