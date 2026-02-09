-- Add salary fields to usuarios table to match operarios
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS salario_base NUMERIC DEFAULT 1300000,
ADD COLUMN IF NOT EXISTS auxilio_transporte NUMERIC DEFAULT 162000,
ADD COLUMN IF NOT EXISTS tipo_contrato TEXT DEFAULT 'INDEFINIDO',
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

-- Sync existing data
UPDATE usuarios SET salario_base = 1800000 WHERE rol = 'TAPICERO';
UPDATE usuarios SET salario_base = 1500000 WHERE rol = 'COSTURERO';
