'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext';
import {
    ClipboardDocumentListIcon,
    CalendarIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import Link from 'next/link';

function AdminLayoutContent({ children }) {
    const { user, logout, loading } = useAdminAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user && pathname !== '/admin/login') {
            router.push('/admin/login');
        }
    }, [user, loading, pathname, router]);

    // Don't show layout on login page
    if (pathname === '/admin/login') {
        return children;
    }

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Cargando...</div>
            </div>
        );
    }

    // Don't render if not authenticated
    if (!user) {
        return null;
    }

    const navigation = [
        {
            name: 'Fichas de Trabajo',
            href: '/admin/fichas',
            icon: ClipboardDocumentListIcon,
            current: pathname === '/admin/fichas'
        },
        {
            name: 'Agendamiento',
            href: '/admin/agendamiento',
            icon: CalendarIcon,
            current: pathname === '/admin/agendamiento'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Hexadent Admin
                    </h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
                ${item.current
                                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }
              `}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-600 hover:text-gray-900"
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {navigation.find(item => item.current)?.name || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                            Bienvenido, <span className="font-medium text-gray-900">{user.username}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                            Cerrar Sesión
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }) {
    return (
        <AdminAuthProvider>
            <AdminLayoutContent>
                {children}
            </AdminLayoutContent>
        </AdminAuthProvider>
    );
}
