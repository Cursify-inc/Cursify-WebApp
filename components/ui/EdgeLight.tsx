import React from 'react';

export const EdgeLight: React.FC = () => {
    return (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-xl">
            {/*
        MASK TRICK:
        This cuts out the center of the div, leaving ONLY a 2px border area visible.
        Everything inside this div will only appear exactly on the border.
      */}
            <div
                className="absolute inset-0 rounded-xl"
                style={{
                    padding: '2px', // Width of the border
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                }}
            >
                {/* LAYER 1: Idle Infinite Orbit (Performance cost: Near 0, GPU accelerated) */}
                <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] motion-reduce:animate-none">
                    <div className="h-full w-full opacity-50 transition-opacity duration-500 group-hover:opacity-20"
                         style={{
                             background: 'conic-gradient(from 0deg, transparent 70%, rgba(56, 189, 248, 0.8) 100%)'
                         }}
                    />
                </div>

                {/* LAYER 2: Active Mouse Tracker (Performance cost: Low, CSS Variable driven) */}
                <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                        background: `radial-gradient(
              250px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
              rgba(125, 211, 252, 0.8), 
              transparent 40%
            )`
                    }}
                />
            </div>
        </div>
    );
};
