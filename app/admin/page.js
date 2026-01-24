'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to fichas by default
        router.push('/admin/fichas');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-96">
            <div className="text-gray-600">Redirigiendo...</div>
        </div>
    );
}
