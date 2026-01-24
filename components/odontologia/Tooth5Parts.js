import React from 'react';

const COLORS = {
    normal: '#FFFFFF',
    // Patologías (Rojo)
    caries: '#D00000',
    sellante_nec: '#D00000',
    extraccion_ind: '#D00000',
    endodoncia: '#D00000',
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
    caries: 'O',
    sellante_nec: '*',
    endodoncia: '△',
    obturado: 'O',
    sellante_realizado: '*',
    endodoncia_real: '△',
    prot_total: '===',
    removible: '(---)',
    fija: '[--]',
    perdida_otra: '⊗',
    corona: '▣',
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
    interactive = true
}) => {
    const status = data.status || 'normal';

    const getFill = (part) => {
        const pStatus = data[part] || 'normal';
        return COLORS[pStatus] || COLORS.normal;
    };

    const commonProps = (part) => ({
        fill: getFill(part),
        stroke: status.includes('corona') ? '#FBBF24' : '#000000',
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

                {(status === 'perdida_caries' || status === 'extraccion_ind' || status === 'perdida_otra' || status === 'ausente') && (
                    <line x1="10" y1="10" x2="90" y2="90" stroke={status === 'extraccion_ind' ? '#D00000' : '#0066FF'} strokeWidth="12" />
                )}
                {status === 'implante' && <text x="35" y="70" fontSize="50" fontWeight="black" fill="#10B981" style={{ fontFamily: 'Inter, sans-serif' }}>I</text>}
                {(status === 'prot_total' || status === 'removible' || status === 'fija') && (
                    <text x="50" y="55" fontSize="28" fontWeight="black" fill="#0000AA" textAnchor="middle" style={{ fontFamily: 'Arial, sans-serif' }}>
                        {SYMBOLS_MAP[status]}
                    </text>
                )}
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

            {(status === 'perdida_caries' || status === 'extraccion_ind' || status === 'perdida_otra' || status === 'ausente') && (
                <line x1="10" y1="10" x2="90" y2="90" stroke={status === 'extraccion_ind' ? '#D00000' : '#0066FF'} strokeWidth="12" />
            )}
            {status === 'implante' && <text x="35" y="75" fontSize="55" fontWeight="black" fill="#10B981" style={{ fontFamily: 'Inter, sans-serif' }}>I</text>}
            {(status === 'prot_total' || status === 'removible' || status === 'fija') && (
                <text x="50" y="60" fontSize="32" fontWeight="black" fill="#0000AA" textAnchor="middle" style={{ fontFamily: 'Arial, sans-serif' }}>
                    {SYMBOLS_MAP[status]}
                </text>
            )}
        </svg>
    );
};

export default Tooth5Parts;
