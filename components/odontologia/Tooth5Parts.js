import React from 'react';

const COLORS = {
    normal: '#FFFFFF',
    // Patologías (Rojo)
    caries: '#D00000',
    sellante_nec: '#D00000',
    extraccion_ind: '#D00000',
    endodoncia: '#D00000',
    corona_nec: '#D00000',
    prot_total_nec: '#D00000',
    removible_nec: '#D00000',
    fija_nec: '#D00000',
    // Tratamientos (Azul)
    obturado: '#0066FF',
    sellante_realizado: '#0066FF',
    perdida_caries: '#0066FF',
    perdida_otra: '#0066FF',
    endodoncia_real: '#0066FF',
    corona: '#0066FF',
    prot_total: '#0066FF',
    removible: '#0066FF',
    fija: '#0066FF',
    implante: '#059669',
};

const SYMBOLS_MAP = {
    sellante_nec: '*',
    sellante_realizado: '*',
    prot_total: '===',
    prot_total_nec: '===',
    removible: '(---)',
    removible_nec: '(---)',
    fija: '[--]',
    fija_nec: '[--]',
    perdida_otra: '⊗',
};

const Tooth5Parts = ({
    toothId,
    data = {},
    onChange,
    onDropPart,
    onDragOverPart,
    onClickPart,
    isCircle = false,
    size = 32,
    interactive = true,
    connectedLeft = false,
    connectedRight = false
}) => {
    const status = data.status || 'normal';
    const coronaProperty = data.corona || 'normal';

    // Helper to check if corona is present in status (legacy) OR independent property OR any part (legacy)
    const hasCorona = ['corona', 'corona_nec'].some(s =>
        status === s || coronaProperty === s || ['top', 'bottom', 'left', 'right', 'center'].some(p => data[p] === s)
    );
    // Helper to check if any protesis is active
    const hasProtesis = ['prot_total', 'prot_total_nec', 'removible', 'removible_nec', 'fija', 'fija_nec'].some(s => status === s);

    const getFill = (part) => {
        // Corona and prótesis are now external, so we ALLOW fills inside.
        // if (hasCorona || hasProtesis) { return COLORS.normal; } (REMOVED)

        const pStatus = data[part] || 'normal';
        // Endodoncia and Corona should not fill the tooth parts
        if (['endodoncia', 'endodoncia_real', 'corona', 'corona_nec'].includes(pStatus)) {
            return COLORS.normal;
        }
        return COLORS[pStatus] || COLORS.normal;
    };

    const coronaColor = hasCorona ? (
        (status === 'corona_nec' || coronaProperty === 'corona_nec' || ['top', 'bottom', 'left', 'right', 'center'].some(p => data[p] === 'corona_nec'))
            ? COLORS.corona_nec
            : COLORS.corona
    ) : '#000000';

    const commonProps = (part) => ({
        fill: getFill(part),
        stroke: '#000000', // Reverted to standard black border for tooth parts
        strokeWidth: interactive ? "4" : "3",
        className: interactive ? "cursor-pointer hover:filter hover:brightness-95 transition-all" : "",
        onDragOver: (e) => { e.preventDefault(); if (onDragOverPart) onDragOverPart(e); },
        onDrop: (e) => onDropPart && onDropPart(e, part),
        onClick: () => onClickPart && onClickPart(part),
    });

    const renderSymbol = (part, cx, cy) => {
        const pStatus = data[part];
        if (!pStatus || !SYMBOLS_MAP[pStatus]) return null;
        return (
            <text
                x={cx}
                y={cy}
                fontSize={isCircle ? "22" : "24"}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                pointerEvents="none"
                fontWeight="black"
                style={{ fontFamily: 'Arial, sans-serif' }}
            >
                {SYMBOLS_MAP[pStatus]}
            </text>
        );
    };

    const renderEndodonciaSymbol = () => {
        const hasEndo = ['top', 'bottom', 'left', 'right', 'center'].some(
            part => data[part] === 'endodoncia' || data[part] === 'endodoncia_real'
        );
        if (!hasEndo) return null;

        const color = ['top', 'bottom', 'left', 'right', 'center'].some(
            part => data[part] === 'endodoncia'
        ) ? '#D00000' : '#0066FF';



        // Adjusted coordinates to avoid UI collision but keep external feel
        // Triangle pointing up
        return (
            <path
                d="M 95 85 L 110 110 L 80 110 Z"
                fill="none"
                stroke={color}
                strokeWidth="4"
                className="pointer-events-none"
            />
        );
    };

    if (isCircle) {
        return (
            <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
                <path d="M 50 50 L 20 20 A 42 42 0 0 1 80 20 Z" {...commonProps('top')} />
                <path d="M 50 50 L 80 80 A 42 42 0 0 1 20 80 Z" {...commonProps('bottom')} />
                <path d="M 50 50 L 20 80 A 42 42 0 0 1 20 20 Z" {...commonProps('left')} />
                <path d="M 50 50 L 80 20 A 42 42 0 0 1 80 80 Z" {...commonProps('right')} />
                <circle cx="50" cy="50" r="20" {...commonProps('center')} />

                {renderSymbol('top', 50, 15)}
                {renderSymbol('bottom', 50, 85)}
                {renderSymbol('left', 15, 50)}
                {renderSymbol('right', 85, 50)}
                {renderSymbol('center', 50, 50)}
                {renderEndodonciaSymbol()}

                {hasCorona && (
                    <circle cx="50" cy="50" r="55" fill="none" stroke={coronaColor} strokeWidth="6" pointerEvents="none" />
                )}
                {(status === 'perdida_caries' || status === 'extraccion_ind' || status === 'perdida_otra' || status === 'ausente') && (
                    <g pointerEvents="none">
                        <line x1="10" y1="10" x2="90" y2="90" stroke={status === 'extraccion_ind' ? '#D00000' : '#0066FF'} strokeWidth="12" />
                        <line x1="90" y1="10" x2="10" y2="90" stroke={status === 'extraccion_ind' ? '#D00000' : '#0066FF'} strokeWidth="12" />
                    </g>
                )}
                {status === 'implante' && <text x="35" y="70" fontSize="50" fontWeight="black" fill="#10B981" style={{ fontFamily: 'Inter, sans-serif' }} pointerEvents="none">I</text>}


                {/* Visualizations for Prosthesis (Connected Borders - Circle) */}
                {(() => {
                    const activeProt = ['prot_total', 'prot_total_nec', 'removible', 'removible_nec', 'fija', 'fija_nec'].find(s => status === s);
                    if (!activeProt) return null;

                    const color = COLORS[activeProt];
                    const isDashed = activeProt.includes('removible');
                    const isBracket = activeProt.includes('fija');
                    const dash = isDashed ? "6,4" : undefined;

                    const Y_TOP = -25;
                    const Y_BOT = 125;
                    const X_LEFT = -25;
                    const X_RIGHT = 125;

                    return (
                        <g pointerEvents="none" strokeLinecap="round">
                            <line x1={X_LEFT} y1={Y_TOP} x2={X_RIGHT} y2={Y_TOP} stroke={color} strokeWidth="5" strokeDasharray={dash} />
                            <line x1={X_LEFT} y1={Y_BOT} x2={X_RIGHT} y2={Y_BOT} stroke={color} strokeWidth="5" strokeDasharray={dash} />
                            {!connectedLeft && (
                                <line x1={X_LEFT} y1={Y_TOP} x2={X_LEFT} y2={Y_BOT} stroke={color} strokeWidth="5" strokeDasharray={dash} />
                            )}
                            {!connectedRight && (
                                <line x1={X_RIGHT} y1={Y_TOP} x2={X_RIGHT} y2={Y_BOT} stroke={color} strokeWidth="5" strokeDasharray={dash} />
                            )}
                        </g>
                    );
                })()}
            </svg>
        );
    }

    return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
            <path d="M 0 0 L 100 0 L 75 25 L 25 25 Z" {...commonProps('top')} />
            <path d="M 0 100 L 100 100 L 75 75 L 25 75 Z" {...commonProps('bottom')} />
            <path d="M 0 0 L 0 100 L 25 75 L 25 25 Z" {...commonProps('left')} />
            <path d="M 100 0 L 100 100 L 75 75 L 75 25 Z" {...commonProps('right')} />
            <rect x="25" y="25" width="50" height="50" {...commonProps('center')} />

            {renderSymbol('top', 50, 12)}
            {renderSymbol('bottom', 50, 88)}
            {renderSymbol('left', 12, 50)}
            {renderSymbol('right', 88, 50)}
            {renderSymbol('center', 50, 50)}
            {renderEndodonciaSymbol()}

            {hasCorona && (
                <rect x="-10" y="-10" width="120" height="120" rx="4" fill="none" stroke={coronaColor} strokeWidth="6" pointerEvents="none" />
            )}

            {(status === 'perdida_caries' || status === 'extraccion_ind' || status === 'perdida_otra' || status === 'ausente') && (
                <g pointerEvents="none">
                    <line x1="10" y1="10" x2="90" y2="90" stroke={status === 'extraccion_ind' ? '#D00000' : '#0066FF'} strokeWidth="12" />
                    <line x1="90" y1="10" x2="10" y2="90" stroke={status === 'extraccion_ind' ? '#D00000' : '#0066FF'} strokeWidth="12" />
                </g>
            )}
            {status === 'implante' && <text x="35" y="75" fontSize="55" fontWeight="black" fill="#10B981" style={{ fontFamily: 'Inter, sans-serif' }} pointerEvents="none">I</text>}


            {/* Visualizations for Prosthesis (Connected Borders) */}
            {/* Prótesis Total / Fija / Removible - Logic for continuous rectangle */}
            {(() => {
                // Determine active prosthesis status to render
                const activeProt = ['prot_total', 'prot_total_nec', 'removible', 'removible_nec', 'fija', 'fija_nec'].find(s => status === s);
                if (!activeProt) return null;

                const color = COLORS[activeProt];
                const isDashed = activeProt.includes('removible'); // Dashed for removible
                const isBracket = activeProt.includes('fija');    // Logic for fija (maybe brackets?) - stick to lines for rect effect

                // Dash array: Removible = dashed, Others = solid
                const dash = isDashed ? "6,4" : undefined;

                // Coordinates for the "Box"
                const Y_TOP = -25;
                const Y_BOT = 125;
                const X_LEFT = -25;
                const X_RIGHT = 125;

                return (
                    <g pointerEvents="none" strokeLinecap="round">
                        {/* Top Line */}
                        <line x1={X_LEFT} y1={Y_TOP} x2={X_RIGHT} y2={Y_TOP} stroke={color} strokeWidth="5" strokeDasharray={dash} />

                        {/* Bottom Line */}
                        <line x1={X_LEFT} y1={Y_BOT} x2={X_RIGHT} y2={Y_BOT} stroke={color} strokeWidth="5" strokeDasharray={dash} />

                        {/* Left Line (Only if NOT connected to left) */}
                        {!connectedLeft && (
                            <line x1={X_LEFT} y1={Y_TOP} x2={X_LEFT} y2={Y_BOT} stroke={color} strokeWidth="5" strokeDasharray={dash} />
                        )}

                        {/* Right Line (Only if NOT connected to right) */}
                        {!connectedRight && (
                            <line x1={X_RIGHT} y1={Y_TOP} x2={X_RIGHT} y2={Y_BOT} stroke={color} strokeWidth="5" strokeDasharray={dash} />
                        )}
                    </g>
                );
            })()}
        </svg>
    );
};

export default Tooth5Parts;
