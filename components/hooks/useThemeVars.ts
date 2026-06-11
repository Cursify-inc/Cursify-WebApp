"use client";

import { useLayoutEffect, useState } from "react";

type VarMap = Record<string, string>;

export function useThemeVars(vars: readonly string[]): VarMap {
    const [values, setValues] = useState<VarMap>(() =>
        vars.reduce((acc, name) => {
            acc[name] = "";
            return acc;
        }, {} as VarMap)
    );

    useLayoutEffect(() => {
        const root = document.documentElement;

        const read = () => {
            const style = getComputedStyle(root);
            const next: VarMap = {};
            for (const name of vars) next[name] = style.getPropertyValue(name).trim();
            setValues(next);
        };

        read();

        const observer = new MutationObserver(read);
        observer.observe(root, {
            attributes: true,
            attributeFilter: ["class", "data-theme", "style"],
        });

        return () => observer.disconnect();
    }, [vars]);

    return values;
}
