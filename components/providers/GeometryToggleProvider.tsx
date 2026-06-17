// components/providers/GeometryToggleProvider.tsx
"use client";

import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type GeometryToggleContextValue = {
    geometryEnabled: boolean;
    toggleGeometry: () => void;
};

const GeometryToggleContext = createContext<GeometryToggleContextValue | null>(null);

export function GeometryToggleProvider({ children }: { children: ReactNode }) {
    const [geometryEnabled, setGeometryEnabled] = useState(true);

    useEffect(() => {
        const savedValue = window.localStorage.getItem("geometry-enabled");

        if (savedValue !== null) {
            setGeometryEnabled(savedValue === "true");
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem("geometry-enabled", String(geometryEnabled));
        document.documentElement.dataset.geometry = geometryEnabled ? "on" : "off";
    }, [geometryEnabled]);

    const value = useMemo(
        () => ({
            geometryEnabled,
            toggleGeometry: () => setGeometryEnabled((current) => !current),
        }),
        [geometryEnabled],
    );

    return (
        <GeometryToggleContext.Provider value={value}>
            {children}
        </GeometryToggleContext.Provider>
    );
}

export function useGeometryToggle() {
    const context = useContext(GeometryToggleContext);

    if (!context) {
        throw new Error("useGeometryToggle must be used inside GeometryToggleProvider");
    }

    return context;
}
