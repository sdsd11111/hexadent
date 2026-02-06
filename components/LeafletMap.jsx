'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

export default function LeafletMap() {
    const mapRef = useRef(null)
    const [isClient, setIsClient] = useState(false)
    const [showZoomMsg, setShowZoomMsg] = useState(false)
    const mapInstance = useRef(null)

    const position = [-4.002543, -79.202441] // Ubicación exacta: Lourdes entre Bolívar y Sucre (XQXX+26Q)

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (!isClient || !mapRef.current || mapInstance.current) return

        // Initialize map
        mapInstance.current = L.map(mapRef.current, {
            center: position,
            zoom: 17,
            zoomControl: false,
            scrollWheelZoom: false // Disabled by default to handle Ctrl+Scroll
        })

        // Add Cleaner TileLayer (CartoDB Voyager)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(mapInstance.current)

        // Custom Marker Pin Style with DivIcon
        const customPinIcon = L.divIcon({
            className: 'custom-pin-container',
            html: `
                <div class="pin-wrapper">
                    <div class="pin-head">
                        <img src="/favicon.png" alt="Hexadent" />
                    </div>
                    <div class="pin-pointer"></div>
                </div>
            `,
            iconSize: [50, 60],
            iconAnchor: [25, 60],
            popupAnchor: [0, -60]
        })

        const marker = L.marker(position, { icon: customPinIcon }).addTo(mapInstance.current)

        // Add Popup
        marker.bindPopup(`
            <div style="text-align: center; padding: 5px;">
                <h3 style="margin: 0; font-weight: bold; color: #58595b; text-transform: uppercase; font-size: 12px;">Hexadent</h3>
                <p style="margin: 2px 0 0; color: #666; font-size: 10px;">Ortodoncia Especializada</p>
            </div>
        `)

        // Enhance rendering
        const container = mapInstance.current.getContainer()
        container.style.filter = 'saturate(1.1) contrast(1.05)'

        // --- Logic for Ctrl + Scroll Zoom ---
        const handleWheel = (e) => {
            if (e.ctrlKey) {
                e.preventDefault()
                setShowZoomMsg(false)
                if (e.deltaY > 0) {
                    mapInstance.current.zoomOut()
                } else {
                    mapInstance.current.zoomIn()
                }
            } else {
                // Show message if trying to scroll without Ctrl
                if (Math.abs(e.deltaY) > 5) {
                    setShowZoomMsg(true)
                    setTimeout(() => setShowZoomMsg(false), 2000)
                }
            }
        }

        container.addEventListener('wheel', handleWheel, { passive: false })

        // Cleanup
        return () => {
            if (mapInstance.current) {
                container.removeEventListener('wheel', handleWheel)
                mapInstance.current.remove()
                mapInstance.current = null
            }
        }
    }, [isClient])

    if (!isClient) return <div className="w-full h-full bg-gray-100 animate-pulse" />

    return (
        <div className="relative w-full h-full group overflow-hidden">
            {/* Div donde se renderiza Leaflet */}
            <div ref={mapRef} className="w-full h-full z-0" />

            {/* Ctrl + Zoom Overlay Message */}
            {showZoomMsg && (
                <div className="absolute inset-0 z-[2000] bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-300">
                    <div className="bg-white px-6 py-3 rounded-full shadow-2xl border-2 border-primary animate-bounce">
                        <p className="text-secondary font-bold text-sm">
                            Usa <span className="bg-primary text-white px-2 py-0.5 rounded text-xs mx-1">Ctrl</span> + rueda para ampliar el mapa
                        </p>
                    </div>
                </div>
            )}

            {/* Overlay de branding / Botón redirección */}
            <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md p-3 border-l-4 border-primary shadow-xl pointer-events-auto">
                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Nuestra ubicación</p>
                    <h4 className="text-sm font-bold text-gray-800">Lourdes entre Simón Bolívar, Loja</h4>
                </div>
            </div>

            <div className="absolute bottom-4 right-4 z-[1000]">
                <a
                    href="https://maps.app.goo.gl/41DyayJXq2XU3x4q6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-primary text-white font-black text-[10px] uppercase py-3 px-5 hover:bg-secondary transition-all shadow-lg hover:-translate-y-1"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 15% 100%)' }}
                >
                    Ir en Google Maps
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </a>
            </div>

            <style jsx global>{`
                .custom-pin-container {
                    background: transparent;
                    border: none;
                }
                .pin-wrapper {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
                }
                .pin-head {
                    width: 50px;
                    height: 50px;
                    background: white;
                    border: 3px solid #009797;
                    border-radius: 50%;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2;
                    transition: all 0.3s ease;
                }
                .pin-head img {
                    width: 85%;
                    height: 85%;
                    object-fit: contain;
                }
                .pin-pointer {
                    width: 0;
                    height: 0;
                    border-left: 10px solid transparent;
                    border-right: 10px solid transparent;
                    border-top: 15px solid #009797;
                    margin-top: -5px;
                    z-index: 1;
                }
                .pin-wrapper:hover .pin-head {
                    transform: scale(1.1) translateY(-5px);
                    border-color: #58595b;
                }
                .pin-wrapper:hover .pin-pointer {
                    border-top-color: #58595b;
                }
                .leaflet-popup-content-wrapper {
                    border-radius: 0 !important;
                    border-left: 4px solid #009797;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    font-family: inherit;
                }
                .leaflet-popup-tip {
                    display: none;
                }
                .leaflet-container {
                    background: #f8f9fa !important;
                }
            `}</style>
        </div>
    )
}
