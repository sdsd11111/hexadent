'use client';

import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
    XMarkIcon,
    DocumentIcon,
    CloudArrowUpIcon,
    TrashIcon,
    ArrowTopRightOnSquareIcon,
    FolderPlusIcon,
    DocumentPlusIcon,
    ArrowLeftIcon,
    EyeIcon,
    PrinterIcon,
    ClipboardDocumentListIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { useForm, useFieldArray } from 'react-hook-form';

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    { ssr: false }
);

import ComplementoClareamientoDocument from '../pdf/ComplementoClareamientoDocument';
import ComplementoFrenectomiaDocument from '../pdf/ComplementoFrenectomiaDocument';
import ComplementoPostquirurgicoDocument from '../pdf/ComplementoPostquirurgicoDocument';

export default function ModalArchivosComplemento({ isOpen, onClose }) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list_accordion', 'edit_dynamic'
    const [selectedTemplate, setSelectedTemplate] = useState('clareamiento');
    const [editingFile, setEditingFile] = useState(null);
    const [openAccordion, setOpenAccordion] = useState(null); // 'clareamiento', 'frenectomia'
    const [previewData, setPreviewData] = useState(null);

    const { register, control, handleSubmit, watch, reset, setValue, getValues } = useForm({
        defaultValues: {
            title: '',
            subtitle: '',
            doctorName: 'Dra. Diana Rodríguez',
            doctorTitle: '',
            patientName: '',
            patientCI: '',
            date: new Date().toLocaleDateString('es-ES'),
            recommendations: [],
            emergencyNumber: '0967885039'
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "recommendations"
    });

    const watchedData = watch();

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/fichas?type=archivos_complemento');
            if (res.ok) {
                const data = await res.json();
                setFiles(data.fichas || []);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchFiles();
        }
    }, [isOpen]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Por favor, sube solo archivos PDF.');
            return;
        }

        setUploading(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Data = reader.result;
                const body = {
                    fichaType: 'archivos_complemento',
                    data: {
                        name: file.name,
                        content: base64Data,
                        size: file.size,
                        type: file.type
                    }
                };

                const res = await fetch('/api/fichas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (res.ok) {
                    fetchFiles();
                } else {
                    alert('Error al subir el archivo');
                }
            };
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error al procesar el archivo');
        } finally {
            setUploading(false);
        }
    };



    const loadTemplateDefaults = (type) => {
        if (type === 'clareamiento') {
            reset({
                title: 'CLAREAMIENTO DENTAL',
                subtitle: 'RECOMENDACIONES POST TRATAMIENTO',
                doctorName: 'Dra. Diana Rodríguez',
                doctorTitle: 'ODONTÓLOGA- ORTODONCISTA',
                patientName: '',
                patientCI: '',
                date: new Date().toLocaleDateString('es-ES'),
                recommendations: [
                    "Molestias por sensibilidad tiene un tiempo estimado de 3 a 5 días, puede ser dolor agudo el primer día, luego del procedimiento.",
                    "Evitar alimentos muy fríos o calientes, ya que puede producir sensibilidad dentaria.",
                    "Evita ingerir ciertos alimentos y bebidas que puedan provocar una pigmentación dental, como en el caso del: Café, té, vino tinto, bebidas energizantes, caramelos, chocolates, frutos rojos, entre otros por 2 meses. Cítricos entre ellos se encuentran las frutas ácidas como el Kiwi, la piña, naranja, lima y limones.",
                    "USAR SORBETE para ingerir bebidas con colorantes",
                    "Evita fumar",
                    "No uso de enjuagues bucales por 2 días",
                    "Utiliza una pasta de dientes sensibles",
                    "Mantener una buena y constante higiene bucal (Puede presentarse sensibilidad durante el cepillado dental)",
                    "La cubeta individual mantenerla limpia y seca"
                ]
            });
        } else if (type === 'frenectomia') {
            reset({
                title: 'INDICACIONES Y RECOMENDACIONES POSTQUIRURGICAS',
                subtitle: '',
                doctorName: 'Dra. Diana Rodríguez',
                doctorTitle: '', // Not shown in Frenectomia default
                patientName: '',
                patientCI: '', // Not shown in Frenectomia default but useful to keep in state
                date: new Date().toLocaleDateString('es-ES'),
                emergencyNumber: '0967885039',
                recommendations: [
                    "No levantar la lengua para verse la herida",
                    "Limitar el habla durante las primeras horas de cirugía",
                    "No escupir con fuerza",
                    "Habrá sensación de dificultad para tragar la saliva",
                    "Cuando pasa el efecto de la anestesia y baja la inflamación se sienten los hilos de sutura puede picar es normal",
                    "Puede presentar un color morado en la base es la lengua es normal",
                    "No tocar la herida, realizar la higiene oral con cuidado con jeringa",
                    "No enjuague la boca durante las primeras 48 horas. No se debe escupir ni hacer movimientos repetitivos de succión, no tomar líquidos con sorbete.",
                    "Dieta blanda primer y segundo día a temperatura ambiente, beber abundantes líquidos. Evitar alimentos irritantes.",
                    "No comer carne de chancho, mariscos, lácteos.",
                    "Reposo (no realizar actividad de esfuerzo físico por 8 días), Mantener una postura en que la cabeza este a nivel más alto del cuerpo (dormir semi sentado), el primer día",
                    "Recomendamos no fumar durante el postoperatorio (por lo menos 15 días después de la intervención quirúrgica). No alcohol",
                    "En caso de continuar con problemas para pronunciación de sonidos se recomienda interconsulta con FONIATRA"
                ]
            });
        }
    };

    const handleRefreshPreview = () => {
        setPreviewData(getValues());
    };

    const handleCreateNew = (type) => {
        setSelectedTemplate(type);
        loadTemplateDefaults(type);
        setPreviewData(getValues());
        setView('edit_dynamic');
    };

    const handleSaveDynamic = async (formData) => {
        setUploading(true);
        try {
            const body = {
                fichaType: 'archivos_complemento',
                data: {
                    ...formData,
                    isDynamic: true,
                    templateType: selectedTemplate || 'clareamiento',
                    name: `${formData.title} - ${formData.patientName || 'Sin Nombre'}`
                }
            };

            const method = editingFile ? 'PUT' : 'POST';
            if (editingFile) body.id = editingFile.id;

            const res = await fetch('/api/fichas', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                fetchFiles();
                setView('list'); // Return to list view
                setEditingFile(null);
            } else {
                alert('Error al guardar el documento');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Error al guardar');
        } finally {
            setUploading(false);
        }
    };

    const handleEditDynamic = (file) => {
        setEditingFile(file);
        setSelectedTemplate(file.data.templateType);
        reset(file.data);
        setPreviewData(file.data);
        setView('edit_dynamic');
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este archivo permanentemente?')) return;

        try {
            const res = await fetch(`/api/fichas?id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setFiles(files.filter(f => f.id !== id));
            } else {
                alert('Error al eliminar el archivo');
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const openPdf = (base64) => {
        const win = window.open();
        win.document.write(`<iframe src="${base64}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 Bytes';
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
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
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all flex flex-col h-[80vh]">
                                <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-4 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-3">
                                        {view === 'edit_dynamic' && (
                                            <button
                                                onClick={() => {
                                                    setView('list');
                                                    setEditingFile(null);
                                                }}
                                                className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 text-white transition-all mr-2"
                                            >
                                                <ArrowLeftIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                        <div className="p-2 bg-white/10 rounded-lg">
                                            <FolderPlusIcon className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <Dialog.Title className="text-xl font-bold text-white uppercase tracking-wider">
                                                {view === 'list' ? 'Archivos de Complemento' : 'Editor de Documento'}
                                            </Dialog.Title>
                                            <p className="text-[10px] text-blue-200 font-bold uppercase">Gestión Global de Documentos</p>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 text-left">
                                    {view === 'list' && (
                                        <div className="space-y-6">
                                            {/* Templates Accordion */}
                                            <div className="space-y-4">
                                                {/* Clareamiento Accordion */}
                                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                                    <div className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
                                                        <button
                                                            onClick={() => handleCreateNew('clareamiento')}
                                                            className="flex-1 flex items-center gap-3 text-left group"
                                                        >
                                                            <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                                                                <DocumentPlusIcon className="h-5 w-5 text-emerald-600" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="text-sm font-black text-slate-800 uppercase group-hover:text-emerald-700 transition-colors">Clareamiento Dental</h4>
                                                                <p className="text-[10px] text-slate-500 font-bold uppercase">Plantilla de Recomendaciones</p>
                                                            </div>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenAccordion(openAccordion === 'clareamiento' ? null : 'clareamiento');
                                                            }}
                                                            className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                                                            title="Ver archivos guardados"
                                                        >
                                                            {openAccordion === 'clareamiento' ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
                                                        </button>
                                                    </div>

                                                    {openAccordion === 'clareamiento' && (
                                                        <div className="p-4 border-t border-slate-100 bg-white">

                                                            {/* List existing files of this type */}
                                                            <div className="grid grid-cols-1 gap-2">
                                                                {files.filter(f => f.data?.templateType === 'clareamiento').map(file => (
                                                                    <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all">
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-bold text-slate-700 truncate">{file.data?.name}</p>
                                                                            <p className="text-[9px] text-slate-400">{new Date(file.timestamp).toLocaleDateString()}</p>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <button onClick={() => handleEditDynamic(file)} className="p-1.5 text-emerald-500 hover:bg-emerald-100 rounded-lg"><PrinterIcon className="h-4 w-4" /></button>
                                                                            <button onClick={() => handleDelete(file.id)} className="p-1.5 text-red-400 hover:bg-red-100 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {files.filter(f => f.data?.templateType === 'clareamiento').length === 0 && (
                                                                    <p className="text-center text-[10px] text-slate-400 py-2">No hay documentos creados aún.</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Frenectomia Accordion */}
                                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                                    <div className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
                                                        <button
                                                            onClick={() => handleCreateNew('frenectomia')}
                                                            className="flex-1 flex items-center gap-3 text-left group"
                                                        >
                                                            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                                                <DocumentPlusIcon className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="text-sm font-black text-slate-800 uppercase group-hover:text-blue-700 transition-colors">Frenectomía</h4>
                                                                <p className="text-[10px] text-slate-500 font-bold uppercase">Indicaciones Postquirúrgicas</p>
                                                            </div>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenAccordion(openAccordion === 'frenectomia' ? null : 'frenectomia');
                                                            }}
                                                            className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                                                            title="Ver archivos guardados"
                                                        >
                                                            {openAccordion === 'frenectomia' ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
                                                        </button>
                                                    </div>

                                                    {openAccordion === 'frenectomia' && (
                                                        <div className="p-4 border-t border-slate-100 bg-white">

                                                            {/* List existing files of this type */}
                                                            <div className="grid grid-cols-1 gap-2">
                                                                {files.filter(f => f.data?.templateType === 'frenectomia').map(file => (
                                                                    <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all">
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-bold text-slate-700 truncate">{file.data?.name}</p>
                                                                            <p className="text-[9px] text-slate-400">{new Date(file.timestamp).toLocaleDateString()}</p>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <button onClick={() => handleEditDynamic(file)} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg"><PrinterIcon className="h-4 w-4" /></button>
                                                                            <button onClick={() => handleDelete(file.id)} className="p-1.5 text-red-400 hover:bg-red-100 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {files.filter(f => f.data?.templateType === 'frenectomia').length === 0 && (
                                                                    <p className="text-center text-[10px] text-slate-400 py-2">No hay documentos creados aún.</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Postquirurgico Accordion */}
                                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                                        <div className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
                                                            <button
                                                                onClick={() => handleCreateNew('postquirurgico')}
                                                                className="flex-1 flex items-center gap-3 text-left group"
                                                            >
                                                                <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                                                                    <DocumentPlusIcon className="h-5 w-5 text-amber-600" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="text-sm font-black text-slate-800 uppercase group-hover:text-amber-700 transition-colors">Postquirúrgico Hexadent</h4>
                                                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Indicaciones Generales</p>
                                                                </div>
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenAccordion(openAccordion === 'postquirurgico' ? null : 'postquirurgico');
                                                                }}
                                                                className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                                                                title="Ver archivos guardados"
                                                            >
                                                                {openAccordion === 'postquirurgico' ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
                                                            </button>
                                                        </div>

                                                        {openAccordion === 'postquirurgico' && (
                                                            <div className="p-4 border-t border-slate-100 bg-white">
                                                                {/* List existing files of this type */}
                                                                <div className="grid grid-cols-1 gap-2">
                                                                    {files.filter(f => f.data?.templateType === 'postquirurgico').map(file => (
                                                                        <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-amber-200 transition-all">
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-xs font-bold text-slate-700 truncate">{file.data?.name}</p>
                                                                                <p className="text-[9px] text-slate-400">{new Date(file.timestamp).toLocaleDateString()}</p>
                                                                            </div>
                                                                            <div className="flex gap-2">
                                                                                <button onClick={() => handleEditDynamic(file)} className="p-1.5 text-amber-500 hover:bg-amber-100 rounded-lg"><PrinterIcon className="h-4 w-4" /></button>
                                                                                <button onClick={() => handleDelete(file.id)} className="p-1.5 text-red-400 hover:bg-red-100 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    {files.filter(f => f.data?.templateType === 'postquirurgico').length === 0 && (
                                                                        <p className="text-center text-[10px] text-slate-400 py-2">No hay documentos creados aún.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Static PDF Upload - Hidden per request or kept minimal */}
                                                <div className="hidden">
                                                    <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col items-center justify-center text-center group cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                                                        <label className="w-full cursor-pointer">
                                                            <CloudArrowUpIcon className="h-8 w-8 text-blue-500 mb-2 mx-auto group-hover:scale-110 transition-transform" />
                                                            <p className="text-xs font-black text-slate-700 uppercase">Subir PDF Estático</p>
                                                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Subir archivos PDF externos</p>
                                                            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                                        </label>
                                                    </div>

                                                    {/* Files List for static PDFs - This part needs to be adjusted if static PDFs are also managed via accordion */}
                                                    <div className="space-y-4">
                                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Archivos PDF Estáticos</h3>
                                                        {loading ? (
                                                            <div className="flex flex-col gap-3">
                                                                {[1, 2, 3].map(i => (
                                                                    <div key={i} className="h-20 bg-white rounded-2xl border border-slate-100 animate-pulse" />
                                                                ))}
                                                            </div>
                                                        ) : files.filter(f => !f.data?.isDynamic).length === 0 ? (
                                                            <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                                                                <DocumentIcon className="h-12 w-12 mb-3 opacity-20" />
                                                                <p className="text-sm font-bold uppercase tracking-wider">No hay archivos PDF estáticos subidos todavía</p>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {files.filter(f => !f.data?.isDynamic).map((file) => (
                                                                    <div
                                                                        key={file.id}
                                                                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex items-center gap-4"
                                                                    >
                                                                        <div className={`w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0`}>
                                                                            <DocumentIcon className={`h-6 w-6 text-red-500`} />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <h4 className="text-sm font-bold text-slate-800 truncate uppercase tracking-tight">
                                                                                {file.data?.name || 'Archivo sin nombre'}
                                                                            </h4>
                                                                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase mt-1">
                                                                                <span>{formatSize(file.data?.size || 0)}</span>
                                                                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                                                <span>{new Date(file.timestamp).toLocaleDateString()}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={() => openPdf(file.data?.content)}
                                                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                                title="Ver documento"
                                                                            >
                                                                                <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDelete(file.id)}
                                                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                                title="Eliminar"
                                                                            >
                                                                                <TrashIcon className="h-5 w-5" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {view === 'edit_dynamic' && (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                                            {/* Editor Panel */}
                                            <div className="space-y-6 overflow-y-auto pr-2">
                                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                                    <h3 className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
                                                        <DocumentPlusIcon className="h-4 w-4 text-blue-500" />
                                                        Información del Documento
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Título</label>
                                                            <input {...register('title')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Subtítulo</label>
                                                            <input {...register('subtitle')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre Paciente</label>
                                                            <input {...register('patientName')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" placeholder="Escriba el nombre..." />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">C.I. Paciente</label>
                                                            <input {...register('patientCI')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" placeholder="Cédula..." />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Doctor/a</label>
                                                            <input {...register('doctorName')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Cargo</label>
                                                            <input {...register('doctorTitle')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                        </div>
                                                        {(selectedTemplate === 'frenectomia' || selectedTemplate === 'postquirurgico') && (
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Teléfono Emergencia</label>
                                                                <input {...register('emergencyNumber')} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
                                                            <ClipboardDocumentListIcon className="h-4 w-4 text-emerald-500" />
                                                            Recomendaciones
                                                        </h3>
                                                        <button
                                                            type="button"
                                                            onClick={() => append("")}
                                                            className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-100 transition-all"
                                                        >
                                                            + Añadir
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {fields.map((field, index) => (
                                                            <div key={field.id} className="flex gap-2">
                                                                <div className="w-6 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 mt-1">
                                                                    {index + 1}
                                                                </div>
                                                                <textarea
                                                                    {...register(`recommendations.${index}`)}
                                                                    rows={2}
                                                                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium resize-none focus:ring-1 focus:ring-blue-500 outline-none"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => remove(index)}
                                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                                                    title="Eliminar punto"
                                                                >
                                                                    <TrashIcon className="h-5 w-5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleSubmit(handleSaveDynamic)}
                                                    disabled={uploading}
                                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
                                                >
                                                    {uploading ? 'GUARDANDO...' : 'GUARDAR DOCUMENTO DINÁMICO'}
                                                </button>
                                            </div>

                                            {/* Preview Panel */}
                                            <div className="bg-slate-800 rounded-2xl overflow-hidden flex flex-col min-h-[500px] shadow-inner lg:sticky lg:top-0">
                                                <div className="bg-slate-900/50 px-4 py-2 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <EyeIcon className="h-4 w-4 text-slate-400" />
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vista Previa PDF</span>
                                                        </div>
                                                        <button
                                                            onClick={handleRefreshPreview}
                                                            className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-full transition-all group active:scale-95"
                                                            title="Actualizar Previsualización"
                                                        >
                                                            <PrinterIcon className="h-3 w-3 group-hover:rotate-12 transition-transform" />
                                                            <span className="text-[8px] font-bold uppercase tracking-tighter">Actualizar Vista</span>
                                                        </button>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <div className="w-2 h-2 rounded-full bg-red-500/40" />
                                                        <div className="w-2 h-2 rounded-full bg-amber-500/40" />
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 bg-slate-100/5 backdrop-blur-sm p-4">
                                                    <div className="w-full h-full bg-white rounded-xl shadow-2xl overflow-hidden border border-white/10">
                                                        <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
                                                            {selectedTemplate === 'clareamiento' ? (
                                                                <ComplementoClareamientoDocument data={previewData} />
                                                            ) : selectedTemplate === 'frenectomia' ? (
                                                                <ComplementoFrenectomiaDocument data={previewData} />
                                                            ) : (
                                                                <ComplementoPostquirurgicoDocument data={previewData} />
                                                            )}
                                                        </PDFViewer>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
                                    <button
                                        onClick={onClose}
                                        className="px-10 py-3 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all active:scale-95 uppercase text-xs tracking-wider"
                                    >
                                        Cerrar Gestión
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
