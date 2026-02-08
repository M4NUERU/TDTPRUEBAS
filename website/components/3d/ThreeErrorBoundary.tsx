'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
}

export default class ThreeErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    }

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Three.js Error caught by Boundary:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex items-center justify-center w-full h-full bg-stone-100 text-stone-400 p-8 text-center uppercase tracking-widest text-[10px] font-bold">
                    No se pudo cargar el modelo 3D.<br />Mostrando vista alternativa.
                </div>
            )
        }

        return this.props.children
    }
}
