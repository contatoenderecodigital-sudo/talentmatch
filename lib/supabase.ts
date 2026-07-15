import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Não lançamos erro no carregamento do módulo (isso deixaria a tela em branco no web).
// Em vez disso, sinalizamos a falta de config e o _layout mostra uma mensagem clara.
export const configOk = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      // AsyncStorage não existe no web; lá o supabase-js usa localStorage sozinho.
      ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
      autoRefreshToken: true,
      persistSession: true,
      // No web a recuperação de senha volta com o token na URL — precisa detectar.
      detectSessionInUrl: Platform.OS === 'web',
    },
  }
);
