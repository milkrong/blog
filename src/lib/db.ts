import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/supabase';
import * as schema from './schema';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const client = createClient(supabaseUrl, supabaseKey);

export const db = drizzle(client, { schema });
