'use client'

import { useState, useCallback, useMemo } from 'react'
import { Product, Fabric, PriceBreakdown, ProductVariant } from '@/lib/types'
import { fabrics, getProductById, getFabricById } from '@/lib/data'
import { calculateTotalPrice, calculateAddiInstallment } from '@/lib/utils'

interface UseProductConfiguratorProps {
    initialProductId: string
    initialFabricId?: string
}

interface UseProductConfiguratorReturn {
    product: Product | undefined
    selectedFabric: Fabric
    setSelectedFabric: (fabricId: string) => void
    selectedVariant: ProductVariant | undefined
    setSelectedVariant: (variant: ProductVariant) => void
    availableFabrics: Fabric[]
    priceBreakdown: PriceBreakdown
    totalPrice: number
    addiInstallment: number
    quantity: number
    setQuantity: (quantity: number) => void
}

export function useProductConfigurator({
    initialProductId,
    initialFabricId = 'lino-natural',
}: UseProductConfiguratorProps): UseProductConfiguratorReturn {
    const product = useMemo(() => getProductById(initialProductId), [initialProductId])
    const [selectedFabricId, setSelectedFabricId] = useState(initialFabricId)
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
        product?.variants && product.variants.length > 0 ? product.variants[0] : undefined
    )
    const [quantity, setQuantity] = useState(1)

    const selectedFabric = useMemo(
        () => getFabricById(selectedFabricId) || fabrics[0],
        [selectedFabricId]
    )

    const setSelectedFabric = useCallback((fabricId: string) => {
        setSelectedFabricId(fabricId)
    }, [])

    const totalPrice = useMemo(() => {
        if (!product) return 0
        const basePrice = selectedVariant?.price || product.basePrice
        return (basePrice + selectedFabric.additionalPrice) * quantity
    }, [product, selectedFabric, selectedVariant, quantity])

    const addiInstallment = useMemo(
        () => calculateAddiInstallment(totalPrice),
        [totalPrice]
    )

    const priceBreakdown: PriceBreakdown = useMemo(() => {
        if (!product) {
            return {
                basePrice: 0,
                fabricAdditional: 0,
                subtotal: 0,
                addiInstallment: 0,
            }
        }
        const basePrice = selectedVariant?.price || product.basePrice
        const subtotal = basePrice + selectedFabric.additionalPrice
        return {
            basePrice,
            fabricAdditional: selectedFabric.additionalPrice,
            subtotal,
            addiInstallment: calculateAddiInstallment(subtotal),
        }
    }, [product, selectedFabric, selectedVariant])

    return {
        product,
        selectedFabric,
        setSelectedFabric,
        selectedVariant,
        setSelectedVariant,
        availableFabrics: fabrics,
        priceBreakdown,
        totalPrice,
        addiInstallment,
        quantity,
        setQuantity,
    }
}

