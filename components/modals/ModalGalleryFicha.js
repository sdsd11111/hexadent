'use client';

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, PhotoIcon, CloudArrowUpIcon, TrashIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

export default function ModalGalleryFicha({ isOpen, onClose, images = [], onSave }) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    const groupedImages = images.reduce((acc, curr) => {
        const date = curr.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(...curr.data);
        return acc;
    }, {});

    const compressImage = async (file) => {
        // ... (previous compressImage logic remains same)
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
                    const MAX_WIDTH = 1000;
                    const MAX_HEIGHT = 1000;
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
                    let quality = 0.4;
                    let dataUrl = canvas.toDataURL('image/jpeg', quality);
                    while (dataUrl.length > 1.3 * 1024 * 1024 && quality > 0.1) {
                        quality -= 0.1;
                        dataUrl = canvas.toDataURL('image/jpeg', quality);
                    }
                    resolve(dataUrl);
                };
            };
        });
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
        setUploading(false);
    };

    const handleDelete = (date, imgIndex) => {
        const newImages = [...images];
        const dateIndex = newImages.findIndex(item => item.date === date);
        if (dateIndex > -1) {
            newImages[dateIndex].data.splice(imgIndex, 1);
            if (newImages[dateIndex].data.length === 0) {
                newImages.splice(dateIndex, 1);
            }
            onSave(newImages);
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
                                            <Dialog.Title className="text-xl font-bold text-white uppercase tracking-wider">
                                                Galería de Imágenes Clínica
                                            </Dialog.Title>
                                        </div>
                                        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 text-left">
                                        {/* Upload Controls */}
                                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
                                            <div className="flex flex-col md:flex-row items-end gap-6">
                                                <div className="flex-1 space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                                        <CalendarDaysIcon className="h-4 w-4" />
                                                        Fecha de las Imágenes
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
                                                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                                    <PhotoIcon className="h-16 w-16 mb-4 opacity-20" />
                                                    <p className="text-sm font-bold uppercase tracking-widest">No hay imágenes en la galería</p>
                                                </div>
                                            ) : (
                                                Object.keys(groupedImages).sort((a, b) => new Date(b) - new Date(a)).map(date => (
                                                    <div key={date} className="space-y-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-px flex-1 bg-slate-200"></div>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                                                                {new Date(date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
