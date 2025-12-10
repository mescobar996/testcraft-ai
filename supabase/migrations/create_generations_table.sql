-- Tabla para guardar el historial de generaciones
CREATE TABLE generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  requirement TEXT NOT NULL,
  context TEXT,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por usuario
CREATE INDEX idx_generations_user_id ON generations(user_id);

-- Índice para ordenar por fecha
CREATE INDEX idx_generations_created_at ON generations(created_at DESC);

-- Habilitar Row Level Security
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Política: usuarios solo pueden ver sus propias generaciones
CREATE POLICY "Users can view own generations" ON generations
  FOR SELECT USING (auth.uid() = user_id);

-- Política: usuarios solo pueden insertar sus propias generaciones
CREATE POLICY "Users can insert own generations" ON generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: usuarios solo pueden eliminar sus propias generaciones
CREATE POLICY "Users can delete own generations" ON generations
  FOR DELETE USING (auth.uid() = user_id);
