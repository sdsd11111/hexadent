import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
    title: 'Términos de Servicio | Hexadent',
    description: 'Términos y condiciones de uso del sitio web de Hexadent - Centro Odontológico.',
}

export default function TerminosServicio() {
    return (
        <main className="min-h-screen bg-white">
            <Header />
            <div className="container-custom py-24 md:py-32">
                <article className="max-w-4xl mx-auto prose prose-teal">
                    <h1 className="text-4xl font-black text-secondary uppercase mb-8 border-l-8 border-primary pl-6">
                        Términos de <span className="text-primary">Servicio</span>
                    </h1>

                    <section className="space-y-6 text-gray-700 leading-relaxed">
                        <p className="text-lg font-medium">
                            Bienvenido al sitio web de Hexadent. Al acceder y utilizar este sitio, usted acepta cumplir con los siguientes términos y condiciones.
                        </p>

                        <h2 className="text-2xl font-bold text-secondary uppercase mt-12">1. Uso del Sitio Web</h2>
                        <p>
                            El contenido de este sitio web es para su información general y uso personal. Está sujeto a cambios sin previo aviso. El uso de cualquier información o material en este sitio es bajo su propio riesgo, para lo cual no seremos responsables.
                        </p>

                        <h2 className="text-2xl font-bold text-secondary uppercase mt-12">2. Citas y Consultas</h2>
                        <p>
                            La solicitud de una cita a través del sitio web no garantiza la reserva inmediata. Nuestro personal se pondrá en contacto con usted para confirmar la disponibilidad y los detalles de la consulta dental.
                        </p>

                        <h2 className="text-2xl font-bold text-secondary uppercase mt-12">3. Propiedad Intelectual</h2>
                        <p>
                            Este sitio web contiene material que es propiedad nuestra o licenciado a nosotros. Este material incluye, pero no se limita a, el diseño, la maquetación, el aspecto, la apariencia y los gráficos (incluyendo el logo de Hexadent). La reproducción está prohibida salvo de acuerdo con el aviso de copyright.
                        </p>

                        <h2 className="text-2xl font-bold text-secondary uppercase mt-12">4. Enlaces Externos</h2>
                        <p>
                            De vez en cuando, este sitio web también puede incluir enlaces a otros sitios web (como Google Maps o redes sociales). Estos enlaces se proporcionan para su conveniencia y no significan que respaldamos los sitios web. No tenemos ninguna responsabilidad por el contenido de los sitios web enlazados.
                        </p>

                        <h2 className="text-2xl font-bold text-secondary uppercase mt-12">5. Limitación de Responsabilidad</h2>
                        <p>
                            Hexadent no será responsable de ningún daño directo o indirecto que surja del uso de este sitio web o de la imposibilidad de utilizarlo.
                        </p>

                        <div className="mt-16 p-6 bg-gray-50 border-l-4 border-primary italic text-sm text-gray-600">
                            Para cualquier duda sobre estos términos, por favor contáctenos directamente en nuestro centro en Loja.
                        </div>
                    </section>
                </article>
            </div>
            <Footer />
        </main>
    )
}
