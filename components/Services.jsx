'use client'

import { useState } from 'react'

export default function Services() {
    const services = [
        {
            id: 1,
            title: 'Ortodoncia Invisible',
            subtitle: 'Invisalign & Alineadores',
            description: 'La solución premium para pacientes exigentes en Loja. Corrige tu sonrisa de forma imperceptible y cómoda, sin alterar tu estilo de vida.',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 2,
            title: 'Brackets High-Tech',
            subtitle: 'Tecnología Biocompatible',
            description: 'Sistemas de auto-ligado y materiales 100% biocompatibles que reducen la fricción, acelerando el tratamiento con mayor confort.',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            )
        },
        {
            id: 3,
            title: 'Ortodoncia Interceptiva',
            subtitle: 'Odontopediatría Especializada',
            description: 'Detección y corrección temprana de maloclusiones en niños. Guiamos el crecimiento facial para evitar cirugías futuras.',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        },
        {
            id: 4,
            title: 'Estética Integral',
            subtitle: 'Diseño de Sonrisa',
            description: 'Tratamientos complementarios para una sonrisa perfecta: blanqueamiento, carillas y contorneado estético en el centro de Loja.',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
            )
        }
    ]

    const handleConsult = (service) => {
        const phone = '593967885039'
        const message = encodeURIComponent(`Hola Dra. Diana, quisiera consultar el precio y detalles sobre el tratamiento de ${service}`)
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    }

    return (
        <section id="servicios" className="py-20 lg:py-32 bg-gray-50 relative overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 hexagon translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 hexagon -translate-x-1/2 translate-y-1/2"></div>

            <div className="container-custom relative z-10">

                {/* Encabezado de Sección */}
                <div className="text-center max-w-3xl mx-auto mb-16 fade-in-up">
                    <h2 className="text-3xl lg:text-5xl font-black text-secondary mb-4 leading-tight">
                        Servicios de Ortodoncia en Loja: <br />
                        <span className="text-primary">Innovación que Transforma</span>
                    </h2>
                    <div className="w-24 h-1 bg-secondary mx-auto"></div>
                </div>

                {/* Grid de Servicios */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <div
                            key={service.id}
                            className="group relative bg-white p-1 hover:-translate-y-2 transition-transform duration-300"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)' }} // Corte diagonal inferior derecho
                        >
                            {/* Borde animado (Background del contenedor padre) */}
                            <div className="absolute inset-0 bg-gray-200 group-hover:bg-primary transition-colors duration-300 -z-10"></div>

                            {/* Contenido de la tarjeta */}
                            <div className="bg-white h-full p-8 flex flex-col relative z-10"
                                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)' }}>

                                {/* Icono en Hexágono */}
                                <div className="w-16 h-16 bg-gray-50 flex items-center justify-center hexagon mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                    {service.icon}
                                </div>

                                <h3 className="text-xl font-black text-secondary mb-2 uppercase tracking-tight group-hover:text-primary transition-colors">
                                    {service.title}
                                </h3>
                                <p className="text-xs font-bold text-primary mb-4 uppercase tracking-widest">
                                    {service.subtitle}
                                </p>
                                <p className="text-gray-600 text-sm leading-relaxed mb-8 flex-grow">
                                    {service.description}
                                </p>

                                {/* Micro-CTA */}
                                <button
                                    onClick={() => handleConsult(service.title)}
                                    className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 font-bold text-xs uppercase hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    Consultar Precio
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Prueba Social / Transparencia */}
                <div className="mt-16 text-center border-t border-gray-200 pt-8 max-w-2xl mx-auto">
                    <p className="text-gray-500 text-sm italic">
                        <span className="text-primary font-bold text-lg not-italic block mb-2">★ ★ ★ ★ ★</span>
                        &quot;Comprometidos con la transparencia: documentamos cada caso con fotografía clínica &apos;antes y después&apos; para garantizar resultados reales y verificables.&quot;
                    </p>
                </div>

            </div>
        </section>
    )
}
