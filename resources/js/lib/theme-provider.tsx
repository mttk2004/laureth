import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
}

/**
 * ThemeProvider - Component quản lý theme cho toàn ứng dụng
 *
 * Cung cấp context để các component con có thể truy cập và thay đổi theme
 */
export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(defaultTheme);

    // Khôi phục theme từ localStorage khi component mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    // Áp dụng theme khi giá trị theme thay đổi
    useEffect(() => {
        if (theme === 'system') {
            // Nếu là system, xóa color-scheme để sử dụng light dark mặc định
            document.documentElement.style.removeProperty('color-scheme');
        } else {
            // Áp dụng color-scheme cụ thể
            document.documentElement.style.setProperty('color-scheme', theme);
        }
        // Lưu theme vào localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Tạo context provider với giá trị theme hiện tại và hàm setTheme
    const value = {
        theme,
        setTheme: (theme: Theme) => {
            setTheme(theme);
        },
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * useTheme - Hook để sử dụng theme context
 *
 * @returns ThemeContextType - Giá trị theme và hàm setTheme
 */
export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
