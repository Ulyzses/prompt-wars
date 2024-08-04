<script lang="ts">
  import { supabase } from "$lib/supabaseClient";
  import { RealtimeChannel, type RealtimePostgresChangesPayload } from "@supabase/supabase-js";
  import { onDestroy } from "svelte";

  import { player, opponents, session } from "$lib/stores";
  import type { Player, Session } from "$lib/types";
  import { generate } from "random-words";
  import AttackBox from "$lib/components/AttackBox.svelte";
  import DefenceBox from "$lib/components/DefenceBox.svelte";

  const handleSessionChanges = async (payload: RealtimePostgresChangesPayload<Session>) => {
    if (payload.eventType !== 'UPDATE') return;

    $session = payload.new;

    if ( payload.new.state === "DEFENDING" ) {
      const password = generate({ minLength: 3, maxLength: 6 }) as string;

      const playerQuery = await supabase
        .from('players')
        .update({ password })
        .eq('id', $player.id)
        .eq('session', $session.id);
      
      if ( playerQuery.error ) {
        const { code, message } = playerQuery.error;
        error = `ERROR ${code}: ${message}`;
        return console.error(playerQuery.error);
      }
    }
  }

  const handlePlayerChanges = async (payload: RealtimePostgresChangesPayload<Player>) => {
    if (payload.eventType === 'INSERT') {
      if ( payload.new.id === $player.id ) return;

      $opponents = [...$opponents, payload.new];
    }
  }

  onDestroy(() => {
    playerSub?.unsubscribe();
    sessionSub?.unsubscribe();
  })

  /* Admin action handlers */

  async function joinSession() {
    const sessionQuery = await supabase
      .from('sessions')
      .select()
      .eq("id", sessionId)
      .limit(1)
      .single();
    
    if ( sessionQuery.error ) {
      const { code, message } = sessionQuery.error;
      error = `ERROR ${code}: ${message}`;
      return console.error(sessionQuery.error);
    }

    $session = sessionQuery.data;

    const playerQuery = await supabase
      .from('players')
      .upsert({
        session: $session.id,
        name: playerName,
      }, { onConflict: 'session, name' })
      .select()
      .limit(1)
      .single();
    
    if ( playerQuery.error ) {
      const { code, message } = playerQuery.error;
      error = `ERROR ${code}: ${message}`;
      return console.error(playerQuery.error);
    }

    $player = playerQuery.data;
    
    const opponentQuery = await supabase
      .from('players')
      .select()
      .eq('session', $session.id)
      .neq('id', $player.id);
    
    if ( opponentQuery.error ) {
      const { code, message } = opponentQuery.error;
      error = `ERROR ${code}: ${message}`;
      return console.error(opponentQuery.error);
    }

    $opponents = opponentQuery.data;

    sessionSub = supabase
      .channel('sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, handleSessionChanges)
      .subscribe();
    
    playerSub = supabase
      .channel('players')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, handlePlayerChanges)
      .subscribe();

    error = '';
  }
  
  let playerSub: RealtimeChannel;
  let sessionSub: RealtimeChannel;
  let error: string = '';
  let playerName: string = '';
  let sessionId: number = 0;
  
</script>
{#if error}
  <p>{error}</p>
{/if}
<form on:submit|preventDefault>
  {#if $session && $player}
    <p>Logged in as {$player.name}</p>
    <p>Current Session: [{$session.id}] {$session.name}</p>
    {#if $session.state === "WAITING"}
      <p>Waiting for admin to start the game</p>
      <p>Opponents</p>
      {#each $opponents as opponent}
        {opponent.name}
      {/each}
    {:else if $session.state === "DEFENDING"}
      <p>Defending</p>
      <DefenceBox bind:error={error} previousPrompt={$player.def_prompt} />
    {:else if $session.state === "ATTACKING"}
      {#each $opponents as opponent}
        <AttackBox {opponent} bind:error={error} />
      {/each}
    {:else}
      <p>Game has concluded</p>
    {/if}
  {:else}
    <input type="text" name="name" placeholder="Name" bind:value={playerName}>
    <input type="number" name="sessionId" placeholder="Session ID" bind:value={sessionId}>
    <button on:click|preventDefault={joinSession}>Join Session</button>
  {/if}
</form>