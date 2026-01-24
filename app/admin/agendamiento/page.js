export default function AgendamientoPage() {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Agendamiento</h1>
                <p className="text-gray-600">Módulo de gestión de citas y agenda</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg
                            className="w-10 h-10 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Módulo en Desarrollo
                    </h2>

                    <p className="text-gray-600 mb-6">
                        El módulo de agendamiento estará disponible próximamente. Aquí podrás gestionar citas,
                        horarios y la disponibilidad de los profesionales.
                    </p>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Próximamente
                    </div>
                </div>
            </div>
        </div>
    );
}
