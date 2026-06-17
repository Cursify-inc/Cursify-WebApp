// import {motion, MotionValue, useTransform} from "framer-motion";
// import React from "react";
// import {AutoEdgeLightQuality, Geometry} from "@/components/ui/AutoEdgeLight";
//
// function mixParsedCssColor(
//     parsedA: ParsedColor | null,
//     parsedB: ParsedColor | null,
//     fallbackA: string,
//     fallbackB: string,
//     t: number
// ) {
//     if (!parsedA || !parsedB) return t < 0.5 ? fallbackA : fallbackB;
//
//     const clampedT = clamp(t, 0, 1);
//
//     const r = Math.round(lerp(parsedA.r, parsedB.r, clampedT));
//     const g = Math.round(lerp(parsedA.g, parsedB.g, clampedT));
//     const b = Math.round(lerp(parsedA.b, parsedB.b, clampedT));
//     const a = Number(lerp(parsedA.a, parsedB.a, clampedT).toFixed(4));
//
//     return `rgba(${r}, ${g}, ${b}, ${a})`;
// }
//
//
// type TailLayer = {
//     length: number;
//     opacity: number;
//     width: number;
//     blur: boolean;
//     distanceFromHead?: number;
// };
//
//
// interface CometDashProps {
//     geometry: Geometry;
//     effectivePathLength: number;
//     offset: number;
//     dashLen: number;
//     perimeterOffset: MotionValue<number>;
//     glowStrokeOpacity: MotionValue<number>;
//     tailLayers: TailLayer[];
//     headStrokeWidth: number;
//     quality: AutoEdgeLightQuality;
//     colorTravel: MotionValue<number>;
//     colorSeed: number;
//     colorA: string;
//     colorB: string;
//     highlightColor: string;
//     parsedColorA: ParsedColor | null;
//     parsedColorB: ParsedColor | null;
//     colorSpeed: number;
// }
//
//
//
//
//
// interface CometTailLayerProps {
//     geometry: Geometry;
//     effectivePathLength: number;
//     offset: number;
//     dashLen: number;
//     perimeterOffset: MotionValue<number>;
//     layer: TailLayer;
//     strokeColor: MotionValue<string>;
// }
//
// const CometTailLayer = React.memo(function CometTailLayer({
//                                                               geometry,
//                                                               effectivePathLength,
//                                                               offset,
//                                                               dashLen,
//                                                               perimeterOffset,
//                                                               layer,
//                                                               strokeColor,
//                                                           }: CometTailLayerProps) {
//     const tailDashoffset = useTransform(perimeterOffset, (base: number) => {
//         const head = base + offset;
//         const distanceFromHead = layer.distanceFromHead ?? 0;
//
//         return -wrap(head + dashLen + distanceFromHead, effectivePathLength);
//     });
//
//     return (
//         <motion.path
//             d={geometry.path}
//             fill="none"
//             strokeWidth={layer.width}
//             strokeLinecap="round"
//             strokeDasharray={`${layer.length} ${Math.max(1, effectivePathLength - layer.length)}`}
//             style={{
//                 stroke: strokeColor,
//                 strokeDashoffset: tailDashoffset,
//                 mixBlendMode: "screen",
//             }}
//             opacity={layer.opacity}
//         />
//     );
// });
//
//
// const CometDash = React.memo(function CometDash({
//                                                     geometry,
//                                                     effectivePathLength,
//                                                     offset,
//                                                     dashLen,
//                                                     perimeterOffset,
//                                                     glowStrokeOpacity,
//                                                     tailLayers,
//                                                     headStrokeWidth,
//                                                     quality,
//                                                     colorTravel,
//                                                     colorSeed,
//                                                     colorA,
//                                                     colorB,
//                                                     highlightColor,
//                                                     parsedColorA,
//                                                     parsedColorB,
//                                                     colorSpeed,
//                                                 }: CometDashProps) {
//
//     const headDashoffset = useTransform(perimeterOffset, (base: number) => {
//         return -wrap(base + offset, effectivePathLength);
//     });
//
//     const cometColorMix = useTransform(colorTravel, (travel: number) => {
//         const pathLoops = travel / effectivePathLength;
//         const phase = pathLoops * colorSpeed + colorSeed;
//         const wrappedPhase = phase - Math.floor(phase);
//
//         return 0.5 - 0.5 * Math.cos(wrappedPhase * Math.PI * 2);
//     });
//
//     const cometColor = useTransform(cometColorMix, (mix: number) => {
//         return mixParsedCssColor(parsedColorA, parsedColorB, colorA, colorB, mix);
//     });
//
//     const glowLen = Math.max(7, dashLen * 0.72);
//     const coreLen = Math.max(5, dashLen * 0.24);
//     const glowHeadWidth = Math.max(headStrokeWidth * 2.1, headStrokeWidth + 2);
//     const showInteractionHalo = quality !== "performance";
//     const haloLen = Math.max(6, dashLen * 4);
//     const haloWidth = Math.max(headStrokeWidth * 1.45, headStrokeWidth + 1.2);
//
//     return (
//         <motion.g style={{ opacity: glowStrokeOpacity }}>
//             {tailLayers.map((layer, index) => (
//                 <CometTailLayer
//                     key={index}
//                     geometry={geometry}
//                     effectivePathLength={effectivePathLength}
//                     offset={offset}
//                     dashLen={dashLen}
//                     perimeterOffset={perimeterOffset}
//                     layer={layer}
//                     strokeColor={cometColor}
//                 />
//             ))}
//
//             <motion.path
//                 d={geometry.path}
//                 fill="none"
//                 strokeWidth={glowHeadWidth}
//                 strokeLinecap="round"
//                 strokeDasharray={`${glowLen} ${Math.max(1, effectivePathLength - glowLen)}`}
//                 style={{
//                     stroke: cometColor,
//                     strokeDashoffset: headDashoffset,
//                 }}
//                 opacity={4}
//             />
//
//             {showInteractionHalo ? (
//                 <motion.path
//                     d={geometry.path}
//                     fill="none"
//                     strokeWidth={haloWidth}
//                     strokeLinecap="round"
//                     strokeDasharray={`${haloLen} ${Math.max(1, effectivePathLength - haloLen)}`}
//                     style={{
//                         stroke: cometColor,
//                         strokeDashoffset: headDashoffset,
//                     }}
//                     opacity={1}
//                 />
//             ) : null}
//
//             <motion.path
//                 d={geometry.path}
//                 fill="none"
//                 stroke={highlightColor}
//                 strokeWidth={headStrokeWidth}
//                 strokeLinecap="round"
//                 strokeDasharray={`${coreLen} ${Math.max(1, effectivePathLength - coreLen)}`}
//                 style={{ strokeDashoffset: headDashoffset }}
//                 opacity={2}
//             />
//         </motion.g>
//     );
// });
