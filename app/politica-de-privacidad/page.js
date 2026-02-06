import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
    title: 'Política de Privacidad | Hexadent',
    description: 'Política de Privacidad de Hexadent - Centro Odontológico Especializado en Loja.',
}

export default function PoliticaPrivacidad() {
    return (
        <main className="min-h-screen bg-white">
            <Header />
            <div className="container-custom py-24 md:py-32">
                <article className="max-w-4xl mx-auto prose prose-teal">
                    <h1 className="text-4xl font-black text-secondary uppercase mb-8 border-l-8 border-primary pl-6">
                        Política de <span className="text-primary">Privacidad</span>
                    </h1>

                    <section className="space-y-6 text-gray-700 leading-relaxed">
                        <p className="text-lg font-medium">
                            En Hexadent, valoramos su privacidad y estamos comprometidos a proteger sus datos personales. Esta política de privacidad le informa sobre cómo tratamos sus datos cuando visita nuestro sitio web y sus derechos de privacidad.
                        </p>

                        <h2 className="text-2xl font-bold text-secondary uppercase mt-12">1. Información que recopilamos</h2>
                        <p>
                            Recopilamos información personal que usted nos proporciona directamente cuando solicita una cita, nos envía un mensaje por WhatsApp o utiliza nuestro formulario de contacto. Esto puede incluir su nombre, número de teléfono, correo electrónico y detalles sobre su consulta dental.
                        </p>

                        <h2 className="text-2xl font-bold text-secondary uppercase mt-12">2. Uso de su información</h2>
                        <p>
                            Utilizamos la información recopilada para:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Gestionar sus citas y consultas clínicas.</li>
                            <li>Responder a sus preguntas y proporcionarle información sobre nuestros servicios.</li>
                            <li>Mejorar la experiencia de usuario en nuestro sitio web.</li>
                            <li>Cumplir con las obligaciones legales en materia de salud.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-secondary uppercase mt-12">3. Protección de datos</h2>
                        <p>
                            Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos personales contra el acceso no autorizado, la pérdida o la alteración. Como centro de salud, seguimos estrictos protocolos de confidencialidad médica.
                        </p>

                        <h2 className="text-2xl font-bold text-secondary uppercase mt-12">4. Sus derechos</h2>
                        <p>
                            Usted tiene derecho a acceder, corregir o solicitar la eliminación de sus datos personales. Si desea ejercer alguno de estos derechos, póngase en contacto con nosotros a través de los canales proporcionados en nuestra sección de contacto.
                        </p>

                        <h2 className="text-2xl font-bold text-secondary uppercase mt-12">5. Cambios en esta política</h2>
                        <p>
                            Podemos actualizar nuestra Política de Privacidad periódicamente. Le recomendamos revisar esta página para estar informado sobre cualquier cambio.
                        </p>

                        <div className="mt-16 p-6 bg-gray-50 border-l-4 border-primary italic text-sm text-gray-600">
                            Última actualización: Febrero 2026. Hexadent Centro Odontológico.
                        </div>
                    </section>
                </article>
            </div>
            <Footer />
        </main>
    )
}
