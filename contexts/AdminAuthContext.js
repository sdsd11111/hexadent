'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in from localStorage
        try {
            const storedUser = localStorage.getItem('adminUser');
            if (storedUser && storedUser !== 'undefined') {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error('Error parsing stored user:', e);
            localStorage.removeItem('adminUser');
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        // Simple authentication - in production, use a proper backend API
        if (username === 'Hexadent' && password === 'Contraseña123') {
            const userData = { username, role: 'admin' };
            setUser(userData);
            localStorage.setItem('adminUser', JSON.stringify(userData));
            return { success: true };
        }
        return { success: false, error: 'Credenciales inválidas' };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
    };

    return (
        <AdminAuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }
    return context;
}
