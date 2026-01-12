import type { Variants } from 'framer-motion';

// Performance-optimized spring configuration
export const springConfig = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
};

export const smoothSpring = {
    type: "spring" as const,
    stiffness: 200,
    damping: 25,
};

export const gentleSpring = {
    type: "spring" as const,
    stiffness: 150,
    damping: 20,
};

// Easing functions for smooth animations
export const easing = {
    smooth: [0.4, 0, 0.2, 1],
    snappy: [0.34, 1.56, 0.64, 1],
    gentle: [0.25, 0.1, 0.25, 1],
} as const;

// Page transition variants
export const pageVariants: Variants = {
    initial: {
        opacity: 0,
        y: 8,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: easing.smooth,
        },
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: {
            duration: 0.2,
            ease: easing.smooth,
        },
    },
};

// Container with staggered children
export const containerVariants: Variants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
            when: "beforeChildren",
        },
    },
};

// Fast container for better perceived performance
export const fastContainerVariants: Variants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.05,
        },
    },
};

// Item variants for use with containers
export const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 12,
        scale: 0.97,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: smoothSpring,
    },
};

// Fade in variants
export const fadeInVariants: Variants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.25,
            ease: easing.smooth,
        },
    },
};

// Scale variants for modals and popovers
export const scaleVariants: Variants = {
    hidden: {
        scale: 0.95,
        opacity: 0,
    },
    visible: {
        scale: 1,
        opacity: 1,
        transition: {
            ...springConfig,
            opacity: { duration: 0.2 },
        },
    },
    exit: {
        scale: 0.95,
        opacity: 0,
        transition: {
            duration: 0.15,
            ease: easing.smooth,
        },
    },
};

// Slide variants for drawers and panels
export const slideVariants = {
    left: {
        hidden: { x: -20, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: smoothSpring },
    },
    right: {
        hidden: { x: 20, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: smoothSpring },
    },
    up: {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: smoothSpring },
    },
    down: {
        hidden: { y: -20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: smoothSpring },
    },
};

// Hover animations - lightweight for performance
export const hoverScale = {
    scale: 1.02,
    transition: {
        duration: 0.2,
        ease: easing.smooth,
    },
};

export const hoverLift = {
    y: -4,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.08)",
    transition: {
        duration: 0.2,
        ease: easing.smooth,
    },
};

export const hoverGlow = {
    boxShadow: "0 0 20px rgba(39, 110, 241, 0.2)",
    transition: {
        duration: 0.3,
        ease: easing.smooth,
    },
};

// Tap animation for buttons
export const tapScale = {
    scale: 0.97,
    transition: {
        duration: 0.1,
    },
};

// List item animation
export const listItemVariants: Variants = {
    hidden: {
        opacity: 0,
        x: -8,
    },
    visible: (index: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: index * 0.05,
            ...smoothSpring,
        },
    }),
};

// Card entrance animation
export const cardVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            ...gentleSpring,
            opacity: { duration: 0.3 },
        },
    },
};

// Skeleton loader animation
export const skeletonVariants: Variants = {
    initial: {
        backgroundPosition: "-200% 0",
    },
    animate: {
        backgroundPosition: "200% 0",
        transition: {
            duration: 1.5,
            ease: "linear",
            repeat: Infinity,
        },
    },
};

// Notification/Toast animation
export const toastVariants: Variants = {
    hidden: {
        opacity: 0,
        y: -20,
        scale: 0.9,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: springConfig,
    },
    exit: {
        opacity: 0,
        x: 100,
        transition: {
            duration: 0.2,
            ease: easing.smooth,
        },
    },
};

// Utility: Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Utility: Get reduced motion variant
export const getReducedMotionVariant = (variants: Variants): Variants => {
    if (!prefersReducedMotion()) return variants;

    // Return simplified variants without transforms
    return Object.keys(variants).reduce((acc, key) => {
        const variant = variants[key];
        if (typeof variant === 'object' && variant !== null && 'opacity' in variant) {
            acc[key] = { opacity: variant.opacity };
        } else {
            acc[key] = { opacity: 1 };
        }
        return acc;
    }, {} as Variants);
};
