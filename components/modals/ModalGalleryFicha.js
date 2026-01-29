'use client';

import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, PhotoIcon, CloudArrowUpIcon, TrashIcon, CalendarDaysIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ModalGalleryFicha({ isOpen, onClose, images = [], historyImages = [], onSave, recordId, fichaType = 'odontologia', onSelectImage }) {
    // get local date in YYYY-MM-DD format
    const getLocalDate = () => new Date().toLocaleDateString('sv-SE');

    const [selectedDate, setSelectedDate] = useState(getLocalDate());
    const [uploading, setUploading] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'success', 'error'
    const [previewImage, setPreviewImage] = useState(null);

    // Refresh local date when opening modal
    useEffect(() => {
        if (isOpen) {
            setSelectedDate(getLocalDate());
        }
    }, [isOpen]);

    const groupedImages = images.reduce((acc, curr) => {
        const date = curr.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(...curr.data);
        return acc;
    }, {});

    const compressImage = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_WIDTH = 800; // Reduced for super compression
                    const MAX_HEIGHT = 800; // Reduced for super compression
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    let quality = 0.2; // Aggressive initial quality
                    let dataUrl = canvas.toDataURL('image/jpeg', quality);
                    // Targeted for < 300KB for maximum efficiency
                    while (dataUrl.length > 0.3 * 1024 * 1024 && quality > 0.05) {
                        quality -= 0.05;
                        dataUrl = canvas.toDataURL('image/jpeg', quality);
                    }
                    resolve(dataUrl);
                };
            };
        });
    };

    const persistImages = async (newImages) => {
        if (!recordId) return; // Only auto-save if record already exists

        setSaveStatus('saving');
        try {
            const response = await fetch('/api/fichas', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: recordId,
                    fichaType: fichaType,
                    // Note: We need the full data object or a way to patch. 
                    // To be safe, the parent handles the full data merge.
                    updateType: 'imagenes_only',
                    imagenes: newImages
                }),
            });

            if (response.ok) {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus(null), 2000);
            } else {
                setSaveStatus('error');
            }
        } catch (error) {
            setSaveStatus('error');
        }
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const compressedImages = await Promise.all(files.map(file => compressImage(file)));

        const newImages = [...images];
        const dateIndex = newImages.findIndex(item => item.date === selectedDate);

        if (dateIndex > -1) {
            newImages[dateIndex].data = [...newImages[dateIndex].data, ...compressedImages];
        } else {
            newImages.push({ date: selectedDate, data: compressedImages });
        }

        onSave(newImages);
        persistImages(newImages);
        setUploading(false);
    };

    const handleDelete = (date, imgIndex) => {
        if (!confirm('¿Estás seguro de eliminar esta foto? Esta acción no se puede deshacer y se borrará permanentemente de la base de datos.')) return;

        const newImages = [...images];
        const dateIndex = newImages.findIndex(item => item.date === date);
        if (dateIndex > -1) {
            newImages[dateIndex].data.splice(imgIndex, 1);
            if (newImages[dateIndex].data.length === 0) {
                newImages.splice(dateIndex, 1);
            }
            onSave(newImages);
            persistImages(newImages);
        }
    };

    return (
        <>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[60]" onClose={onClose}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all flex flex-col h-[85vh]">
                                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/10 rounded-lg">
                                                <PhotoIcon className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <Dialog.Title className="text-xl font-bold text-white uppercase tracking-wider">
                                                    Galería de Imágenes Clínica
                                                </Dialog.Title>
                                                {saveStatus === 'saving' && <p className="text-[9px] text-blue-400 font-bold animate-pulse">GUARDANDO CAMBIOS EN NUBE...</p>}
                                                {saveStatus === 'success' && <p className="text-[9px] text-emerald-400 font-bold uppercase">¡Cambios guardados con éxito!</p>}
                                                {saveStatus === 'error' && <p className="text-[9px] text-red-400 font-bold uppercase">Error al sincronizar imágenes</p>}
                                                {!saveStatus && recordId && <p className="text-[9px] text-white/40 uppercase">Sincronización automática activa</p>}
                                            </div>
                                        </div>
                                        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 text-left">

                                        {/* HISTORY IMAGES READ-ONLY SECTION */}
                                        {historyImages.length > 0 && (
                                            <div className="mb-8">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="p-1.5 bg-amber-100 rounded-lg">
                                                        <CalendarDaysIcon className="h-4 w-4 text-amber-600" />
                                                    </div>
                                                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide">Historial del Paciente (Otras Fichas)</h3>
                                                </div>
                                                <p className="text-[10px] text-slate-400 mb-2 pl-2">Mostrando las 20 imágenes más recientes del historial completo.</p>
                                                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                                        {historyImages.map((img, idx) => (
                                                            <div key={`hist-${idx}`} className="group relative aspect-square rounded-xl overflow-hidden border border-amber-200 shadow-sm bg-white cursor-zoom-in">
                                                                <img
                                                                    src={img}
                                                                    alt="Historial"
                                                                    className="w-full h-full object-cover"
                                                                    onClick={() => setPreviewImage(img)}
                                                                />
                                                                <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[9px] font-bold text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    HISTÓRICO
                                                                </div>
                                                                {/* Selection Overlay */}
                                                                {onSelectImage && (
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                onSelectImage(img);
                                                                            }}
                                                                            className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg font-bold text-[10px] uppercase shadow-lg hover:bg-emerald-600 transition-all transform hover:scale-105 flex items-center gap-1"
                                                                        >
                                                                            <CheckCircleIcon className="h-4 w-4" />
                                                                            Seleccionar
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Upload Controls */}
                                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
                                            <div className="flex flex-col md:flex-row items-end gap-6">
                                                <div className="flex-1 space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                                        <PhotoIcon className="h-4 w-4" />
                                                        Imágenes de ESTA Ficha (Nuevas)
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={selectedDate}
                                                        onChange={(e) => setSelectedDate(e.target.value)}
                                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="relative flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                                            <CloudArrowUpIcon className="h-8 w-8 text-slate-400 group-hover:text-blue-500 mb-1" />
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase">
                                                                {uploading ? 'Comprimiendo...' : 'Subir Imágenes'}
                                                            </p>
                                                        </div>
                                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Image Grid */}
                                        <div className="space-y-8">
                                            {Object.keys(groupedImages).length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-10 text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-100 mt-4">
                                                    <PhotoIcon className="h-10 w-10 mb-2 opacity-20" />
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No hay imágenes NUEVAS en esta ficha</p>
                                                    {historyImages.length > 0 && (
                                                        <p className="text-[9px] text-slate-400 mt-1 italic">Puedes seleccionar las del historial arriba o subir fotos nuevas</p>
                                                    )}
                                                </div>
                                            ) : (
                                                Object.keys(groupedImages).sort((a, b) => new Date(b) - new Date(a)).map(date => (
                                                    <div key={date} className="space-y-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-px flex-1 bg-slate-200"></div>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                                                                {/* Parse date as YYYY, MM, DD to avoid UTC offset */}
                                                                {(() => {
                                                                    const [y, m, d] = date.split('-').map(Number);
                                                                    return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
                                                                        weekday: 'long',
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric'
                                                                    });
                                                                })()}
                                                            </span>
                                                            <div className="h-px flex-1 bg-slate-200"></div>
                                                        </div>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                            {groupedImages[date].map((img, idx) => (
                                                                <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white hover:shadow-xl transition-all cursor-zoom-in">
                                                                    <img
                                                                        src={img}
                                                                        alt="Clínica"
                                                                        className="w-full h-full object-cover"
                                                                        onClick={() => setPreviewImage(img)}
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
                                                                        {onSelectImage ? (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    onSelectImage(img);
                                                                                }}
                                                                                className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg font-bold text-[10px] uppercase shadow-lg hover:bg-emerald-600 transition-all transform hover:scale-105 flex items-center gap-1"
                                                                            >
                                                                                <CheckCircleIcon className="h-4 w-4" />
                                                                                Seleccionar
                                                                            </button>
                                                                        ) : (
                                                                            <>
                                                                                <button
                                                                                    onClick={() => setPreviewImage(img)}
                                                                                    className="p-2 bg-white rounded-full text-slate-900 hover:bg-blue-500 hover:text-white transition-all transform hover:scale-110"
                                                                                >
                                                                                    <PhotoIcon className="h-5 w-5" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleDelete(date, idx);
                                                                                    }}
                                                                                    className="p-2 bg-white rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:scale-110"
                                                                                >
                                                                                    <TrashIcon className="h-5 w-5" />
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
                                        <button
                                            onClick={onClose}
                                            className="px-8 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all active:scale-95 uppercase text-xs"
                                        >
                                            Cerrar Galería
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* PREVIEW LIGHTBOX MODAL */}
            <Transition appear show={!!previewImage} as={Fragment}>
                <Dialog as="div" className="relative z-[70]" onClose={() => setPreviewImage(null)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/90 backdrop-blur-md" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="relative w-full max-w-5xl h-[90vh] flex flex-col items-center justify-center">
                                    <button
                                        onClick={() => setPreviewImage(null)}
                                        className="absolute top-0 right-0 p-3 text-white bg-white/10 rounded-full hover:bg-white/20 transition-all z-10"
                                    >
                                        <XMarkIcon className="h-8 w-8" />
                                    </button>
                                    {previewImage && (
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                                        />
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}
