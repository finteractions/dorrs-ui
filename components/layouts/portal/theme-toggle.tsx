import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import {getGlobalConfig} from "@/utils/global-config";

const ThemeToggle = () => {
    const PATH = `${getGlobalConfig().host}-theme`;
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const root = document.documentElement;
        const storedTheme = localStorage.getItem(PATH);
        if (storedTheme) {
            setTheme(storedTheme);
        } else {
            setTheme('light');
        }
    }, [PATH, setTheme]);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.remove('light');
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
            root.classList.add('light');
        }
        window.dispatchEvent(new Event("themeToggle"));
        localStorage.setItem(PATH, theme ?? 'system');
    }, [PATH, theme]);

    return (
        <div className={`theme-toggle ${theme}`}>
            <input
                type="checkbox"
                id="theme-toggle-checkbox"
                className="theme-toggle-checkbox"
                checked={theme === 'dark'}
                onChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            />
            <label htmlFor="theme-toggle-checkbox" className="theme-toggle-label">
                <span className="theme-toggle-button"></span>
            </label>
        </div>
    );
};

export default ThemeToggle;
