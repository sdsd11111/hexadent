'use client';

import { useState, useEffect } from 'react';
import {
    ClockIcon,
    UserIcon,
    ChatBubbleLeftRightIcon,
    ArrowPathIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function AgendamientoPage() {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // In a real app, this would be an API call
    // For now, we'll try to fetch the logs from a temporary endpoint or just mock them
    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000); // Polling
        return () => clearInterval(interval);
    }, []);

    const fetchLogs = async () => {
        try {
            // We'll create a simple API route for this too
            const res = await fetch('/api/admin/chatbot-logs');
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setIsLoading(false);
        }
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

            {/* Calendar Integration */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-12">
                <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="font-bold text-gray-800 flex items-center gap-3 text-lg">
                        <ClockIcon className="h-6 w-6 text-blue-600" />
                        Agenda de Citas y Disponibilidad
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                            Sincronizado con Google
                        </span>
                    </div>
                </div>
                <div className="w-full" style={{ height: '700px' }}>
                    <iframe
                        src="https://calendar.google.com/calendar/embed?src=cristhopheryeah113%40gmail.com&ctz=America%2FGuayaquil"
                        style={{ border: 0 }}
                        className="w-full h-full"
                        frameBorder="0"
                        scrolling="no"
                    ></iframe>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats */}
                <div className="lg:col-span-1 space-y-6">

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Resumen</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Total Consultas</span>
                                <span className="font-bold text-blue-600">{logs.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Citas por confirmar</span>
                                <span className="font-bold text-orange-600">--</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl">
                        <h3 className="font-bold mb-2">Recordatorio</h3>
                        <p className="text-blue-100 text-sm leading-relaxed">
                            Recuerda que el bot guía al paciente. Si detectas una urgencia en los logs, puedes intervenir manualmente desde la App de WhatsApp Business.
                        </p>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />
                                Últimas Interacciones
                            </h2>
                            <button
                                onClick={fetchLogs}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                                <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4">Paciente / Hora</th>
                                        <th className="px-6 py-4">Mensaje Usuario</th>
                                        <th className="px-6 py-4">Respuesta Bot</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center text-gray-400 italic">
                                                No hay interacciones registradas aún.
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{log.phone}</span>
                                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                            <ClockIcon className="h-3 w-3" />
                                                            {new Date(log.timestamp).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-sm text-gray-600 max-w-xs">{log.userMsg}</p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-start gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                                            <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <p className="text-sm text-gray-500 italic line-clamp-2">{log.botResp}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
