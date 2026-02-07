/**
 * Email Outreach Tool - Prospección Automatizada
 * 
 * Este script te ayuda a generar correos profesionales personalizados
 * para contactar empresas potenciales.
 */

const leads = [
    {
        empresa: "Fábricas Unidas",
        contacto: "Gerente de Logística",
        email: "info@fabricasunidas.com", // Buscar email real en su web
        sector: "Muebles",
        pain_point: "gestión de múltiples líneas de producto",
        años: "40+"
    },
    {
        empresa: "Muebles Jamar",
        contacto: "Director de Operaciones",
        email: "contacto@jamar.com", // Buscar email real
        sector: "Retail Muebles",
        pain_point: "sincronización de inventario entre múltiples sedes",
        años: "varios"
    },
    {
        empresa: "Ingemuebles",
        contacto: "Gerente General",
        email: "info@ingemuebles.com", // Buscar email real
        sector: "Fabricación Muebles",
        pain_point: "modernización de procesos de bodega",
        años: "30+"
    }
];

// Plantillas de email
const templates = {
    inicial: (lead) => ({
        asunto: `Modernización de gestión de inventario para ${lead.empresa}`,
        cuerpo: `Estimado/a ${lead.contacto},

Mi nombre es Josu y me especializo en desarrollo de sistemas de gestión industrial.

Vi que ${lead.empresa} tiene ${lead.años} años de trayectoria en el sector de ${lead.sector}. Empresas con su experiencia merecen herramientas modernas que potencien su operación.

Recientemente ayudé a una empresa manufacturera a:
• Reducir errores de despacho en 80%
• Acelerar procesos de picking 3x
• Visualizar inventario en 3D con escaneo QR

Implementación: 2 semanas (no 6 meses como otras soluciones).

¿Tendría 15 minutos esta semana para una demostración rápida?

Adjunto algunas capturas del sistema.

Saludos cordiales,
Josu
Desarrollador de Software
WhatsApp: [Tu número]
`
    }),

    seguimiento: (lead) => ({
        asunto: `Re: Modernización de gestión de inventario para ${lead.empresa}`,
        cuerpo: `Hola,

Envié un mensaje hace unos días sobre automatización de gestión de inventario.

Entiendo que están ocupados. Solo quería compartir un video rápido (2 min) 
mostrando cómo funciona el sistema:

[Link al video demo]

Si les interesa, con gusto agendo una llamada cuando les convenga.

Saludos,
Josu
`
    }),

    propuesta: (lead) => ({
        asunto: `Propuesta: Sistema de Gestión de Inventario - ${lead.empresa}`,
        cuerpo: `Estimado/a ${lead.contacto},

Gracias por su interés en modernizar la gestión de ${lead.empresa}.

PROPUESTA:

Sistema de Gestión de Inventario 3D
- Escaneo QR de productos
- Visualización 3D de bodega
- Gestión de pedidos y despachos
- Reportes automáticos
- App móvil (PWA)

INVERSIÓN:
• Setup inicial: $1.000.000 COP (una sola vez)
• Mensualidad: $500.000 COP
  Incluye: hosting, soporte, actualizaciones

TIEMPO: 2 semanas desde el pago inicial

GARANTÍA: 30 días de prueba. Si no funciona, devolvemos el 100%.

¿Cuándo podríamos iniciar?

Saludos,
Josu
`
    })
};

// Generador de emails
function generarEmail(lead, tipo = 'inicial') {
    const template = templates[tipo];
    if (!template) {
        console.error('Tipo de email no válido');
        return null;
    }

    const email = template(lead);
    return {
        para: lead.email,
        asunto: email.asunto,
        cuerpo: email.cuerpo,
        empresa: lead.empresa
    };
}

// Generar todos los emails iniciales
function generarCampañaInicial() {
    console.log('=== CAMPAÑA DE PROSPECCIÓN INICIAL ===\n');

    leads.forEach((lead, index) => {
        const email = generarEmail(lead, 'inicial');
        console.log(`\n--- EMAIL ${index + 1}: ${email.empresa} ---`);
        console.log(`Para: ${email.para}`);
        console.log(`Asunto: ${email.asunto}`);
        console.log(`\n${email.cuerpo}`);
        console.log('\n' + '='.repeat(60));
    });
}

// Exportar para uso en Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { leads, templates, generarEmail, generarCampañaInicial };
}

// Si se ejecuta directamente
if (require.main === module) {
    generarCampañaInicial();
}
