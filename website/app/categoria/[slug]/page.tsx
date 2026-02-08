import { getProductsByCategory, products } from '@/lib/data'
import CategoryContent from './CategoryContent'
import { notFound } from 'next/navigation'

const categoryNames: Record<string, string> = {
    'sala': 'Salas',
    'sofa': 'Sofás',
    'sofacama': 'Sofacamas',
    'sillon': 'Sillones',
    'basecama': 'Basecamas',
    'puff': 'Puffs'
}

export function generateStaticParams() {
    const categories = Array.from(new Set(products.map(p => p.category)))
    return categories.map((category) => ({
        slug: category,
    }))
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params
    const slug = resolvedParams.slug
    const categoryProducts = getProductsByCategory(slug as any)
    const categoryTitle = categoryNames[slug] || slug.charAt(0).toUpperCase() + slug.slice(1)

    if (categoryProducts.length === 0 && !categoryNames[slug]) {
        // Only 404 if the category doesn't exist at all
    }

    return <CategoryContent products={categoryProducts} categoryTitle={categoryTitle} />
}
