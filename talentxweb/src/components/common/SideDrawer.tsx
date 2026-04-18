import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

interface SideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string | undefined;
    children: React.ReactNode;
    footer?: React.ReactNode | undefined;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const SideDrawer: React.FC<SideDrawerProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    size = 'md',
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setMounted(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setMounted(false), 300);
            document.body.style.overflow = 'unset';
            return () => {
                clearTimeout(timer);
                document.body.style.overflow = 'unset';
            };
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full',
    };

    if (!mounted && !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            <div
                className={`absolute inset-0 bg-secondary-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
                <div
                    className={`w-screen ${sizes[size]} transform transition-transform duration-500 ease-premium shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="flex h-full flex-col bg-white dark:bg-secondary-900 shadow-xl overflow-hidden rounded-l-[32px] border-l border-white/20 dark:border-secondary-800">
                        <div className="px-8 pt-8 pb-6 border-b border-secondary-50 dark:border-secondary-800/50">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-secondary-900 dark:text-white tracking-tight leading-none">{title}</h2>
                                    {subtitle && <p className="text-secondary-500 dark:text-secondary-400 text-sm font-medium">{subtitle}</p>}
                                </div>
                                <div className="ml-3 flex h-7 items-center">
                                    <Button
                                        variant="glass"
                                        size="xs"
                                        onClick={onClose}
                                        className="rounded-full w-10 h-10 p-0 center"
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="relative flex-1 overflow-y-auto px-8 py-8 scrollbar-premium">
                            <div className="animate-fade-in animation-delay-300">
                                {children}
                            </div>
                        </div>

                        {footer && (
                            <div className="flex-shrink-0 border-t border-secondary-50 dark:border-secondary-800/50 px-8 py-6 bg-secondary-50/30 dark:bg-secondary-800/20">
                                {footer}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SideDrawer;
