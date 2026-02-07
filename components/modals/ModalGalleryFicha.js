import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import axios from 'axios';
import {
    XMarkIcon,
    PhotoIcon,
    CloudArrowUpIcon,
    TrashIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    VideoCameraIcon,
    DocumentIcon,
    PencilSquareIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';

export default function ModalGalleryFicha({ isOpen, onClose, images = [], recordId, cedula, modulo, onSelectImage }) {
    const [mediaList, setMediaList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('Diagnóstico');
    const [editingMedia, setEditingMedia] = useState(null);
    const [previewMedia, setPreviewMedia] = useState(null);
    const [showZoomMsg, setShowZoomMsg] = useState(false);

    const categories = ['Diagnóstico', 'En proceso 1 año', 'En proceso 2 años', 'Finales', 'Otros'];

    useEffect(() => {
        if (isOpen && (cedula || recordId)) {
            fetchMedia();
        }
    }, [isOpen, cedula, recordId]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            // Build query with cedula/recordId and modulo for isolation
            let query = cedula ? `cedula=${cedula}` : `ficha_id=${recordId}`;
            if (modulo) {
                query += `&modulo=${modulo}`;
            }
            const response = await fetch(`/api/media?${query}`);
            if (response.ok) {
                const data = await response.json();
                setMediaList(data.media || []);
            }
        } catch (error) {
            console.error('Error fetching media:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0 || !cedula) return;

        // Differentiated Size limits
        const validFiles = files.filter(f => {
            const isVideo = f.type.startsWith('video/');
            const isPdf = f.type === 'application/pdf';
            const isImage = f.type.startsWith('image/');

            if (!isVideo && !isPdf && !isImage) return false;

            // Check size only if not an image (images will be compressed)
            if (!isImage) {
                const maxSize = isVideo ? 10 * 1024 * 1024 : (isPdf ? 5 * 1024 * 1024 : 1 * 1024 * 1024);
                const limitDesc = isVideo ? '10MB' : (isPdf ? '5MB' : '1MB');

                if (f.size > maxSize) {
                    alert(`El archivo ${f.name} supera el límite de ${limitDesc} y será omitido.`);
                    return false;
                }
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            const totalFiles = validFiles.length;
            let completedFiles = 0;

            for (const file of validFiles) {
                let fileToUpload = file;
                const isImage = file.type.startsWith('image/');

                // Compress image if applicable
                if (isImage) {
                    try {
                        // Helper to compress image
                        const compressImage = async (file) => {
                            return new Promise((resolve, reject) => {
                                const img = new Image();
                                img.src = URL.createObjectURL(file);
                                img.onload = () => {
                                    const canvas = document.createElement('canvas');
                                    let width = img.width;
                                    let height = img.height;

                                    // Resize if larger than 1920px
                                    const MAX_WIDTH = 1920;
                                    const MAX_HEIGHT = 1920;

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

                                    canvas.toBlob((blob) => {
                                        if (blob) {
                                            const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                                                type: 'image/webp',
                                                lastModified: Date.now(),
                                            });
                                            resolve(newFile);
                                        } else {
                                            reject(new Error('Compression failed'));
                                        }
                                    }, 'image/webp', 0.8); // 0.8 quality
                                };
                                img.onerror = reject;
                            });
                        };

                        fileToUpload = await compressImage(file);
                        console.log(`Compresión: ${file.size} -> ${fileToUpload.size} bytes`);
                    } catch (err) {
                        console.error("Error comprimiendo imagen, se usará original:", err);
                    }
                }

                // Final size check for images after compression
                if (isImage) {
                    const maxSize = 1 * 1024 * 1024; // 1MB for images
                    if (fileToUpload.size > maxSize) {
                        alert(`La imagen ${file.name} supera 1MB incluso después de comprimir y será omitida.`);
                        continue;
                    }
                }

                const formData = new FormData();
                formData.append('file', fileToUpload);
                formData.append('cedula', cedula);
                formData.append('ficha_id', recordId || '');
                formData.append('modulo', modulo || 'odontologia');
                formData.append('categoria', selectedCategory);
                formData.append('nombre', file.name);

                const response = await axios.post('/api/media', formData, {
                    onUploadProgress: (progressEvent) => {
                        const filePercent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        // Approximate total progress
                        const overallPercent = Math.round(((completedFiles * 100) + filePercent) / totalFiles);
                        setUploadProgress(overallPercent);
                    }
                });

                // INSTANT UI UPDATE: Add the uploaded media to the list immediately
                if (response.data && response.data.media) {
                    setMediaList(prev => [response.data.media, ...prev]);
                }

                completedFiles++;
                setUploadProgress(Math.round((completedFiles * 100) / totalFiles));
            }
            await fetchMedia();
            setUploading(false);
            setUploadProgress(0);
        } catch (error) {
            console.error('Error uploading media:', error);
            alert('Error al subir archivos: ' + (error.response?.data?.error || error.message));
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este archivo permanentemente?')) return;

        try {
            const response = await fetch(`/api/media?id=${id}`, { method: 'DELETE' });
            if (response.ok) {
                setMediaList(mediaList.filter(m => m.id !== id));
            }
        } catch (error) {
            console.error('Error deleting media:', error);
        }
    };

    const handleRename = async (id, newName) => {
        try {
            const response = await fetch('/api/media', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, nombre: newName, categoria: selectedCategory }),
            });
            if (response.ok) {
                setMediaList(mediaList.map(m => m.id === id ? { ...m, nombre: newName } : m));
                setEditingMedia(null);
            }
        } catch (error) {
            console.error('Error renaming:', error);
        }
    };

    const groupedMedia = mediaList.reduce((acc, curr) => {
        const cat = curr.categoria || 'Sin Categoría';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(curr);
        return acc;
    }, {});

    const renderMediaIcon = (m) => {
        if (m.tipo === 'video') return <VideoCameraIcon className="h-10 w-10 text-white/50" />;
        if (m.tipo === 'pdf') return <DocumentIcon className="h-10 w-10 text-white/50" />;
        return <PhotoIcon className="h-10 w-10 text-white/50" />;
    };

    return (
        <>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[60]" onClose={onClose}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all flex flex-col h-[90vh]">
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/10 rounded-lg">
                                                <PhotoIcon className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <Dialog.Title className="text-xl font-bold text-white uppercase tracking-wider">
                                                    Galería Multimedia <span className="text-primary/50 text-sm ml-2">Profesional</span>
                                                </Dialog.Title>
                                                <p className="text-[9px] text-white/40 uppercase">Archivos optimizados en base de datos dedicada</p>
                                            </div>
                                        </div>
                                        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 text-left">



                                        {/* Controls */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Categoría de Destino</label>
                                                <div className="relative">
                                                    <select
                                                        value={selectedCategory}
                                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 text-sm"
                                                    >
                                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                    </select>
                                                    <ChevronDownIcon className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                                                </div>
                                            </div>

                                            <div className="md:col-span-2 space-y-3">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase block">Subir Multimedia (Fotos/Docs: 1MB, Video: 10MB)</label>
                                                <label className={`relative flex items-center justify-center h-14 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
                                                    <div className="flex items-center gap-3">
                                                        <CloudArrowUpIcon className="h-6 w-6 text-slate-400 group-hover:text-blue-500" />
                                                        <span className="text-xs text-slate-500 font-bold uppercase">
                                                            {uploading ? 'Procesando archivos...' : 'Click para subir archivos multimedia'}
                                                        </span>
                                                    </div>
                                                    <input type="file" multiple accept="image/*,video/*,.pdf" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                                </label>

                                                {/* Progress Bar */}
                                                {uploading && (
                                                    <div className="space-y-1.5 animate-in fade-in duration-300">
                                                        <div className="flex justify-between items-center text-[9px] font-black text-blue-600 uppercase tracking-widest">
                                                            <span>Subiendo...</span>
                                                            <span>{uploadProgress}%</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-600 transition-all duration-300 ease-out rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                                                                style={{ width: `${uploadProgress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Media Grid */}
                                        <div className="space-y-12">
                                            {loading ? (
                                                <div className="flex items-center justify-center py-20">
                                                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            ) : mediaList.length === 0 ? (
                                                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                                                    <PhotoIcon className="h-16 w-16 mx-auto text-slate-100 mb-4" />
                                                    <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">No hay archivos en la galería de este paciente</p>
                                                </div>
                                            ) : (
                                                categories.map(cat => groupedMedia[cat] && (
                                                    <div key={cat} className="space-y-4">
                                                        <div className="flex items-center gap-4">
                                                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest bg-white shadow-sm border border-slate-200 px-4 py-1.5 rounded-full flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                                                {cat}
                                                                <span className="text-[10px] text-slate-400 font-normal">({groupedMedia[cat].length})</span>
                                                            </h3>
                                                            <div className="h-px flex-1 bg-slate-200" />
                                                        </div>

                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                            {groupedMedia[cat].map(m => (
                                                                <div key={m.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-800 shadow-sm hover:shadow-xl transition-all border-b-4 border-b-blue-500/0 hover:border-b-blue-500">
                                                                    {m.tipo === 'foto' ? (
                                                                        <img src={`/api/media/${m.id}`} alt={m.nombre} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                                                                            {renderMediaIcon(m)}
                                                                            <p className="mt-2 text-[10px] text-white/70 font-bold uppercase truncate w-full">{m.nombre}</p>
                                                                        </div>
                                                                    )}

                                                                    {/* Overlay Actions */}
                                                                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                                                        <div className="flex gap-2">
                                                                            {onSelectImage && m.tipo === 'foto' && (
                                                                                <button
                                                                                    onClick={() => onSelectImage(`/api/media/${m.id}`)}
                                                                                    className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-all transform hover:scale-110 shadow-lg"
                                                                                    title="Seleccionar para la ficha"
                                                                                >
                                                                                    <CheckCircleIcon className="h-5 w-5" />
                                                                                </button>
                                                                            )}
                                                                            <button
                                                                                onClick={() => setPreviewMedia(m)}
                                                                                className="p-2 bg-white rounded-lg text-slate-900 hover:bg-blue-500 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                                                                            >
                                                                                <PhotoIcon className="h-5 w-5" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setEditingMedia(m)}
                                                                                className="p-2 bg-white rounded-lg text-slate-900 hover:bg-emerald-500 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                                                                            >
                                                                                <PencilSquareIcon className="h-5 w-5" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDelete(m.id)}
                                                                                className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                                                                            >
                                                                                <TrashIcon className="h-5 w-5" />
                                                                            </button>
                                                                        </div>
                                                                        <p className="text-[9px] text-white/50 font-mono">{m.nombre.slice(0, 15)}...</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
                                        <button onClick={onClose} className="px-8 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all active:scale-95 uppercase text-xs">
                                            Cerrar Galería
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* PREVIEW LIGHTBOX */}
            <Transition appear show={!!previewMedia} as={Fragment}>
                <Dialog as="div" className="relative z-[70]" onClose={() => setPreviewMedia(null)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/90 backdrop-blur-md" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="relative w-full max-w-5xl h-[90vh] flex flex-col items-center justify-center">
                                    <button onClick={() => setPreviewMedia(null)} className="absolute top-0 right-0 p-3 text-white bg-white/10 rounded-full hover:bg-white/20 transition-all z-10">
                                        <XMarkIcon className="h-8 w-8" />
                                    </button>
                                    {previewMedia && (
                                        <>
                                            {previewMedia.tipo === 'foto' && <img src={`/api/media/${previewMedia.id}`} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />}
                                            {previewMedia.tipo === 'video' && <video controls src={`/api/media/${previewMedia.id}`} className="max-w-full max-h-full rounded-xl" />}
                                            {previewMedia.tipo === 'pdf' && <iframe src={`/api/media/${previewMedia.id}`} className="w-full h-full rounded-xl bg-white" />}
                                        </>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* RENAME MODAL */}
            <Transition appear show={!!editingMedia} as={Fragment}>
                <Dialog as="div" className="relative z-[80]" onClose={() => setEditingMedia(null)}>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                            <h3 className="text-sm font-black text-slate-800 uppercase mb-4">Renombrar Archivo</h3>
                            <input
                                type="text"
                                defaultValue={editingMedia?.nombre}
                                id="rename-input"
                                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                            />
                            <div className="flex gap-2">
                                <button onClick={() => setEditingMedia(null)} className="flex-1 py-2 text-xs font-bold text-slate-400 uppercase">Cancelar</button>
                                <button
                                    onClick={() => handleRename(editingMedia.id, document.getElementById('rename-input').value)}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase shadow-lg shadow-blue-200"
                                >
                                    Guardar
                                </button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}
