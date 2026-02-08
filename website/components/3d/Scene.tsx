'use client'

import { useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei'
import * as THREE from 'three'

interface SceneProps {
    children: React.ReactNode
    className?: string
    cameraPosition?: [number, number, number]
    enableOrbit?: boolean
    backgroundColor?: string
}

function Lights() {
    return (
        <>
            <ambientLight intensity={0.4} />
            <directionalLight
                position={[10, 10, 5]}
                intensity={1}
                castShadow
                shadow-mapSize={[1024, 1024]}
            />
            <directionalLight position={[-10, 10, -5]} intensity={0.5} />
            <spotLight
                position={[0, 10, 0]}
                angle={0.3}
                penumbra={1}
                intensity={0.5}
                castShadow
            />
        </>
    )
}

function LoadingFallback() {
    return (
        <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#d6d3d1" wireframe />
        </mesh>
    )
}

export default function Scene({
    children,
    className = '',
    cameraPosition = [0, 1, 5],
    enableOrbit = true,
    backgroundColor = '#fafaf9',
}: SceneProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    return (
        <div className={`canvas-container ${className}`}>
            <Canvas
                ref={canvasRef}
                camera={{ position: cameraPosition, fov: 45 }}
                shadows
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.2,
                }}
                style={{ background: backgroundColor }}
            >
                <Suspense fallback={<LoadingFallback />}>
                    <Lights />
                    <Environment preset="apartment" />

                    <Float
                        speed={1.5}
                        rotationIntensity={0.2}
                        floatIntensity={0.3}
                    >
                        {children}
                    </Float>

                    <ContactShadows
                        position={[0, -1.5, 0]}
                        opacity={0.4}
                        scale={10}
                        blur={2}
                        far={4}
                    />

                    {enableOrbit && (
                        <OrbitControls
                            enableZoom={true}
                            enablePan={false}
                            minPolarAngle={Math.PI / 4}
                            maxPolarAngle={Math.PI / 2}
                            minDistance={3}
                            maxDistance={8}
                            autoRotate={false}
                            autoRotateSpeed={0.5}
                        />
                    )}
                </Suspense>
            </Canvas>
        </div>
    )
}
