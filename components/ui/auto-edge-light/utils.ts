import {CornerRadii, CornerRadius, Geometry} from "@/components/ui/auto-edge-light/types";

export const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(n, max));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export default lerp

export const dist = (x1: number, y1: number, x2: number, y2: number) =>
    Math.hypot(x2 - x1, y2 - y1);

export function getCssVar(el: HTMLElement, name: string, fallback: string) {
    const v = getComputedStyle(el).getPropertyValue(name).trim();
    return v || fallback;
}

export function parseNum(v: string, fallback: number) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
}

function parseLengthToken(token: string, base: number) {
    const v = token.trim();

    if (!v) return 0;
    if (v.endsWith("%")) return (parseFloat(v) / 100) * base;

    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
}

export function parseCornerRadii(
    style: CSSStyleDeclaration,
    width: number,
    height: number
): CornerRadii {
    const raw = style.borderRadius.trim();

    if (!raw) {
        return {
            tl: { rx: 0, ry: 0 },
            tr: { rx: 0, ry: 0 },
            br: { rx: 0, ry: 0 },
            bl: { rx: 0, ry: 0 },
        };
    }

    const [hPart, vPart] = raw.split("/").map((s) => s.trim());
    const hTokens = hPart.split(/\s+/);
    const vTokens = (vPart || hPart).split(/\s+/);

    const expand4 = (tokens: string[], base: number) => {
        const vals = tokens.map((t) => parseLengthToken(t, base));

        if (vals.length === 1) return [vals[0], vals[0], vals[0], vals[0]];
        if (vals.length === 2) return [vals[0], vals[1], vals[0], vals[1]];
        if (vals.length === 3) return [vals[0], vals[1], vals[2], vals[1]];

        return [
            vals[0] ?? 0,
            vals[1] ?? 0,
            vals[2] ?? 0,
            vals[3] ?? 0,
        ];
    };

    let [tlx, trx, brx, blx] = expand4(hTokens, width);
    let [tly, try_, bry, bly] = expand4(vTokens, height);

    tlx = clamp(tlx, 0, width);
    trx = clamp(trx, 0, width);
    brx = clamp(brx, 0, width);
    blx = clamp(blx, 0, width);

    tly = clamp(tly, 0, height);
    try_ = clamp(try_, 0, height);
    bry = clamp(bry, 0, height);
    bly = clamp(bly, 0, height);

    const hScale = Math.min(
        1,
        width / Math.max(tlx + trx, 1),
        width / Math.max(blx + brx, 1)
    );

    const vScale = Math.min(
        1,
        height / Math.max(tly + bly, 1),
        height / Math.max(try_ + bry, 1)
    );

    tlx *= hScale;
    trx *= hScale;
    brx *= hScale;
    blx *= hScale;

    tly *= vScale;
    try_ *= vScale;
    bry *= vScale;
    bly *= vScale;

    return {
        tl: { rx: tlx, ry: tly },
        tr: { rx: trx, ry: try_ },
        br: { rx: brx, ry: bry },
        bl: { rx: blx, ry: bly },
    };
}
