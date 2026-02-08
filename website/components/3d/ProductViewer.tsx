'use client'

import { useRef, useEffect, useMemo, Suspense } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import Scene from './Scene'
import ThreeErrorBoundary from './ThreeErrorBoundary'

interface ProductViewerProps {
    modelUrl?: string
    textureUrl?: string
    color: string
    autoRotate?: boolean
}

// Subcomponent to handle texture loading safely
function TextureMaterial({ textureUrl, color, ...props }: { textureUrl?: string, color: string, [key: string]: any }) {
    // We pass an empty string if no textureUrl is provided, but useTexture usually requires a valid URL.
    // However, we can use a small conditional component or a fallback.
    return <MaterialWithTexture textureUrl={textureUrl} color={color} {...props} />
}

function MaterialWithTexture({ textureUrl, color, ...props }: { textureUrl?: string, color: string, [key: string]: any }) {
    // If we have a textureUrl, we load it. If not, we don't.
    // To satisfy rules of hooks, we can't call useTexture conditionally.
    // So we use a "null" texture or a separate component.

    if (textureUrl) {
        return <ActualMaterialWithTexture textureUrl={textureUrl} color={color} {...props} />
    }

    return <meshStandardMaterial color={new THREE.Color(color)} roughness={0.9} metalness={0.05} {...props} />
}

function ActualMaterialWithTexture({ textureUrl, color, ...props }: { textureUrl: string, color: string, [key: string]: any }) {
    const texture = useTexture(textureUrl)

    useEffect(() => {
        if (texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping
            texture.repeat.set(2, 2)
        }
    }, [texture])

    return <meshStandardMaterial color={new THREE.Color(color)} map={texture} roughness={0.9} metalness={0.05} {...props} />
}

// Minimalist Sofa Geometry with dynamic materials
function DynamicSofa({ color, textureUrl }: { color: string, textureUrl?: string }) {
    const groupRef = useRef<THREE.Group>(null)

    return (
        <group ref={groupRef} position={[0, -0.4, 0]} scale={1.3}>
            {/* Main Sofa Body */}
            <mesh castShadow receiveShadow>
                <boxGeometry args={[2.5, 0.4, 1.1]} />
                <TextureMaterial textureUrl={textureUrl} color={color} />
            </mesh>

            {/* Backrest */}
            <mesh position={[0, 0.5, -0.45]} castShadow receiveShadow>
                <boxGeometry args={[2.5, 0.7, 0.3]} />
                <TextureMaterial textureUrl={textureUrl} color={color} />
            </mesh>

            {/* Armrests */}
            <mesh position={[-1.15, 0.25, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.2, 0.5, 1]} />
                <TextureMaterial textureUrl={textureUrl} color={color} />
            </mesh>
            <mesh position={[1.15, 0.25, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.2, 0.5, 1]} />
                <TextureMaterial textureUrl={textureUrl} color={color} />
            </mesh>

            {/* Cushions */}
            <mesh position={[0, 0.3, 0.1]} castShadow receiveShadow>
                <boxGeometry args={[2.1, 0.25, 0.9]} />
                <TextureMaterial
                    textureUrl={textureUrl}
                    color={new THREE.Color(color).multiplyScalar(1.1).getStyle()}
                />
            </mesh>

            {/* Metal Legs */}
            {[[-1, 0.45], [1, 0.45], [-1, -0.45], [1, -0.45]].map(([x, z], i) => (
                <mesh key={i} position={[x, -0.35, z]} castShadow>
                    <cylinderGeometry args={[0.03, 0.02, 0.4]} />
                    <meshStandardMaterial color="#a16207" metalness={0.8} roughness={0.1} />
                </mesh>
            ))}
        </group>
    )
}

function GLBModel({ modelUrl }: { modelUrl: string }) {
    // Hooks cannot be in try-catch blocks. Suspense handles loading/errors.
    const { scene } = useGLTF(modelUrl)
    return <primitive object={scene} />
}

export default function ProductViewer({
    modelUrl,
    textureUrl,
    color,
    autoRotate = false,
}: ProductViewerProps) {
    // Check if it's a valid internal model path
    const isRealModel = modelUrl && modelUrl.startsWith('/models/')

    return (
        <Scene
            className="w-full h-full"
            cameraPosition={[0, 1.5, 4.5]}
            backgroundColor="transparent"
        >
            <ThreeErrorBoundary fallback={<DynamicSofa color={color} textureUrl={textureUrl} />}>
                <Suspense fallback={null}>
                    {isRealModel ? (
                        <GLBModel modelUrl={modelUrl!} />
                    ) : (
                        <DynamicSofa color={color} textureUrl={textureUrl} />
                    )}
                </Suspense>
            </ThreeErrorBoundary>
        </Scene>
    )
}
