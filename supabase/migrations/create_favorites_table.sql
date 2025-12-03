-- Tabla para guardar casos de prueba favoritos
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  test_case JSONB NOT NULL,
  requirement_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por usuario
CREATE INDEX idx_favorites_user_id ON favorites(user_id);

-- Índice para ordenar por fecha
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);

-- Habilitar Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Política: usuarios solo pueden ver sus propios favoritos
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

-- Política: usuarios solo pueden insertar sus propios favoritos
CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: usuarios solo pueden eliminar sus propios favoritos
CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);
