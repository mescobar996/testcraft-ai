import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { GenerationResult } from '@/app/page';

export interface HistoryRecord {
  id: string;
  user_id: string;
  requirement: string;
  context: string;
  result: GenerationResult;
  created_at: string;
}

// Guardar generación en la base de datos
export async function saveGeneration(
  userId: string,
  requirement: string,
  context: string,
  result: GenerationResult
): Promise<HistoryRecord | null> {
  try {
    const supabase = createClientComponentClient();

    const { data, error } = await supabase
      .from('generations')
      .insert({
        user_id: userId,
        requirement,
        context,
        result,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving generation:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error saving generation:', err);
    return null;
  }
}

// Obtener historial del usuario
export async function getGenerations(
  userId: string,
  limit: number = 50
): Promise<HistoryRecord[]> {
  try {
    const supabase = createClientComponentClient();

    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching generations:', error);
      throw error; // Throw para que el componente pueda manejar el error
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error fetching generations:', err);
    throw err; // Propagar el error
  }
}

// Eliminar una generación
export async function deleteGeneration(
  userId: string,
  generationId: string
): Promise<boolean> {
  try {
    const supabase = createClientComponentClient();

    const { error } = await supabase
      .from('generations')
      .delete()
      .eq('id', generationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting generation:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error deleting generation:', err);
    return false;
  }
}

// Eliminar todo el historial del usuario
export async function clearAllGenerations(userId: string): Promise<boolean> {
  try {
    const supabase = createClientComponentClient();

    const { error } = await supabase
      .from('generations')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error clearing generations:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error clearing generations:', err);
    return false;
  }
}
