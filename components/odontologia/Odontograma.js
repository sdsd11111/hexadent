import React, { useState } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const STATES = [
    { id: 'normal', label: 'Normal', color: 'bg-white', icon: null },
    { id: 'caries', label: 'Caries', color: 'bg-red-500', icon: '🔴' },
    { id: 'obturado', label: 'Obturado', color: 'bg-blue-500', icon: '🔵' },
    { id: 'ausente', label: 'Ausente', color: 'bg-slate-200', icon: '❌' },
    { id: 'corona', label: 'Corona', color: 'bg-yellow-400', icon: '👑' },
    { id: 'implante', label: 'Implante', color: 'bg-emerald-500', icon: 'I' },
    { id: 'fractura', label: 'Fractura', color: 'bg-orange-500', icon: '⚡' },
];

const Tooth = ({ id, value, onChange }) => {
    const currentStatus = STATES.find(s => s.id === value) || STATES[0];

    return (
        <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-slate-500">{id}</span>
            <Popover className="relative">
                <Popover.Button
                    className={`w-8 h-8 rounded border border-slate-300 flex items-center justify-center transition-all hover:border-blue-500 shadow-sm ${currentStatus.color}`}
                >
                    <span className="text-[10px] font-bold">
                        {currentStatus.icon}
                    </span>
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
                    <Popover.Panel className="absolute z-10 mt-2 w-40 transform px-4 sm:px-0 lg:max-w-3xl left-1/2 -translate-x-1/2">
                        <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="relative grid gap-1 bg-white p-2">
                                {STATES.map((state) => (
                                    <button
                                        key={state.id}
                                        onClick={() => onChange(id, state.id)}
                                        className="flex items-center gap-2 p-1.5 hover:bg-slate-50 transition-colors text-left rounded"
                                    >
                                        <div className={`w-3 h-3 rounded-full ${state.color} border border-slate-200`} />
                                        <span className="text-[10px] font-medium text-slate-700">{state.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Popover.Panel>
                </Transition>
            </Popover>
        </div>
    );
};

export default function Odontograma({ value = {}, onChange }) {
    const handleToothChange = (id, status) => {
        onChange({ ...value, [id]: status });
    };

    const renderQuadrant = (teeth, reverse = false) => {
        const list = reverse ? [...teeth].reverse() : teeth;
        return (
            <div className="flex gap-1.5">
                {list.map(id => (
                    <Tooth key={id} id={id.toString()} value={value[id.toString()]} onChange={handleToothChange} />
                ))}
            </div>
        );
    };

    return (
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <div className="min-w-[600px] flex flex-col gap-8">
                {/* Superior Row */}
                <div className="flex justify-center gap-12 border-b border-slate-100 pb-4">
                    {/* Q1: 18 -> 11 */}
                    <div>
                        <h4 className="text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-tighter">Superior Derecha (Q1)</h4>
                        {renderQuadrant([18, 17, 16, 15, 14, 13, 12, 11])}
                    </div>
                    {/* Q2: 21 -> 28 */}
                    <div>
                        <h4 className="text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-tighter">Superior Izquierda (Q2)</h4>
                        {renderQuadrant([21, 22, 23, 24, 25, 26, 27, 28])}
                    </div>
                </div>

                {/* Inferior Row */}
                <div className="flex justify-center gap-12">
                    {/* Q4: 48 -> 41 (Visualized left side) */}
                    <div>
                        {renderQuadrant([48, 47, 46, 45, 44, 43, 42, 41])}
                        <h4 className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tighter text-right">Inferior Derecha (Q4)</h4>
                    </div>
                    {/* Q3: 31 -> 38 */}
                    <div>
                        {renderQuadrant([31, 32, 33, 34, 35, 36, 37, 38])}
                        <h4 className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">Inferior Izquierda (Q3)</h4>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-slate-100 text-[10px]">
                {STATES.map(s => (
                    <div key={s.id} className="flex items-center gap-1.5 grayscale-[0.5]">
                        <div className={`w-3 h-3 rounded-sm ${s.color} border border-slate-200`} />
                        <span className="text-slate-600 font-medium">{s.label}</span>
                    </div>
                ))}
                <span className="ml-auto text-blue-600 font-bold uppercase italic">
                    Pintar con azul para marcar tratamiento realizado
                </span>
            </div>
        </div>
    );
}
