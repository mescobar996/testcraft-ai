import { supabase } from './supabase';
import { TestCase } from '@/app/page';

export interface FavoriteCase {
  id: string;
  user_id: string;
  test_case: TestCase;
  requirement_title: string;
  created_at: string;
}

// Guardar caso como favorito
export async function addFavorite(
  userId: string,
  testCase: TestCase,
  requirementTitle: string
): Promise<FavoriteCase | null> {
  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      test_case: testCase,
      requirement_title: requirementTitle,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding favorite:', error);
    return null;
  }

  return data;
}

// Obtener favoritos del usuario
export async function getFavorites(userId: string): Promise<FavoriteCase[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }

  return data || [];
}

// Eliminar favorito
export async function removeFavorite(
  userId: string,
  favoriteId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('id', favoriteId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error removing favorite:', error);
    return false;
  }

  return true;
}

// Verificar si un caso es favorito
export async function isFavorite(
  userId: string,
  testCaseId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .filter('test_case->>id', 'eq', testCaseId)
    .single();

  if (error) return false;
  return !!data;
}
