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
                    <a
                        href="/indicaciones-postquirurgicas.pdf"
                        download
                        className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-all shadow-md"
                    >
                        <DocumentTextIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Indicaciones Postquirúrgicas</span>
                        <span className="sm:hidden">Post-Op</span>
                    </a>

                    <a
                        href="/recomendaciones-clareamiento.pdf"
                        download
                        className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-pink-600 text-pink-600 rounded-xl font-medium hover:bg-pink-50 transition-all shadow-md"
                    >
                        <DocumentTextIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Recomendaciones Clareamiento</span>
                        <span className="sm:hidden">Clareamiento</span>
                    </a>

                    <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-xl font-bold shadow-lg uppercase text-xs flex items-center gap-2">
                        <PlusIcon className="h-4 w-4 stroke-[3px]" /> Nueva Ficha Ortodoncia
                    </button>
                </div>
            </div>

            <div className="mb-8 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" placeholder="Buscar paciente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border rounded-2xl outline-none" />
            </div>

            {isLoading ? (
                <div className="text-center py-20">Cargando fichas...</div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">No hay fichas registradas</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map(c => (
                        <div key={c.id} className="bg-white rounded-2xl border p-6 hover:shadow-xl transition-all relative overflow-hidden group">
                            <button onClick={() => deleteClient(c.id)} className="absolute top-4 right-4 p-2 text-red-500 opacity-0 group-hover:opacity-100"><TrashIcon className="h-4 w-4" /></button>
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white mb-4"><DocumentTextIcon className="h-8 w-8" /></div>
                            <h3 className="font-bold text-lg uppercase truncate">{c.data.nombre || ''} {c.data.apellido || ''}</h3>
                            <p className="text-xs text-slate-500 mb-4 tracking-tighter">ID: {c.id.slice(0, 8)}</p>
                            <button onClick={() => handleEdit(c)} className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase hover:bg-slate-800 transition-colors">Editar Ficha</button>
                        </div>
                    ))}
                </div>
            )}

            <ModalFichaOrtodoncia isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingClient(null); }} onSuccess={fetchClients} editData={editingClient} />
        </div>
    );
}
