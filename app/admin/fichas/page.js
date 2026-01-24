'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    DocumentTextIcon,
    ClipboardDocumentCheckIcon,
    UserIcon,
    PlusIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function FichasPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const fichas = [
        {
            id: 'odontologia',
            title: 'Odontología General',
            description: 'Gestión de fichas de odontología general',
            icon: DocumentTextIcon,
            color: 'from-blue-500 to-cyan-500',
            clientCount: 0, // En producción vendría de la base de datos
        },
        {
            id: 'ortopedia',
            title: 'Ortopedia',
            description: 'Gestión de fichas de ortopedia maxilar',
            icon: ClipboardDocumentCheckIcon,
            color: 'from-purple-500 to-pink-500',
            clientCount: 0, // En producción vendría de la base de datos
        },
        {
            id: 'placeholder',
            title: 'Próximamente',
            description: 'Nueva especialidad en desarrollo',
            icon: UserIcon,
            color: 'from-gray-400 to-gray-500',
            disabled: true,
        }
    ];

    const goToFichaTipo = (fichaId) => {
        if (fichaId !== 'placeholder') {
            router.push(`/admin/fichas/${fichaId}`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Fichas de Trabajo</h1>
                <p className="text-gray-600">Selecciona el tipo de ficha para gestionar clientes</p>
            </div>

            {/* Fichas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fichas.map((ficha) => {
                    const Icon = ficha.icon;
                    return (
                        <button
                            key={ficha.id}
                            onClick={() => goToFichaTipo(ficha.id)}
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

                                {!ficha.disabled && (
                                    <>
                                        <div className="text-sm text-gray-500 mb-3">
                                            <span className="font-semibold text-gray-700">{ficha.clientCount}</span> cliente{ficha.clientCount !== 1 ? 's' : ''}
                                        </div>
                                        <div className="text-sm font-medium text-blue-600">
                                            Ver clientes →
                                        </div>
                                    </>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
