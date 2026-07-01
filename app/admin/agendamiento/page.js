'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    ArrowPathIcon,
    MagnifyingGlassIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import Calendar from '@/components/Calendar';

/**
 * CRITICAL FIX for "No se pudo vincular":
 * 
 * The old code polled /api/admin/evolution every 20s, which called
 * /instance/connect/ on Evolution API — generating a NEW QR each time
 * and invalidating the one being scanned.
 * 
 * New approach:
 *   1. Poll /api/admin/evolution (status only) every 5s — this NEVER generates a QR
 *   2. Request QR ONCE via /api/admin/evolution?action=qr — only when needed
 *   3. Keep showing the same QR until connected or user manually refreshes
 */

export default function AgendamientoPage() {
    const [evolutionStatus, setEvolutionStatus] = useState({ status: 'loading', qr: null });
    const [currentQr, setCurrentQr] = useState(null);       // Cached QR image
    const [qrRequested, setQrRequested] = useState(false);   // Whether we already asked for a QR
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [ignoredNumbers, setIgnoredNumbers] = useState([]);
    const [newIgnoredNumber, setNewIgnoredNumber] = useState('');
    const [newIgnoredName, setNewIgnoredName] = useState('');
    const [editingPhone, setEditingPhone] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [ignoredSearch, setIgnoredSearch] = useState('');

    // --- SEARCH STATE: Buscador de citas por nombre o cédula ---
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    // Función de búsqueda
    const handleSearch = useCallback(async (query) => {
        if (!query || query.trim().length < 2) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }
        
        setIsSearching(true);
        try {
            const res = await fetch(`/api/admin/calendar/appointments?q=${encodeURIComponent(query.trim())}`);
            const data = await res.json();
            setSearchResults(Array.isArray(data) ? data : []);
            setShowSearchResults(true);
        } catch (e) {
            console.error("Error en búsqueda:", e);
            setSearchResults([]);
        }
        setIsSearching(false);
    }, []);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length >= 2) {
                handleSearch(searchQuery);
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, handleSearch]);

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
    };

    // --- STATUS POLLING: Only checks connection state, never touches QR ---
    const checkStatus = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/evolution');
            const data = await res.json();
            setEvolutionStatus(data);

            // If connected, clear QR
            if (data.status === 'open' || data.status === 'CONNECTED' || data.status === 'connected') {
                setCurrentQr(null);
                setQrRequested(false);
            }
        } catch (e) {
            console.error("Error checking status:", e);
        }
    }, []);

    // --- QR REQUEST: Only called once, or when user explicitly refreshes ---
    const requestQr = useCallback(async () => {
        try {
            console.log("[QR] Requesting fresh QR code...");
            const res = await fetch('/api/admin/evolution?action=qr');
            const data = await res.json();
            if (data.qr) {
                setCurrentQr(data.qr);
                setQrRequested(true);
                console.log("[QR] Got QR code successfully");
            } else {
                console.log("[QR] No QR in response, status:", data.status);
            }
        } catch (e) {
            console.error("Error requesting QR:", e);
        }
    }, []);

    // --- Initial load + polling ---
    useEffect(() => {
        checkStatus();
        fetchIgnoredNumbers();

        // Poll STATUS every 5 seconds (this is safe — no QR generation)
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // --- Auto-request QR only when DISCONNECTED (not on transient states like 'connecting') ---
    useEffect(() => {
        const isConnected = ['open', 'CONNECTED', 'connected'].includes(evolutionStatus.status);
        const isDisconnected = !isConnected && evolutionStatus.status !== 'loading';
        const needsQr = isDisconnected && !currentQr && !qrRequested && evolutionStatus.status !== 'loading';

        if (needsQr) {
            requestQr();
        }
    }, [evolutionStatus.status, currentQr, qrRequested, requestQr]);

    // --- ACTIONS: logout, restart, full_reset ---
    const handleAction = async (action, confirmMsg) => {
        if (confirmMsg && !confirm(confirmMsg)) return;
        setIsActionLoading(true);
        try {
            const res = await fetch('/api/admin/evolution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });

            if (res.ok) {
                // Clear cached QR so a new one gets requested
                setCurrentQr(null);
                setQrRequested(false);

                // Wait for the action to take effect, then refresh
                setTimeout(async () => {
                    await checkStatus();
                    setIsActionLoading(false);
                }, action === 'full_reset' ? 6000 : 3000);
            } else {
                setIsActionLoading(false);
            }
        } catch (e) {
            console.error("Error en acción:", e);
            setIsActionLoading(false);
        }
    };

    // --- Manual QR refresh (clears cache and requests new) ---
    const handleRefreshQr = async () => {
        setIsActionLoading(true);
        setCurrentQr(null);
        setQrRequested(false);
        await requestQr();
        setIsActionLoading(false);
    };

    // --- Ignored numbers ---
    const fetchIgnoredNumbers = async () => {
        try {
            const res = await fetch('/api/admin/ignored-numbers');
            const data = await res.json();
            setIgnoredNumbers(Array.isArray(data) ? data : []);
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
            body: JSON.stringify({ 
                phone: cleanPhone, 
                name: newIgnoredName || 'Sin Nombre',
                action: 'add' 
            })
        });
        setNewIgnoredNumber('');
        setNewIgnoredName('');
        fetchIgnoredNumbers();
    };

    const handleRemoveIgnored = async (phone) => {
        await fetch('/api/admin/ignored-numbers', {
            method: 'POST',
            body: JSON.stringify({ phone, action: 'remove' })
        });
        fetchIgnoredNumbers();
    };

    const handleStartEdit = (item) => {
        setEditingPhone(item.phone);
        setEditingName(item.name || '');
    };

    const handleSaveEdit = async () => {
        if (!editingPhone) return;
        await fetch('/api/admin/ignored-numbers', {
            method: 'POST',
            body: JSON.stringify({ 
                phone: editingPhone, 
                name: editingName || 'Sin Nombre',
                action: 'add' 
            })
        });
        setEditingPhone(null);
        setEditingName('');
        fetchIgnoredNumbers();
    };

    // Determine display state
    const isConnected = ['open', 'CONNECTED', 'connected'].includes(evolutionStatus.status);
    const qrToShow = currentQr;

    return (
        <div className="max-w-7xl mx-auto pb-20 px-3 lg:px-4">
            <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 lg:gap-0">
                <div>
                    <h1 className="text-xl lg:text-3xl font-bold text-gray-900 mb-1 lg:mb-2">Monitor de Chatbot</h1>
                    <p className="text-xs lg:text-sm text-gray-600">Seguimiento en tiempo real de interacciones por WhatsApp</p>
                </div>
                <div className={`flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-[9px] lg:text-xs font-bold uppercase tracking-wider border self-start sm:self-auto ${
                    isConnected
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                }`}>
                    <span className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    {isConnected ? 'Bot Conectado' : 'Desconectado'}
                </div>
            </div>

            {/* BUSCADOR DE CITAS */}
            <div className="mb-6 bg-white p-4 lg:p-6 rounded-2xl border border-gray-100 shadow-lg">
                <h3 className="text-sm lg:text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <MagnifyingGlassIcon className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                    Buscar Citas por Nombre o Cédula
                </h3>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Ingresa nombre o número de cédula..."
                        className="w-full text-xs lg:text-sm border-2 border-gray-100 rounded-xl lg:rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-0 transition-all font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                    />
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    )}
                    {isSearching && (
                        <div className="absolute right-10 top-1/2 -translate-y-1/2">
                            <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
                        </div>
                    )}
                </div>
                
                {/* RESULTADOS DE BÚSQUEDA */}
                {showSearchResults && (
                    <div className="mt-3 border-t border-gray-100 pt-3 max-h-64 overflow-y-auto">
                        {searchResults.length === 0 ? (
                            <p className="text-xs text-gray-500 text-center py-4">No se encontraron citas</p>
                        ) : (
                            <div className="space-y-2">
                                {searchResults
                                    .filter(appt => appt.status !== 'no-show')
                                    .map((appt) => {
                                    // Solo verde (scheduled/completed) y rojo (cancelled)
                                    const isCancelled = appt.status === 'cancelled';
                                    const statusBadge = isCancelled 
                                        ? { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelada' }
                                        : { bg: 'bg-green-100', text: 'text-green-700', label: appt.status === 'completed' ? 'Completada' : 'Programada' };
                                    
                                    return (
                                    <div key={appt.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl text-xs lg:text-sm">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-bold text-gray-800">{appt.patient_name}</p>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge.bg} ${statusBadge.text}`}>
                                                    {statusBadge.label}
                                                </span>
                                            </div>
                                            <p className="text-gray-500">Cédula: {appt.patient_cedula}</p>
                                            <p className="text-gray-500">Teléfono: {appt.patient_phone}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-blue-600">
                                                {appt.appointment_date ? new Date(`${appt.appointment_date.split('T')[0]}T12:00:00`).toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Sin fecha'}
                                            </p>
                                            <p className="text-blue-600 font-bold">{appt.appointment_time || '--:--'}</p>
                                            <p className="text-gray-400 text-[10px]">{appt.motive || 'Consulta'}</p>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Internal Calendar Integration */}
            <div className="mb-12">
                <Calendar isAdmin={true} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                {/* Evolution API Connection */}
                <div className="space-y-4 lg:space-y-6">
                    {/* Conexión WhatsApp */}
                    <div className="bg-white p-4 lg:p-8 rounded-2xl lg:rounded-3xl border border-gray-100 shadow-lg lg:shadow-xl">
                        <h3 className="text-sm lg:text-lg font-bold text-gray-800 mb-4 lg:mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-6 lg:w-2 lg:h-8 bg-blue-600 rounded-full" />
                            Conexión WhatsApp
                        </h3>
                        <div className="flex flex-col items-center gap-4 lg:gap-6 py-2 lg:py-4">
                            {isConnected ? (
                                /* --- CONNECTED STATE --- */
                                <div className="text-center p-4 lg:p-8 bg-green-50 rounded-2xl lg:rounded-3xl w-full border border-green-100">
                                    <div className="bg-green-500 text-white px-4 lg:px-6 py-1.5 lg:py-2 rounded-full text-[10px] lg:text-sm font-black uppercase tracking-widest inline-block mb-3 lg:mb-4">
                                        Bot Conectado
                                    </div>
                                    <p className="text-xs lg:text-sm text-gray-600 font-medium">Instancia activa: <span className="text-blue-600">{evolutionStatus.instance}</span></p>
                                    <p className="text-[10px] lg:text-xs text-gray-400 mt-2">El bot está listo para procesar citas.</p>

                                    <button
                                        onClick={() => handleAction('logout', '¿Estás seguro de cerrar sesión en WhatsApp?')}
                                        disabled={isActionLoading}
                                        className="mt-4 lg:mt-6 text-[10px] lg:text-xs text-red-500 font-bold uppercase tracking-widest hover:underline disabled:opacity-50"
                                    >
                                        {isActionLoading ? <ArrowPathIcon className="h-3 w-3 lg:h-4 lg:w-4 animate-spin inline" /> : 'Cerrar Sesión WhatsApp'}
                                    </button>
                                </div>
                            ) : qrToShow ? (
                                /* --- QR CODE VISIBLE: User should scan NOW --- */
                                <div className="text-center w-full">
                                    <p className="text-xs lg:text-sm text-gray-600 mb-2 font-bold">Escanea con tu WhatsApp Business:</p>
                                    <p className="text-[9px] lg:text-xs text-amber-600 mb-3 lg:mb-4 font-medium bg-amber-50 px-2 lg:px-3 py-1 rounded-full inline-block">
                                        ⚠️ No recargues la página mientras escaneas
                                    </p>
                                    <div className="p-3 lg:p-4 bg-white border-4 border-dashed border-blue-100 rounded-2xl lg:rounded-3xl shadow-inner mb-4">
                                        <img
                                            src={qrToShow.startsWith('data:') ? qrToShow : `data:image/png;base64,${qrToShow}`}
                                            alt="WhatsApp QR"
                                            className="w-48 h-48 lg:w-64 lg:h-64 object-contain mx-auto"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={handleRefreshQr}
                                            disabled={isActionLoading}
                                            className="w-full py-2.5 lg:py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl lg:rounded-2xl text-[11px] lg:text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isActionLoading ? <ArrowPathIcon className="h-3 w-3 lg:h-4 lg:w-4 animate-spin" /> : 'OBTENER NUEVO QR'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* --- LOADING / WAITING FOR QR --- */
                                <div className="text-center py-8 lg:py-12">
                                    <ArrowPathIcon className="h-8 w-8 lg:h-12 lg:w-12 text-blue-200 animate-spin mx-auto" />
                                    <p className="text-[11px] lg:text-sm text-gray-400 mt-3 lg:mt-4">Obteniendo QR de Evolution API...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Exclusion and Stats */}
                <div className="space-y-4 lg:space-y-6">
                    {/* Blacklist / Ignored Numbers */}
                    <div className="bg-white p-4 lg:p-8 rounded-2xl lg:rounded-3xl border border-gray-100 shadow-lg lg:shadow-xl">
                        <h3 className="text-sm lg:text-lg font-bold text-gray-800 mb-4 lg:mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-6 lg:w-2 lg:h-8 bg-red-500 rounded-full" />
                            Exclusión del Bot
                        </h3>
                        <div className="space-y-3 lg:space-y-4">
                            <p className="text-[10px] lg:text-xs text-gray-500 mb-2">Ingresa los números a los que el bot NO debe contestar automáticamente.</p>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="Nombre (ej. Doctora)"
                                    className="flex-1 text-xs lg:text-sm border-2 border-gray-100 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2.5 lg:py-3 focus:outline-none focus:border-blue-500 focus:ring-0 transition-all font-medium"
                                    value={newIgnoredName}
                                    onChange={(e) => setNewIgnoredName(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Número (ej. 593963410409)"
                                    className="flex-1 text-xs lg:text-sm border-2 border-gray-100 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2.5 lg:py-3 focus:outline-none focus:border-blue-500 focus:ring-0 transition-all font-bold"
                                    value={newIgnoredNumber}
                                    onChange={(e) => setNewIgnoredNumber(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleAddIgnored}
                                className="w-full bg-blue-600 text-white px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-sm uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                            >
                                Añadir a Exclusión
                            </button>
                        </div>
                            <div className="max-h-48 lg:max-h-60 overflow-y-auto pr-1 lg:pr-2 custom-scrollbar">
                                {/* Buscador de excluidos */}
                                {ignoredNumbers.length > 0 && (
                                    <div className="relative mb-2">
                                        <input
                                            type="text"
                                            placeholder="Buscar por nombre o número..."
                                            className="w-full text-[10px] lg:text-xs border-2 border-gray-100 rounded-xl px-3 py-2 focus:outline-none focus:border-red-300 focus:ring-0 transition-all font-medium"
                                            value={ignoredSearch}
                                            onChange={(e) => setIgnoredSearch(e.target.value)}
                                        />
                                    </div>
                                )}
                                {ignoredNumbers.length === 0 ? (
                                    <div className="text-center py-6 lg:py-8 bg-gray-50 rounded-xl lg:rounded-2xl border-2 border-dashed border-gray-100 italic text-gray-400 text-xs lg:text-sm">
                                        No hay números en la lista negra.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-1.5 lg:gap-2">
                                        {ignoredNumbers
                                            .filter(item => {
                                                if (!ignoredSearch) return true;
                                                const q = ignoredSearch.toLowerCase();
                                                return (item.name || '').toLowerCase().includes(q) || 
                                                       (item.phone || '').includes(q);
                                            })
                                            .map(item => (
                                            <div key={item.phone} className="flex items-center justify-between bg-gray-50 hover:bg-blue-50 px-3 lg:px-4 py-2 lg:py-3 rounded-xl lg:rounded-2xl group transition-all border-2 border-transparent hover:border-blue-100">
                                                {editingPhone === item.phone ? (
                                                    <div className="flex-1 flex gap-2 mr-2">
                                                        <input 
                                                            className="flex-1 text-xs lg:text-sm border-2 border-blue-200 rounded-xl px-2 lg:px-3 py-1 focus:outline-none bg-white font-bold"
                                                            placeholder="Editar nombre..."
                                                            value={editingName}
                                                            onChange={(e) => setEditingName(e.target.value)}
                                                            autoFocus
                                                        />
                                                        <button onClick={handleSaveEdit} className="text-green-600 font-black text-[9px] lg:text-xs uppercase">Guardar</button>
                                                        <button onClick={() => setEditingPhone(null)} className="text-gray-400 font-black text-[9px] lg:text-xs uppercase">X</button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-blue-500 truncate">{item.name || 'Sin Nombre'}</span>
                                                        <span className="text-xs lg:text-sm font-bold text-gray-700">{item.phone}</span>
                                                    </div>
                                                )}
                                                
                                                <div className="flex gap-2 lg:gap-3 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                                    {editingPhone !== item.phone && (
                                                        <button
                                                            onClick={() => handleStartEdit(item)}
                                                            className="text-blue-400 hover:text-blue-600 font-bold p-1 text-[8px] lg:text-[10px] uppercase tracking-tighter"
                                                        >
                                                            Editar
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleRemoveIgnored(item.phone)}
                                                        className="text-gray-300 hover:text-red-500 font-bold p-1 text-[8px] lg:text-[10px] uppercase tracking-tighter"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
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
