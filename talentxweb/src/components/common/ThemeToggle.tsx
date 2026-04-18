import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-all duration-300 focus-ring"
            aria-label="Toggle Theme"
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 animate-scale-in" />
            ) : (
                <Sun className="w-5 h-5 animate-scale-in" />
            )}
        </button>
    );
};

export default ThemeToggle;
