-- Create asistencia table
CREATE TABLE IF NOT EXISTS asistencia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operario_id UUID REFERENCES operarios(id) ON DELETE CASCADE,
  fecha DATE DEFAULT CURRENT_DATE,
  entrada TIMESTAMPTZ DEFAULT NOW(),
  salida TIMESTAMPTZ,
  horas_trabajadas NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vales_tiempo table
CREATE TABLE IF NOT EXISTS vales_tiempo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operario_id UUID REFERENCES operarios(id) ON DELETE CASCADE,
  creado_por UUID REFERENCES operarios(id),
  cantidad_horas NUMERIC NOT NULL,
  tipo TEXT CHECK (tipo IN ('ABONO', 'CARGO')),
  motivo TEXT,
  estado TEXT DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANJEADO')),
  fecha_solicitud TIMESTAMPTZ DEFAULT NOW(),
  fecha_aprobacion TIMESTAMPTZ,
  firma_digital TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE asistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE vales_tiempo ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON asistencia FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON asistencia FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON asistencia FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON vales_tiempo FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON vales_tiempo FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON vales_tiempo FOR UPDATE USING (true);
