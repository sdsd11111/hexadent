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
            <Contact />
            <Footer />
        </main>
    )
}
