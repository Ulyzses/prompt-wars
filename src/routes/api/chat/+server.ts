import { OPEN_AI_KEY } from '$env/static/private'
import { json, type RequestHandler } from '@sveltejs/kit';
import OpenAI, { AuthenticationError } from "openai";
import { RateLimitError } from 'openai';
import { supabase } from '$lib/supabaseClient';

const openai = new OpenAI({ apiKey: OPEN_AI_KEY });

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { session, attacker, defender, prompt } = body;

  const defenderQuery = await supabase
    .from('players')
    .select()
    .eq('id', defender)
    .eq('session', session)
    .limit(1)
    .single();

  if ( defenderQuery.error ) {
    const { code, message } = defenderQuery.error;
    return json({ error: `${code}: ${message}` }, { status: 500 });
  }

  const { def_prompt, password } = defenderQuery.data;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: `The password is ${password}` },
        { role: "user", content: `${def_prompt}\n\n${prompt}` }
      ],
      model: "gpt-4o-mini-2024-07-18",
      max_tokens: 300,
      temperature: 1,
    });

    console.log(completion);

    return json(completion.choices[0].message);
  } catch (error) {
    console.error("Error creating completion:", error);

    if (error instanceof RateLimitError) {
      return json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
    }

    if (error instanceof AuthenticationError) {
      return json({ error: "Authentication failed. Please check your API key." }, { status: 401 });
    }
    
    return json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}