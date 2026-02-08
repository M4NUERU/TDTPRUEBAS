'use client'

import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

interface Hero3DModelProps {
    scrollProgress: number
}

// Global path for the hero model
const HERO_MODEL_PATH = '/models/sevilla_hero.glb'

// Preload the model
if (typeof window !== 'undefined') {
    useGLTF.preload(HERO_MODEL_PATH)
}

// Luxury furniture hero model
export function HeroFurnitureModel({ scrollProgress }: Hero3DModelProps) {
    const groupRef = useRef<THREE.Group>(null)
    const { scene } = useGLTF(HERO_MODEL_PATH)

    // Traverse the scene to enable shadows
    useEffect(() => {
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true
                child.receiveShadow = true
                // Improve materials if needed
                const mesh = child as THREE.Mesh
                if (mesh.material instanceof THREE.MeshStandardMaterial) {
                    mesh.material.roughness = 0.7
                    mesh.material.metalness = 0.2
                }
            }
        })
    }, [scene])

    // Animate based on scroll progress
    useFrame(() => {
        if (groupRef.current) {
            // Rotate gracefully as user scrolls
            groupRef.current.rotation.y = scrollProgress * Math.PI

            // Subtle parallax effect
            groupRef.current.rotation.z = Math.sin(scrollProgress * Math.PI) * 0.05

            // Subtle floating animation
            groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.05 - 0.2
        }
    })

    return (
        <primitive
            ref={groupRef}
            object={scene}
            position={[0, -0.2, 0]}
            scale={2.5} // Increased scale for GLB models usually being smaller than primitives
        />
    )
}

// Background gradient plane that changes with scroll
export function HeroBackground({ scrollProgress }: Hero3DModelProps) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame(() => {
        if (meshRef.current && meshRef.current.material instanceof THREE.MeshBasicMaterial) {
            const hue = 0.08 + scrollProgress * 0.02
            const lightness = 0.97 - scrollProgress * 0.1
            meshRef.current.material.color.setHSL(hue, 0.05, lightness)
        }
    })

    return (
        <mesh ref={meshRef} position={[0, 0, -5]} scale={[20, 20, 1]}>
            <planeGeometry />
            <meshBasicMaterial color="#fafaf9" />
        </mesh>
    )
}

// Camera controller for scroll-based zoom
export function HeroCameraController({ scrollProgress }: Hero3DModelProps) {
    const { camera } = useThree()

    useFrame(() => {
        // Zoom in as user scrolls (from 5 to 3)
        const targetZ = 5 - scrollProgress * 2
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1)

        // Slight camera tilt
        const targetY = 1 + scrollProgress * 0.5
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.1)

        camera.lookAt(0, 0, 0)
    })

    return null
}
