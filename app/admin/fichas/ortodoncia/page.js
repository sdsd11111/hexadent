'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, MagnifyingGlassIcon, PencilSquareIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import ModalFichaOrtodoncia from '@/components/modals/ModalFichaOrtodoncia';

export default function OrtodonciaFichasPage() {
    const router = useRouter();
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [editingClient, setEditingClient] = useState(null);

    useEffect(() => { fetchClients(); }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = clients.filter(c => {
                const name = `${c.data.nombre || ''} ${c.data.apellido || ''}`.toLowerCase().trim();
                return name.includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
            });
            setFilteredClients(filtered);
        } else {
            setFilteredClients(clients);
        }
    }, [searchTerm, clients]);

    const fetchClients = async () => {
        try {
            const res = await fetch('/api/fichas?type=ortodoncia');
            if (res.ok) {
                const data = await res.json();
                setClients(data.fichas || []);
                setFilteredClients(data.fichas || []);
            }
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    const deleteClient = async (id) => {
        if (!confirm('¿Eliminar esta ficha de ortodoncia?')) return;
        try {
            const res = await fetch(`/api/fichas?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchClients();
        } catch (e) { alert(e.message); }
    };

    const handleEdit = (c) => { setEditingClient(c); setIsModalOpen(true); };

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() => router.push('/admin/fichas')}
                        className="text-gray-500 hover:text-gray-700 cursor-pointer z-10"
                    >
                        ← Volver
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mt-2">Fichas de Ortodoncia</h1>
                </div>
                <div className="flex gap-2">


                    <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-xl font-bold shadow-lg uppercase text-xs flex items-center gap-2">
                        <PlusIcon className="h-4 w-4 stroke-[3px]" /> Nueva Ficha Ortodoncia
                    </button>
                </div>
            </div>

            <div className="mb-8 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" placeholder="Buscar paciente por nombre o cédula..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border rounded-2xl outline-none" />
            </div>

            {isLoading ? (
                <div className="text-center py-20">Cargando fichas...</div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">No hay fichas registradas</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map(c => (
                        <div key={c.id} className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:border-orange-200 transition-all flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => deleteClient(c.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Eliminar ficha"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-100 group-hover:scale-110 transition-transform">
                                    <DocumentTextIcon className="h-8 w-8" />
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-mono text-gray-400 block tracking-tighter">ID: {c.id.slice(0, 8)}</span>
                                    <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded-full font-bold uppercase mt-1 inline-block">Ortodoncia</span>
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-orange-600 transition-colors uppercase truncate">
                                {c.data.nombre || ''} {c.data.apellido || ''}
                            </h3>
                            <p className="text-xs text-slate-500 mb-4 font-medium flex items-center gap-1">
                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                Registrado el {new Date(c.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>

                            <div className="flex gap-2 mt-auto">
                                <button
                                    onClick={() => handleEdit(c)}
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

            <ModalFichaOrtodoncia isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingClient(null); }} onSuccess={fetchClients} editData={editingClient} />
        </div>
    );
}
