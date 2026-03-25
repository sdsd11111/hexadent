'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const handleReservarCita = () => {
        const phone = '593967885039'
        const message = encodeURIComponent('¡Hola! Me gustaría agendar una cita para un tratamiento de ortodoncia con la Dra. Diana Rodríguez. ¿Cuál es su disponibilidad?')
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    }

    return (
        <header className="sticky top-0 z-[100] w-full bg-white overflow-visible shadow-sm">
            <div className="w-full relative h-[90px] md:h-[105px] lg:h-[115px]">
                <nav className="flex items-center w-full h-full relative overflow-visible">
                    
                    {/* Logo (La imagen ya incluye el bloque blanco con corte curvo y sombra) */}
                    <Link href="/" className="absolute top-0 left-0 h-full w-[220px] md:w-[260px] lg:w-[360px] xl:w-[420px] z-40 flex items-center pl-0">
                        <Image
                            src="/Recurso 1logo rectangular hexa.webp"
                            alt="Hexadent Logo"
                            width={800}
                            height={250}
                            className="w-full h-auto object-contain object-left scale-[1.25] md:scale-[1.3] lg:scale-[1.35] origin-left -translate-x-1 md:-translate-x-2 lg:-translate-x-4"
                            priority
                        />
                    </Link>

                    {/* Área Derecha: Textos, Botón y Barra Inferior */}
                    <div className="flex-1 flex flex-col h-full relative z-20 overflow-hidden lg:overflow-visible">
                        {/* Fila Superior (Blanca): Menú + Botón */}
                        <div className="flex-1 bg-white flex items-center pl-[220px] md:pl-[260px] lg:pl-[360px] xl:pl-[420px] pr-14 md:pr-16 lg:pr-10">
                            {/* Menú centrado en el espacio restante */}
                            <div className="hidden lg:flex flex-1 justify-center items-center gap-3 xl:gap-8 font-bold text-[#58595b] text-[10px] xl:text-[12px] uppercase tracking-wider whitespace-nowrap overflow-x-auto lg:overflow-visible no-scrollbar">
                                <Link href="#inicio" className="hover:text-[#13a79b] transition-colors">Inicio</Link>
                                <Link href="#nosotros" className="hover:text-[#13a79b] transition-colors">Nosotros</Link>
                                <Link href="#especialidades" className="hover:text-[#13a79b] transition-colors">Especialidades</Link>
                                <Link href="#galeria" className="hover:text-[#13a79b] transition-colors">Casos Clínicos</Link>
                                <Link href="#contacto" className="hover:text-[#13a79b] transition-colors">Contacto</Link>
                            </div>

                            {/* Botón anclado a la derecha */}
                            <button
                                onClick={handleReservarCita}
                                className="hidden md:flex shrink-0 bg-[#58595b] text-white font-bold px-6 xl:px-8 py-3 text-[11px] xl:text-[13px] hover:bg-[#13a79b] transition-colors uppercase tracking-[0.1em] ml-4 lg:ml-8 shadow-sm rounded-sm"
                            >
                                RESERVAR CITA
                            </button>
                        </div>

                        {/* Fila Inferior (Barra Gris Continua) */}
                        <div className="flex flex-col justify-end h-[15px] md:h-[30%] lg:h-[35px] relative w-full">
                            {/* Gris oscuro */}
                            <div className="w-full h-full bg-[#58595b] absolute bottom-0"></div>
                            {/* Línea turquesa en la mera base */}
                            <div className="w-full h-[4px] md:h-[5px] xl:h-[6px] bg-[#13a79b] absolute bottom-0 z-10"></div>
                        </div>
                    </div>

                    {/* Menú Móvil Toggle */}
                    <div className="flex lg:hidden items-center absolute right-4 top-[35%] md:top-[15%] -translate-y-1/2 z-50">
                        <button
                            onClick={toggleMenu}
                            className="flex flex-col gap-1.5 w-10 h-10 justify-center items-center"
                            aria-label="Toggle menu"
                        >
                            <span className={`w-8 h-1 bg-[#58595b] transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
                            <span className={`w-8 h-1 bg-[#58595b] transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`w-8 h-1 bg-[#58595b] transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Menú Móvil Desplegable */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-24 left-0 w-full bg-white shadow-2xl z-40 animate-fade-in border-t border-gray-100">
                    <div className="flex flex-col py-6">
                        <Link href="#inicio" onClick={toggleMenu} className="px-8 py-4 text-[#58595b] font-bold border-b border-gray-50 hover:bg-gray-50">Inicio</Link>
                        <Link href="#nosotros" onClick={toggleMenu} className="px-8 py-4 text-[#58595b] font-bold border-b border-gray-50 hover:bg-gray-50">Nosotros</Link>
                        <Link href="#especialidades" onClick={toggleMenu} className="px-8 py-4 text-[#58595b] font-bold border-b border-gray-50 hover:bg-gray-50">Especialidades</Link>
                        <Link href="#galeria" onClick={toggleMenu} className="px-8 py-4 text-[#58595b] font-bold border-b border-gray-50 hover:bg-gray-50">Casos Clínicos</Link>
                        <Link href="#contacto" onClick={toggleMenu} className="px-8 py-4 text-[#58595b] font-bold hover:bg-gray-50">Contacto</Link>
                        <button
                            onClick={() => { handleReservarCita(); toggleMenu(); }}
                            className="m-8 bg-[#13a79b] text-white font-bold py-4 uppercase tracking-widest rounded-sm"
                        >
                            RESERVAR CITA
                        </button>
                    </div>
                </div>
            )}
        </header>
    )
}
