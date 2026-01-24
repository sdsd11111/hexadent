'use client'

import { useState } from 'react'

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null)

    const faqs = [
        {
            question: '¿Dónde está ubicada la clínica Hexadent en Loja?',
            answer: 'Nos encontramos estratégicamente ubicados en el corazón del casco central de Loja, en el tradicional sector de San Sebastián. Nuestra dirección exacta es Calles Lourdes 156-46, entre Bolívar y Sucre. Contamos con fácil acceso y cercanía a las principales vías de la ciudad.'
        },
        {
            question: '¿Qué tipos de ortodoncia ofrece la Dra. Diana Rodríguez?',
            answer: 'La Dra. Diana Rodríguez es especialista en ortodoncia correctiva, estética e interceptiva. Utilizamos exclusivamente materiales biocompatibles de alta tecnología y enfoques de odontología multidisciplinar para garantizar tratamientos seguros, rápidos y resultados estéticamente perfectos.'
        },
        {
            question: '¿Cómo puedo agendar una cita de valoración?',
            answer: 'Agendar es muy sencillo. Puedes contactarnos directamente a través de nuestro botón de WhatsApp en esta web o llamando al 0967885039. Realizaremos una evaluación inicial personalizada para diseñar el plan de tratamiento que mejor se adapte a tus necesidades.'
        },
        {
            question: '¿Cuáles son los horarios de atención?',
            answer: 'Atendemos de Lunes a Viernes en horario partido de 09h00 a 13h00 y de 15h00 a 18h30. Los días Sábados ofrecemos atención de 09h30 a 13h00, ideal para pacientes con agenda apretada durante la semana.'
        }
    ]

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    // Schema.org JSON-LD para FAQ
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqs.map(faq => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer
            }
        }))
    }

    return (
        <section id="faq" className="py-20 lg:py-32 bg-white relative">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="container-custom max-w-4xl mx-auto">

                {/* Header de Sección */}
                <div className="text-center mb-16 fade-in-up">
                    <h2 className="text-3xl lg:text-4xl font-black text-secondary leading-tight mb-4">
                        Preguntas <span className="text-primary">Frecuentes</span>
                    </h2>
                    <div className="w-20 h-1 bg-secondary mx-auto"></div>
                </div>

                {/* Acordeón Geométrico */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="group fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className={`w-full text-left p-6 flex justify-between items-center transition-all duration-300 border-l-4
                  ${openIndex === index
                                        ? 'bg-primary text-white border-primary shadow-lg scale-[1.02]'
                                        : 'bg-white text-secondary border-secondary border hover:bg-gray-50'
                                    }`}
                            >
                                <span className="font-bold text-lg pr-4">{faq.question}</span>

                                {/* Icono Hexagonal */}
                                <div
                                    className={`w-8 h-8 flex items-center justify-center transition-transform duration-300 hexagon
                    ${openIndex === index ? 'bg-white text-primary rotate-180' : 'bg-primary text-white'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out
                  ${openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="p-6 bg-gray-50 border-x border-b border-gray-200 text-gray-600 leading-relaxed font-medium">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}
