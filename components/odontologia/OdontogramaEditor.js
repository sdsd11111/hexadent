import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Tooth5Parts from './Tooth5Parts';

// Símbolos y etiquetas según la imagen de referencia del usuario
const SYMBOLS = {
    patologia: [
        { id: 'caries', label: 'CARIES', color: '#EF4444', icon: 'O' },
        { id: 'sellante_nec', label: 'SELLANTE NECESARIO', color: '#EF4444', icon: '*' },
        { id: 'extraccion_ind', label: 'EXTRACCIÓN INDICADA', color: '#EF4444', icon: 'X' },
        { id: 'endodoncia', label: 'ENDODONCIA', color: '#EF4444', icon: '△' },
    ],
    tratamiento: [
        { id: 'obturado', label: 'OBTURADO', color: '#0066FF', icon: 'O' },
        { id: 'sellante_realizado', label: 'SELLANTE REALIZADO', color: '#0066FF', icon: '*' },
        { id: 'perdida_caries', label: 'PÉRDIDA POR CARIES', color: '#0066FF', icon: 'X' },
        { id: 'perdida_otra', label: 'PÉRDIDA (OTRA CAUSA)', color: '#0066FF', icon: '⊗' },
        { id: 'endodoncia_real', label: 'ENDODONCIA REAL.', color: '#0066FF', icon: '△' },
        { id: 'corona', label: 'CORONA', color: '#0066FF', icon: '▣' },
        { id: 'fija', label: 'PRÓTESIS FIJA', color: '#0066FF', icon: '[--]' },
        { id: 'removible', label: 'PRÓTESIS REMOVIBLE', color: '#0066FF', icon: '(---)' },
        { id: 'prot_total', label: 'PRÓTESIS TOTAL', color: '#0066FF', icon: '===' },
    ]
};

const ToothEditorModal = ({ isOpen, onClose, toothId, data = {}, onConfirm }) => {
    const [localData, setLocalData] = useState(data);
    const [selectedSymbolId, setSelectedSymbolId] = useState(null);

    // Sync localData ONLY when opening modal with a new tooth
    useEffect(() => {
        if (isOpen) {
            setLocalData(data);
            setSelectedSymbolId(null);
        }
    }, [isOpen, toothId]); // Removed 'data' to prevent constant resets

    const handleDropPart = (e, part) => {
        e.preventDefault();
        const symbolId = e.dataTransfer.getData('symbolId');
        if (!symbolId) return;

        if (['perdida_caries', 'prot_total', 'removible', 'fija', 'extraccion_ind', 'perdida_otra', 'ausente'].includes(symbolId)) {
            setLocalData({ ...localData, status: symbolId });
        } else {
            setLocalData({ ...localData, [part]: symbolId });
        }
    };

    const handlePartClick = (part) => {
        if (!selectedSymbolId) return;
        if (['perdida_caries', 'prot_total', 'removible', 'fija', 'extraccion_ind', 'perdida_otra'].includes(selectedSymbolId)) {
            setLocalData({ ...localData, status: selectedSymbolId });
        } else {
            setLocalData({ ...localData, [part]: selectedSymbolId });
        }
    };

    const handleDragStart = (e, symbolId) => {
        e.dataTransfer.setData('symbolId', symbolId);
        setSelectedSymbolId(symbolId);
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-2">
                        <Dialog.Panel className="w-full max-w-7xl max-h-[98vh] transform overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] transition-all">
                            <div className="flex flex-col lg:flex-row gap-6 h-full">
                                {/* Left Side: Tooth and Buttons */}
                                <div className="flex flex-col items-center justify-center min-w-[280px]">
                                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic">PIEZA {toothId}</h2>

                                    <div className="relative p-4 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 shadow-inner group">
                                        <Tooth5Parts
                                            toothId={toothId}
                                            data={localData}
                                            size={240}
                                            isCircle={parseInt(toothId) >= 51 && parseInt(toothId) <= 85}
                                            interactive={true}
                                            onClickPart={handlePartClick}
                                            onDropPart={handleDropPart}
                                            onDragOverPart={(e) => e.preventDefault()}
                                        />
                                    </div>

                                    <div className="flex gap-3 w-full mt-4">
                                        <button
                                            onClick={() => setLocalData({})}
                                            className="flex-1 py-3 border-2 border-red-500 text-red-600 rounded-xl font-black text-sm uppercase hover:bg-red-50 transition-all active:scale-95 shadow-md shadow-red-100"
                                        >
                                            Limpiar
                                        </button>
                                        <button
                                            onClick={() => { onConfirm(toothId, localData); onClose(); }}
                                            className="flex-[2] py-3 bg-emerald-500 text-white rounded-xl font-black text-sm uppercase hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-2 px-6 shadow-md shadow-emerald-200"
                                        >
                                            ✓ GUARDAR
                                        </button>
                                    </div>

                                    {/* Recesión y Movilidad */}
                                    <div className="flex gap-3 w-full mt-3">
                                        <div className="flex-1 space-y-1">
                                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Recesión</label>
                                            <input
                                                type="text"
                                                value={localData.recesion || ''}
                                                onChange={(e) => setLocalData({ ...localData, recesion: e.target.value })}
                                                className="w-full p-2 text-lg font-bold text-center border-2 border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Movilidad</label>
                                            <input
                                                type="text"
                                                value={localData.movilidad || ''}
                                                onChange={(e) => setLocalData({ ...localData, movilidad: e.target.value })}
                                                className="w-full p-2 text-lg font-bold text-center border-2 border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Palette Information */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 content-start overflow-y-auto pr-2">
                                    {/* Patología Column */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1 h-6 bg-red-600 rounded-full" />
                                            <h4 className="text-lg font-black text-red-600 tracking-widest uppercase">PATOLOGÍA</h4>
                                        </div>
                                        {SYMBOLS.patologia.map((s) => (
                                            <button
                                                key={s.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, s.id)}
                                                onClick={() => setSelectedSymbolId(s.id)}
                                                className={`w-full flex items-center p-5 rounded-[2rem] border-2 transition-all group ${selectedSymbolId === s.id
                                                    ? 'border-red-500 bg-red-50 shadow-xl scale-[1.02]'
                                                    : 'border-slate-50 bg-white hover:border-red-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <div className="w-14 h-14 flex items-center justify-center border-2 border-red-500 rounded-2xl text-red-600 font-bold text-2xl mr-6 group-hover:scale-110 transition-transform bg-white">
                                                    {s.icon}
                                                </div>
                                                <span className="text-xs font-black text-slate-800 tracking-tight uppercase">{s.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Tratamiento Column */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1 h-6 bg-blue-600 rounded-full" />
                                            <h4 className="text-lg font-black text-blue-600 tracking-widest uppercase">TRATAMIENTO</h4>
                                        </div>
                                        {SYMBOLS.tratamiento.map((s) => (
                                            <button
                                                key={s.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, s.id)}
                                                onClick={() => setSelectedSymbolId(s.id)}
                                                className={`w-full flex items-center p-3 rounded-2xl border-2 transition-all group ${selectedSymbolId === s.id
                                                    ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]'
                                                    : 'border-slate-50 bg-white hover:border-blue-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <div className="w-10 h-10 flex items-center justify-center border-2 border-blue-500 rounded-xl text-blue-600 font-bold text-lg mr-4 group-hover:scale-110 transition-transform bg-white">
                                                    {s.icon}
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-800 uppercase tracking-tighter leading-tight">{s.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

const InputBox = ({ field, label, value, onChange }) => (
    <div className="w-8 h-8 flex items-center justify-center">
        <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            className="w-full h-full text-xs border-2 border-slate-300 rounded-lg text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-black placeholder:text-slate-300 text-slate-700"
            value={value || ''}
            placeholder={label}
            onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                onChange(field, val);
            }}
        />
    </div>
);

const ToothInteractiveBlock = ({ id, toothData, onToothClick, onValueChange, isCircle, reverse = false, hideRM = false }) => {
    return (
        <div key={id} className="flex flex-col items-center gap-1 w-[28px] sm:w-[32px]">
            {!hideRM && !reverse && (
                <>
                    <InputBox field="recesion" label="R" value={toothData.recesion} onChange={(field, val) => onValueChange(id.toString(), field, val)} />
                    <InputBox field="movilidad" label="M" value={toothData.movilidad} onChange={(field, val) => onValueChange(id.toString(), field, val)} />
                </>
            )}
            <div
                onClick={() => onToothClick(id.toString())}
                className="flex flex-col items-center gap-1 cursor-pointer transform hover:scale-110 active:scale-95 transition-all p-0.5"
            >
                <span className="text-[7px] font-black text-slate-400 mb-0.5">{id}</span>
                <Tooth5Parts
                    toothId={id.toString()}
                    data={toothData}
                    size={24}
                    isCircle={isCircle}
                    interactive={false}
                />
            </div>
            {!hideRM && reverse && (
                <>
                    <InputBox field="movilidad" label="M" value={toothData.movilidad} onChange={(field, val) => onValueChange(id.toString(), field, val)} />
                    <InputBox field="recesion" label="R" value={toothData.recesion} onChange={(field, val) => onValueChange(id.toString(), field, val)} />
                </>
            )}
        </div>
    );
};

export default function OdontogramaEditor({ value = {}, onChange }) {
    const [selectedTooth, setSelectedTooth] = useState(null);

    const handleToothClick = (id) => setSelectedTooth(id);

    const handleValueChange = (id, field, val) => {
        onChange({ ...value, [id]: { ...value[id], [field]: val } });
    };

    const handleConfirm = (id, data) => {
        onChange({ ...value, [id]: data });
    };

    const LabelColumn = ({ labels, colors }) => (
        <div className="flex flex-col gap-5 pr-2">
            {labels.map((l, i) => (
                <div key={l} className={`text-[9px] font-black uppercase text-right tracking-tighter h-7 flex items-center justify-end ${colors?.[i] || 'text-black'}`}>
                    {l}
                </div>
            ))}
        </div>
    );

    return (
        <div className="w-full bg-white p-3 md:p-6 rounded-2xl border border-slate-100 shadow-xl select-none overflow-hidden">
            {/* Upper Teeth Quadrants */}
            <div className="flex justify-center items-center gap-2 mb-6 w-full">
                <LabelColumn labels={['RECESIÓN', 'MOVILIDAD', 'VESTIBULAR']} />
                <div className="flex gap-1 border-r-[3px] border-black/30 pr-2">
                    {[18, 17, 16, 15, 14, 13, 12, 11].map(id => (
                        <ToothInteractiveBlock
                            key={id} id={id}
                            toothData={value[id.toString()] || {}}
                            onToothClick={handleToothClick}
                            onValueChange={handleValueChange}
                        />
                    ))}
                </div>
                <div className="flex gap-1">
                    {[21, 22, 23, 24, 25, 26, 27, 28].map(id => (
                        <ToothInteractiveBlock
                            key={id} id={id}
                            toothData={value[id.toString()] || {}}
                            onToothClick={handleToothClick}
                            onValueChange={handleValueChange}
                        />
                    ))}
                </div>
            </div>

            {/* Temporal / Lingual Section */}
            <div className="flex justify-center items-center gap-4 py-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 mb-6 w-full">
                <div className="text-[9px] font-black text-blue-600 tracking-widest rotate-[-90deg]">LINGUAL</div>
                <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                        <div className="flex gap-1 pr-2 border-r-[3px] border-black/30">
                            {[55, 54, 53, 52, 51].map(id => (
                                <ToothInteractiveBlock
                                    key={id} id={id} isCircle hideRM
                                    toothData={value[id.toString()] || {}}
                                    onToothClick={handleToothClick}
                                    onValueChange={handleValueChange}
                                />
                            ))}
                        </div>
                        <div className="flex gap-1 pl-2">
                            {[61, 62, 63, 64, 65].map(id => (
                                <ToothInteractiveBlock
                                    key={id} id={id} isCircle hideRM
                                    toothData={value[id.toString()] || {}}
                                    onToothClick={handleToothClick}
                                    onValueChange={handleValueChange}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="border-t-[3px] border-black/20 mx-4" />
                    <div className="flex gap-2">
                        <div className="flex gap-1 pr-2 border-r-[3px] border-black/30">
                            {[85, 84, 83, 82, 81].map(id => (
                                <ToothInteractiveBlock
                                    key={id} id={id} isCircle hideRM
                                    toothData={value[id.toString()] || {}}
                                    onToothClick={handleToothClick}
                                    onValueChange={handleValueChange}
                                />
                            ))}
                        </div>
                        <div className="flex gap-1 pl-2">
                            {[71, 72, 73, 74, 75].map(id => (
                                <ToothInteractiveBlock
                                    key={id} id={id} isCircle hideRM
                                    toothData={value[id.toString()] || {}}
                                    onToothClick={handleToothClick}
                                    onValueChange={handleValueChange}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lower Teeth Quadrants */}
            <div className="flex justify-center items-center gap-2 w-full">
                <LabelColumn labels={['VESTIBULAR', 'MOVILIDAD', 'RECESIÓN']} />
                <div className="flex gap-1 border-r-[3px] border-black/30 pr-2">
                    {[48, 47, 46, 45, 44, 43, 42, 41].map(id => (
                        <ToothInteractiveBlock
                            key={id} id={id} reverse
                            toothData={value[id.toString()] || {}}
                            onToothClick={handleToothClick}
                            onValueChange={handleValueChange}
                        />
                    ))}
                </div>
                <div className="flex gap-1">
                    {[31, 32, 33, 34, 35, 36, 37, 38].map(id => (
                        <ToothInteractiveBlock
                            key={id} id={id} reverse
                            toothData={value[id.toString()] || {}}
                            onToothClick={handleToothClick}
                            onValueChange={handleValueChange}
                        />
                    ))}
                </div>
            </div>

            <ToothEditorModal
                isOpen={!!selectedTooth}
                onClose={() => setSelectedTooth(null)}
                toothId={selectedTooth}
                data={value[selectedTooth] || {}}
                onConfirm={handleConfirm}
            />

            <div className="mt-12 bg-slate-100 p-8 rounded-3xl border border-slate-200 flex flex-wrap gap-10 items-center">
                <span className="text-xs font-black text-slate-800 tracking-widest uppercase">Leyenda:</span>
                <div className="flex items-center gap-2.5"><div className="w-4 h-4 bg-red-500 rounded-md border border-red-600 shadow-sm" /> <span className="text-[10px] font-bold text-slate-600 uppercase">Patología</span></div>
                <div className="flex items-center gap-2.5"><div className="w-4 h-4 bg-blue-500 rounded-md border border-blue-600 shadow-sm" /> <span className="text-[10px] font-bold text-slate-600 uppercase">Tratamiento</span></div>
                <div className="flex items-center gap-2.5"><div className="w-4 h-4 bg-yellow-400 rounded-md border border-yellow-500 shadow-sm" /> <span className="text-[10px] font-bold text-slate-600 uppercase">Pieza Especial</span></div>
                <div className="ml-auto text-[10px] font-black text-emerald-600 animate-pulse tracking-wide uppercase italic">
                    Haz clic en una pieza para abrir el editor avanzado
                </div>
            </div>
        </div>
    );
}
