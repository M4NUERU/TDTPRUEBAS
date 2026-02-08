'use client'

import { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useStore } from '@/lib/store'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import { HeroFurnitureModel, HeroBackground, HeroCameraController } from './Hero3DModel'

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
}

function LoadingSpinner() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-stone-200 border-t-amber-800 rounded-full animate-spin" />
        </div>
    )
}

export default function Hero3D() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [scrollProgress, setScrollProgress] = useState(0)
    const [isClient, setIsClient] = useState(false)
    const { activeBrand } = useStore()

    // Text animation refs
    const headlineRef = useRef<HTMLHeadingElement>(null)
    const subheadlineRef = useRef<HTMLParagraphElement>(null)
    const ctaRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const isTodoTejidos = activeBrand === 'TODOTEJIDOS'

    useEffect(() => {
        if (!isClient || !containerRef.current) return

        // GSAP ScrollTrigger for scroll progress
        const trigger = ScrollTrigger.create({
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
            onUpdate: (self) => {
                setScrollProgress(self.progress)
            },
        })

        // Text animations with stagger and smooth reveal
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top top',
                end: '70% top',
                scrub: 1,
            },
        })

        if (headlineRef.current) {
            tl.to(headlineRef.current, {
                y: -150,
                scale: 0.95,
                opacity: 0,
                filter: 'blur(10px)',
                duration: 1,
            }, 0)
        }

        if (subheadlineRef.current) {
            tl.to(subheadlineRef.current, {
                y: -100,
                opacity: 0,
                filter: 'blur(5px)',
                duration: 1,
            }, 0.1)
        }

        if (ctaRef.current) {
            tl.to(ctaRef.current, {
                y: -50,
                opacity: 0,
                duration: 1,
            }, 0.2)
        }

        return () => {
            trigger.kill()
            tl.kill()
        }
    }, [isClient, activeBrand])

    // Background color interpolation based on scroll
    // TodoTejidos: Stone/Sand tones. EMadera: Dark Wood/Coffee tones.
    const baseH = isTodoTejidos ? 35 : 20
    const baseS = isTodoTejidos ? 5 : 15
    const baseL = isTodoTejidos ? 97 : 94

    const backgroundColor = `hsl(${baseH}, ${baseS + scrollProgress * 10}%, ${baseL - scrollProgress * 10}%)`

    return (
        <section
            ref={containerRef}
            className="hero-section relative overflow-hidden"
            style={{ backgroundColor }}
        >
            {/* 3D Canvas */}
            <div className="absolute inset-0 z-0">
                {isClient && (
                    <Canvas
                        camera={{ position: [0, 1, 5], fov: 45 }}
                        shadows
                        dpr={[1, 2]}
                        gl={{
                            antialias: true,
                            toneMapping: THREE.ACESFilmicToneMapping,
                            toneMappingExposure: 1.2,
                        }}
                    >
                        <Suspense fallback={null}>
                            <ambientLight intensity={isTodoTejidos ? 0.5 : 0.3} />
                            <directionalLight
                                position={[10, 10, 5]}
                                intensity={isTodoTejidos ? 1.2 : 1.5}
                                castShadow
                                shadow-mapSize={[1024, 1024]}
                            />
                            <directionalLight position={[-5, 5, -5]} intensity={0.4} />

                            <Environment preset={isTodoTejidos ? "apartment" : "forest"} />

                            <HeroFurnitureModel scrollProgress={scrollProgress} />
                            <HeroCameraController scrollProgress={scrollProgress} />

                            <ContactShadows
                                position={[0, -0.8, 0]}
                                opacity={0.5}
                                scale={10}
                                blur={2}
                                far={4}
                            />
                        </Suspense>
                    </Canvas>
                )}
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
                <motion.div
                    key={activeBrand}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="text-center max-w-4xl mx-auto"
                >
                    {/* Brand Tag */}
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className={`inline-block mb-6 px-4 py-2 rounded-full text-sm font-black tracking-[0.3em] uppercase ${isTodoTejidos ? 'bg-stone-900/5 text-stone-600' : 'bg-orange-900/10 text-orange-900'
                            }`}
                    >
                        {isTodoTejidos ? 'Textiles de Lujo' : 'Carpintería de Autor'}
                    </motion.span>

                    {/* Main Headline */}
                    <h1
                        ref={headlineRef}
                        className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-stone-900 leading-[1.1] mb-6"
                    >
                        {isTodoTejidos ? (
                            <>
                                <span className="block italic font-light text-stone-500">Sofa</span>
                                <span className="block text-brand-navy">COMODO</span>
                            </>
                        ) : (
                            <>
                                <span className="block italic font-light text-stone-500">Diseño en</span>
                                <span className="block text-orange-900">MADERA</span>
                            </>
                        )}
                    </h1>

                    {/* Subheadline */}
                    <p
                        ref={subheadlineRef}
                        className="text-lg sm:text-xl text-stone-500 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
                    >
                        {isTodoTejidos
                            ? "Diseñamos piezas icónicas que fusionan la calidez artesanal con la precisión del diseño moderno."
                            : "La nobleza de la madera transformada en piezas atemporales. Mobiliario artesanal con acabados de alta gama."
                        }
                    </p>

                    {/* CTA Buttons */}
                    <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <motion.a
                            href="#catalogo"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`px-8 py-4 font-black tracking-widest text-sm rounded-full transition-all duration-300 shadow-xl ${isTodoTejidos
                                    ? 'bg-stone-900 text-stone-50 hover:bg-stone-800 shadow-stone-900/20'
                                    : 'bg-orange-800 text-stone-50 hover:bg-orange-900 shadow-orange-900/20'
                                }`}
                        >
                            Explorar Colección
                        </motion.a>
                        <motion.a
                            href="#configurador"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`px-8 py-4 border-2 font-black tracking-widest text-sm rounded-full transition-all duration-300 ${isTodoTejidos
                                    ? 'border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-stone-50'
                                    : 'border-orange-800 text-orange-800 hover:bg-orange-800 hover:text-stone-50'
                                }`}
                        >
                            Diseñar en 3D
                        </motion.a>
                    </div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                >
                    <div className="flex flex-col items-center gap-2 text-stone-400">
                        <span className="text-xs tracking-widest uppercase">Desliza</span>
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-6 h-10 border-2 border-stone-400 rounded-full flex justify-center pt-2"
                        >
                            <div className="w-1.5 h-1.5 bg-stone-400 rounded-full" />
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* Texture Reveal Overlay (appears on scroll) */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-5"
                style={{
                    background: `radial-gradient(circle at center, transparent ${100 - scrollProgress * 50}%, rgba(250,250,249,0.8) 100%)`,
                }}
            />
        </section>
    )
}
