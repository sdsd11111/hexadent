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

                    {/* Columna Izquierda: Contenido y Narrativa */}
                    <div className="space-y-8 fade-in-up">
                        <div className="space-y-4">
                            <h2 className="text-3xl lg:text-4xl font-black text-secondary leading-tight">
                                Liderando la <span className="text-primary">Ortodoncia de Vanguardia</span> en el Corazón de Loja
                            </h2>
                            <div className="w-20 h-1.5 bg-primary"></div>
                        </div>

                        <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                            <p>
                                En <strong>Centro Odontológico Hexadent</strong>, redefinimos la experiencia dental en el tradicional barrio de <strong>San Sebastián</strong>. Bajo el liderazgo de la <strong>Odontóloga Diana Rodríguez</strong>, fusionamos la calidez humana de la &quot;odontología de proximidad&quot; con los más altos estándares científicos.
                            </p>
                            <p>
                                Entendemos que cada sonrisa es única. Por eso, nuestra filosofía se centra en diagnósticos precisos y tratamientos personalizados que no solo buscan la estética perfecta, sino la funcionalidad y salud a largo plazo de cada paciente.
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
                            <Link href="#trayectoria" className="btn btn-secondary text-sm px-8 py-4 w-full sm:w-auto">
                                CONOCE NUESTRA TRAYECTORIA
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

                    {/* Columna Derecha: Imagen de la Doctora */}
                    <div className="relative flex justify-center lg:justify-end fade-in-up delay-200">
                        {/* Elemento decorativo detrás de la imagen */}
                        <div className="absolute top-1/2 left-1/2 w-[110%] h-[110%] bg-primary/20 hexagon transform -translate-x-1/2 -translate-y-1/2 rotate-6 z-0"></div>

                        <div className="relative w-full max-w-md aspect-square z-10">
                            <div className="w-full h-full hexagon overflow-hidden relative shadow-2xl bg-white">
                                <Image
                                    src="/doctor.png"
                                    alt="Dra. Diana Rodríguez - Especialista en Ortodoncia Loja"
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-700"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />

                                {/* Overlay gradiente inferior para texto */}
                                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-6">
                                    <div className="text-center text-white p-4">
                                        <p className="font-bold text-xl tracking-wide">Dra. Diana Rodríguez</p>
                                        <p className="text-xs uppercase tracking-widest text-primary font-bold">Registro SENESCYT</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -left-6 bg-white p-4 shadow-xl border-l-4 border-primary z-20 hidden md:block max-w-xs">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Especialista en</p>
                            <p className="text-lg font-black text-secondary leading-none">ORTODONCIA Y ODONTOPEDIATRÍA</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
