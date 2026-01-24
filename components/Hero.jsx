'use client'

import Image from 'next/image'

export default function Hero() {
    const handleAgendarWhatsApp = () => {
        const phone = '593967885039'
        const message = encodeURIComponent('¡Hola! Me gustaría agendar una cita para un tratamiento de ortodoncia con la Dra. Diana Rodríguez. ¿Cuál es su disponibilidad?')
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    }

    const scrollToServicios = () => {
        const servicios = document.getElementById('servicios')
        if (servicios) {
            servicios.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Imagen de Fondo */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/hero-bg.jpg"
                    alt="Clínica Dental Hexadent"
                    fill
                    className="object-cover"
                    priority
                    quality={90}
                />
                {/* Overlay oscuro */}
                <div className="absolute inset-0 bg-black/60"></div>
            </div>

            {/* Overlays Hexagonales Decorativos */}
            <div className="absolute top-20 right-10 w-32 h-32 bg-primary/20 hexagon hidden lg:block"></div>
            <div className="absolute bottom-32 left-20 w-40 h-40 bg-primary/10 hexagon hidden lg:block"></div>
            <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-white/10 hexagon hidden xl:block"></div>

            {/* Contenido */}
            <div className="container-custom relative z-10 py-20 lg:py-32">
                <div className="max-w-4xl mx-auto text-center text-white fade-in-up">
                    {/* H1 Optimizado para SEO */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                        Ortodoncia en Loja: <br className="hidden sm:block" />
                        <span className="text-primary">Transforma tu Sonrisa</span> con Hexadent
                    </h1>

                    {/* Subtítulo con mención a la Dra. Diana Rodríguez */}
                    <p className="text-lg md:text-xl lg:text-2xl mb-4 font-normal leading-relaxed">
                        Dra. <strong>Diana Rodríguez</strong> - Especialista en Ortodoncia de Vanguardia
                    </p>

                    <p className="text-base md:text-lg mb-8 opacity-90">
                        En el corazón de <strong>San Sebastián, Loja</strong> - Tecnología de punta y atención personalizada
                    </p>

                    {/* Divisor Visual */}
                    <div className="w-24 h-1 bg-primary mx-auto mb-10"></div>

                    {/* CTAs Duales */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        {/* CTA Principal: WhatsApp */}
                        <button
                            onClick={handleAgendarWhatsApp}
                            className="btn btn-primary flex items-center gap-3 w-full sm:w-auto"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            AGENDAR CITA VÍA WHATSAPP
                        </button>

                        {/* CTA Secundario: Ver Tratamientos */}
                        <button
                            onClick={scrollToServicios}
                            className="btn btn-outline w-full sm:w-auto"
                        >
                            VER TRATAMIENTOS
                        </button>
                    </div>

                    {/* Información Rápida */}
                    <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center text-sm">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span>San Sebastián, Loja</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            <span>0967885039</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span>Lun-Vie: 9:00-18:30</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
