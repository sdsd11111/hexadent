'use client';

import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition, Disclosure } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import {
    XMarkIcon,
    ChevronUpIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    ClipboardDocumentCheckIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import PDF components
const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    { ssr: false }
);

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    { ssr: false }
);

// Import PDF Document
import OrtopediaDocument from '@/components/pdf/OrtopediaDocument';
import ModalGalleryFicha from '@/components/modals/ModalGalleryFicha';

export default function OrtopediaFichasPage() {
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { register, handleSubmit, reset, watch, setValue } = useForm();
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = clients.filter(client =>
                client.data.section1_field1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredClients(filtered);
        } else {
            setFilteredClients(clients);
        }
    }, [searchTerm, clients]);

    const fetchClients = async () => {
        try {
            const response = await fetch('/api/fichas?type=ortopedia');
            if (response.ok) {
                const data = await response.json();
                setClients(data.fichas || []);
                setFilteredClients(data.fichas || []);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const sections = [
        { id: 1, title: 'Datos del Paciente' },
        { id: 2, title: 'Historia Clínica Ortodóntica' },
        { id: 3, title: 'Análisis Facial' },
        { id: 4, title: 'Análisis Intraoral' },
        { id: 5, title: 'Análisis Cefalométrico' },
        { id: 6, title: 'Diagnóstico Ortodóntico' },
        { id: 7, title: 'Objetivos del Tratamiento' },
        { id: 8, title: 'Plan de Tratamiento' },
        { id: 9, title: 'Aparatología' },
        { id: 10, title: 'Seguimiento y Controles' },
        { id: 11, title: 'Resultados y Retención' },
    ];

    const openModal = () => {
        setIsModalOpen(true);
        reset();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const onSubmit = async (data) => {
        setIsSaving(true);

        try {
            const response = await fetch('/api/fichas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fichaType: 'ortopedia',
                    data: data,
                    timestamp: new Date().toISOString(),
                }),
            });

            if (response.ok) {
                alert('Ficha guardada exitosamente');
                closeModal();
                fetchClients();
            } else {
                throw new Error('Error al guardar');
            }
        } catch (error) {
            alert('Error al guardar la ficha: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const formData = watch();

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link
                            href="/admin/fichas"
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            ← Volver
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Ortopedia</h1>
                    <p className="text-gray-600">Gestión de fichas de clientes</p>
                </div>

                <button
                    onClick={openModal}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                >
                    <PlusIcon className="h-5 w-5" />
                    Nuevo Cliente
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Clients List */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="text-gray-600">Cargando clientes...</div>
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                    <div className="text-gray-400 mb-4">
                        <ClipboardDocumentCheckIcon className="h-16 w-16 mx-auto mb-3" />
                        {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                    </div>
                    {!searchTerm && (
                        <button
                            onClick={openModal}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
                        >
                            <PlusIcon className="h-5 w-5" />
                            Crear Primer Cliente
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <div
                            key={client.id}
                            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                    <ClipboardDocumentCheckIcon className="h-6 w-6 text-purple-600" />
                                </div>
                                <span className="text-xs text-gray-500">ID: {client.id.slice(0, 8)}</span>
                            </div>

                            <h3 className="font-bold text-gray-900 mb-1">
                                {client.data.section1_field1 || 'Sin nombre'}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                {new Date(client.timestamp).toLocaleDateString('es-ES')}
                            </p>

                            <div className="flex gap-2">
                                <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                    <PencilSquareIcon className="h-4 w-4" />
                                    Ver/Editar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create New Client Modal */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50" />
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
                                <Dialog.Panel className="w-full max-w-7xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                    {/* Modal Header */}
                                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
                                        <Dialog.Title className="text-xl font-bold text-white">
                                            Nuevo Cliente - Ortopedia
                                        </Dialog.Title>
                                        <button
                                            onClick={closeModal}
                                            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                                        >
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="p-6">
                                        <form onSubmit={handleSubmit(onSubmit)}>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {/* Left Column - Form with Accordion */}
                                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Formulario</h3>

                                                    {sections.map((section) => (
                                                        <Disclosure key={section.id} as="div" className="border border-gray-200 rounded-lg">
                                                            {({ open }) => (
                                                                <>
                                                                    <Disclosure.Button className="flex w-full justify-between items-center px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                                                                        <span>Sección {section.id}: {section.title}</span>
                                                                        <ChevronUpIcon
                                                                            className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500 transition-transform`}
                                                                        />
                                                                    </Disclosure.Button>

                                                                    <Disclosure.Panel className="px-4 pb-4 pt-2 space-y-3 bg-gray-50">
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                Campo de texto
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                {...register(`section${section.id}_field1`)}
                                                                                placeholder="Ingrese información"
                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                                                            />
                                                                        </div>

                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                Selección
                                                                            </label>
                                                                            <select
                                                                                {...register(`section${section.id}_select`)}
                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                                                            >
                                                                                <option value="">Seleccione una opción</option>
                                                                                <option value="opcion1">Opción 1</option>
                                                                                <option value="opcion2">Opción 2</option>
                                                                                <option value="opcion3">Opción 3</option>
                                                                            </select>
                                                                        </div>

                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                Área de texto
                                                                            </label>
                                                                            <textarea
                                                                                {...register(`section${section.id}_textarea`)}
                                                                                rows="3"
                                                                                placeholder="Observaciones adicionales"
                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                                                                            />
                                                                        </div>
                                                                    </Disclosure.Panel>
                                                                </>
                                                            )}
                                                        </Disclosure>
                                                    ))}
                                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsGalleryOpen(true)}
                                                            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-purple-400 hover:bg-purple-50 transition-all text-gray-500 hover:text-purple-600"
                                                        >
                                                            <PlusIcon className="h-6 w-6" />
                                                            <span className="text-sm font-medium">
                                                                Galería de Imágenes Clínica ({watch('imagenes')?.reduce((acc, curr) => acc + (curr.data?.length || 0), 0) || 0} fotos)
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Right Column - PDF Preview */}
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vista Previa del PDF</h3>

                                                    <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                                                        <PDFViewer width="100%" height="600" className="rounded-lg">
                                                            <OrtopediaDocument data={formData} />
                                                        </PDFViewer>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="mt-6 flex flex-wrap gap-3 justify-end border-t pt-6">
                                                <button
                                                    type="button"
                                                    onClick={closeModal}
                                                    className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    Cancelar
                                                </button>

                                                {Object.keys(formData).length > 0 && (
                                                    <PDFDownloadLink
                                                        document={<OrtopediaDocument data={formData} />}
                                                        fileName={`ficha_ortopedia_${Date.now()}.pdf`}
                                                        className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
                                                    >
                                                        {({ loading }) => (loading ? 'Preparando PDF...' : 'Descargar PDF')}
                                                    </PDFDownloadLink>
                                                )}

                                                <button
                                                    type="submit"
                                                    disabled={isSaving}
                                                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSaving ? 'Guardando...' : 'Guardar'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <ModalGalleryFicha
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                images={watch('imagenes') || []}
                onSave={(newImages) => setValue('imagenes', newImages)}
            />
        </div>
    );
}
