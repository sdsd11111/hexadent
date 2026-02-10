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
    PhoneIcon
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

    useEffect(() => {
        fetchMetadata();
    }, [currentMonth, currentYear]);

    useEffect(() => {
        if (selectedDate) {
            fetchDayDetails(selectedDate);
        }
    }, [selectedDate]);

    const fetchMetadata = async () => {
        setIsLoading(true);
        try {
            // Fetch blocked dates
            const blockedRes = await fetch('/api/admin/calendar/blocked-dates');
            const blockedData = await blockedRes.json();
            setBlockedDates(blockedData.map(d => d.blocked_date.split('T')[0]));

            // If admin, fetch appointments for the month (simplified load)
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
            if (isAdmin) {
                // Admin already has appointments, filter them locally or fetch fresh
                const res = await fetch(`/api/admin/calendar/appointments?date=${dateStr}`);
                const data = await res.json();
                // Update local day appointments
            } else {
                // Public view: fetch availability
                const res = await fetch(`/api/calendar/availability?date=${dateStr}`);
                const data = await res.json();
                setAvailableSlots(data.slots || []);
            }
        } catch (e) {
            console.error("Error fetching day details:", e);
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
    // Padding from prev month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        calendarDays.push({ day: prevMonthDays - i, currentMonth: false });
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push({ day: i, currentMonth: true });
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
            {/* Calendar Grid */}
            <div className="flex-1 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-secondary to-blue-900 p-6 flex items-center justify-between text-white">
                    <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-all">
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <h2 className="text-xl font-black uppercase tracking-widest">
                        {MONTHS[currentMonth]} {currentYear}
                    </h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-all">
                        <ChevronRightIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Days Label */}
                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                    {DAYS.map(day => (
                        <div key={day} className="py-3 text-center text-[10px] font-black uppercase text-gray-400 tracking-tighter">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid */}
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
                                onClick={() => d.currentMonth && !isPast && !isSunday && setSelectedDate(dateStr)}
                                className={`
                                    h-24 p-2 border-r border-b border-gray-50 cursor-pointer transition-all relative group
                                    ${!d.currentMonth ? 'bg-gray-50/50 opacity-30 cursor-default' : ''}
                                    ${isPast || isSunday ? 'cursor-not-allowed bg-gray-50/30' : 'hover:bg-blue-50'}
                                    ${isSelected ? 'bg-blue-50 !border-blue-200' : ''}
                                `}
                            >
                                <span className={`
                                    text-sm font-black 
                                    ${isToday ? 'bg-primary text-white w-7 h-7 flex items-center justify-center rounded-full' : 'text-secondary'}
                                    ${isSunday ? 'text-red-300' : ''}
                                `}>
                                    {d.day}
                                </span>

                                {/* Status Indicators */}
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {isBlocked && (
                                        <div className="w-full bg-red-100 text-red-600 text-[8px] font-bold px-1 rounded flex items-center gap-0.5">
                                            <LockClosedIcon className="h-2 w-2" /> Bloqueado
                                        </div>
                                    )}
                                    {isSunday && d.currentMonth && (
                                        <div className="w-full bg-gray-100 text-gray-400 text-[8px] font-bold px-1 rounded">Cerrado</div>
                                    )}
                                    {isAdmin && d.currentMonth && !isSunday && !isPast && (
                                        <>
                                            {(() => {
                                                const count = appointments
                                                    .filter(a => a.appointment_date.split('T')[0] === dateStr && a.status !== 'cancelled')
                                                    .length;
                                                return count > 0 ? (
                                                    <div className="w-full bg-blue-100 text-blue-700 text-[9px] font-black px-1.5 py-0.5 rounded-lg flex items-center justify-between">
                                                        <span>Citas:</span>
                                                        <span className="bg-blue-600 text-white w-3.5 h-3.5 flex items-center justify-center rounded-full text-[8px]">{count}</span>
                                                    </div>
                                                ) : null;
                                            })()}
                                        </>
                                    )}
                                </div>


                                {isAdmin && d.currentMonth && !isSunday && !isPast && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleBlockDate(dateStr); }}
                                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-white shadow-md rounded-lg text-gray-400 hover:text-red-500 transition-all"
                                    >
                                        {isBlocked ? <LockOpenIcon className="h-4 w-4" /> : <LockClosedIcon className="h-4 w-4" />}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar Details */}
            <div className="w-full lg:w-96 bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col">
                <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                    <h3 className="text-secondary font-black uppercase tracking-widest text-lg flex items-center gap-3">
                        <CalendarIcon className="h-6 w-6 text-primary" />
                        Detalles del Día
                    </h3>
                    <p className="text-gray-400 text-xs font-bold mt-1">
                        {selectedDate ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Selecciona un día'}
                    </p>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    {!selectedDate ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-300 py-10">
                            <ClockIcon className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-sm font-medium">Selecciona un día en el calendario para ver disponibilidad</p>
                        </div>
                    ) : isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : isAdmin ? (
                        <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest px-2">Citas Agendadas</h4>
                            {appointments.filter(a => a.appointment_date.split('T')[0] === selectedDate).length === 0 ? (
                                <p className="text-sm text-gray-400 italic px-2">No hay citas para este día.</p>
                            ) : (
                                <div className="space-y-3">
                                    {appointments.filter(a => a.appointment_date.split('T')[0] === selectedDate).map(app => (
                                        <div key={app.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-black text-primary bg-blue-100 px-2 py-1 rounded-full">{app.appointment_time.substring(0, 5)}</span>
                                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${app.status === 'scheduled' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {app.status === 'scheduled' ? 'Confirmada' : app.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <UserIcon className="h-4 w-4 text-secondary" />
                                                <p className="text-sm font-bold text-secondary">{app.patient_name}</p>
                                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-black">
                                                    {app.patient_age} años
                                                </span>
                                            </div>
                                            <div className="space-y-1 ml-6">
                                                <p className="text-[10px] text-gray-500 flex items-center gap-2">
                                                    <PhoneIcon className="h-3 w-3" /> {app.patient_phone}
                                                </p>
                                                <p className="text-[10px] text-gray-500 font-medium flex items-center gap-2">
                                                    <span className="font-black text-gray-300">ID:</span> {app.patient_cedula}
                                                </p>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest px-2">Horarios Disponibles</h4>
                            {availableSlots.length === 0 ? (
                                <div className="text-center py-10 bg-red-50 rounded-3xl border border-red-100 p-4">
                                    <LockClosedIcon className="h-8 w-8 text-red-300 mx-auto mb-2" />
                                    <p className="text-sm text-red-600 font-bold">No hay turnos disponibles.</p>
                                    <p className="text-[10px] text-red-400 mt-1 uppercase font-black">Prueba otra fecha o consulta al chatbot</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {availableSlots.map(slot => (
                                        <div key={slot} className="bg-white border-2 border-gray-100 py-3 rounded-xl text-center text-xs font-black text-secondary hover:border-primary hover:text-primary cursor-pointer transition-all overflow-hidden relative group">
                                            {slot}
                                            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform -z-10"></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
