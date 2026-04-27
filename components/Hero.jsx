'use client'

import Image from 'next/image'

export default function Hero() {
    const handleAgendarWhatsApp = () => {
        const phone = '593967885039'
        const message = encodeURIComponent('¡Hola! Me gustaría agendar una cita para un tratamiento de ortodoncia con la Dra. Diana Rodríguez. ¿Cuál es su disponibilidad?')
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    }

    const scrollToEspecialidades = () => {
        const especialidades = document.getElementById('especialidades')
        if (especialidades) {
            especialidades.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <section id="inicio" className="relative min-h-[700px] lg:h-[calc(100vh-100px)] flex items-center overflow-hidden bg-white">
            {/* Imagen de Fondo (Patrón de Hexágonos) */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/hero-pattern-bg.png"
                    alt="Background Pattern"
                    fill
                    className="object-cover opacity-30"
                    priority
                />
            </div>

            {/* Decoración: Hexágonos sutiles adicionales */}
            <div className="absolute top-20 left-10 w-64 h-64 border border-primary/5 hexagon rotate-12 pointer-events-none"></div>
            <div className="absolute bottom-10 right-1/4 w-96 h-96 border border-primary/3 hexagon -rotate-12 pointer-events-none"></div>

            <div className="container-custom relative z-10 w-full flex flex-col lg:flex-row items-center gap-12 pt-12 lg:pt-0">
                {/* Columna Izquierda: Texto y CTAs */}
                <div className="w-full lg:w-1/2 text-left fade-in-up">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight tracking-tight text-secondary">
                        Ortodoncia en Loja: <br className="hidden sm:block" />
                        <span className="text-primary font-medium">Transforma tu Sonrisa</span> con Hexadent
                    </h1>

                    <p className="text-lg md:text-xl lg:text-2xl my-6 text-secondary/80 font-medium">
                        Contamos con un equipo de especialistas altamente capacitados en el cuidado de tu salud bucal!
                    </p>

                    <p className="text-base md:text-lg mb-10 text-secondary/70 hidden md:block">
                        En <strong>San Sebastián, Loja</strong> - Tecnología de punta y atención personalizada
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <div className="drop-shadow-lg filter">
                            <button
                                onClick={handleAgendarWhatsApp}
                                className="w-full bg-primary text-white font-bold py-4 px-10 hover:bg-[#007575] transition-all rounded-full uppercase tracking-widest text-sm"
                            >
                                Agendar Cita
                            </button>
                        </div>
                        <div className="drop-shadow-lg filter">
                            <button
                                onClick={scrollToEspecialidades}
                                className="w-full bg-primary text-white font-bold py-4 px-10 hover:bg-[#007575] transition-all rounded-full uppercase tracking-widest text-sm"
                            >
                                Especialidades
                            </button>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Imagen Hexagonal y Texto */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center items-center lg:items-end relative gap-6 lg:gap-8 mt-12 lg:mt-0">
                    <div className="relative w-64 h-[22rem] md:w-[380px] md:h-[460px]">
                        {/* Sombra/Fondo del hexágono gris claro */}
                        <div className="absolute inset-0 bg-gray-100/30 hexagon transform scale-110"></div>
                        
                        {/* Fondo blanco del hexágono principal */}
                        <div className="absolute inset-0 bg-white hexagon shadow-2xl overflow-hidden">
                            <Image
                                src="/hero-image.webp"
                                alt="Transforma tu Sonrisa"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* Texto Manuscrito (Abajo de la imagen en ambos) */}
                    <div className="z-20 fade-in-up delay-300 text-center lg:text-right w-full mb-10 lg:mb-0">
                        <div className="font-script text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                            <span className="text-secondary">Cuidamos de tu </span>
                            <span className="text-primary drop-shadow-sm">Sonrisa...!</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Línea Teal Inferior de Separación */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-primary"></div>
        </section>
    )
}
