import { Montserrat } from 'next/font/google'
import './globals.css'

const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['400', '700', '900'],
    display: 'swap',
})

export const metadata = {
    metadataBase: new URL('https://hexadent.com.ec'),
    title: 'Hexadent - Ortodoncia Especializada en Loja | Dra. Diana Rodríguez',
    description: 'Centro Odontológico Hexadent en San Sebastián, Loja. Especialistas en Ortodoncia de vanguardia. Dra. Diana Rodríguez - Registro SENESCYT. Agenda tu cita al 0967885039.',
    keywords: 'ortodoncia Loja, dentista Loja, brackets Loja, clínica dental Loja, San Sebastián Loja, odontología especializada, Dra Diana Rodríguez, Hexadent',
    authors: [{ name: 'Hexadent - Odontología Especializada' }],
    creator: 'Hexadent',
    publisher: 'Hexadent',
    formatDetection: {
        email: false,
        address: true,
        telephone: true,
    },
    openGraph: {
        title: 'Hexadent - Ortodoncia Especializada en Loja',
        description: 'Transforma tu sonrisa con tratamientos de ortodoncia de vanguardia en el corazón de Loja. Dra. Diana Rodríguez.',
        url: 'https://hexadent.com.ec',
        siteName: 'Hexadent',
        locale: 'es_EC',
        type: 'website',
        images: [
            {
                url: '/logo.jpg',
                width: 1200,
                height: 630,
                alt: 'Hexadent - Odontología Especializada',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Hexadent - Ortodoncia Especializada en Loja',
        description: 'Transforma tu sonrisa con tratamientos de ortodoncia de vanguardia en el corazón de Loja.',
        images: ['/logo.jpg'],
    },
    icons: {
        icon: '/favicon.png',
        apple: '/favicon.png',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-verification-code',
    },
}

export default function RootLayout({ children }) {
    return (
        <html lang="es-EC">
            <head>
                <link rel="icon" href="/favicon.png" />
                <meta name="geo.region" content="EC-L" />
                <meta name="geo.placename" content="Loja" />
                <meta name="geo.position" content="-3.9933;-79.2042" />
                <meta name="ICBM" content="-3.9933, -79.2042" />
            </head>
            <body className={montserrat.className}>
                {children}
            </body>
        </html>
    )
}
