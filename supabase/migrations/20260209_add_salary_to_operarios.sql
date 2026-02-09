-- Migration: Add salary and contract columns to operarios

ALTER TABLE operarios
ADD COLUMN IF NOT EXISTS salario_base NUMERIC DEFAULT 1300000,
ADD COLUMN IF NOT EXISTS auxilio_transporte NUMERIC DEFAULT 162000,
ADD COLUMN IF NOT EXISTS tipo_contrato TEXT DEFAULT 'INDEFINIDO',
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

-- Update existing records with defaults based on cargo (optional, best effort)
UPDATE operarios SET salario_base = 1800000 WHERE cargo = 'Tapicero';
UPDATE operarios SET salario_base = 1500000 WHERE cargo = 'Costurero';
-- Ayudantes and others keep default 1300000
