'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ARViewerProps } from '@/lib/types'

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & {
                    src?: string
                    'ios-src'?: string
                    poster?: string
                    alt?: string
                    'camera-controls'?: boolean
                    'auto-rotate'?: boolean
                    'shadow-intensity'?: string
                    ar?: boolean
                    'ar-modes'?: string
                    'ar-scale'?: string
                    loading?: 'auto' | 'lazy' | 'eager'
                    reveal?: 'auto' | 'manual'
                },
                HTMLElement
            >
        }
    }
}

import '@google/model-viewer'

export default function ARViewer({ modelUrl, usdzUrl, alt, poster }: ARViewerProps) {
    const viewerRef = useRef<any>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [showLoader, setShowLoader] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        try {
            const viewer = viewerRef.current
            if (!viewer) return

            const handleLoad = () => {
                console.log('AR Model Loaded successfully')
                setIsLoaded(true)
                setShowLoader(false)
            }

            const handleError = (e: any) => {
                console.error('ARViewer Error Details:', e)
                setError(`Error de cargador: ${e.detail?.type || 'desconocido'}`)
            }

            viewer.addEventListener('load', handleLoad)
            viewer.addEventListener('error', handleError)

            const timer = setTimeout(() => {
                setShowLoader(false)
            }, 8000)

            return () => {
                viewer.removeEventListener('load', handleLoad)
                viewer.removeEventListener('error', handleError)
                clearTimeout(timer)
            }
        } catch (err: any) {
            console.error('ARViewer Lifecycle Error:', err)
            setError(`Error de inicialización: ${err.message || 'Error grave'}`)
        }
    }, [modelUrl])

    if (!modelUrl) return (
        <div className="p-4 text-center text-xs text-stone-500">
            Falta URL del modelo 3D.
        </div>
    )

    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-stone-100 flex items-center justify-center">
            {/* Pantalla de Error Detallada */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-stone-50 p-6 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                            ⚠️
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-stone-800 uppercase tracking-tighter">Error de Visualización</p>
                            <p className="text-[10px] text-stone-500 font-mono bg-stone-100 p-2 rounded">{error}</p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-stone-900 text-white text-[10px] rounded-full font-bold"
                        >
                            REINTENTAR
                        </button>
                    </div>
                </div>
            )}

            {/* Spinner de Carga */}
            {showLoader && !error && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-stone-100">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-stone-200 border-t-amber-800 rounded-full animate-spin" />
                        <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Iniciando Realidad Aumentada...</span>
                    </div>
                </div>
            )}

            {/* Componente Nativo model-viewer */}
            <model-viewer
                ref={viewerRef}
                src={modelUrl}
                ios-src={usdzUrl || ''}
                alt={alt || 'Modelo 3D Todotejidos'}
                poster={poster}
                camera-controls
                auto-rotate
                shadow-intensity="1"
                ar={true}
                ar-modes="webxr scene-viewer quick-look"
                ar-scale="fixed"
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'transparent',
                    display: 'block'
                } as any}
            >
                <button
                    slot="ar-button"
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-8 py-3 bg-stone-900 text-white rounded-full font-bold shadow-2xl hover:bg-stone-800 transition-all active:scale-95 z-40 whitespace-nowrap"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 10 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                    PROBAR EN MI SALA
                </button>
            </model-viewer>

            {/* Overlay de Consejos */}
            {!showLoader && !error && (
                <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/60 backdrop-blur-md rounded-full text-[10px] text-stone-600 font-bold uppercase tracking-widest border border-white/20">
                    Escala Real (1:1) • Pellizca para zoom
                </div>
            )}
        </div>
    )
}
