import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Edit2, Download, Trash2, UserPlus, ChevronDown } from 'lucide-react';

export interface ActionItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'danger';
}

interface QuickActionsDropdownProps {
    actions: ActionItem[];
    label?: string;
    variant?: 'button' | 'icon';
}

const QuickActionsDropdown: React.FC<QuickActionsDropdownProps> = ({
    actions,
    label = 'Actions',
    variant = 'button'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            {variant === 'button' ? (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex justify-center items-center px-4 py-2 border border-secondary-300 shadow-sm text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all gap-2"
                >
                    {label}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            ) : (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-full hover:bg-secondary-100 transition-colors"
                >
                    <MoreHorizontal className="w-5 h-5 text-secondary-500" />
                </button>
            )}

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-fadeIn scale-100 border border-secondary-100 overflow-hidden">
                    <div className="py-1">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    action.onClick();
                                    setIsOpen(false);
                                }}
                                className={`
                  flex items-center w-full px-4 py-2.5 text-sm transition-colors
                  ${action.variant === 'danger'
                                        ? 'text-danger-600 hover:bg-danger-50'
                                        : 'text-secondary-700 hover:bg-secondary-50'}
                `}
                            >
                                <span className={`mr-3 ${action.variant === 'danger' ? 'text-danger-500' : 'text-secondary-400'}`}>
                                    {action.icon}
                                </span>
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuickActionsDropdown;
