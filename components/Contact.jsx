'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false })


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
        setTimeout(() => {
            setStatus('success')
        }, 1500)
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
                            <h2 className="text-3xl lg:text-4xl font-black text-secondary uppercase tracking-tight mb-4">
                                Agenda tu <span className="text-primary">Valoración</span>
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
                                <h3 className="text-2xl font-black text-secondary uppercase mb-2">¡Solicitud Enviada!</h3>
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
                                    <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Nombre Completo</label>
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
                                    <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">WhatsApp</label>
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
                                    <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Motivo de Consulta</label>
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
                                    <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Mensaje / Horario</label>
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
                                        className="w-full bg-primary hover:bg-secondary text-white font-black uppercase py-5 px-8 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed tracking-widest text-sm relative overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1"
                                        style={{ clipPath: 'polygon(0 0, 100% 0, 98% 100%, 0 100%)' }} // Corte sutil
                                    >
                                        <span className="flex items-center justify-center gap-3">
                                            {status === 'submitting' ? 'PROCESANDO...' : 'SOLICITAR MI VALORACIÓN'}
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

                            <LeafletMap />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
