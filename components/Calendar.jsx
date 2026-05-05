'use client';

import { useState, useEffect } from 'react';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    CalendarIcon,
    LockClosedIcon,
    LockOpenIcon,
    UserIcon,
    ClockIcon,
    PhoneIcon,
    ChatBubbleBottomCenterTextIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function Calendar({ isAdmin = false }) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [blockedDates, setBlockedDates] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [showBookingForm, setShowBookingForm] = useState(false);
    const [bookingSlot, setBookingSlot] = useState(null);
    const [customTime, setCustomTime] = useState('');
    const [bookingData, setBookingData] = useState({
        name: '',
        cedula: '',
        age: '',
        phone: '',
        motive: '',
        endTime: '',
        isSpecial: false
    });

    // Helper: detect if a time falls outside normal business hours
    const checkIfSpecial = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return false;
        const d = new Date(dateStr + 'T12:00:00-05:00');
        const day = d.getDay();
        const [h, m] = timeStr.split(':').map(Number);
        const mins = h * 60 + m;
        
        if (day === 0) return true; // Sunday - always special
        if (day === 6) { // Saturday: normal 08:30-15:00
            const isNormal = mins >= (8*60+30) && mins < (15*60);
            return !isNormal;
        }
        // Weekdays: normal 09:00-13:00 and 15:00-18:00
        const isMorning = mins >= (9*60) && mins < (13*60);
        const isAfternoon = mins >= (15*60) && mins < (18*60);
        return !isMorning && !isAfternoon;
    };

    useEffect(() => {
        fetchMetadata();
    }, [currentMonth, currentYear]);

    useEffect(() => {
        if (selectedDate) {
            fetchDayDetails(selectedDate);
            setShowBookingForm(false);
            setBookingSlot(null);
        }
    }, [selectedDate]);

    const fetchMetadata = async () => {
        setIsLoading(true);
        try {
            const blockedRes = await fetch('/api/admin/calendar/blocked-dates');
            const blockedData = await blockedRes.json();
            setBlockedDates(blockedData.map(d => d.blocked_date.split('T')[0]));

            if (isAdmin) {
                const appRes = await fetch(`/api/admin/calendar/appointments`);
                const appData = await appRes.json();
                setAppointments(appData);
            }
        } catch (e) {
            console.error("Error fetching calendar metadata:", e);
        }
        setIsLoading(false);
    };

    const fetchDayDetails = async (dateStr) => {
        setIsLoading(true);
        try {
            // Both admin and public need availability for booking, but admin might need more for listing
            const availRes = await fetch(`/api/calendar/availability?date=${dateStr}${isAdmin ? '&isAdmin=true' : ''}`);
            const availData = await availRes.json();
            setAvailableSlots(availData.slots || []);

            if (isAdmin) {
                const res = await fetch(`/api/admin/calendar/appointments?date=${dateStr}`);
                const data = await res.json();
                setAppointments(prev => {
                    const otherDays = prev.filter(a => a.appointment_date.split('T')[0] !== dateStr);
                    return [...otherDays, ...data];
                });
            }
        } catch (e) {
            console.error("Error fetching day details:", e);
        }
        setIsLoading(false);
    };

    const handleManualBook = async (e) => {
        e.preventDefault();
        const finalTime = customTime || bookingSlot;
        if (!finalTime) { alert('Selecciona o escribe una hora.'); return; }
        
        // Calculate duration from start time to end time
        let duration = 45;
        if (bookingData.endTime) {
            const [startH, startM] = finalTime.split(':').map(Number);
            const [endH, endM] = bookingData.endTime.split(':').map(Number);
            const startMin = startH * 60 + startM;
            const endMin = endH * 60 + endM;
            const diff = endMin - startMin;
            if (diff <= 0) { alert('La hora de fin debe ser después de la hora de inicio.'); setIsLoading(false); return; }
            duration = diff;
        }
        
        // Mark special appointments with [ESPECIAL] prefix in motive
        const finalMotive = bookingData.isSpecial
            ? `[ESPECIAL] ${bookingData.motive}`
            : bookingData.motive;
        
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/calendar/book', {
                method: 'POST',
                body: JSON.stringify({
                    ...bookingData,
                    date: selectedDate,
                    time: finalTime,
                    motive: finalMotive,
                    duration
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Cita agendada con éxito');
                setShowBookingForm(false);
                setBookingSlot(null);
                setCustomTime('');
                setBookingData({ name: '', cedula: '', age: '', phone: '', motive: '', endTime: '', isSpecial: false });
                fetchDayDetails(selectedDate);
                fetchMetadata(); // Update markers
            } else {
                alert('Error: ' + data.error);
            }
        } catch (e) {
            alert('Error al agendar: ' + e.message);
        }
        setIsLoading(false);
    };

    const handleCancelAppointment = async (id) => {
        if (!confirm('¿Estás seguro de cancelar esta cita?')) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/calendar/appointments', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'cancelled' })
            });
            const data = await res.json();
            if (data.success) {
                fetchDayDetails(selectedDate);
                fetchMetadata(); // Update markers
            } else {
                alert('Error al cancelar: ' + data.error);
            }
        } catch (e) {
            alert('Error al conectar con el servidor');
        }
        setIsLoading(false);
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleBlockDate = async (dateStr) => {
        if (!isAdmin) return;
        const isBlocked = blockedDates.includes(dateStr);
        try {
            if (isBlocked) {
                await fetch(`/api/admin/calendar/blocked-dates?date=${dateStr}`, { method: 'DELETE' });
            } else {
                await fetch(`/api/admin/calendar/blocked-dates`, {
                    method: 'POST',
                    body: JSON.stringify({ date: dateStr, reason: 'Manual Block' })
                });
            }
            fetchMetadata();
        } catch (e) {
            console.error("Error toggling block date:", e);
        }
    };

    // Calendar logic
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const calendarDays = [];
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        calendarDays.push({ day: prevMonthDays - i, currentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push({ day: i, currentMonth: true });
    }

    const isPastSelected = selectedDate ? new Date(selectedDate) < new Date(today.toISOString().split('T')[0]) : false;

    return (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 animate-fade-in">
            <div className="flex-1 bg-white rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-secondary to-blue-900 p-3 lg:p-6 flex items-center justify-between text-white">
                    <button onClick={prevMonth} className="p-1.5 lg:p-2 hover:bg-white/10 rounded-full transition-all">
                        <ChevronLeftIcon className="h-5 w-5 lg:h-6 lg:w-6" />
                    </button>
                    <h2 className="text-sm lg:text-xl font-black uppercase tracking-widest">
                        {MONTHS[currentMonth]} {currentYear}
                    </h2>
                    <button onClick={nextMonth} className="p-1.5 lg:p-2 hover:bg-white/10 rounded-full transition-all">
                        <ChevronRightIcon className="h-5 w-5 lg:h-6 lg:w-6" />
                    </button>
                </div>

                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                    {DAYS.map(day => (
                        <div key={day} className="py-2 lg:py-3 text-center text-[9px] lg:text-[10px] font-black uppercase text-gray-400 tracking-tighter">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 border-collapse">
                    {calendarDays.map((d, i) => {
                        const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${d.day.toString().padStart(2, '0')}`;
                        const isBlocked = blockedDates.includes(dateStr);
                        const isSelected = selectedDate === dateStr;
                        const isToday = today.toISOString().split('T')[0] === dateStr;
                        const isPast = new Date(dateStr) < new Date(today.toISOString().split('T')[0]);
                        const isSunday = (i % 7 === 0);

                        return (
                            <div
                                key={i}
                                onClick={() => d.currentMonth && !(isPast && !isAdmin) && !isSunday && setSelectedDate(dateStr)}
                                className={`
                                    min-h-[56px] lg:h-24 p-1 lg:p-2 border-r border-b border-gray-50 cursor-pointer transition-all relative group
                                    ${!d.currentMonth ? 'bg-gray-50/50 opacity-30 cursor-default' : ''}
                                    ${isSunday ? 'cursor-not-allowed bg-gray-50/30' : ''}
                                    ${isPast && !isAdmin ? 'cursor-not-allowed bg-gray-50/30' : ''}
                                    ${isPast && isAdmin ? 'hover:bg-amber-50/50 opacity-75' : ''}
                                    ${!isPast && !isSunday ? 'hover:bg-blue-50' : ''}
                                    ${isSelected ? 'bg-blue-50 !border-blue-200' : ''}
                                `}
                            >
                                <span className={`
                                    text-[11px] lg:text-sm font-black 
                                    ${isToday ? 'bg-primary text-white w-5 h-5 lg:w-7 lg:h-7 flex items-center justify-center rounded-full text-[9px] lg:text-sm' : 'text-secondary'}
                                    ${isSunday ? 'text-red-300' : ''}
                                `}>
                                    {d.day}
                                </span>

                                <div className="mt-0.5 lg:mt-2 flex flex-wrap gap-0.5 lg:gap-1">
                                    {isBlocked && (
                                        <div className="w-full bg-red-100 text-red-600 text-[6px] lg:text-[8px] font-bold px-0.5 lg:px-1 rounded flex items-center gap-0.5">
                                            <LockClosedIcon className="h-1.5 w-1.5 lg:h-2 lg:w-2" /> Blq
                                        </div>
                                    )}
                                    {isSunday && d.currentMonth && (
                                        <div className="w-full bg-gray-100 text-gray-400 text-[6px] lg:text-[8px] font-bold px-0.5 lg:px-1 rounded">Cerrado</div>
                                    )}
                                    {isAdmin && d.currentMonth && !isSunday && (
                                        <>
                                            {(() => {
                                                const count = appointments
                                                    .filter(a => a.appointment_date.split('T')[0] === dateStr && a.status !== 'cancelled')
                                                    .length;
                                                return count > 0 ? (
                                                    <div className="w-full bg-blue-100 text-blue-700 text-[7px] lg:text-[9px] font-black px-1 lg:px-1.5 py-0.5 rounded-lg flex items-center justify-between">
                                                        <span className="hidden lg:inline">Citas:</span>
                                                        <span className="bg-blue-600 text-white w-3 h-3 lg:w-3.5 lg:h-3.5 flex items-center justify-center rounded-full text-[7px] lg:text-[8px]">{count}</span>
                                                    </div>
                                                ) : null;
                                            })()}
                                        </>
                                    )}
                                </div>


                                {isAdmin && d.currentMonth && !isSunday && !isPast && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleBlockDate(dateStr); }}
                                        className="absolute bottom-1 right-1 lg:bottom-2 lg:right-2 opacity-0 group-hover:opacity-100 p-0.5 lg:p-1 bg-white shadow-md rounded-lg text-gray-400 hover:text-red-500 transition-all"
                                    >
                                        {isBlocked ? <LockOpenIcon className="h-3 w-3 lg:h-4 lg:w-4" /> : <LockClosedIcon className="h-3 w-3 lg:h-4 lg:w-4" />}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="w-full lg:w-80 xl:w-96 bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 flex flex-col">
                <div className="p-4 lg:p-8 border-b border-gray-50 bg-gray-50/50">
                    <h3 className="text-secondary font-black uppercase tracking-widest text-sm lg:text-lg flex items-center gap-2 lg:gap-3">
                        <CalendarIcon className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                        Detalles del Día
                    </h3>
                    <p className="text-gray-400 text-[10px] lg:text-xs font-bold mt-1">
                        {selectedDate ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Selecciona un día'}
                    </p>
                </div>

                <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
                    {!selectedDate ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-300 py-6 lg:py-10">
                            <ClockIcon className="h-8 w-8 lg:h-12 lg:w-12 mb-3 lg:mb-4 opacity-20" />
                            <p className="text-[11px] lg:text-sm font-medium px-4">Selecciona un día en el calendario para ver disponibilidad</p>
                        </div>
                    ) : isLoading ? (
                        <div className="flex justify-center items-center h-32 lg:h-40">
                            <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : showBookingForm ? (
                        <div className="animate-fade-in shadow-inner bg-gray-50 p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-gray-100">
                            <div className="flex items-center justify-between mb-4 lg:mb-6">
                                <div className="flex items-center gap-2">
                                    <label className="text-[9px] lg:text-[10px] font-black uppercase text-gray-400">Inicio:</label>
                                    <input
                                        type="time"
                                        required
                                        className="bg-white border-2 border-primary rounded-xl px-2 lg:px-3 py-1.5 text-xs lg:text-sm font-black text-primary focus:outline-none transition-all w-24 lg:w-28"
                                        value={customTime || bookingSlot || ''}
                                        onChange={(e) => { setCustomTime(e.target.value); setBookingSlot(null); if (selectedDate) setBookingData(prev => ({ ...prev, isSpecial: checkIfSpecial(selectedDate, e.target.value) })); }}
                                    />
                                </div>
                                <button onClick={() => { setShowBookingForm(false); setCustomTime(''); }} className="text-[9px] lg:text-[10px] font-black text-red-400 uppercase hover:underline">Cancelar</button>
                            </div>
                            <form onSubmit={handleManualBook} className="space-y-3 lg:space-y-4">
                                <div>
                                    <label className="text-[9px] lg:text-[10px] font-black uppercase text-gray-400 ml-1">Hora de Fin *</label>
                                    <input
                                        required
                                        type="time"
                                        className="w-full bg-white border-2 border-gray-100 rounded-xl px-3 lg:px-4 py-2 text-xs lg:text-sm focus:border-primary outline-none transition-all font-bold"
                                        value={bookingData.endTime}
                                        onChange={(e) => setBookingData({ ...bookingData, endTime: e.target.value })}
                                    />
                                </div>
                                {bookingData.isSpecial && (
                                    <div className="flex items-center gap-1.5 px-1 py-1.5">
                                        <span className="text-[9px] lg:text-[10px] font-black uppercase text-purple-500 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 tracking-wider">⭐ Horario Especial</span>
                                    </div>
                                )}
                                <div>
                                    <label className="text-[9px] lg:text-[10px] font-black uppercase text-gray-400 ml-1">Nombre Completo *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-2 text-sm focus:border-primary outline-none transition-all font-bold"
                                        value={bookingData.name}
                                        onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[9px] lg:text-[10px] font-black uppercase text-gray-400 ml-1">Cédula</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white border-2 border-gray-100 rounded-xl px-3 lg:px-4 py-2 text-xs lg:text-sm focus:border-primary outline-none transition-all font-bold"
                                            value={bookingData.cedula}
                                            onChange={(e) => setBookingData({ ...bookingData, cedula: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] lg:text-[10px] font-black uppercase text-gray-400 ml-1">Edad *</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full bg-white border-2 border-gray-100 rounded-xl px-3 lg:px-4 py-2 text-xs lg:text-sm focus:border-primary outline-none transition-all font-bold"
                                            value={bookingData.age}
                                            onChange={(e) => setBookingData({ ...bookingData, age: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] lg:text-[10px] font-black uppercase text-gray-400 ml-1">Teléfono (WhatsApp)</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. 096..."
                                        className="w-full bg-white border-2 border-gray-100 rounded-xl px-3 lg:px-4 py-2 text-xs lg:text-sm focus:border-primary outline-none transition-all font-bold"
                                        value={bookingData.phone}
                                        onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] lg:text-[10px] font-black uppercase text-gray-400 ml-1">Motivo / Tratamiento *</label>
                                    <textarea
                                        required
                                        rows="2"
                                        className="w-full bg-white border-2 border-gray-100 rounded-xl px-3 lg:px-4 py-2 text-xs lg:text-sm focus:border-primary outline-none transition-all font-bold"
                                        value={bookingData.motive}
                                        onChange={(e) => setBookingData({ ...bookingData, motive: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-primary text-white py-3 lg:py-4 rounded-xl lg:rounded-2xl font-black uppercase tracking-widest text-[10px] lg:text-xs shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all mt-3 lg:mt-4"
                                >
                                    Confirmar Cita
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Helper to check if appointment is special */}
                            {(() => {
                                const dayAppts = appointments.filter(a => a.appointment_date.split('T')[0] === selectedDate && a.status !== 'cancelled');
                                const normalAppts = dayAppts.filter(a => !a.motive?.startsWith('[ESPECIAL]'));
                                const specialAppts = dayAppts.filter(a => a.motive?.startsWith('[ESPECIAL]'));
                                
                                return (
                                    <div className="space-y-4 lg:space-y-6">
                                        {/* Normal appointments */}
                                        <div className="space-y-3 lg:space-y-4">
                                            <h4 className="text-[10px] lg:text-xs font-black uppercase text-gray-400 tracking-widest px-2">Citas Agendadas</h4>
                                            {normalAppts.length === 0 ? (
                                                <p className="text-xs lg:text-sm text-gray-400 italic px-2">No hay citas normales para este día.</p>
                                            ) : (
                                                <div className="space-y-2 lg:space-y-3">
                                                    {normalAppts.map(app => (
                                                        <div key={app.id} className="p-3 lg:p-4 bg-gray-50 rounded-xl lg:rounded-2xl border border-gray-100 hover:shadow-md transition-all">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] lg:text-xs font-black text-primary bg-blue-100 px-2 py-1 rounded-full">{app.appointment_time.substring(0, 5)}</span>
                                                                    {app.duration_minutes && (
                                                                        <span className="text-[8px] lg:text-[9px] text-gray-400 font-bold">({app.duration_minutes} min)</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[8px] lg:text-[9px] font-black uppercase px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full bg-green-100 text-green-700">
                                                                        Confirmada
                                                                    </span>
                                                                    {isAdmin && (
                                                                        <button onClick={() => handleCancelAppointment(app.id)} className="p-1 lg:p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Cancelar Cita">
                                                                            <TrashIcon className="h-4 w-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <UserIcon className="h-4 w-4 text-secondary" />
                                                                <p className="text-sm font-bold text-secondary">{app.patient_name}</p>
                                                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-black">{app.patient_age} años</span>
                                                            </div>
                                                            <div className="space-y-1 ml-6 mt-2">
                                                                <p className="text-[10px] text-gray-500 flex items-center gap-2"><PhoneIcon className="h-3 w-3" /> {app.patient_phone}</p>
                                                                <p className="text-[10px] text-gray-500 font-medium flex items-center gap-2"><span className="font-black text-gray-300">ID:</span> {app.patient_cedula}</p>
                                                                {app.motive && (
                                                                    <div className="pt-1 mt-1 border-t border-gray-100 flex items-start gap-1">
                                                                        <ChatBubbleBottomCenterTextIcon className="h-3 w-3 text-blue-400 mt-0.5" />
                                                                        <p className="text-[10px] text-blue-600/90 italic font-medium break-words pr-2">{app.motive}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Special appointments */}
                                        {specialAppts.length > 0 && (
                                            <div className="space-y-3 lg:space-y-4 pt-3 lg:pt-4 border-t-2 border-dashed border-purple-200">
                                                <h4 className="text-[10px] lg:text-xs font-black uppercase text-purple-500 tracking-widest px-2 flex items-center gap-2">
                                                    <span>⭐ Horarios Especiales</span>
                                                </h4>
                                                <div className="space-y-2 lg:space-y-3">
                                                    {specialAppts.map(app => {
                                                        const cleanMotive = app.motive?.replace('[ESPECIAL]', '').trim();
                                                        return (
                                                            <div key={app.id} className="p-3 lg:p-4 bg-purple-50 rounded-xl lg:rounded-2xl border-2 border-purple-200 hover:shadow-md transition-all">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] lg:text-xs font-black text-purple-700 bg-purple-200 px-2 py-1 rounded-full">{app.appointment_time.substring(0, 5)}</span>
                                                                        {app.duration_minutes && (
                                                                            <span className="text-[8px] lg:text-[9px] text-purple-400 font-bold">({app.duration_minutes} min)</span>
                                                                        )}
                                                                        <span className="text-[10px]">⭐</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[8px] lg:text-[9px] font-black uppercase px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full bg-purple-200 text-purple-700">
                                                                            Especial
                                                                        </span>
                                                                        {isAdmin && (
                                                                            <button onClick={() => handleCancelAppointment(app.id)} className="p-1 lg:p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Cancelar Cita">
                                                                                <TrashIcon className="h-4 w-4" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <UserIcon className="h-4 w-4 text-purple-700" />
                                                                    <p className="text-sm font-bold text-purple-800">{app.patient_name}</p>
                                                                    <span className="text-[10px] bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full font-black">{app.patient_age} años</span>
                                                                </div>
                                                                <div className="space-y-1 ml-6 mt-2">
                                                                    <p className="text-[10px] text-purple-500 flex items-center gap-2"><PhoneIcon className="h-3 w-3" /> {app.patient_phone}</p>
                                                                    <p className="text-[10px] text-purple-500 font-medium flex items-center gap-2"><span className="font-black text-purple-300">ID:</span> {app.patient_cedula}</p>
                                                                    {cleanMotive && (
                                                                        <div className="pt-1 mt-1 border-t border-purple-200 flex items-start gap-1">
                                                                            <ChatBubbleBottomCenterTextIcon className="h-3 w-3 text-purple-400 mt-0.5" />
                                                                            <p className="text-[10px] text-purple-600/90 italic font-medium break-words pr-2">{cleanMotive}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {isAdmin && !isPastSelected && (
                                <div className="space-y-3 lg:space-y-4 pt-3 lg:pt-4 border-t border-gray-100">
                                    <h4 className="text-[10px] lg:text-xs font-black uppercase text-primary tracking-widest px-2">Agendar Manualmente</h4>
                                    
                                    {/* Custom time input */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-blue-50/50 p-3 rounded-xl lg:rounded-2xl border border-blue-100">
                                        <input
                                            type="time"
                                            className="flex-1 bg-white border-2 border-blue-200 rounded-xl px-3 py-2.5 lg:py-2 text-xs lg:text-sm font-black text-secondary focus:border-primary outline-none transition-all"
                                            value={customTime}
                                            onChange={(e) => { setCustomTime(e.target.value); if (selectedDate) setBookingData(prev => ({ ...prev, isSpecial: checkIfSpecial(selectedDate, e.target.value) })); }}
                                        />
                                        <button
                                            onClick={() => { if (customTime) { setBookingSlot(null); setShowBookingForm(true); } else { alert('Selecciona una hora primero.'); } }}
                                            className="bg-primary text-white px-4 py-2.5 lg:py-2 rounded-xl font-black uppercase text-[10px] tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-md whitespace-nowrap"
                                        >
                                            + Hora Exacta
                                        </button>
                                    </div>

                                    {availableSlots.length === 0 ? (
                                        <p className="text-[10px] text-gray-400 italic px-2">No hay horarios predefinidos. Usa el campo de arriba para agendar a cualquier hora.</p>
                                    ) : (
                                        <>
                                            <p className="text-[8px] lg:text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">O elige un horario rápido:</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 lg:gap-2">
                                                {availableSlots.map(slot => (
                                                    <button
                                                        key={slot}
                                                        onClick={() => { setBookingSlot(slot); setCustomTime(''); setBookingData(prev => ({ ...prev, isSpecial: false })); setShowBookingForm(true); }}
                                                        className="bg-white border-2 border-gray-100 py-1.5 lg:py-2 rounded-xl text-[10px] lg:text-[11px] font-black text-secondary hover:border-primary hover:text-primary transition-all shadow-sm active:scale-95"
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {appointments.filter(a => a.appointment_date.split('T')[0] === selectedDate && a.status === 'cancelled').length > 0 && (
                                <div className="space-y-3 lg:space-y-4 pt-3 lg:pt-4 border-t border-dashed border-gray-100">
                                    <h4 className="text-[10px] lg:text-xs font-black uppercase text-red-300 tracking-widest px-2">Historial / Canceladas</h4>
                                    <div className="space-y-1.5 lg:space-y-2 opacity-60">
                                        {appointments.filter(a => a.appointment_date.split('T')[0] === selectedDate && a.status === 'cancelled').map(app => (
                                            <div key={app.id} className="p-2.5 lg:p-3 bg-red-50/30 rounded-xl border border-red-50 flex items-center justify-between gap-2 lg:gap-4 grayscale">
                                                <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                                                    <span className="text-[8px] lg:text-[9px] font-black text-red-400 bg-red-100/50 px-1.5 lg:px-2 py-0.5 rounded-full line-through shrink-0">{app.appointment_time.substring(0, 5)}</span>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] lg:text-xs font-bold text-gray-400 line-through truncate">{app.patient_name}</p>
                                                        <p className="text-[8px] lg:text-[9px] text-gray-300 truncate">Cédula: {app.patient_cedula}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[7px] lg:text-[8px] font-black uppercase text-red-300 shrink-0">Cancelada</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
