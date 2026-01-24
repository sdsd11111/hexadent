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
        <header className="sticky top-0 z-50 bg-white border-b-4 border-primary shadow-md">
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
                        <span className="text-2xl font-black text-secondary tracking-tight">
                            HEXA<span className="text-primary">DENT</span>
                        </span>
                    </Link>

                    {/* Navegación Desktop */}
                    <ul className="hidden md:flex items-center gap-8 font-bold text-secondary">
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
                            <Link href="#servicios" className="hover:text-primary transition-sharp">
                                Servicios
                            </Link>
                        </li>
                        <li>
                            <Link href="#contacto" className="hover:text-primary transition-sharp">
                                Contacto
                            </Link>
                        </li>
                    </ul>

                    {/* Botón Reservar Cita Desktop */}
                    <button
                        onClick={handleReservarCita}
                        className="hidden md:block btn btn-secondary"
                    >
                        RESERVAR CITA
                    </button>

                    {/* Botón Menú Móvil */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden flex flex-col gap-1.5 w-8 h-8 justify-center items-center"
                        aria-label="Toggle menu"
                    >
                        <span className={`w-full h-0.5 bg-secondary transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                        <span className={`w-full h-0.5 bg-secondary transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`w-full h-0.5 bg-secondary transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                    </button>
                </nav>

                {/* Menú Móvil */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96' : 'max-h-0'
                        }`}
                >
                    <ul className="flex flex-col gap-4 py-6 font-bold text-secondary">
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
                                href="#servicios"
                                onClick={() => setIsMenuOpen(false)}
                                className="block hover:text-primary transition-sharp"
                            >
                                Servicios
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
                        <li className="pt-4">
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
