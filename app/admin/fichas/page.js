'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    DocumentTextIcon,
    ClipboardDocumentCheckIcon,
    UserIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    FolderPlusIcon
} from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import ModalArchivosComplemento from '@/components/modals/ModalArchivosComplemento';

export default function FichasPage() {
    const router = useRouter();
    const [counts, setCounts] = useState({
        odontologia: 0,
        ortopedia: 0,
        ortodoncia: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isComplementOpen, setIsComplementOpen] = useState(false);

    const fetchCounts = async () => {
        try {
            const res = await fetch('/api/fichas?summary=true');
            if (res.ok) {
                const data = await res.json();
                setCounts(data.counts);
            }
        } catch (e) {
            console.error('Error fetching counts:', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCounts();
        window.addEventListener('focus', fetchCounts);
        return () => window.removeEventListener('focus', fetchCounts);
    }, []);

    const fichas = [
        {
            id: 'odontologia',
            title: 'Odontología General',
            description: 'Gestión de fichas de odontología general',
            icon: DocumentTextIcon,
            color: 'from-blue-500 to-cyan-500',
            clientCount: counts.odontologia,
        },
        {
            id: 'ortopedia',
            title: 'Ortopedia',
            description: 'Gestión de fichas de ortopedia maxilar',
            icon: ClipboardDocumentCheckIcon,
            color: 'from-purple-500 to-pink-500',
            clientCount: counts.ortopedia,
        },
        {
            id: 'ortodoncia',
            title: 'Ortodoncia',
            description: 'Gestión de fichas de ortodoncia especializada',
            icon: DocumentTextIcon,
            color: 'from-orange-500 to-amber-500',
            clientCount: counts.ortodoncia,
        },
        {
            id: 'archivos_complemento',
            title: 'Archivos de complemento',
            description: 'Gestión de documentos PDF adicionales',
            icon: FolderPlusIcon,
            color: 'from-emerald-500 to-teal-500',
            isSpecial: true,
            action: () => setIsComplementOpen(true)
        }
    ];

    const goToFichaTipo = (fichaId) => {
        router.push(`/admin/fichas/${fichaId}`);
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Fichas de Trabajo</h1>
                    <p className="text-gray-600">Selecciona el tipo de ficha para gestionar pacientes</p>
                </div>
                <button
                    onClick={fetchCounts}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Refrescar contadores"
                >
                    <ArrowPathIcon className={`h-6 w-6 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
                </button>
            </div>

            {/* Fichas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fichas.map((ficha) => {
                    const Icon = ficha.icon;
                    return (
                        <button
                            key={ficha.id}
                            onClick={() => ficha.action ? ficha.action() : goToFichaTipo(ficha.id)}
                            disabled={ficha.disabled}
                            className={`
                relative overflow-hidden rounded-2xl p-6 text-left transition-all
                ${ficha.disabled
                                    ? 'bg-gray-100 cursor-not-allowed opacity-60'
                                    : 'bg-white hover:shadow-xl hover:scale-105 cursor-pointer border border-gray-200'
                                }
              `}
                        >
                            {/* Gradient Background */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${ficha.color} opacity-10 rounded-full -mr-16 -mt-16`} />

                            <div className="relative">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ficha.color} flex items-center justify-center mb-4`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">{ficha.title}</h3>
                                <p className="text-sm text-gray-600 mb-4">{ficha.description}</p>

                                {ficha.isSpecial ? (
                                    <div className="text-sm font-bold text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                        Subir y gestionar archivos
                                        <span className="text-lg">→</span>
                                    </div>
                                ) : !ficha.disabled && (
                                    <>
                                        <div className="flex items-center gap-3 mb-5">
                                            {isLoading ? (
                                                <div className="h-6 w-20 bg-slate-100 animate-pulse rounded-full" />
                                            ) : (
                                                <div className="px-3 py-1 bg-slate-100 rounded-full border border-slate-200 flex items-center gap-2 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                                                    <UserIcon className="h-3 w-3 text-slate-400 group-hover:text-blue-500" />
                                                    <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">
                                                        {ficha.clientCount} {ficha.clientCount === 1 ? 'Paciente' : 'Pacientes'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                            Gestionar registros
                                            <span className="text-lg">→</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            <ModalArchivosComplemento
                isOpen={isComplementOpen}
                onClose={() => setIsComplementOpen(false)}
            />
        </div>
    );
}
