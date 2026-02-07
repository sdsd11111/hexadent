'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    TrashIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

// Import New Modal
import ModalFichaOdontologiaGeneral from '@/components/modals/ModalFichaOdontologiaGeneral';

export default function OdontologiaFichasPage() {
    const router = useRouter();

    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [editingClient, setEditingClient] = useState(null);

    // Fetch clients on mount
    useEffect(() => {
        fetchClients();
    }, []);

    // Filter clients when search term changes
    useEffect(() => {
        if (searchTerm) {
            const filtered = clients.filter(client => {
                const fullName = `${client.data.nombre || ''} ${client.data.apellido || ''}`.toLowerCase().trim();
                return fullName.includes(searchTerm.toLowerCase()) || client.id.toLowerCase().includes(searchTerm.toLowerCase());
            });
            setFilteredClients(filtered);
        } else {
            setFilteredClients(clients);
        }
    }, [searchTerm, clients]);

    const fetchClients = async () => {
        try {
            const response = await fetch('/api/fichas?type=odontologia');
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

    const deleteClient = async (id) => {
        if (!confirm('¿Está seguro de eliminar esta ficha? Esta acción no se puede deshacer.')) return;

        try {
            const response = await fetch(`/api/fichas?id=${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Ficha eliminada');
                fetchClients();
            } else {
                throw new Error('Error al eliminar');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
    };

    const handleGoBack = () => {
        try {
            router.push('/admin/fichas');
        } catch (error) {
            console.error('Router error:', error);
            window.location.href = '/admin/fichas';
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <button
                            type="button"
                            onClick={handleGoBack}
                            className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 cursor-pointer relative z-50"
                        >
                            ← Volver
                        </button>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Odontología General</h1>
                    <p className="text-gray-600">Gestión de fichas clínicas especializadas</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-700 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-800 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl active:scale-95 uppercase text-xs"
                >
                    <PlusIcon className="h-4 w-4 stroke-[3px]" />
                    Nueva Ficha Clínica
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
                <div className="relative group">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar paciente por nombre o cédula..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Clients List */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg mb-4" />
                            <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-slate-100 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="text-gray-400 mb-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DocumentTextIcon className="h-10 w-10 text-slate-300" />
                        </div>
                        <p className="text-lg font-medium text-gray-600">
                            {searchTerm ? 'No se encontraron pacientes con ese criterio' : 'Todavía no hay fichas clínicas registradas'}
                        </p>
                    </div>
                    {!searchTerm && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 uppercase text-xs"
                        >
                            <PlusIcon className="h-4 w-4 stroke-[3px]" />
                            Crear Mi Primera Ficha
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <div
                            key={client.id}
                            className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:border-blue-200 transition-all flex flex-col relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => deleteClient(client.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Eliminar ficha"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
                                    <DocumentTextIcon className="h-8 w-8" />
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-mono text-gray-400 block tracking-tighter">ID: {client.id.slice(0, 8)}</span>
                                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold uppercase mt-1 inline-block">General</span>
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors uppercase truncate">
                                {client.data.nombre || ''} {client.data.apellido || ''}
                            </h3>
                            <p className="text-xs text-slate-500 mb-4 font-medium flex items-center gap-1">
                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                Registrado el {new Date(client.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>

                            <div className="flex gap-2 mt-auto">
                                <button
                                    onClick={() => handleEdit(client)}
                                    className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95 uppercase tracking-wide"
                                >
                                    <PencilSquareIcon className="h-4 w-4" />
                                    Editar Ficha
                                </button>
                                <button className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-all hover:border-slate-300">
                                    <DocumentTextIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Ficha Modal Component */}
            <ModalFichaOdontologiaGeneral
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={fetchClients}
                editData={editingClient}
            />
        </div>
    );
}
