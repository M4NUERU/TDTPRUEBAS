'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import { ShoppingBag, Menu, X } from 'lucide-react'

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { cart, toggleCart, activeBrand } = useStore()

    // Hydration fix
    const [hydrated, setHydrated] = useState(false)
    useEffect(() => { setHydrated(true) }, [])

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const isTodoTejidos = activeBrand === 'TODOTEJIDOS'

    const navLinks = [
        { href: '/categoria/sala', label: 'Salas' },
        { href: '/categoria/sofa', label: 'Sofás' },
        { href: '/categoria/sofacama', label: 'Sofacamas' },
        { href: '/configurador', label: 'Personalizar 3D' },
    ]

    return (
        <header
            className={`fixed top-10 left-0 right-0 z-50 transition-all duration-500 hidden md:block ${isScrolled ? 'glass py-3' : 'py-6'
                }`}
        >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <motion.div
                            key={activeBrand} // Force re-animation on brand change
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            className={`font-display text-2xl font-bold transition-colors duration-500 ${isTodoTejidos ? 'text-brand-navy' : 'text-stone-900'
                                }`}
                        >
                            {isTodoTejidos ? (
                                <>TODO<span className="text-brand-gold italic text-[#c29d6d]">TEJIDOS</span></>
                            ) : (
                                <>E-<span className="text-orange-800 italic">MADERA</span></>
                            )}
                        </motion.div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors relative group"
                            >
                                {link.label}
                                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isTodoTejidos ? 'bg-amber-800' : 'bg-orange-800'
                                    }`} />
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {/* Cart Icon */}
                        <motion.button
                            onClick={toggleCart}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative p-2 transition-colors ${isTodoTejidos ? 'text-stone-700 hover:text-brand-gold' : 'text-stone-700 hover:text-orange-800'
                                }`}
                        >
                            <ShoppingBag className="w-6 h-6" />
                            {hydrated && cart.length > 0 && (
                                <span className={`absolute -top-1 -right-1 w-5 h-5 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white ${isTodoTejidos ? 'bg-brand-navy' : 'bg-orange-900'
                                    }`}>
                                    {cart.length}
                                </span>
                            )}
                        </motion.button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-stone-700"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden mt-4 pb-4 border-t border-stone-200"
                        >
                            <div className="flex flex-col gap-2 pt-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="py-3 px-4 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    )
}
