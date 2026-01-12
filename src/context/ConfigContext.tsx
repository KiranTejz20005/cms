import React, { createContext, useContext, useState, useEffect } from 'react';

interface ConfigContextType {
    platformName: string;
    setPlatformName: (name: string) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
    // Initialize from localStorage or default to 'Lifemonk'
    const [platformName, setPlatformName] = useState(() => {
        return localStorage.getItem('platformName') || 'Lifemonk';
    });

    // Persist to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('platformName', platformName);
    }, [platformName]);

    return (
        <ConfigContext.Provider value={{ platformName, setPlatformName }}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
}
