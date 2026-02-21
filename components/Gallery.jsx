'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function Gallery() {
    const [activeFilter, setActiveFilter] = useState('all')
    const [selectedImage, setSelectedImage] = useState(null)
    const [page, setPage] = useState(0)
    const imagesPerPage = 5

    const categories = [
        { id: 'all', label: 'Ver Todo' },
        { id: 'clinic', label: 'Nuestra Clínica' },
        { id: 'cases', label: 'Casos de Éxito' },
        { id: 'tech', label: 'Tecnología' }
    ]

    const galleryItems = [
        // --- Categoría: Nuestra Clínica ---
        {
            id: 1,
            category: 'clinic',
            src: '/images/clinica 1.webp',
            alt: 'Instalaciones de Clínica Hexadent - Loja',
            size: 'large' // Destacada
        },
        {
            id: 2,
            category: 'clinic',
            src: '/images/clinica 2.webp',
            alt: 'Recepción y sala de espera Hexadent',
            size: 'normal'
        },
        {
            id: 3,
            category: 'clinic',
            src: '/images/clinica 3.webp',
            alt: 'Consultorio odontológico equipado',
            size: 'normal'
        },
        {
            id: 4,
            category: 'clinic',
            src: '/images/clinica 4.webp',
            alt: 'Detalles visuales de la clínica Hexadent',
            size: 'wide' // Ancho completo en grid
        },

        // --- Categoría: Casos de Éxito (Clientes) ---
        {
            id: 5,
            category: 'cases',
            src: '/images/cliente 1.webp',
            alt: 'Resultado exitoso de Ortodoncia',
            size: 'normal'
        },
        {
            id: 6,
            category: 'cases',
            src: '/images/cliente 2.webp',
            alt: 'Paciente feliz con su nueva sonrisa',
            size: 'large' // Destacada
        },
        {
            id: 7,
            category: 'cases',
            src: '/images/cliente 3.webp',
            alt: 'Transformación dental en Hexadent',
            size: 'normal'
        },
        {
            id: 8,
            category: 'cases',
            src: '/images/cliente 4.webp',
            alt: 'Sonrisa de alta estética dental',
            size: 'normal'
        },

        // --- Categoría: Tecnología ---
        {
            id: 9,
            category: 'tech',
            src: '/images/tecnologia 1.webp',
            alt: 'Equipos dentales de última generación',
            size: 'wide'
        },
        {
            id: 10,
            category: 'tech',
            src: '/images/tecnologia 2.webp',
            alt: 'Tecnología de escaneo y diagnóstico digital',
            size: 'normal'
        },
        {
            id: 11,
            category: 'tech',
            src: '/images/tecnologia 3.webp',
            alt: 'Instrumental biocompatible y seguro',
            size: 'large'
        },
        {
            id: 12,
            category: 'tech',
            src: '/images/tecnologia 4.webp',
            alt: 'Esterilización y cuidados de primer nivel',
            size: 'normal'
        }
    ]

    const baseItems = activeFilter === 'all'
        ? galleryItems
        : galleryItems.filter(item => item.category === activeFilter)

    const totalPages = Math.ceil(baseItems.length / imagesPerPage)
    const startIndex = page * imagesPerPage
    const filteredItems = baseItems.slice(startIndex, startIndex + imagesPerPage)

    return (
        <section id="galeria" className="py-20 bg-white relative">
            <div className="container-custom">

                {/* Header de Sección */}
                <div className="text-center mb-12 fade-in-up">
                    <h2 className="text-3xl lg:text-4xl font-light text-secondary mb-4 leading-tight">
                        Casos Clínicos de <span className="text-primary font-medium">Éxito en Loja</span>
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Conoce nuestras instalaciones y los resultados reales que transforman vidas en Loja.
                    </p>
                </div>

                {/* Filtros Geométricos */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setActiveFilter(cat.id)
                                setPage(0)
                            }}
                            className={`px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-300 border-2
                ${activeFilter === cat.id
                                    ? 'bg-secondary text-white border-secondary'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary'
                                }`}
                            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 25%)' }} // Corte sutil en esquina
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Masonry Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">
                    {filteredItems.map((item, index) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedImage(item)}
                            className={`relative group cursor-pointer overflow-hidden bg-gray-100 fade-in-up
                ${item.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
                ${item.size === 'wide' ? 'md:col-span-2' : ''}
              `}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <Image
                                src={item.src}
                                alt={item.alt}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Overlay Hover Efecto Lupa */}
                            <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white text-primary flex items-center justify-center hexagon transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Borde sutil al hover */}
                            <div className="absolute inset-0 border-4 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                    ))}
                </div>

                {/* Controles de Paginación */}
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center fade-in-up">
                        <button
                            onClick={() => setPage(page < totalPages - 1 ? page + 1 : 0)}
                            className="bg-primary text-white font-bold py-3 px-8 uppercase tracking-widest text-sm hover:bg-secondary transition-colors duration-300"
                            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 25%)' }}
                        >
                            {page < totalPages - 1 ? 'Ver Más' : 'Volver al Inicio'}
                        </button>
                    </div>
                )}

                {/* Pie de Galería SEO */}
                <div className="mt-8 text-center">
                    <p className="text-secondary text-xs font-bold tracking-widest uppercase opacity-60">
                        Resultados reales obtenidos en nuestro centro odontológico en el centro de Loja
                    </p>
                </div>

            </div>

            {/* Lightbox / Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="relative max-w-5xl w-full max-h-[90vh] bg-[#2a2b2e]"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Marco Estricto Gris Carbono + Acento Teal */}
                        <div className="border-8 border-secondary relative">
                            <div className="absolute top-0 right-0 w-16 h-16 border-t-8 border-r-8 border-primary z-20"></div>

                            <div className="relative aspect-square md:aspect-video w-full h-full bg-black">
                                <Image
                                    src={selectedImage.src}
                                    alt={selectedImage.alt}
                                    fill
                                    className="object-contain"
                                    sizes="100vw"
                                />
                            </div>
                        </div>

                        {/* Caption */}
                        <div className="bg-secondary p-4 text-white">
                            <p className="font-bold text-lg">{selectedImage.alt}</p>
                        </div>

                        {/* Botón Cerrar */}
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white hover:text-primary transition-colors"
                        >
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </section>
    )
}
