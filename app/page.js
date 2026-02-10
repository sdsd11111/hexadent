import Header from '@/components/Header'
import Hero from '@/components/Hero'
import About from '@/components/About'
import VideoSection from '@/components/VideoSection'
import Services from '@/components/Services'
import Gallery from '@/components/Gallery'
import Testimonials from '@/components/Testimonials'
import FAQ from '@/components/FAQ'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import Calendar from '@/components/Calendar'


export default function Home() {
    return (
        <main>
            <Header />
            <Hero />
            <About />
            <VideoSection />
            <Services />
            <Gallery />
            <Testimonials />
            <FAQ />

            <section className="py-20 lg:py-32 bg-gray-50 overflow-hidden">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-5xl font-black text-secondary uppercase tracking-tight mb-4">
                            Disponibilidad en <span className="text-primary">Tiempo Real</span>
                        </h2>
                        <div className="w-24 h-1.5 bg-primary mx-auto mb-6"></div>
                        <p className="max-w-2xl mx-auto text-gray-500 text-lg lg:text-xl font-medium">
                            Consulta la agenda actualizada y elige el momento ideal para tu cita. El bot agendará automáticamente tu seleccion.
                        </p>
                    </div>

                    <Calendar isAdmin={false} />
                </div>
            </section>

            <Contact />

            <Footer />
        </main>
    )
}
