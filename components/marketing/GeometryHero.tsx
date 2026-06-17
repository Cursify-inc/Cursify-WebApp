"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PointMaterial, Points } from "@react-three/drei";
import {
    animate,
    motion,
    useMotionTemplate,
    useMotionValue,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
} from "framer-motion";
import {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type RefObject,
} from "react";
import {
    AmbientLight,
    Color,
    DirectionalLight,
    Fog,
    Group,
    InstancedMesh,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    Object3D,
    PointLight,
    Points as ThreePoints,
    PointsMaterial,
    Vector3,
} from "three";

type SectionStage = 0 | 1 | 2 | 3;
type NumberRef = RefObject<number>;
type ThemeRef = RefObject<RuntimeTheme>;

type Theme = {
    accent: Color;
    accent2: Color;
    fog: Color;
    bg: Color;
    coreScale: number;
    frameScale: number;
    particleOpacity: number;
    dataSpeed: number;
    pulse: number;
};

type RuntimeTheme = {
    accent: Color;
    accent2: Color;
    fog: Color;
    bg: Color;
    accentStyle: string;
    accent2Style: string;
    fogStyle: string;
    bgStyle: string;
    coreScale: number;
    frameScale: number;
    particleOpacity: number;
    dataSpeed: number;
    pulse: number;
};

const THEMES: readonly Theme[] = [
    {
        accent: new Color("#00e5ff"),
        accent2: new Color("#8b5cf6"),
        fog: new Color("#030712"),
        bg: new Color("#020617"),
        coreScale: 1,
        frameScale: 1,
        particleOpacity: 0.58,
        dataSpeed: 0.22,
        pulse: 0.85,
    },
    {
        accent: new Color("#00ffc6"),
        accent2: new Color("#b026ff"),
        fog: new Color("#020617"),
        bg: new Color("#030014"),
        coreScale: 1.06,
        frameScale: 1.06,
        particleOpacity: 0.68,
        dataSpeed: 0.3,
        pulse: 1,
    },
    {
        accent: new Color("#ff2bd6"),
        accent2: new Color("#00e5ff"),
        fog: new Color("#080012"),
        bg: new Color("#050010"),
        coreScale: 1.12,
        frameScale: 1.12,
        particleOpacity: 0.76,
        dataSpeed: 0.38,
        pulse: 1.16,
    },
    {
        accent: new Color("#39ff14"),
        accent2: new Color("#00e5ff"),
        fog: new Color("#020810"),
        bg: new Color("#010409"),
        coreScale: 1.18,
        frameScale: 1.18,
        particleOpacity: 0.84,
        dataSpeed: 0.46,
        pulse: 1.32,
    },
];

const BG_STOPS = [
    { from: "#020617", via: "#07112a", to: "#020617" },
    { from: "#030014", via: "#071a2d", to: "#020617" },
    { from: "#050010", via: "#1b0731", to: "#020617" },
    { from: "#010409", via: "#062016", to: "#020617" },
] as const;

const GLOW_STOPS = [
    {
        a: "rgba(0,229,255,0.2)",
        b: "rgba(139,92,246,0.16)",
        c: "rgba(0,255,198,0.1)",
        d: "rgba(255,43,214,0.08)",
    },
    {
        a: "rgba(0,255,198,0.2)",
        b: "rgba(176,38,255,0.16)",
        c: "rgba(0,229,255,0.1)",
        d: "rgba(57,255,20,0.06)",
    },
    {
        a: "rgba(255,43,214,0.18)",
        b: "rgba(0,229,255,0.16)",
        c: "rgba(176,38,255,0.12)",
        d: "rgba(0,255,198,0.08)",
    },
    {
        a: "rgba(57,255,20,0.16)",
        b: "rgba(0,229,255,0.14)",
        c: "rgba(176,38,255,0.1)",
        d: "rgba(0,255,198,0.08)",
    },
] as const;

const INSTANCE_DUMMY = new Object3D();
const MAX_FRAME_DELTA = 1 / 30;

function safeDelta(delta: number) {
    return Math.min(delta, MAX_FRAME_DELTA);
}

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

function dampFactor(speed: number, delta: number) {
    return 1 - Math.exp(-speed * delta);
}

function hexString(color: Color) {
    return `#${color.getHexString()}`;
}

function createRuntimeTheme(theme: Theme): RuntimeTheme {
    return {
        accent: theme.accent.clone(),
        accent2: theme.accent2.clone(),
        fog: theme.fog.clone(),
        bg: theme.bg.clone(),
        accentStyle: hexString(theme.accent),
        accent2Style: hexString(theme.accent2),
        fogStyle: hexString(theme.fog),
        bgStyle: hexString(theme.bg),
        coreScale: theme.coreScale,
        frameScale: theme.frameScale,
        particleOpacity: theme.particleOpacity,
        dataSpeed: theme.dataSpeed,
        pulse: theme.pulse,
    };
}

function applyBlendedTheme(target: RuntimeTheme, progress: number) {
    const maxIndex = THEMES.length - 1;
    const clamped = Math.max(0, Math.min(progress, maxIndex));
    const base = Math.floor(clamped);
    const next = Math.min(base + 1, maxIndex);
    const t = clamped - base;

    const from = THEMES[base];
    const to = THEMES[next];

    target.accent.copy(from.accent).lerp(to.accent, t);
    target.accent2.copy(from.accent2).lerp(to.accent2, t);
    target.fog.copy(from.fog).lerp(to.fog, t);
    target.bg.copy(from.bg).lerp(to.bg, t);

    target.accentStyle = hexString(target.accent);
    target.accent2Style = hexString(target.accent2);
    target.fogStyle = hexString(target.fog);
    target.bgStyle = hexString(target.bg);

    target.coreScale = lerp(from.coreScale, to.coreScale, t);
    target.frameScale = lerp(from.frameScale, to.frameScale, t);
    target.particleOpacity = lerp(from.particleOpacity, to.particleOpacity, t);
    target.dataSpeed = lerp(from.dataSpeed, to.dataSpeed, t);
    target.pulse = lerp(from.pulse, to.pulse, t);
}

function toSectionStage(index: number): SectionStage {
    const normalized = Math.max(0, Math.min(index, THEMES.length - 1));
    return normalized as SectionStage;
}

function mulberry32(seed: number) {
    return () => {
        let value = (seed += 0x6d2b79f5);
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
}

function createDataParticlePositions() {
    const count = 180;
    const arr = new Float32Array(count * 3);
    const random = mulberry32(0x8f14c2d9);

    for (let i = 0; i < count; i++) {
        const column = Math.floor(random() * 18) - 9;
        const lane = Math.floor(random() * 7) - 3;

        arr[i * 3] = column * 0.38 + (random() - 0.5) * 0.08;
        arr[i * 3 + 1] = -3.2 + random() * 6.4;
        arr[i * 3 + 2] = lane * 0.46 + (random() - 0.5) * 0.16;
    }

    return arr;
}

function createNetworkLayout() {
    const nodes: { pos: Vector3; scale: number }[] = [
        { pos: new Vector3(-2.65, 1.28, -0.28), scale: 0.07 },
        { pos: new Vector3(-1.82, 0.72, 0.52), scale: 0.052 },
        { pos: new Vector3(-2.25, -0.28, -0.66), scale: 0.056 },
        { pos: new Vector3(-1.18, -1.18, 0.24), scale: 0.064 },
        { pos: new Vector3(-0.38, 1.48, -0.82), scale: 0.05 },
        { pos: new Vector3(0.82, 1.18, 0.42), scale: 0.068 },
        { pos: new Vector3(1.72, 0.48, -0.42), scale: 0.052 },
        { pos: new Vector3(2.58, 1.08, 0.18), scale: 0.07 },
        { pos: new Vector3(2.18, -0.42, 0.62), scale: 0.058 },
        { pos: new Vector3(1.18, -1.24, -0.32), scale: 0.064 },
        { pos: new Vector3(0.06, -1.62, 0.46), scale: 0.052 },
        { pos: new Vector3(-0.92, 0.12, -0.72), scale: 0.048 },
        { pos: new Vector3(0.94, -0.08, 0.76), scale: 0.048 },
        { pos: new Vector3(0.12, 0.84, 0.64), scale: 0.05 },
    ];

    const connections = [
        [0, 1],
        [0, 4],
        [1, 2],
        [1, 11],
        [2, 3],
        [3, 10],
        [4, 5],
        [4, 13],
        [5, 6],
        [5, 13],
        [6, 7],
        [6, 8],
        [8, 9],
        [9, 10],
        [9, 12],
        [11, 13],
        [12, 13],
        [11, 12],
    ];

    const lineData: number[] = [];

    connections.forEach(([a, b]) => {
        const from = nodes[a].pos;
        const to = nodes[b].pos;

        lineData.push(from.x, from.y, from.z, to.x, to.y, to.z);
    });

    nodes.forEach((node) => {
        lineData.push(0, 0, 0, node.pos.x, node.pos.y, node.pos.z);
    });

    return {
        nodes,
        linePositions: new Float32Array(lineData),
    };
}

function createHudFramePositions() {
    const data: number[] = [];

    const addSegment = (a: [number, number, number], b: [number, number, number]) => {
        data.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    };

    const addRectCorners = (width: number, height: number, z: number, corner: number) => {
        const x = width / 2;
        const y = height / 2;

        addSegment([-x, y, z], [-x + corner, y, z]);
        addSegment([-x, y, z], [-x, y - corner, z]);

        addSegment([x, y, z], [x - corner, y, z]);
        addSegment([x, y, z], [x, y - corner, z]);

        addSegment([-x, -y, z], [-x + corner, -y, z]);
        addSegment([-x, -y, z], [-x, -y + corner, z]);

        addSegment([x, -y, z], [x - corner, -y, z]);
        addSegment([x, -y, z], [x, -y + corner, z]);
    };

    const addHex = (radius: number, z: number) => {
        const points: [number, number, number][] = [];

        for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 6 + (i / 6) * Math.PI * 2;
            points.push([Math.cos(angle) * radius, Math.sin(angle) * radius, z]);
        }

        for (let i = 0; i < points.length; i++) {
            const current = points[i];
            const next = points[(i + 1) % points.length];

            if (i !== 1 && i !== 4) {
                addSegment(current, next);
            }
        }
    };

    addRectCorners(4.8, 3.2, -0.22, 0.46);
    addRectCorners(3.45, 2.35, 0.2, 0.34);
    addHex(1.92, 0.08);
    addHex(1.26, 0.34);

    addSegment([-2.8, 0.02, -0.1], [-1.95, 0.02, -0.1]);
    addSegment([1.95, 0.02, -0.1], [2.8, 0.02, -0.1]);
    addSegment([0, 1.92, -0.1], [0, 1.34, -0.1]);
    addSegment([0, -1.92, -0.1], [0, -1.34, -0.1]);

    return new Float32Array(data);
}

function useActiveGeometrySection() {
    const [activeSection, setActiveSection] = useState<SectionStage>(0);

    useEffect(() => {
        const sections = Array.from(
            document.querySelectorAll<HTMLElement>("[data-geometry-section]"),
        );

        if (!sections.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (!visible) return;

                const index = sections.indexOf(visible.target as HTMLElement);
                if (index === -1) return;

                const next = toSectionStage(index % THEMES.length);
                setActiveSection((current) => (current === next ? current : next));
            },
            {
                threshold: [0.25, 0.5, 0.75],
                rootMargin: "-10% 0px -10% 0px",
            },
        );

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    return activeSection;
}

function useCanvasActive() {
    const [active, setActive] = useState(true);

    useEffect(() => {
        const updateVisibility = () => {
            setActive(!document.hidden);
        };

        updateVisibility();
        document.addEventListener("visibilitychange", updateVisibility);

        return () => {
            document.removeEventListener("visibilitychange", updateVisibility);
        };
    }, []);

    return active;
}

function useThemeProgress(stage: SectionStage) {
    const progressRef = useRef<number>(stage);

    useFrame((_, delta) => {
        const frameDelta = safeDelta(delta);
        const smoothing = dampFactor(4.5, frameDelta);

        progressRef.current = lerp(progressRef.current, stage, smoothing);
    }, -101);

    return progressRef;
}

function DataStreamField({ themeRef }: { themeRef: ThemeRef }) {
    const pointsRef = useRef<ThreePoints>(null);
    const positions = useMemo(() => createDataParticlePositions(), []);

    useFrame((_, delta) => {
        const frameDelta = safeDelta(delta);
        const points = pointsRef.current;
        const theme = themeRef.current;

        if (!points || !theme) return;

        const attribute = points.geometry.getAttribute("position");

        for (let i = 0; i < attribute.count; i++) {
            const currentY = attribute.getY(i);
            const nextY = currentY - frameDelta * (0.28 + theme.dataSpeed * 1.8);

            attribute.setY(i, nextY < -3.2 ? 3.2 : nextY);
        }

        attribute.needsUpdate = true;

        points.rotation.y = Math.sin(performance.now() * 0.00008) * 0.08;

        const material = points.material as PointsMaterial;
        material.color.copy(theme.accent2);
        material.opacity = theme.particleOpacity;
        material.size = theme.pulse > 1.15 ? 0.036 : 0.03;
    });

    return (
        <Points ref={pointsRef} positions={positions} stride={3} frustumCulled>
            <PointMaterial
                transparent
                color="#ffffff"
                size={0.032}
                sizeAttenuation
                depthWrite={false}
                opacity={0.64}
            />
        </Points>
    );
}

function AgentNetwork({
                          themeRef,
                          themeProgressRef,
                      }: {
    themeRef: ThemeRef;
    themeProgressRef: NumberRef;
}) {
    const groupRef = useRef<Group>(null);
    const primaryRef = useRef<InstancedMesh>(null);
    const secondaryRef = useRef<InstancedMesh>(null);
    const linesRef = useRef<LineSegments>(null);

    const { primaryNodes, secondaryNodes, linePositions } = useMemo(() => {
        const layout = createNetworkLayout();

        return {
            primaryNodes: layout.nodes.filter((_, index) => index % 2 === 0),
            secondaryNodes: layout.nodes.filter((_, index) => index % 2 !== 0),
            linePositions: layout.linePositions,
        };
    }, []);

    useLayoutEffect(() => {
        const writeMatrices = (
            mesh: InstancedMesh | null,
            nodes: { pos: Vector3; scale: number }[],
        ) => {
            if (!mesh) return;

            nodes.forEach((node, index) => {
                INSTANCE_DUMMY.position.copy(node.pos);
                INSTANCE_DUMMY.scale.setScalar(node.scale);
                INSTANCE_DUMMY.updateMatrix();
                mesh.setMatrixAt(index, INSTANCE_DUMMY.matrix);
            });

            mesh.instanceMatrix.needsUpdate = true;
        };

        writeMatrices(primaryRef.current, primaryNodes);
        writeMatrices(secondaryRef.current, secondaryNodes);
    }, [primaryNodes, secondaryNodes]);

    useFrame((state, delta) => {
        const frameDelta = safeDelta(delta);
        const group = groupRef.current;
        const theme = themeRef.current;

        if (!group || !theme) return;

        const progress = themeProgressRef.current ?? 0;
        const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 2.2) * 0.5;

        group.rotation.y += frameDelta * (0.025 + theme.dataSpeed * 0.05);
        group.rotation.x = Math.sin(state.clock.elapsedTime * 0.32) * 0.035;
        group.position.y = Math.sin(state.clock.elapsedTime * 0.64) * 0.035;

        const primaryMat = primaryRef.current?.material as MeshBasicMaterial | undefined;
        const secondaryMat = secondaryRef.current?.material as MeshBasicMaterial | undefined;
        const lineMat = linesRef.current?.material as LineBasicMaterial | undefined;

        if (primaryMat) {
            primaryMat.color.copy(theme.accent);
        }

        if (secondaryMat) {
            secondaryMat.color.copy(theme.accent2);
        }

        if (lineMat) {
            lineMat.color.copy(theme.accent);
            lineMat.opacity = 0.14 + progress * 0.045 + pulse * 0.045;
        }
    });

    return (
        <group ref={groupRef}>
            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[linePositions, 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial
                    color="#00e5ff"
                    transparent
                    opacity={0.18}
                    depthWrite={false}
                />
            </lineSegments>

            <instancedMesh
                ref={primaryRef}
                args={[undefined, undefined, primaryNodes.length]}
            >
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color="#00e5ff" />
            </instancedMesh>

            <instancedMesh
                ref={secondaryRef}
                args={[undefined, undefined, secondaryNodes.length]}
            >
                <octahedronGeometry args={[1, 0]} />
                <meshBasicMaterial color="#8b5cf6" />
            </instancedMesh>
        </group>
    );
}

function HudFrames({
                       themeRef,
                       themeProgressRef,
                   }: {
    themeRef: ThemeRef;
    themeProgressRef: NumberRef;
}) {
    const groupRef = useRef<Group>(null);
    const linesARef = useRef<LineSegments>(null);
    const linesBRef = useRef<LineSegments>(null);
    const positions = useMemo(() => createHudFramePositions(), []);

    useFrame((state, delta) => {
        const frameDelta = safeDelta(delta);
        const group = groupRef.current;
        const theme = themeRef.current;

        if (!group || !theme) return;

        const progress = themeProgressRef.current ?? 0;
        const time = state.clock.elapsedTime;

        group.rotation.z = Math.sin(time * 0.28) * 0.035;
        group.rotation.y = Math.sin(time * 0.18) * 0.08;
        group.scale.setScalar(theme.frameScale + Math.sin(time * 1.4) * 0.006);

        const matA = linesARef.current?.material as LineBasicMaterial | undefined;
        const matB = linesBRef.current?.material as LineBasicMaterial | undefined;

        if (matA) {
            matA.color.copy(theme.accent);
            matA.opacity = 0.34 + progress * 0.035;
        }

        if (matB) {
            matB.color.copy(theme.accent2);
            matB.opacity = 0.14 + Math.sin(time * 2.1) * 0.035;
        }

        if (linesBRef.current) {
            linesBRef.current.rotation.z -= frameDelta * (0.08 + theme.dataSpeed * 0.16);
        }
    });

    return (
        <group ref={groupRef}>
            <lineSegments ref={linesARef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                </bufferGeometry>
                <lineBasicMaterial
                    color="#00e5ff"
                    transparent
                    opacity={0.34}
                    depthWrite={false}
                />
            </lineSegments>

            <lineSegments ref={linesBRef} rotation-z={Math.PI / 4} scale={0.72}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                </bufferGeometry>
                <lineBasicMaterial
                    color="#8b5cf6"
                    transparent
                    opacity={0.16}
                    depthWrite={false}
                />
            </lineSegments>
        </group>
    );
}

function AgentCore({
                       progressRef,
                       themeRef,
                       themeProgressRef,
                   }: {
    progressRef: NumberRef;
    themeRef: ThemeRef;
    themeProgressRef: NumberRef;
}) {
    const groupRef = useRef<Group>(null);
    const coreRef = useRef<Mesh>(null);
    const wireRef = useRef<Mesh>(null);
    const innerRef = useRef<Mesh>(null);
    const glowRef = useRef<Mesh>(null);
    const chipARef = useRef<Mesh>(null);
    const chipBRef = useRef<Mesh>(null);
    const chipCRef = useRef<Mesh>(null);

    useFrame((state, delta) => {
        const frameDelta = safeDelta(delta);
        const time = state.clock.elapsedTime;
        const progress = progressRef.current ?? 0;
        const themeProgress = themeProgressRef.current ?? 0;
        const theme = themeRef.current;

        if (!theme) return;

        const pointerX = state.pointer.x * 0.22;
        const pointerY = state.pointer.y * 0.14;

        const group = groupRef.current;

        if (group) {
            const smoothing = dampFactor(3.4, frameDelta);
            const targetX = -pointerY + 0.12 + progress * 0.05;
            const targetY = pointerX + themeProgress * 0.018;

            group.rotation.x = lerp(group.rotation.x, targetX, smoothing);
            group.rotation.y = lerp(group.rotation.y, targetY, smoothing);
            group.position.y = Math.sin(time * 0.74) * 0.045;

            const scale = theme.coreScale + Math.sin(time * 1.5) * 0.012 * theme.pulse;
            group.scale.setScalar(scale);
        }

        if (coreRef.current) {
            coreRef.current.rotation.x += frameDelta * 0.16;
            coreRef.current.rotation.y += frameDelta * 0.22;

            const mat = coreRef.current.material as MeshStandardMaterial;
            mat.emissive.copy(theme.accent);
            mat.emissiveIntensity = 0.72 + themeProgress * 0.08;
        }

        if (wireRef.current) {
            wireRef.current.rotation.x -= frameDelta * 0.12;
            wireRef.current.rotation.z += frameDelta * 0.18;

            const mat = wireRef.current.material as MeshBasicMaterial;
            mat.color.copy(theme.accent2);
            mat.opacity = 0.44 + Math.sin(time * 2.4) * 0.08;
        }

        if (innerRef.current) {
            innerRef.current.rotation.y -= frameDelta * 0.32;
            innerRef.current.rotation.z += frameDelta * 0.2;

            const mat = innerRef.current.material as MeshStandardMaterial;
            mat.emissive.copy(theme.accent2);
            mat.emissiveIntensity = 0.86 + themeProgress * 0.12;
        }

        if (glowRef.current) {
            glowRef.current.scale.setScalar(1 + Math.sin(time * 1.9) * 0.035 * theme.pulse);

            const mat = glowRef.current.material as MeshBasicMaterial;
            mat.color.copy(theme.accent);
            mat.opacity = 0.055 + Math.sin(time * 1.8) * 0.012;
        }

        const chips = [chipARef.current, chipBRef.current, chipCRef.current];

        chips.forEach((chip, index) => {
            if (!chip) return;

            chip.rotation.z = Math.sin(time * 0.8 + index) * 0.04;

            const mat = chip.material as MeshBasicMaterial;
            mat.color.copy(index === 1 ? theme.accent2 : theme.accent);
            mat.opacity = 0.2 + Math.sin(time * 1.7 + index) * 0.04;
        });
    });

    return (
        <group ref={groupRef}>
            <mesh ref={glowRef} scale={1.92}>
                <icosahedronGeometry args={[1, 1]} />
                <meshBasicMaterial
                    color="#00e5ff"
                    transparent
                    opacity={0.06}
                    depthWrite={false}
                />
            </mesh>

            <mesh ref={coreRef} scale={0.72}>
                <icosahedronGeometry args={[1.2, 2]} />
                <meshStandardMaterial
                    color="#07111f"
                    roughness={0.28}
                    metalness={0.72}
                    emissive="#00e5ff"
                    emissiveIntensity={0.72}
                    transparent
                    opacity={0.86}
                />
            </mesh>

            <mesh ref={wireRef} scale={0.92}>
                <icosahedronGeometry args={[1.2, 2]} />
                <meshBasicMaterial
                    color="#8b5cf6"
                    wireframe
                    transparent
                    opacity={0.48}
                    depthWrite={false}
                />
            </mesh>

            <mesh ref={innerRef} scale={0.28}>
                <octahedronGeometry args={[1, 1]} />
                <meshStandardMaterial
                    color="#e0f2fe"
                    roughness={0.18}
                    metalness={0.5}
                    emissive="#8b5cf6"
                    emissiveIntensity={0.86}
                />
            </mesh>

            <mesh ref={chipARef} position={[-1.24, 0.52, -0.12]} rotation-z={0.2}>
                <boxGeometry args={[0.72, 0.018, 0.18]} />
                <meshBasicMaterial
                    color="#00e5ff"
                    transparent
                    opacity={0.22}
                    depthWrite={false}
                />
            </mesh>

            <mesh ref={chipBRef} position={[1.16, -0.38, 0.18]} rotation-z={-0.32}>
                <boxGeometry args={[0.66, 0.018, 0.16]} />
                <meshBasicMaterial
                    color="#8b5cf6"
                    transparent
                    opacity={0.22}
                    depthWrite={false}
                />
            </mesh>

            <mesh ref={chipCRef} position={[0.18, -1.08, -0.2]} rotation-z={0.08}>
                <boxGeometry args={[0.9, 0.018, 0.14]} />
                <meshBasicMaterial
                    color="#00e5ff"
                    transparent
                    opacity={0.18}
                    depthWrite={false}
                />
            </mesh>

            <HudFrames themeRef={themeRef} themeProgressRef={themeProgressRef} />
            <AgentNetwork themeRef={themeRef} themeProgressRef={themeProgressRef} />
        </group>
    );
}

function CameraRig() {
    return null;
}

function SceneContents({
                           stage,
                           progressRef,
                       }: {
    stage: SectionStage;
    progressRef: NumberRef;
}) {
    const themeProgressRef = useThemeProgress(stage);
    const themeRef = useRef<RuntimeTheme>(createRuntimeTheme(THEMES[0]));

    const backgroundRef = useRef<Color>(null);
    const fogRef = useRef<Fog>(null);

    const pointARef = useRef<PointLight>(null);
    const pointBRef = useRef<PointLight>(null);
    const ambientRef = useRef<AmbientLight>(null);
    const dirRef = useRef<DirectionalLight>(null);
    const floorRef = useRef<Mesh>(null);

    useFrame(() => {
        applyBlendedTheme(themeRef.current, themeProgressRef.current);

        const theme = themeRef.current;
        const progress = themeProgressRef.current;

        backgroundRef.current?.copy(theme.bg);

        if (fogRef.current) {
            fogRef.current.color.copy(theme.fog);
        }

        if (ambientRef.current) {
            ambientRef.current.intensity = 0.42 + progress * 0.035;
        }

        if (dirRef.current) {
            dirRef.current.intensity = 1 + progress * 0.08;
        }

        if (pointARef.current) {
            pointARef.current.intensity = 1.7 + progress * 0.22;
            pointARef.current.color.copy(theme.accent);
        }

        if (pointBRef.current) {
            pointBRef.current.color.copy(theme.accent2);
            pointBRef.current.intensity = 0.72 + progress * 0.08;
        }

        if (floorRef.current) {
            const mat = floorRef.current.material as MeshBasicMaterial;

            mat.color.copy(theme.accent);
            mat.opacity = 0.05 + progress * 0.012;
        }
    }, -100);

    return (
        <>
            <color ref={backgroundRef} attach="background" args={[THEMES[0].bg]} />
            <fog ref={fogRef} attach="fog" args={[THEMES[0].fog, 7.2, 15]} />

            <ambientLight ref={ambientRef} intensity={0.42} />

            <directionalLight
                ref={dirRef}
                position={[4, 4, 3]}
                intensity={1}
                color="#e5f0ff"
            />

            <pointLight
                ref={pointARef}
                position={[0, 0, 0]}
                intensity={1.7}
                distance={8}
            />

            <pointLight
                ref={pointBRef}
                position={[-3, 2, -2]}
                intensity={0.72}
                distance={10}
            />

            <CameraRig />
            <DataStreamField themeRef={themeRef} />

            <group position={[0, 0.08, 0]}>
                <AgentCore
                    progressRef={progressRef}
                    themeRef={themeRef}
                    themeProgressRef={themeProgressRef}
                />
            </group>

            <mesh ref={floorRef} rotation-x={-Math.PI / 2} position={[0, -2.8, 0]}>
                <circleGeometry args={[7.2, 48]} />
                <meshBasicMaterial
                    color="#00e5ff"
                    transparent
                    opacity={0.05}
                    depthWrite={false}
                />
            </mesh>
        </>
    );
}

export function GeometryHero() {
    const activeSection = useActiveGeometrySection();
    const canvasActive = useCanvasActive();
    const prefersReducedMotion = useReducedMotion();
    const { scrollYProgress } = useScroll();

    const smooth = useSpring(scrollYProgress, {
        stiffness: 70,
        damping: 20,
        mass: 0.4,
    });

    const overlayOpacity = useTransform(smooth, [0, 1], [0.1, 0.26]);
    const gridOpacity = useTransform(smooth, [0, 1], [0.08, 0.16]);
    const glowScale = useTransform(smooth, [0, 1], [1, 1.14]);
    const scanOpacity = useTransform(smooth, [0, 1], [0.12, 0.2]);

    const progressRef = useRef<number>(0);

    useEffect(() => {
        return smooth.on("change", (value) => {
            progressRef.current = value;
        });
    }, [smooth]);

    const fromColor = useMotionValue<string>(BG_STOPS[0].from);
    const viaColor = useMotionValue<string>(BG_STOPS[0].via);
    const toColor = useMotionValue<string>(BG_STOPS[0].to);

    const glowA = useMotionValue<string>(GLOW_STOPS[0].a);
    const glowB = useMotionValue<string>(GLOW_STOPS[0].b);
    const glowC = useMotionValue<string>(GLOW_STOPS[0].c);
    const glowD = useMotionValue<string>(GLOW_STOPS[0].d);

    useEffect(() => {
        const controls = [
            animate(fromColor, BG_STOPS[activeSection].from, {
                duration: 0.85,
                ease: "easeOut",
            }),
            animate(viaColor, BG_STOPS[activeSection].via, {
                duration: 0.85,
                ease: "easeOut",
            }),
            animate(toColor, BG_STOPS[activeSection].to, {
                duration: 0.85,
                ease: "easeOut",
            }),
            animate(glowA, GLOW_STOPS[activeSection].a, {
                duration: 0.85,
                ease: "easeOut",
            }),
            animate(glowB, GLOW_STOPS[activeSection].b, {
                duration: 0.85,
                ease: "easeOut",
            }),
            animate(glowC, GLOW_STOPS[activeSection].c, {
                duration: 0.85,
                ease: "easeOut",
            }),
            animate(glowD, GLOW_STOPS[activeSection].d, {
                duration: 0.85,
                ease: "easeOut",
            }),
        ];

        return () => {
            controls.forEach((control) => control.stop());
        };
    }, [activeSection, fromColor, viaColor, toColor, glowA, glowB, glowC, glowD]);

    const animatedBg = useMotionTemplate`linear-gradient(to bottom, ${fromColor}, ${viaColor}, ${toColor})`;

    const animatedGlow = useMotionTemplate`radial-gradient(circle at 50% 42%, ${glowA}, transparent 18%), radial-gradient(circle at 18% 16%, ${glowB}, transparent 22%), radial-gradient(circle at 82% 18%, ${glowC}, transparent 20%), radial-gradient(circle at 50% 82%, ${glowD}, transparent 26%)`;

    return (
        <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
            style={{ background: animatedBg }}
        >
            <motion.div
                className="absolute inset-[-10%] will-change-transform"
                style={{
                    scale: glowScale,
                    background: animatedGlow,
                }}
            />

            <motion.div
                className="absolute inset-0 mask-[radial-gradient(circle_at_center,black_30%,transparent_88%)]"
                style={{ opacity: gridOpacity }}
            >
                <div
                    className="h-full w-full"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(0,229,255,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.14) 1px, transparent 1px)",
                        backgroundSize: "46px 46px",
                    }}
                />
            </motion.div>

            <motion.div
                className="absolute inset-0"
                style={{
                    opacity: scanOpacity,
                    backgroundImage:
                        "repeating-linear-gradient(to bottom, transparent 0px, transparent 8px, rgba(0,229,255,0.08) 9px, transparent 10px)",
                }}
            />

            <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                    backgroundImage:
                        "linear-gradient(115deg, transparent 0%, transparent 42%, rgba(0,229,255,0.28) 43%, transparent 44%, transparent 100%)",
                    backgroundSize: "180px 180px",
                }}
            />

            {!prefersReducedMotion && (
                <Canvas
                    frameloop={canvasActive ? "always" : "never"}
                    dpr={[1, 1.2]}
                    camera={{ position: [0, 0, 6.4], fov: 42 }}
                    gl={{
                        antialias: false,
                        alpha: true,
                        powerPreference: "high-performance",
                        stencil: false,
                    }}
                >
                    <SceneContents stage={activeSection} progressRef={progressRef} />
                </Canvas>
            )}

            <motion.div
                className="absolute inset-0"
                style={{
                    opacity: overlayOpacity,
                    background:
                        "radial-gradient(circle at center, transparent 34%, rgba(2,6,23,0.76) 100%)",
                }}
            />
        </motion.div>
    );
}
