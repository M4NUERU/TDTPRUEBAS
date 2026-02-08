'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    const footerLinks = {
        productos: [
            { href: '/categoria/sala', label: 'Salas' },
            { href: '/categoria/sofa', label: 'Sofás' },
            { href: '/categoria/sofacama', label: 'Sofacamas' },
            { href: '/categoria/basecama', label: 'Basecamas' },
            { href: '/configurador', label: 'Personalizar 3D' },
        ],
        empresa: [
            { href: '/nosotros', label: 'Nosotros' },
            { href: '/proceso', label: 'Nuestro Proceso' },
            { href: '/garantia', label: 'Garantía' },
            { href: '/blog', label: 'Blog' },
        ],
        soporte: [
            { href: '/contacto', label: 'Contacto' },
            { href: '/envios', label: 'Envíos' },
            { href: '/devoluciones', label: 'Devoluciones' },
            { href: '/faq', label: 'Preguntas Frecuentes' },
        ],
    }

    const socialLinks = [
        { href: 'https://instagram.com/todotejidos', icon: 'instagram', label: 'Instagram' },
        { href: 'https://facebook.com/todotejidos', icon: 'facebook', label: 'Facebook' },
        { href: 'https://pinterest.com/todotejidos', icon: 'pinterest', label: 'Pinterest' },
    ]

    return (
        <footer className="bg-stone-900 text-stone-300">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-block">
                            <span className="font-display text-2xl font-semibold text-stone-50">
                                TODO<span className="text-amber-500">TEJIDOS</span>
                            </span>
                        </Link>
                        <p className="mt-4 text-stone-400 max-w-sm leading-relaxed">
                            Transformamos espacios con el arte del tejido artesanal colombiano.
                            Cada mueble cuenta una historia de tradición y modernidad.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-4 mt-6">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.icon}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-50 hover:bg-amber-800 transition-colors"
                                >
                                    {social.icon === 'instagram' && (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    )}
                                    {social.icon === 'facebook' && (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    )}
                                    {social.icon === 'pinterest' && (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                                        </svg>
                                    )}
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="font-medium text-stone-50 mb-4">Productos</h4>
                        <ul className="space-y-3">
                            {footerLinks.productos.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-stone-400 hover:text-stone-50 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-medium text-stone-50 mb-4">Empresa</h4>
                        <ul className="space-y-3">
                            {footerLinks.empresa.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-stone-400 hover:text-stone-50 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-medium text-stone-50 mb-4">Soporte</h4>
                        <ul className="space-y-3">
                            {footerLinks.soporte.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-stone-400 hover:text-stone-50 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-stone-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-stone-500">
                            © {currentYear} TODOTEJIDOS SAS. Todos los derechos reservados.
                        </p>
                        <div className="flex items-center gap-6 text-sm text-stone-500">
                            <Link href="/privacidad" className="hover:text-stone-300 transition-colors">
                                Política de Privacidad
                            </Link>
                            <Link href="/terminos" className="hover:text-stone-300 transition-colors">
                                Términos y Condiciones
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
