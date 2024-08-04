import { supabase } from "$lib/supabaseClient";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async({ request }) => {
  const body = await request.json();
  const { session, attacker, defender, password } = body;

  const playerQuery = await supabase
    .from('players')
    .select()
    .eq('id', defender)
    .limit(1)
    .single();

  if ( playerQuery.error ) {
    const { code, message } = playerQuery.error;
    return json({ error: `${code}: ${message}` }, { status: 500 });
  }

  if ( password === playerQuery.data.password ) {
    return json({ correct: true });
  } else {
    return json({ correct: false });
  }
}