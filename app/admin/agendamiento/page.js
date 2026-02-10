'use client';

import { useState, useEffect } from 'react';
import {
    ClockIcon,
    ArrowPathIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import Calendar from '@/components/Calendar';

export default function AgendamientoPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [evolutionStatus, setEvolutionStatus] = useState({ status: 'loading', qr: null });
    const [ignoredNumbers, setIgnoredNumbers] = useState([]);
    const [newIgnoredNumber, setNewIgnoredNumber] = useState('');

    useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchAll, 10000); // Polling
        return () => clearInterval(interval);
    }, []);

    const fetchAll = () => {
        fetchEvolutionStatus();
        fetchIgnoredNumbers();
    };

    const fetchEvolutionStatus = async () => {
        try {
            const res = await fetch('/api/admin/evolution');
            const data = await res.json();
            setEvolutionStatus(data);
        } catch (e) {
            console.error("Error fetching evolution status:", e);
        }
    };

    const fetchIgnoredNumbers = async () => {
        try {
            const res = await fetch('/api/admin/ignored-numbers');
            const data = await res.json();
            setIgnoredNumbers(data || []);
        } catch (e) {
            console.error("Error fetching ignored numbers:", e);
        }
    };

    const handleAddIgnored = async () => {
        if (!newIgnoredNumber) return;
        const cleanPhone = newIgnoredNumber.replace(/\D/g, '');
        if (!cleanPhone) return;

        await fetch('/api/admin/ignored-numbers', {
            method: 'POST',
            body: JSON.stringify({ phone: cleanPhone, action: 'add' })
        });
        setNewIgnoredNumber('');
        fetchIgnoredNumbers();
    };

    const handleRemoveIgnored = async (phone) => {
        await fetch('/api/admin/ignored-numbers', {
            method: 'POST',
            body: JSON.stringify({ phone, action: 'remove' })
        });
        fetchIgnoredNumbers();
    };


    return (
        <div className="max-w-7xl mx-auto pb-20">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Monitor de Chatbot</h1>
                    <p className="text-gray-600">Seguimiento en tiempo real de interacciones por WhatsApp</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider border border-green-100">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Bot Activo
                </div>
            </div>

            {/* Internal Calendar Integration */}
            <div className="mb-12">
                <Calendar isAdmin={true} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Evolution API Connection */}
                <div className="space-y-6">
                    {/* Conexión WhatsApp */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="w-2 h-8 bg-blue-600 rounded-full" />
                            Conexión WhatsApp
                        </h3>
                        <div className="flex flex-col items-center gap-6 py-4">
                            {evolutionStatus.status === 'open' ? (
                                <div className="text-center p-8 bg-green-50 rounded-3xl w-full border border-green-100">
                                    <div className="bg-green-500 text-white px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest inline-block mb-4">
                                        Bot Conectado
                                    </div>
                                    <p className="text-gray-600 font-medium">Instancia activa: <span className="text-blue-600">{evolutionStatus.instance}</span></p>
                                    <p className="text-xs text-gray-400 mt-2">El bot está listo para procesar citas.</p>

                                    <button
                                        onClick={async () => {
                                            if (confirm('¿Estás seguro de cerrar sesión en WhatsApp?')) {
                                                await fetch('/api/admin/evolution', {
                                                    method: 'POST',
                                                    body: JSON.stringify({ action: 'logout' })
                                                });
                                                fetchEvolutionStatus();
                                            }
                                        }}
                                        className="mt-6 text-xs text-red-500 font-bold uppercase tracking-widest hover:underline"
                                    >
                                        Cerrar Sesión WhatsApp
                                    </button>
                                </div>
                            ) : evolutionStatus.qr ? (
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-4 font-bold">Escanea con tu WhatsApp Business:</p>
                                    <div className="p-4 bg-white border-4 border-dashed border-blue-100 rounded-3xl shadow-inner">
                                        {evolutionStatus.qr.length > 100 ? (
                                            <img
                                                src={evolutionStatus.qr.includes('base64') ? evolutionStatus.qr : `data:image/png;base64,${evolutionStatus.qr}`}
                                                alt="WhatsApp QR"
                                                className="w-64 h-64 object-contain"
                                            />
                                        ) : (
                                            <div className="w-64 h-64 flex flex-col items-center justify-center p-4">
                                                <p className="text-[10px] text-gray-400 mb-2">Código de conexión:</p>
                                                <code className="text-xs break-all bg-gray-50 p-2 rounded border border-gray-100">{evolutionStatus.qr}</code>
                                                <p className="text-[10px] text-blue-500 mt-4 font-bold">Intenta recargar para ver el código QR</p>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={fetchEvolutionStatus}
                                        className="mt-6 text-xs text-blue-600 font-bold uppercase tracking-widest hover:underline"
                                    >
                                        Recargar Estado / QR
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <ArrowPathIcon className="h-12 w-12 text-blue-200 animate-spin mx-auto" />
                                    <p className="text-sm text-gray-400 mt-4">Obteniendo QR de Evolution API...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Exclusion and Stats */}
                <div className="space-y-6">
                    {/* Blacklist / Ignored Numbers */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="w-2 h-8 bg-red-500 rounded-full" />
                            Exclusión del Bot
                        </h3>
                        <div className="space-y-4">
                            <p className="text-xs text-gray-500 mb-2">Ingresa los números a los que el bot NO debe contestar automáticamente.</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Número (ej. 593963410409)"
                                    className="flex-1 text-sm border-2 border-gray-100 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-0 transition-all font-bold"
                                    value={newIgnoredNumber}
                                    onChange={(e) => setNewIgnoredNumber(e.target.value)}
                                />
                                <button
                                    onClick={handleAddIgnored}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                                >
                                    Añadir
                                </button>
                            </div>
                            <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {ignoredNumbers.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 italic text-gray-400 text-sm">
                                        No hay números en la lista negra.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {ignoredNumbers.map(phone => (
                                            <div key={phone} className="flex items-center justify-between bg-gray-50 hover:bg-red-50 px-4 py-3 rounded-2xl group transition-all">
                                                <span className="text-sm font-bold text-gray-700">{phone}</span>
                                                <button
                                                    onClick={() => handleRemoveIgnored(phone)}
                                                    className="text-gray-300 hover:text-red-500 font-bold p-1"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-black uppercase tracking-widest text-blue-200 text-xs mb-2">Recordatorio Importante</h3>
                            <p className="text-sm leading-relaxed opacity-90 font-medium">
                                Monitorea los chats desde tu móvil para emergencias o casos especiales.
                            </p>
                        </div>
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
