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
        <header className="sticky top-0 z-[100] bg-white shadow-sm border-b-[6px] border-[#13a79b]">
            <div className="container-custom relative">
                <nav className="flex items-center justify-between h-20 md:h-28 px-2 md:px-4 overflow-visible relative">
                    {/* Fondo Slant Izquierdo (Blanco con sombra) */}
                    <div className="absolute top-0 left-[-5%] bottom-0 z-0 w-[60%] md:w-[45%] lg:w-[38%] xl:w-[32%] pointer-events-none filter drop-shadow-[8px_0_15px_rgba(0,0,0,0.15)] hidden md:block">
                        <div className="w-full h-full bg-white relative" style={{ clipPath: 'polygon(0 0, 85% 0, 100% 100%, 0% 100%)' }}>
                        </div>
                    </div>

                    {/* Nuevo Fondo Slant Derecho Gris */}
                    <div className="absolute top-0 right-0 bottom-0 z-0 w-[50%] md:w-[45%] lg:w-[32%] xl:w-[28%] pointer-events-none filter drop-shadow-[-8px_0_15px_rgba(0,0,0,0.15)] hidden md:block">
                        <div className="w-full h-full bg-[#58595b] relative" style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}>
                        </div>
                    </div>

                    {/* Solo Logo (Ajustado para formato rectangular) */}
                    <Link href="/" className="relative z-20 flex items-center hover-scale group ml-2 md:ml-4 py-2">
                        <div className="shrink-0 flex items-center transition-transform group-hover:scale-105">
                            <Image
                                src="/logo-rectangular.png"
                                alt="Hexadent Logo"
                                width={600}
                                height={130}
                                className="h-12 md:h-[60px] lg:h-[70px] w-auto object-contain"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Navegación Desktop (z-index corregido) */}
                    <div className="hidden lg:flex items-center gap-6 xl:gap-8 ml-auto mr-4 font-bold text-[#58595b] text-sm uppercase tracking-wider relative z-20">
                        <Link href="#inicio" className="hover:text-[#13a79b] transition-colors">Inicio</Link>
                        <Link href="#nosotros" className="hover:text-[#13a79b] transition-colors">Nosotros</Link>
                        <Link href="#especialidades" className="hover:text-[#13a79b] transition-colors">Especialidades</Link>
                        <Link href="#galeria" className="hover:text-[#13a79b] transition-colors">Casos Clínicos</Link>
                        <Link href="#contacto" className="text-white hover:text-[#13a79b] transition-colors">Contacto</Link>
                    </div>

                    {/* Botón Reservar y Menú Móvil */}
                    <div className="flex items-center gap-4 relative z-10">
                        <button
                            onClick={handleReservarCita}
                            className="hidden md:block bg-transparent border-2 border-white text-white font-bold px-8 py-3 lg:py-4 text-sm hover:bg-white hover:text-[#13a79b] transition-all uppercase tracking-widest"
                        >
                            RESERVAR CITA
                        </button>

                        <button
                            onClick={toggleMenu}
                            className="lg:hidden flex flex-col gap-1.5 w-10 h-10 justify-center items-center shrink-0"
                            aria-label="Toggle menu"
                        >
                            <span className={`w-8 h-1 bg-[#58595b] transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
                            <span className={`w-8 h-1 bg-[#58595b] transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`w-8 h-1 bg-[#58595b] transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Menú Móvil */}
            <div
                className={`lg:hidden overflow-hidden transition-all duration-500 bg-white ${isMenuOpen ? 'max-h-screen border-t border-gray-100' : 'max-h-0'}`}
            >
                <div className="flex flex-col p-8 gap-6">
                    {[
                        { name: 'Inicio', href: '#inicio' },
                        { name: 'Nosotros', href: '#nosotros' },
                        { name: 'Especialidades', href: '#especialidades' },
                        { name: 'Casos Clínicos', href: '#galeria' },
                        { name: 'Contacto', href: '#contacto' }
                    ].map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="text-[#58595b] font-bold py-2 uppercase tracking-[0.2em] text-sm hover:text-[#13a79b]"
                        >
                            {item.name}
                        </Link>
                    ))}
                    <button
                        onClick={() => { handleReservarCita(); setIsMenuOpen(false); }}
                        className="bg-[#58595b] text-white font-bold py-5 px-6 text-sm uppercase tracking-widest"
                    >
                        RESERVAR CITA
                    </button>
                </div>
            </div>
        </header>
    )
}
