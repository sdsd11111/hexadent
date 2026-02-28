'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function About() {
    return (
        <section id="nosotros" className="relative py-20 lg:py-32 bg-white overflow-hidden">
            {/* Fondo Decorativo Hexagonal (Marca de Agua) */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 border-4 border-secondary hexagon transform rotate-12"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 border-4 border-secondary hexagon transform -rotate-12"></div>
                <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] border-2 border-secondary hexagon transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>

            <div className="container-custom relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Columna Izquierda: Contenido y Narrativa - Order 2 on mobile, 1 on LG */}
                    <div className="space-y-8 fade-in-up order-2 lg:order-1">
                        <div className="space-y-4">
                            <h2 className="text-3xl lg:text-4xl font-light text-secondary leading-tight">
                                Referente en <span className="text-primary font-medium">Ortodoncia y Ortopedia</span> en Loja
                            </h2>
                            <div className="w-20 h-1.5 bg-primary"></div>

                            {/* Eliminado badge de Especialización de esta zona según solicitud */}
                            <div className="pt-4 pb-2 border-b border-transparent"></div>
                        </div>

                        <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                            <p>
                                En <strong>Centro Odontológico Hexadent</strong>, redefinimos la experiencia dental en <strong>Loja</strong>. Bajo el liderazgo de la <strong>Odontóloga Diana Rodríguez</strong>, fusionamos calidez humana con los más altos estándares científicos.
                            </p>
                            <p>
                                Priorizamos diagnósticos precisos y tratamientos personalizados para garantizar una sonrisa estética, funcional y saludable a largo plazo.
                            </p>
                        </div>

                        {/* Pilares Misión/Visión Geometrizados */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                            {[
                                { title: 'Excelencia Clínica', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                                { title: 'Tecnología Biocompatible', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
                                { title: 'Resultados Reales', icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
                            ].map((item, index) => (
                                <div key={index} className="bg-gray-50 p-4 border-l-4 border-primary hover:bg-white hover:shadow-lg transition-sharp cursor-default">
                                    <svg className="w-8 h-8 text-primary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d={item.icon} />
                                    </svg>
                                    <h4 className="font-bold text-secondary text-sm uppercase">{item.title}</h4>
                                </div>
                            ))}
                        </div>

                        {/* Gatillo de Confianza + CTA */}
                        <div className="pt-6 flex flex-col sm:flex-row gap-6 items-center">
                            <Link href="#contacto" className="btn btn-secondary text-sm px-8 py-4 w-full sm:w-auto">
                                AGENDA TU CITA AHORA
                            </Link>

                            {/* Badge SEO Local */}
                            <div className="flex items-center gap-3 bg-primary/5 p-3 px-5 border border-primary/20">
                                <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <div className="text-xs text-secondary">
                                    <p className="font-bold">UBICACIÓN ESTRATÉGICA</p>
                                    <p>Lourdes entre Bolívar y Sucre</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Imagen de la Doctora - Order 1 on mobile, 2 on LG */}
                    <div className="relative flex justify-center lg:justify-end fade-in-up delay-200 order-1 lg:order-2 mb-36 lg:mb-0">
                        {/* Elemento decorativo detrás de la imagen */}
                        <div className="absolute top-1/2 left-1/2 w-[110%] h-[110%] bg-primary/20 hexagon transform -translate-x-1/2 -translate-y-1/2 rotate-6 z-0"></div>

                        <div className="relative w-full max-w-md aspect-square z-10">
                            {/* Badge Rusia - Colores oficiales y tamaño mejorado - Movido un poco más arriba en móvil */}
                            <div className="absolute -top-10 -right-2 md:top-8 md:-right-8 z-30 flex items-center gap-3 px-4 py-2.5 bg-white shadow-2xl border-r-4 border-primary">
                                <div className="flex flex-col w-12 h-8 border border-gray-100 overflow-hidden shadow-sm">
                                    <div className="h-1/3 bg-white"></div>
                                    <div className="h-1/3" style={{ backgroundColor: '#0039A6' }}></div>
                                    <div className="h-1/3" style={{ backgroundColor: '#D52B1E' }}></div>
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Especializada en</span>
                                    <span className="text-sm font-black text-secondary uppercase leading-none tracking-wide">RUSIA</span>
                                </div>
                            </div>

                            <div className="w-full h-full hexagon overflow-hidden relative shadow-2xl bg-white">
                                <Image
                                    src="/doctor.png"
                                    alt="Dra. Diana Rodríguez - Especialista en Ortodoncia Loja"
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-700"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />

                                {/* Overlay gradiente inferior para profundidad */}
                                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                        </div>

                        {/* Floating Badge -Visible on both mobile and desktop- */}
                        <div className="absolute -bottom-20 md:-bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:-left-6 bg-white p-5 shadow-2xl border-l-4 border-primary z-20 w-full max-w-[280px] md:max-w-[300px]">
                            {/* Logo en la tarjeta */}
                            <div className="mb-4 pb-4 border-b border-gray-100">
                                <svg width="200" height="75" viewBox="0 0 240 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto md:mx-0">
                                    <g stroke="#009797" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M15 28 V85" strokeLinecap="butt" />
                                        <path d="M25 15 V85" strokeLinecap="butt" />
                                        <path d="M25 15 C65 15 75 30 75 50 C75 70 65 85 25 85" fill="none" />
                                        <path d="M15 28 H52" strokeLinecap="butt" />
                                        <path d="M52 28 C68 28 68 56 52 56" fill="none" />
                                        <path d="M52 56 H15" strokeLinecap="butt" />
                                        <path d="M35 56 L48 78" />
                                    </g>
                                    <text x="85" y="38" fill="#2a2b2e" fontSize="24" fontWeight="500" className="font-sans tracking-tight">DIANA</text>
                                    <text x="85" y="65" fill="#2a2b2e" fontSize="24" fontWeight="500" className="font-sans tracking-tight">RODRÍGUEZ</text>
                                    <rect x="85" y="72" width="145" height="1" fill="#f3f4f6" />
                                    <text x="85" y="85" fill="#58595b" fontSize="10" fontWeight="400" letterSpacing="5" className="font-sans uppercase">Ortodoncista</text>
                                </svg>
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1 text-center md:text-left">Especialista en</p>
                            <p className="text-lg font-medium text-secondary leading-tight text-center md:text-left">ORTODONCIA</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
