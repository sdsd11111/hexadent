'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function VideoSection() {
    const [isPlaying, setIsPlaying] = useState(false)

    const handlePlay = () => {
        setIsPlaying(true)
    }

    return (
        <section className="bg-[#2a2b2e] py-20 lg:py-32 overflow-hidden text-white relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.05]">
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')]"></div>
            </div>

            <div className="container-custom relative z-10">
                <div className="max-w-4xl mx-auto space-y-12">

                    {/* Header del Video */}
                    <div className="text-center space-y-4 fade-in-up">
                        <h2 className="text-3xl lg:text-4xl font-black leading-tight">
                            Tecnología y Calidez: <span className="text-primary">El Corazón de Hexadent</span>
                        </h2>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                            Descubre nuestra experiencia de bienestar. Reducimos el estrés dental integrando tecnología de vanguardia y materiales biocompatibles en San Sebastián.
                        </p>
                    </div>

                    {/* Contenedor del Video Geométrico */}
                    <div className="relative w-full aspect-video group fade-in-up delay-100">
                        {/* Marco/Borde Geométrico activado en Hover - Usando pseudo-elementos o div absoluto */}
                        <div className="absolute -inset-1 bg-primary transform scale-[0.99] group-hover:scale-[1.01] transition-transform duration-300 z-0"
                            style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 90%, 95% 100%, 0 100%, 0 10%)' }}>
                        </div>

                        {/* Contenedor Principal Clip-Path */}
                        <div className="relative w-full h-full bg-black z-10 overflow-hidden"
                            style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 90%, 95% 100%, 0 100%, 0 10%)' }}>

                            {!isPlaying ? (
                                <>
                                    {/* Thumbnail con Filtro */}
                                    <Image
                                        src="/video-poster.jpg"
                                        alt="Ortodoncia Invisible en Loja - Dra. Diana Rodríguez"
                                        fill
                                        className="object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                                    />

                                    {/* Overlay Gradiente */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                                    {/* Botón Play Personalizado (Triángulo) */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <button
                                            onClick={handlePlay}
                                            className="group/btn relative w-24 h-24 hover:scale-110 transition-transform duration-300 focus:outline-none"
                                            aria-label="Reproducir Video de Autoridad"
                                        >
                                            {/* Forma Hexagonal del Botón */}
                                            <div className="absolute inset-0 bg-primary opacity-90 group-hover/btn:opacity-100 transition-opacity"
                                                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                                            </div>

                                            {/* Icono Play (Triángulo) */}
                                            <div className="absolute inset-0 flex items-center justify-center pl-2">
                                                <div className="w-0 h-0 
                                border-t-[12px] border-t-transparent
                                border-l-[20px] border-l-white
                                border-b-[12px] border-b-transparent">
                                                </div>
                                            </div>
                                        </button>
                                    </div>

                                    {/* Etiqueta de Autoridad */}
                                    <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-20">
                                        <p className="text-primary font-bold tracking-widest uppercase text-xs mb-1">Dra. Diana Rodríguez</p>
                                        <p className="text-white font-bold text-xl md:text-2xl">Innovación en Loja</p>
                                    </div>
                                </>
                            ) : (
                                <iframe
                                    className="w-full h-full"
                                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0"
                                    title="Tecnología Hexadent Loja"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
