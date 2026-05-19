import { Outfit, Dancing_Script } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '900'],
    display: 'swap',
    variable: '--font-outfit',
})

const dancingScript = Dancing_Script({
    subsets: ['latin'],
    weight: ['400', '700'],
    display: 'swap',
    variable: '--font-script',
})

export const metadata = {
    metadataBase: new URL('https://www.hexadentdradianarodriguez.com'),
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
        url: 'https://www.hexadentdradianarodriguez.com',
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
        google: 'phtM31SPvI8yOzx9n37XSk4up88E9gVJGJ3Cmbp4U1Y',
    },
}

import WhatsAppButton from '@/components/WhatsAppButton'

const dentistSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    '@id': 'https://www.hexadentdradianarodriguez.com/#dentist',
    'name': 'Hexadent - Ortodoncia Especializada',
    'alternateName': 'Dra. Diana Rodríguez - Ortodoncia en Loja',
    'image': 'https://www.hexadentdradianarodriguez.com/logo.jpg',
    'url': 'https://www.hexadentdradianarodriguez.com',
    'telephone': '+593967885039',
    'priceRange': '$$',
    'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Calle Lourdes entre Simón Bolívar y Sucre (Sector San Sebastián)',
        'addressLocality': 'Loja',
        'addressRegion': 'Loja',
        'postalCode': '110150',
        'addressCountry': 'EC'
    },
    'geo': {
        '@type': 'GeoCoordinates',
        'latitude': -3.9933,
        'longitude': -79.2042
    },
    'openingHoursSpecification': [
        {
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday'
            ],
            'opens': '09:00',
            'closes': '13:00'
        },
        {
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday'
            ],
            'opens': '15:00',
            'closes': '18:30'
        },
        {
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': 'Saturday',
            'opens': '09:30',
            'closes': '13:00'
        }
    ],
    'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+593967885039',
        'contactType': 'customer service',
        'areaServed': 'EC',
        'availableLanguage': 'Spanish'
    }
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
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(dentistSchema) }}
                />
            </head>
            <body className={`${outfit.variable} ${dancingScript.variable} font-sans`}>
                {children}
                <WhatsAppButton />
            </body>
        </html>
    )
}
