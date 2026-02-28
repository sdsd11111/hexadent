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
        <header className="sticky top-0 z-[100] bg-white border-b-4 border-primary shadow-md">
            <div className="container-custom">
                <nav className="flex items-center justify-between py-4">
                    {/* Logo y Marca */}
                    <Link href="/" className="flex items-center gap-3 hover-scale">
                        <Image
                            src="/logo.jpg"
                            alt="Hexadent Logo"
                            width={50}
                            height={50}
                            className="w-12 h-12"
                            priority
                        />
                        <div className="flex flex-col justify-center">
                            <span className="text-2xl font-light text-secondary tracking-tight leading-none mb-0.5">
                                HEXA<span className="text-primary font-medium">DENT</span>
                            </span>
                            <div className="font-script text-xl md:text-2xl mt-[-4px]">
                                <span className="text-secondary">Cuidamos de tu </span>
                                <span className="text-primary">Sonrisa...!</span>
                            </div>
                        </div>
                    </Link>

                    {/* Navegación Desktop */}
                    <ul className="hidden md:flex items-center gap-8 font-medium text-secondary">
                        <li>
                            <Link href="#inicio" className="hover:text-primary transition-sharp">
                                Inicio
                            </Link>
                        </li>
                        <li>
                            <Link href="#nosotros" className="hover:text-primary transition-sharp">
                                Nosotros
                            </Link>
                        </li>
                        <li>
                            <Link href="#especialidades" className="hover:text-primary transition-sharp">
                                Especialidades
                            </Link>
                        </li>
                        <li>
                            <Link href="#galeria" className="hover:text-primary transition-sharp">
                                Casos Clínicos
                            </Link>
                        </li>
                        <li>
                            <Link href="#contacto" className="hover:text-primary transition-sharp">
                                Contacto
                            </Link>
                        </li>
                    </ul>

                    {/* Botón Reservar Cita y Menú Móvil */}
                    <div className="flex items-center gap-2 md:gap-8">
                        {/* Botón Reservar Cita */}
                        <button
                            onClick={handleReservarCita}
                            className="bg-secondary text-white font-bold px-3 py-2 text-[10px] sm:text-xs md:px-8 md:py-4 md:text-sm hover:bg-primary transition-colors whitespace-nowrap tracking-widest uppercase md:btn-secondary md:bg-secondary md:hover:bg-primary md:hover:translate-y-[-2px] md:hover:shadow-[0_4px_8px_rgba(0,151,151,0.3)] md:border-none"
                            style={{ clipPath: 'none', WebkitClipPath: 'none' }} // Para la version móvil
                        >
                            <span className="md:hidden">RESERVAR</span>
                            <span className="hidden md:inline">RESERVAR CITA</span>
                        </button>

                        {/* Botón Menú Móvil */}
                        <button
                            onClick={toggleMenu}
                            className="md:hidden flex flex-col gap-1.5 w-8 h-8 justify-center items-center shrink-0"
                            aria-label="Toggle menu"
                        >
                            <span className={`w-full h-0.5 bg-secondary transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                            <span className={`w-full h-0.5 bg-secondary transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`w-full h-0.5 bg-secondary transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                        </button>
                    </div>
                </nav>

                {/* Menú Móvil */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96' : 'max-h-0'
                        }`}
                >
                    <ul className="flex flex-col gap-4 py-6 font-medium text-secondary">
                        <li>
                            <Link
                                href="#inicio"
                                onClick={() => setIsMenuOpen(false)}
                                className="block hover:text-primary transition-sharp"
                            >
                                Inicio
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="#nosotros"
                                onClick={() => setIsMenuOpen(false)}
                                className="block hover:text-primary transition-sharp"
                            >
                                Nosotros
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="#especialidades"
                                onClick={() => setIsMenuOpen(false)}
                                className="block hover:text-primary transition-sharp"
                            >
                                Especialidades
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="#galeria"
                                onClick={() => setIsMenuOpen(false)}
                                className="block hover:text-primary transition-sharp"
                            >
                                Casos Clínicos
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="#contacto"
                                onClick={() => setIsMenuOpen(false)}
                                className="block hover:text-primary transition-sharp"
                            >
                                Contacto
                            </Link>
                        </li>
                        <li className="pt-4 hidden md:block">
                            <button
                                onClick={handleReservarCita}
                                className="btn btn-secondary w-full"
                            >
                                RESERVAR CITA
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    )
}
