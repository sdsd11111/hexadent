import React from 'react';
import Tooth5Parts from './Tooth5Parts';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const TOOTH_STATUS_OPTIONS = [
    { id: 'normal', label: 'Normal', color: 'bg-white', icon: null },
    { id: 'ausente', label: 'Ausente (X)', color: 'bg-slate-200', icon: '❌' },
    { id: 'implante', label: 'Implante (I)', color: 'bg-emerald-500', icon: 'I' },
    { id: 'corona', label: 'Corona', color: 'bg-yellow-400', icon: '👑' },
];

const ToothStatusSelector = ({ toothId, value, onChange }) => {
    const current = TOOTH_STATUS_OPTIONS.find(o => o.id === value) || TOOTH_STATUS_OPTIONS[0];

    return (
        <Popover className="relative">
            <Popover.Button className={`w-8 h-6 border rounded text-[10px] font-bold ${current.color} hover:border-blue-500`}>
                {current.id === 'normal' ? 'EST' : current.icon}
            </Popover.Button>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
            >
                <Popover.Panel className="absolute z-30 mt-1 w-24 bg-white rounded-md shadow-lg border border-slate-200 p-1">
                    {TOOTH_STATUS_OPTIONS.map(opt => (
                        <button
                            key={opt.id}
                            type="button"
                            className="flex items-center gap-2 w-full p-1 hover:bg-slate-50 text-[10px] rounded"
                            onClick={() => onChange(toothId, opt.id)}
                        >
                            <span className={`w-3 h-3 rounded-full ${opt.color} border border-slate-200`} />
                            {opt.label}
                        </button>
                    ))}
                </Popover.Panel>
            </Transition>
        </Popover>
    );
};

const ToothRow = ({ id, data = {}, onChange, isCircle = false }) => {
    const handlePartChange = (tId, newData) => {
        onChange(tId, newData);
    };

    const handleFieldChange = (field, val) => {
        onChange(id, { ...data, [field]: val });
    };

    const handleStatusChange = (tId, status) => {
        onChange(tId, { ...data, status });
    };

    return (
        <div className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0 group hover:bg-slate-50/50 transition-colors">
            <span className="text-[10px] font-bold text-slate-500 min-w-[20px]">{id}</span>

            {/* Recession & Mobility Inputs */}
            <input
                type="text"
                placeholder="R"
                className="w-7 h-6 text-[9px] border border-slate-200 rounded text-center outline-none focus:ring-1 focus:ring-blue-500"
                value={data.recesion || ''}
                onChange={(e) => handleFieldChange('recesion', e.target.value)}
            />
            <input
                type="text"
                placeholder="M"
                className="w-7 h-6 text-[9px] border border-slate-200 rounded text-center outline-none focus:ring-1 focus:ring-blue-500"
                value={data.movilidad || ''}
                onChange={(e) => handleFieldChange('movilidad', e.target.value)}
            />

            {/* Main interactive Tooth */}
            <div className="flex-1 flex justify-center">
                <Tooth5Parts
                    toothId={id}
                    data={data}
                    onChange={handlePartChange}
                    isCircle={isCircle}
                    size={28}
                />
            </div>

            {/* General Status Selector */}
            <ToothStatusSelector
                toothId={id}
                value={data.status}
                onChange={handleStatusChange}
            />
        </div>
    );
};

export default function OdontogramaVertical({ value = {}, onChange }) {
    const updateTooth = (id, newData) => {
        onChange({ ...value, [id]: newData });
    };

    const renderQuadrant = (title, ids, isCircle = false) => (
        <div className="flex flex-col bg-white p-3 rounded-xl border border-slate-200 shadow-sm h-full">
            <h3 className="text-[10px] font-black text-slate-800 border-b border-slate-100 pb-2 mb-2 uppercase tracking-tight">
                {title}
            </h3>
            <div className="flex items-center gap-2 text-[7px] font-bold text-slate-400 mb-2 px-1 uppercase">
                <span className="min-w-[20px]">ID</span>
                <span className="w-7 text-center">REC</span>
                <span className="w-7 text-center">MOV</span>
                <span className="flex-1 text-center font-black text-blue-800">PIEZA DENTAL</span>
                <span className="w-8 text-center">ESTADO</span>
            </div>
            <div className="space-y-1">
                {ids.map(id => (
                    <ToothRow
                        key={id}
                        id={id.toString()}
                        data={value[id.toString()]}
                        onChange={updateTooth}
                        isCircle={isCircle}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-h-[800px] overflow-y-auto">
                {/* Adult Top Row */}
                {renderQuadrant("Superior Derecha (Q1)", [18, 17, 16, 15, 14, 13, 12, 11])}
                {renderQuadrant("Superior Izquierda (Q2)", [21, 22, 23, 24, 25, 26, 27, 28])}

                {/* Child Top Row */}
                {renderQuadrant("Temporal Sup. Der. (Q5)", [55, 54, 53, 52, 51], true)}
                {renderQuadrant("Temporal Sup. Izq. (Q6)", [61, 62, 63, 64, 65], true)}

                {/* Child Bottom Row */}
                {renderQuadrant("Temporal Inf. Der. (Q8)", [85, 84, 83, 82, 81], true)}
                {renderQuadrant("Temporal Inf. Izq. (Q7)", [71, 72, 73, 74, 75], true)}

                {/* Adult Bottom Row */}
                {renderQuadrant("Inferior Derecha (Q4)", [48, 47, 46, 45, 44, 43, 42, 41])}
                {renderQuadrant("Inferior Izquierda (Q3)", [31, 32, 33, 34, 35, 36, 37, 38])}
            </div>

            <div className="mt-8 bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-6 items-center shadow-sm">
                <div className="flex items-center gap-2 border-r pr-6">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Leyenda</span>
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-sm" />
                        <span className="text-[10px] font-medium text-slate-600 uppercase">Caries</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                        <span className="text-[10px] font-medium text-slate-600 uppercase">Obturado</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                        <span className="text-[10px] font-black italic uppercase">Clic en cada cara para marcar</span>
                    </div>
                </div>
                <div className="ml-auto text-[10px] font-bold text-blue-800 uppercase italic bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    Pintar con azul para marcar tratamiento realizado
                </div>
            </div>
        </div>
    );
}
