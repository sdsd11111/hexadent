'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'



export default function Especialidades() {
    const [selectedService, setSelectedService] = useState(null)

    // Bloquear scroll cuando el modal está abierto
    useEffect(() => {
        if (selectedService) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [selectedService])

    const especialidades = [
        {
            id: 1,
            title: 'Ortodoncia y Ortopedia',
            subtitle: 'Alineación y Desarrollo',
            description: 'Brackets metálicos, estéticos e invisibles. Guía del crecimiento maxilar con ortopedia.',
            detailedDescription: 'Tratamientos especializados para corregir la posición de los dientes y guiar el correcto desarrollo maxilofacial. Utilizamos tecnología de vanguardia en brackets metálicos, cerámicos (estéticos) y alineadores invisibles (Invisalign), asegurando una sonrisa funcional, estética y armónica desde la infancia hasta la edad adulta.',
            iconPath: '/images/icon_ortodoncia.webp'
        },
        {
            id: 2,
            title: 'Rehabilitación Oral',
            subtitle: 'Restauración Integral',
            description: 'Recupera la funcionalidad y estética con restauraciones dentales de alta calidad.',
            detailedDescription: 'Soluciones integrales diseñadas para restaurar la función masticatoria, la salud y la estética dental. Incluye prótesis fijas, removeribles, coronas de porcelana y restauraciones estéticas, devolviéndote la confianza al sonreír con resultados naturales y duraderos.',
            iconPath: '/images/icon_rehabilitacion.webp'
        },
        {
            id: 3,
            title: 'Cirugía Oral',
            subtitle: 'Procedimientos Seguros',
            description: 'Extracciones y cirugías dentales precisas con tecnología avanzada y segura.',
            detailedDescription: 'Procedimientos quirúrgicos realizados bajo los más estrictos estándares de bioseguridad. Especialistas en extracciones de cordales (terceros molares), frenectomías e intervenciones complejas, garantizando bienestar en todo momento y una recuperación rápida y segura.',
            iconPath: '/images/icon_cirugia.webp'
        },
        {
            id: 4,
            title: 'Odontopediatría',
            subtitle: 'Cuidado Dental Infantil',
            description: 'Atención dental preventiva y amigable diseñada especialmente para los más pequeños.',
            detailedDescription: 'Cuidado dental integral y preventivo para niños y adolescentes. Nos enfocamos en crear experiencias positivas desde la primera visita, fomentando hábitos de higiene saludables y protegiendo la salud bucal en desarrollo en un ambiente diseñado para su comodidad.',
            iconPath: '/images/icon_odontopediatria.webp'
        },
        {
            id: 5,
            title: 'Endodoncia',
            subtitle: 'Tratamiento de Conductos',
            description: 'Salvamos tus dientes naturales eliminando infecciones y dolor dental interno.',
            detailedDescription: 'Terapia dental avanzada para tratar el interior del diente (pulpa dental). Mediante tecnología moderna, eliminamos focos infecciosos y aliviamos el dolor profundo, permitiendo conservar tu pieza dental natural sin necesidad de extracciones, con el máximo confort.',
            iconPath: '/images/icon_endodoncia.webp'
        }
    ]

    const handleConsult = (service) => {
        const phone = '593967885039'
        const message = encodeURIComponent(`Hola Dra. Diana, quisiera consultar el precio y detalles sobre el tratamiento de ${service}`)
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    }

    return (
        <section id="especialidades" className="py-20 lg:py-32 bg-gray-50 relative overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 hexagon translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 hexagon -translate-x-1/2 translate-y-1/2"></div>

            <div className="container-custom relative z-10">

                {/* Encabezado de Sección */}
                <div className="text-center max-w-3xl mx-auto mb-16 fade-in-up">
                    <h2 className="text-3xl lg:text-5xl font-light text-secondary mb-4 leading-tight">
                        Especialidades en Ortodoncia y Ortopedia en Loja: <br />
                        <span className="text-primary font-script text-4xl lg:text-5xl block mt-2 normal-case">Innovación que Transforma</span>
                    </h2>
                    <div className="w-24 h-1 bg-secondary mx-auto"></div>
                </div>

                {/* Grid de Especialidades */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
                    {especialidades.map((service, index) => (
                        <div
                            key={service.id}
                            onClick={() => setSelectedService(service)}
                            className={`group relative bg-white p-1 hover:-translate-y-2 transition-transform duration-300 lg:col-span-2 cursor-pointer ${index === 3 ? 'lg:col-start-2 md:col-start-1' : ''
                                }`}
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)' }} // Corte diagonal inferior derecho
                        >
                            {/* Borde animado (Background del contenedor padre) */}
                            <div className="absolute inset-0 bg-gray-200 group-hover:bg-primary transition-colors duration-300 -z-10"></div>

                            {/* Contenido de la tarjeta */}
                            <div className="bg-white h-full p-8 flex flex-col relative z-10"
                                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)' }}>

                                {/* Icono de Especialidad */}
                                <div className="w-full h-48 relative mb-6 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                                    {service.iconPath && (
                                        <img 
                                            src={service.iconPath} 
                                            alt={service.title}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                    )}
                                </div>

                                <h3 className="text-xl font-medium text-secondary mb-2 uppercase tracking-tight group-hover:text-primary transition-colors">
                                    {service.title}
                                </h3>
                                <p className="text-xs font-bold text-primary mb-4 uppercase tracking-widest">
                                    {service.subtitle}
                                </p>
                                <p className="text-gray-600 text-sm leading-relaxed mb-8 flex-grow">
                                    {service.description}
                                </p>

                                {/* Micro-CTA */}
                                <div
                                    className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-400 font-bold text-xs uppercase group-hover:border-primary group-hover:text-primary group-hover:bg-primary/5 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    Ver Detalles
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Lightbox de Detalles */}
                {selectedService && (
                    <div
                        className="fixed inset-0 z-[95] flex items-start md:items-center justify-center bg-secondary/95 backdrop-blur-md animate-fade-in overflow-y-auto"
                        onClick={() => setSelectedService(null)}
                    >
                        {/* Botón de Cierre (Justo debajo del Header) */}
                        <button
                            onClick={() => setSelectedService(null)}
                            className="fixed top-[95px] right-6 z-[100] bg-primary text-white p-3 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center border-2 border-white/20"
                            aria-label="Cerrar detalles"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div
                            className="bg-white max-w-2xl w-full my-32 md:my-10 relative animate-scale-up shadow-2xl overflow-hidden"
                            style={{ clipPath: 'none' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header del Lightbox */}
                            <div className="relative h-64 md:h-80 bg-gray-50 flex items-center justify-center overflow-hidden">
                                {selectedService.iconPath && (
                                    <img 
                                        src={selectedService.iconPath} 
                                        alt={selectedService.title}
                                        className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                                    />
                                )}
                                <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-primary via-secondary to-primary"></div>
                            </div>

                            <div className="p-8 md:p-12">
                                <h2 className="text-3xl md:text-4xl font-light text-secondary mb-2 uppercase tracking-tight">
                                    {selectedService.title}
                                </h2>
                                <p className="text-sm font-bold text-primary mb-8 uppercase tracking-widest border-b border-gray-100 pb-4">
                                    {selectedService.subtitle}
                                </p>

                                <p className="text-lg leading-relaxed mb-12 text-gray-600 font-light italic">
                                    {selectedService.detailedDescription}
                                </p>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => handleConsult(selectedService.title)}
                                        className="btn btn-primary w-full py-5 flex items-center justify-center gap-4 text-sm tracking-[0.2em] font-bold shadow-xl hover:shadow-primary/20 transition-all uppercase"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                        COORDINAR CITA POR WHATSAPP
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
