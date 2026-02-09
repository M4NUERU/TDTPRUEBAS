-- Migration: Advanced ERP Modules (Engineering & Purchasing) with Multi-Company Support

-- 1. ENGINEERING / CATALOG --------------------------------------------------

-- Table: catalogo_productos (What we sell)
CREATE TABLE IF NOT EXISTS catalogo_productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT, -- 'SOFA', 'BASECAMA', 'CABECERO'
  empresa TEXT NOT NULL CHECK (empresa IN ('TODOTEJIDOS', 'EMADERA')),
  precio_base NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: recetas (BOM Header - Variations of a product)
CREATE TABLE IF NOT EXISTS recetas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID REFERENCES catalogo_productos(id) ON DELETE CASCADE,
  nombre_variante TEXT NOT NULL, -- e.g., 'Tela Lino Gris', 'Cuero Café'
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: recetas_insumos (BOM Lines - Ingredients)
CREATE TABLE IF NOT EXISTS recetas_insumos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receta_id UUID REFERENCES recetas(id) ON DELETE CASCADE,
  insumo_id UUID REFERENCES inventario_insumos(id) ON DELETE RESTRICT, -- Don't delete used material
  cantidad NUMERIC NOT NULL,
  unidad_medida TEXT, -- 'METROS', 'UNIDADES', 'TARR', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PURCHASING / LOGISTICS -------------------------------------------------

-- Table: proveedores (Who we buy from)
CREATE TABLE IF NOT EXISTS proveedores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  razon_social TEXT NOT NULL,
  nit TEXT,
  contacto_nombre TEXT,
  telefono TEXT,
  email TEXT,
  categoria_insumo TEXT, -- 'TELAS', 'MADERAS', 'ESPUMAS'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: ordenes_compra (Purchase Orders)
CREATE TABLE IF NOT EXISTS ordenes_compra (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consecutivo SERIAL,
  proveedor_id UUID REFERENCES proveedores(id),
  empresa_solicitante TEXT NOT NULL CHECK (empresa_solicitante IN ('TODOTEJIDOS', 'EMADERA')),
  fecha_solicitud DATE DEFAULT CURRENT_DATE,
  fecha_entrega_estimada DATE,
  estado TEXT DEFAULT 'BORRADOR' CHECK (estado IN ('BORRADOR', 'ENVIADA', 'RECIBIDA', 'CANCELADA')),
  total_estimado NUMERIC DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: ordenes_compra_detalles (PO Lines)
CREATE TABLE IF NOT EXISTS ordenes_compra_detalles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  orden_id UUID REFERENCES ordenes_compra(id) ON DELETE CASCADE,
  insumo_id UUID REFERENCES inventario_insumos(id),
  cantidad_solicitada NUMERIC NOT NULL,
  cantidad_recibida NUMERIC DEFAULT 0,
  precio_unitario NUMERIC DEFAULT 0,
  subtotal NUMERIC GENERATED ALWAYS AS (cantidad_solicitada * precio_unitario) STORED
);


-- 3. SECURITY POLICIES (RLS) ------------------------------------------------
ALTER TABLE catalogo_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE recetas_insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra_detalles ENABLE ROW LEVEL SECURITY;

-- Simple policies for now (Open access for authenticated users, refined later)
CREATE POLICY "Enable all for auth" ON catalogo_productos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth" ON recetas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth" ON recetas_insumos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth" ON proveedores FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth" ON ordenes_compra FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth" ON ordenes_compra_detalles FOR ALL USING (auth.role() = 'authenticated');
