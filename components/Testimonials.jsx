'use client'

import { useState, useEffect, useCallback } from 'react'

const reviews = [
    {
        id: 1,
        author: 'Andrea Palacios',
        role: 'Paciente Verificado',
        content: 'Una excelente ortodoncista y odontologa. Muy profesional en su trato y explicación del tratamiento.',
        rating: 5,
        avatarInitials: 'AP',
        link: 'https://share.google/vRb2oa29D8Sb7RWir'
    },
    {
        id: 2,
        author: 'Ariel Paredes',
        role: 'Local Guide',
        content: 'Sus tratamientos odontológicos son muy efectivos, y me ayudaron a mejorar mi salud oral. GRACIAS.',
        rating: 5,
        avatarInitials: 'AP',
        link: 'https://share.google/qaLOw1lA4HYCT7p3P'
    },
    {
        id: 3,
        author: 'Dra. Diana Rodríguez',
        role: 'Visión de Marca',
        content: 'Ofrecemos atención odontológica personalizada, manejamos técnicas modernas en Odontologia Multidisciplinar.',
        rating: 5,
        avatarInitials: 'DR',
        link: 'https://share.google/Wqt5ZQl8DkhJ3iePS'
    }
]

export default function Testimonials() {
    const [activeIndex, setActiveIndex] = useState(0)

    const nextSlide = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % reviews.length)
    }, [])

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
    }

    // Auto-play
    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide()
        }, 5000)
        return () => clearInterval(timer)
    }, [nextSlide])

    return (
        <section id="testimonios" className="py-20 bg-gray-50 relative overflow-hidden">
            {/* Patrón de líneas diagonales en esquinas */}
            <div className="absolute top-0 right-0 w-40 h-40 opacity-10"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, #58595b 0, #58595b 1px, transparent 0, transparent 10px)' }}></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 opacity-10"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, #58595b 0, #58595b 1px, transparent 0, transparent 10px)' }}></div>

            <div className="container-custom relative z-10">

                {/* Header + Badge Google */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 fade-in-up">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl lg:text-4xl font-black text-secondary leading-tight mb-2">
                            Confianza Real: <span className="text-primary">Lo que dicen nuestros pacientes</span> en Loja
                        </h2>
                        <div className="w-20 h-1 bg-primary"></div>
                    </div>

                    {/* Badge Google 5.0 */}
                    <div className="bg-white border-2 border-gray-200 p-4 min-w-[200px] flex items-center gap-4 shadow-sm hover:shadow-md transition-sharp cursor-pointer">
                        <div className="w-12 h-12 relative">
                            <svg viewBox="0 0 48 48" className="w-full h-full">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 11.95-2.16 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="font-black text-secondary text-xl leading-none">5.0</p>
                            <div className="flex text-[#FBBC05] text-xs">★★★★★</div>
                            <p className="text-xs text-gray-500 font-bold uppercase mt-1">Google Rating</p>
                        </div>
                    </div>
                </div>

                {/* Slider Geométrico */}
                <div className="relative max-w-4xl mx-auto">
                    <div className="overflow-hidden">
                        <div
                            className="flex transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                        >
                            {reviews.map((review) => (
                                <div key={review.id} className="w-full flex-shrink-0 px-4">
                                    <div
                                        className="bg-white p-8 md:p-12 shadow-lg relative h-full flex flex-col"
                                        style={{ clipPath: 'polygon(0 0, 90% 0, 100% 15%, 100% 100%, 0 100%)' }} // Corte pestaña superior derecha
                                    >
                                        {/* Comillas Decorativas */}
                                        <div className="text-gray-100 absolute top-4 right-8 text-9xl font-serif leading-none select-none">&quot;</div>

                                        {/* Contenido */}
                                        <div className="flex-grow relative z-10">
                                            <div className="flex items-center gap-1 mb-4">
                                                {[...Array(review.rating)].map((_, i) => (
                                                    <svg key={i} className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>

                                            <p className="text-lg md:text-xl text-secondary italic font-light mb-8 leading-relaxed">
                                                &quot;{review.content}&quot;
                                            </p>
                                        </div>

                                        {/* Footer Testimonio */}
                                        <div className="flex items-center gap-4 relative z-10 border-t border-gray-100 pt-6 mt-auto">
                                            {/* Avatar Hexagonal */}
                                            <div className="w-12 h-12 bg-primary flex items-center justify-center hexagon text-white font-black text-lg">
                                                {review.avatarInitials}
                                            </div>

                                            <div>
                                                <p className="font-bold text-secondary text-sm">{review.author}</p>
                                                <p className="text-primary text-xs font-bold uppercase tracking-wide">{review.role}</p>
                                            </div>

                                            {review.link !== '#' && (
                                                <a
                                                    href={review.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-auto text-xs text-gray-400 hover:text-primary flex items-center gap-1 transition-colors"
                                                >
                                                    Ver reseña
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Controles Angulares */}
                    <div className="flex justify-end gap-2 mt-6 pr-4">
                        <button
                            onClick={prevSlide}
                            className="w-12 h-12 border-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors flex items-center justify-center"
                            aria-label="Testimonio anterior"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={nextSlide}
                            className="w-12 h-12 bg-secondary text-white border-2 border-secondary hover:bg-white hover:text-secondary transition-colors flex items-center justify-center"
                            aria-label="Siguiente testimonio"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
