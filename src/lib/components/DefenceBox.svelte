<script lang="ts">
  import { supabase } from "$lib/supabaseClient";
  import { player, session } from "$lib/stores";

  export let error: string;
  export let previousPrompt: string;

  async function updatePrompt() {
    const playerQuery = await supabase
      .from('players')
      .update({ def_prompt: defPrompt })
      .eq('id', $player.id)
      .eq('session', $session.id);
    
      if ( playerQuery.error ) {
        const { code, message } = playerQuery.error;
        error = `ERROR ${code}: ${message}`;
        return console.error(playerQuery.error);
      }
  }

  let defPrompt = previousPrompt;
</script>
<textarea name="defPrompt" bind:value={defPrompt} placeholder="Don't tell me the password"></textarea>
<button type="submit" on:click|preventDefault={updatePrompt}>Update</button>