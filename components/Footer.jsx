'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    const handleWhatsAppClick = () => {
        const phone = '593967885039'
        const message = encodeURIComponent('¡Hola! Me gustaría obtener más información sobre los servicios de Hexadent.')
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    }

    return (
        <footer id="contacto" className="bg-secondary text-white">
            {/* Sección Principal del Footer */}
            <div className="container-custom section-padding">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Columna 1: Marca y Descripción */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/logo.jpg"
                                alt="Hexadent Logo"
                                width={50}
                                height={50}
                                className="w-12 h-12"
                            />
                            <span className="text-2xl font-black">
                                HEXA<span className="text-primary">DENT</span>
                            </span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Centro Odontológico especializado en Ortodoncia de vanguardia en el corazón de Loja.
                        </p>
                        <div className="pt-2">
                            <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold">
                                REGISTRO SENESCYT
                            </span>
                        </div>
                    </div>

                    {/* Columna 2: Información de Contacto (NAP) */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-black text-primary uppercase tracking-wide">
                            Contacto
                        </h3>
                        <div className="space-y-3 text-sm">
                            {/* Nombre */}
                            <div>
                                <p className="font-bold text-white">Centro Odontológico HEXA DENT</p>
                            </div>

                            {/* Dirección */}
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="text-gray-300">
                                        Calles Lourdes 156-46<br />
                                        entre Bolívar y Sucre<br />
                                        <strong>San Sebastián, Loja</strong>
                                    </p>
                                </div>
                            </div>

                            {/* Teléfono */}
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                <div>
                                    <a href="tel:0967885039" className="text-gray-300 hover:text-primary transition-sharp">
                                        0967885039
                                    </a>
                                </div>
                            </div>

                            {/* WhatsApp */}
                            <div>
                                <button
                                    onClick={handleWhatsAppClick}
                                    className="flex items-center gap-2 text-primary hover:text-white transition-sharp font-bold"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    Escríbenos por WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Columna 3: Horarios de Atención */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-black text-primary uppercase tracking-wide">
                            Horarios
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center border-b border-gray-600 pb-2">
                                <span className="font-bold text-white">Lunes - Viernes</span>
                            </div>
                            <div className="space-y-1 text-gray-300">
                                <p>• 09:00 - 13:00</p>
                                <p>• 15:00 - 18:30</p>
                            </div>

                            <div className="flex justify-between items-center border-b border-gray-600 pb-2 pt-2">
                                <span className="font-bold text-white">Sábados</span>
                            </div>
                            <div className="text-gray-300">
                                <p>• 09:30 - 13:00</p>
                            </div>

                            <div className="pt-3">
                                <p className="text-xs text-gray-400 italic">
                                    *Atención con cita previa
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Columna 4: Sección de Autoridad y Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-black text-primary uppercase tracking-wide">
                            Certificaciones
                        </h3>
                        <div className="space-y-3 text-sm text-gray-300">
                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p>Registro SENESCYT - Odontología Especializada</p>
                            </div>

                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p>Dra. Diana Rodríguez - Especialista en Ortodoncia</p>
                            </div>

                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p>Tecnología de Última Generación</p>
                            </div>
                        </div>

                        {/* Redes Sociales */}
                        <div className="pt-4">
                            <h4 className="text-sm font-bold text-white mb-3">Síguenos</h4>
                            <div className="flex gap-3">
                                <a
                                    href="#"
                                    className="w-10 h-10 bg-primary hover:bg-white hover:text-primary transition-sharp flex items-center justify-center"
                                    aria-label="Facebook"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </a>
                                <a
                                    href="#"
                                    className="w-10 h-10 bg-primary hover:bg-white hover:text-primary transition-sharp flex items-center justify-center"
                                    aria-label="Instagram"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.9194.92-.0581-1.265-.07-1.645-.07-4.849 0-3.204.0086-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra Inferior de Copyright */}
            <div className="border-t border-gray-600">
                <div className="container-custom py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                        <p>
                            © {currentYear} <strong className="text-white">HEXADENT</strong> - Odontología Especializada. Todos los derechos reservados.
                        </p>
                        <div className="flex gap-6">
                            <Link href="#" className="hover:text-primary transition-sharp">
                                Política de Privacidad
                            </Link>
                            <Link href="#" className="hover:text-primary transition-sharp">
                                Términos de Servicio
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
