'use client'

import { useState } from 'react'
import Image from 'next/image'


export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        service: '',
        message: ''
    })
    const [status, setStatus] = useState(null)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setStatus('submitting')

        // WhatsApp redirection logic
        const phoneNumber = '593967885039'
        const message = `¡Hola! Me gustaría agendar una valoración.
        
*Nombre:* ${formData.name}
*WhatsApp:* ${formData.phone}
*Motivo:* ${formData.service}
*Mensaje:* ${formData.message || 'Sin mensaje adicional'}`

        const encodedMessage = encodeURIComponent(message)
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`

        // Open WhatsApp in a new tab
        window.open(whatsappUrl, '_blank')

        setTimeout(() => {
            setStatus('success')
        }, 1000)
    }

    return (
        <section id="contacto" className="relative py-20 lg:py-32 bg-white overflow-hidden">
            {/* Fondo geométrico sutil */}
            <div className="absolute top-0 right-0 w-[500px] h-full bg-gray-50 skew-x-12 translate-x-1/2 z-0 hidden lg:block"></div>

            <div className="container-custom relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">

                    {/* Columna Izquierda: Formulario (7 columnas) */}
                    <div className="lg:col-span-7 bg-white">
                        {/* Header */}
                        <div className="mb-10">
                            <h2 className="text-3xl lg:text-4xl font-light text-secondary uppercase tracking-tight mb-4">
                                Agenda tu <span className="text-primary font-medium">Valoración</span>
                            </h2>
                            <div className="w-20 h-1 bg-primary mb-4"></div>
                            <p className="text-gray-500 text-lg">
                                Déjanos tus datos y coordinaremos tu cita en nuestro centro de San Sebastián.
                            </p>
                        </div>

                        {status === 'success' ? (
                            <div className="bg-primary/5 border-l-4 border-primary p-8 lg:p-12 text-center animate-fade-in my-8 shadow-sm">
                                <div className="w-20 h-20 bg-primary text-white mx-auto flex items-center justify-center mb-6 hexagon shadow-lg">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-light text-secondary uppercase mb-2">¡Solicitud Enviada!</h3>
                                <p className="text-gray-600 mb-6">
                                    Hemos recibido tus datos correctamente. El equipo de Hexadent te contactará vía WhatsApp en los próximos minutos.
                                </p>
                                <button
                                    onClick={() => setStatus(null)}
                                    className="font-bold text-primary underline hover:text-secondary uppercase text-sm tracking-wide"
                                >
                                    Regresar al formulario
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Nombre */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-secondary uppercase tracking-widest mb-2">Nombre Completo</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border-2 border-gray-200 p-4 font-bold text-secondary focus:border-primary focus:bg-white focus:outline-none transition-all duration-300 rounded-none placeholder-gray-300"
                                        placeholder="Ej. Juan Pérez"
                                    />
                                </div>

                                {/* Teléfono */}
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-medium text-secondary uppercase tracking-widest mb-2">WhatsApp</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border-2 border-gray-200 p-4 font-bold text-secondary focus:border-primary focus:bg-white focus:outline-none transition-all duration-300 rounded-none placeholder-gray-300"
                                        placeholder="Ej. 096 788 5039"
                                    />
                                </div>

                                {/* Motivo */}
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-medium text-secondary uppercase tracking-widest mb-2">Motivo de Consulta</label>
                                    <div className="relative">
                                        <select
                                            name="service"
                                            required
                                            value={formData.service}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border-2 border-gray-200 p-4 font-bold text-secondary focus:border-primary focus:bg-white focus:outline-none transition-all duration-300 rounded-none appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Selecciona...</option>
                                            <option value="Ortodoncia">Ortodoncia (Brackets/Invisalign)</option>
                                            <option value="Limpieza">Limpieza Dental</option>
                                            <option value="Estetica">Estética / Blanqueamiento</option>
                                            <option value="Otros">Otros</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-primary">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Mensaje */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-secondary uppercase tracking-widest mb-2">Mensaje / Horario</label>
                                    <textarea
                                        name="message"
                                        rows="3"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border-2 border-gray-200 p-4 font-bold text-secondary focus:border-primary focus:bg-white focus:outline-none transition-all duration-300 rounded-none placeholder-gray-300 resize-none"
                                        placeholder="Hola, me gustaría agendar una cita..."
                                    ></textarea>
                                </div>

                                {/* Botón */}
                                <div className="md:col-span-2 pt-2">
                                    <button
                                        type="submit"
                                        disabled={status === 'submitting'}
                                        className="w-full bg-primary hover:bg-secondary text-white font-medium uppercase py-5 px-8 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed tracking-widest text-sm relative overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1"
                                        style={{ clipPath: 'polygon(0 0, 100% 0, 98% 100%, 0 100%)' }} // Corte sutil
                                    >
                                        <span className="flex items-center justify-center gap-3">
                                            {status === 'submitting' ? 'PROCESANDO...' : 'AGENDAR MI VALORACIÓN'}
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </span>
                                    </button>
                                    <p className="text-[10px] text-gray-400 mt-4 text-center">
                                        * Tus datos están protegidos y serán usados exclusivamente para contactarte.
                                    </p>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Columna Derecha: Mapa Estilizado (5 columnas) */}
                    <div className="lg:col-span-5 h-full min-h-[500px] relative">
                        <div className="absolute inset-0 bg-gray-100 shadow-2xl overflow-hidden"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)' }}> {/* Marco Hexa-Tech */}
                            <Image
                                src="/images/ubicacion.webp"
                                alt="Ubicación de Hexadent en San Sebastián, Loja"
                                fill
                                className="object-cover transition-transform duration-700 hover:scale-105"
                            />

                            {/* Overlay y Botón Google Maps */}
                            <div className="absolute inset-0 bg-secondary/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                <a
                                    href="https://maps.app.goo.gl/6NcHF86TzWDoBDZ69"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white text-secondary font-bold px-6 py-3 rounded-full shadow-xl hover:scale-105 hover:text-primary transition-all duration-300 flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5 text-[#EA4335]" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                    </svg>
                                    VER EN GOOGLE MAPS
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
