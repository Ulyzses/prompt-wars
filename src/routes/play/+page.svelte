<script lang="ts">
  import { generate } from "random-words";
  import type {
    PostgrestError,
    RealtimePostgresInsertPayload,
    RealtimePostgresUpdatePayload,
  } from "@supabase/supabase-js";
  import { RealtimeChannel } from "@supabase/supabase-js";
  import { onDestroy } from "svelte";

  import LoginScreen from "$lib/components/LoginScreen.svelte";
  import { attacks, opponents, player, session } from "$lib/stores";
  import { supabase } from "$lib/supabaseClient";
  import type { Attack, Player, Session } from "$lib/types";
  import GameScreen from "$lib/components/GameScreen.svelte";

  function handleError(queryError: PostgrestError) {
    console.error(queryError); 
    const { code, message } = queryError;
    error = `ERROR ${code}: ${message}`;
  }

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
      
      if (playerQuery.error) return handleError(playerQuery.error);
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

    if (sessionQuery.error) return handleError(sessionQuery.error); 

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

    if (playerQuery.error) return handleError(playerQuery.error); 

    $player = playerQuery.data;

    /* Retrieve opponents */
    const opponentQuery = await supabase
      .from("players")
      .select()
      .eq("session", $session.id)
      .neq("id", $player.id);

    if (opponentQuery.error) return handleError(opponentQuery.error); 

    $opponents = opponentQuery.data;

    /* Retrieve attacks */
    const attackQuery = await supabase
      .from("attacks")
      .select()
      .eq("session", $session.id)
      .eq("defender", $player.id);

    if (attackQuery.error) return handleError(attackQuery.error); 

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
  <GameScreen bind:error />
{:else}
  <LoginScreen {joinSession} bind:error />
{/if}
