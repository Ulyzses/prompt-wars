<script lang="ts">
  import { supabase } from "$lib/supabaseClient";

  import { durations, session } from "$lib/stores";
  import type { GameState } from "$lib/types";

  /* Util */

  const delay = (s: number) => new Promise(resolve => setTimeout(resolve, s * 1000));

  /* Admin action handlers */

  async function createSession() {
    const { data, error } = await supabase
      .from('sessions')
      .insert({ name: sessionName, max_rounds: sessionMaxRounds })
      .select()
      .limit(1)
      .single();
    
    if ( error ) return console.error(error);

    $session = data;
    $durations = { atk: 3, def: 2 }
  }

  async function claimSession() {
    const { data, error } = await supabase
      .from('sessions')
      .select()
      .eq("id", sessionId)
      .limit(1)
      .single();
    
    if ( error ) return console.error(error);

    $session = data;
    $durations = { atk: 3, def: 2 }
  }
  
  async function broadcast(action: GameState) {
    const sessionQuery = await supabase
      .from('sessions')
      .update({ state: action, round })
      .eq('id', $session.id)
      .select()
      .single();
    
    if ( sessionQuery.error ) return console.error(sessionQuery.error);

    $session = sessionQuery.data;
  }

  async function startGame() {
    const { max_rounds } = $session;

    for (round = 0; round < max_rounds; ++round) {
      await broadcast("DEFENDING");
      await delay($durations.def * 60);
      await broadcast("ATTACKING");
      await delay($durations.atk * 60);
    }

    await broadcast("CONCLUDED");
  }

  let round: number = 0;
  let sessionName: string = '';
  let sessionId: number = 0;
  let sessionMaxRounds: number = 5;
  
</script>
<form on:submit|preventDefault>
  {#if $session}
    <label for="defDuration">
      Defence Duration
      <input type="number" step="0.1" name="atkDuration" bind:value={$durations.def}>
    </label>
    <label for="atkDuration">
      Attack Duration
      <input type="number" step="0.1" name="atkDuration" bind:value={$durations.atk}>
    </label>
    <p>Current Session: [{$session.id}] {$session.name} ({$session.state})</p>
    <button on:click={startGame}>Start</button>
  {:else}
    <input type="text" name="sessionName" placeholder="Session Name" bind:value={sessionName}>
    <input type="number" name="sessionMaxRounds" placeholder="Rounds" bind:value={sessionMaxRounds}>
    <button on:click={createSession}>Create Session</button>
    <br>OR<br>
    <input type="number" name="sessionId" placeholder="Session ID" bind:value={sessionId}>
    <button on:click={claimSession}>Claim Session</button>
  {/if}
</form>