
import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedTheme = window.localStorage.getItem('theme');
            if (storedTheme) {
                return storedTheme;
            }
            // Check system preference
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        try {
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.error("Could not save theme to localStorage", error);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="flex items-center justify-center w-full px-4 py-3 text-gray-300 hover:bg-brand-dark-accent hover:text-white transition-colors duration-200 rounded-lg"
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 mr-3" />
            ) : (
                <Sun className="w-5 h-5 mr-3" />
            )}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
    );
};

export default ThemeToggle;
