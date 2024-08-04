<script lang="ts">
  import { generate } from "random-words";
  import type {
    RealtimePostgresInsertPayload,
    RealtimePostgresUpdatePayload,
  } from "@supabase/supabase-js";
  import { RealtimeChannel } from "@supabase/supabase-js";
  import { onDestroy } from "svelte";

  import AttackBox from "$lib/components/AttackBox.svelte";
  import DefenceBox from "$lib/components/DefenceBox.svelte";
  import { attacks, opponents, player, session } from "$lib/stores";
  import { supabase } from "$lib/supabaseClient";
  import type { Attack, Player, Session } from "$lib/types";
  import LoginScreen from "$lib/components/LoginScreen.svelte";

  const handleSessionUpdates = async (
    payload: RealtimePostgresUpdatePayload<Session>,
  ) => {
    if (payload.new.id !== $session.id) return;

    $session = payload.new;

    if (payload.new.state === "DEFENDING") {
      const password = generate({ minLength: 3, maxLength: 6 }) as string;

      const playerQuery = await supabase
        .from("players")
        .update({ password })
        .eq("id", $player.id);

      if (playerQuery.error) {
        const { code, message } = playerQuery.error;
        error = `ERROR ${code}: ${message}`;
        return console.error(playerQuery.error);
      }
    }
  };

  const handlePlayerInserts = async (
    payload: RealtimePostgresInsertPayload<Player>,
  ) => {
    if (payload.new.id === $player.id) return;

    $opponents = [...$opponents, payload.new];
  };

  const handlePlayerUpdates = async (
    payload: RealtimePostgresUpdatePayload<Player>,
  ) => {
    if (payload.new.id !== $player.id) return;

    $player = payload.new;
  };

  const handleAttackInserts = async (
    payload: RealtimePostgresInsertPayload<Attack>,
  ) => {
    if (payload.new.defender !== $player.id) return;

    $attacks = [...$attacks, payload.new];
  };

  onDestroy(() => {
    playerSub?.unsubscribe();
    sessionSub?.unsubscribe();
    attackSub?.unsubscribe();
  });

  /* Admin action handlers */

  async function joinSession(sessionId: number, playerName: string) {
    /* Retrieve session */
    const sessionQuery = await supabase
      .from("sessions")
      .select()
      .eq("id", sessionId)
      .limit(1)
      .single();

    if (sessionQuery.error) {
      const { code, message } = sessionQuery.error;
      error = `ERROR ${code}: ${message}`;
      return console.error(sessionQuery.error);
    }

    $session = sessionQuery.data;

    /* Retrieve player */
    const playerQuery = await supabase
      .from("players")
      .upsert(
        {
          session: $session.id,
          name: playerName,
        },
        { onConflict: "session, name" },
      )
      .select()
      .limit(1)
      .single();

    if (playerQuery.error) {
      const { code, message } = playerQuery.error;
      error = `ERROR ${code}: ${message}`;
      return console.error(playerQuery.error);
    }

    $player = playerQuery.data;

    /* Retrieve opponents */
    const opponentQuery = await supabase
      .from("players")
      .select()
      .eq("session", $session.id)
      .neq("id", $player.id);

    if (opponentQuery.error) {
      const { code, message } = opponentQuery.error;
      error = `ERROR ${code}: ${message}`;
      return console.error(opponentQuery.error);
    }

    $opponents = opponentQuery.data;

    /* Retrieve attacks */
    const attackQuery = await supabase
      .from("attacks")
      .select()
      .eq("session", $session.id)
      .eq("defender", $player.id);

    if (attackQuery.error) {
      const { code, message } = attackQuery.error;
      error = `ERROR ${code}: ${message}`;
      return console.error(attackQuery.error);
    }

    $attacks = attackQuery.data;

    /* Subscribers */

    sessionSub = supabase
      .channel("sessions")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "sessions" },
        handleSessionUpdates,
      )
      .subscribe();

    playerSub = supabase
      .channel("players")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "players" },
        handlePlayerInserts,
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "players" },
        handlePlayerUpdates,
      )
      .subscribe();

    attackSub = supabase
      .channel("attacks")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "attacks" },
        handleAttackInserts,
      )
      .subscribe();

    error = "";
  }

  let attackSub: RealtimeChannel;
  let playerSub: RealtimeChannel;
  let sessionSub: RealtimeChannel;

  let error: string = "";
</script>

{#if error}
  <p>{error}</p>
{/if}
{#if $session && $player}
  <p>Logged in as {$player.name}</p>
  <p>Current Session: [{$session.id}] {$session.name}</p>
  <p>Score: {$player.score}</p>
  {#if $session.state === "WAITING"}
    <p>Waiting for admin to start the game</p>
    <p>Opponents</p>
    {#each $opponents as opponent}
      {opponent.name}
    {/each}
  {:else if $session.state === "DEFENDING"}
    <p>Defending</p>
    <DefenceBox bind:error previousPrompt={$player.def_prompt} />
  {:else if $session.state === "ATTACKING"}
    {#each $opponents as opponent}
      <AttackBox {opponent} bind:error />
    {/each}
  {:else}
    <p>Game has concluded</p>
  {/if}
  <h1>Logs</h1>
  {#each $attacks as attack}
    <p>{attack.attacker} ⚔️: "{attack.atk_prompt}"</p>
  {/each}
{:else}
  <LoginScreen {joinSession} bind:error />
{/if}
