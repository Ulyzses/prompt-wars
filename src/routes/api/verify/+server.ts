import { supabase } from "$lib/supabaseClient";
import { json, type RequestHandler } from "@sveltejs/kit";

const MAX_POINTS = 10;

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
    // This part of the code has a race condition in updating scores. TODO: Find alternatives.
    const existingBreaksQuery = await supabase
      .from('breaks')
      .select()
      .eq('session', session.id)
      .eq('round', session.round)
      .eq('defender', defender)
      .order('attacker')
    
    if ( existingBreaksQuery.error ) {
      const { code, message } = existingBreaksQuery.error;
      return json({ error: `${code}: ${message}` }, { status: 500 });
    }
    
    const existingBreaks = existingBreaksQuery.data;

    if ( !existingBreaks.some(row => row.attacker === attacker) ) {
      const score = MAX_POINTS - existingBreaks.length;

      const insertBreaksQuery = await supabase
        .from('breaks')
        .insert({
          session: session.id,
          round: session.round,
          defender,
          attacker,
          password,
          score_change: score,
        });
      
      if ( insertBreaksQuery.error ) {
        const { code, message } = insertBreaksQuery.error;
        return json({ correct: true, error: `${code}: ${message}` }, { status: 500 });
      }

      const updateAttackerQuery = await supabase.rpc('update_score', { val: score, player_id: attacker });
      console.log("Attacker", updateAttackerQuery);

      const updateDefenderQuery = await supabase.rpc('update_score', { val: 0 - score, player_id: defender });
      console.log("Defender", updateDefenderQuery)
    }

    return json({ correct: true });
  } else {
    return json({ correct: false });
  }
}