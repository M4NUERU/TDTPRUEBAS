import { getProductBySlug, products } from '@/lib/data'
import { notFound } from 'next/navigation'
import ProductContent from './ProductContent'

export function generateStaticParams() {
    return products.map((product) => ({
        slug: product.slug,
    }))
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params
    const product = getProductBySlug(resolvedParams.slug)

    if (!product) {
        notFound()
    }

    return <ProductContent product={product} />
}
