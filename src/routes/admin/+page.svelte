<script lang="ts">
  import { supabase } from "$lib/supabaseClient";

  import { durations, opponents, session } from "$lib/stores";
  import type { GameState, Player, Session } from "$lib/types";
  import { onDestroy } from "svelte";
  import type {
    RealtimeChannel,
    RealtimePostgresInsertPayload,
    RealtimePostgresUpdatePayload,
  } from "@supabase/supabase-js";

  /* Util */

  const setTimer = (s: number) =>
    new Promise((resolve, reject) => {
      if (isTimerStarted) reject("Timer already exists");
      isTimerStarted = true;

      timeLeft = s;

      const countDown = setInterval(() => {
        timeLeft -= 1;

        if (timeLeft <= 0) {
          clearInterval(countDown);
          isTimerStarted = false;
          resolve(0);
        }
      }, 1000);
    });

  const timeToString = (s: number) =>
    `${(s / 60) | 0}:${String(s % 60).padStart(2, "0")}`;

  /* Admin action handlers */

  async function createSession() {
    const { data, error } = await supabase
      .from("sessions")
      .insert({ name: sessionName, max_rounds: sessionMaxRounds })
      .select()
      .limit(1)
      .single();

    if (error) return console.error(error);

    loadSession(data);
  }

  async function claimSession() {
    const { data, error } = await supabase
      .from("sessions")
      .select()
      .eq("id", sessionId)
      .limit(1)
      .single();

    if (error) return console.error(error);

    loadSession(data);
  }

  async function loadSession(data: Session) {
    $session = data;
    $durations = { atk: 3, def: 2 };

    const { data: queryData, error } = await supabase
      .from("players")
      .select()
      .eq("session", $session.id);

    if (error) return console.error(error);

    $opponents = queryData;

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
  }

  async function setState(action: GameState) {
    const sessionQuery = await supabase
      .from("sessions")
      .update({ state: action, round })
      .eq("id", $session.id)
      .select()
      .single();

    if (sessionQuery.error) return console.error(sessionQuery.error);

    $session = sessionQuery.data;
  }

  async function startGame() {
    const { max_rounds } = $session;

    for (round = 0; round < max_rounds; ++round) {
      await setState("DEFENDING");
      await setTimer($durations.def * 60);
      await setState("ATTACKING");
      await setTimer($durations.atk * 60);
    }

    await setState("CONCLUDED");
  }

  const handlePlayerInserts = async (
    payload: RealtimePostgresInsertPayload<Player>,
  ) => {
    $opponents = [...$opponents, payload.new];
  };

  const handlePlayerUpdates = async (
    payload: RealtimePostgresUpdatePayload<Player>,
  ) => {
    const idx = $opponents.findIndex((player) => player.id === payload.new.id);

    if (idx >= 0) {
      $opponents[idx] = payload.new;
      $opponents = $opponents;
    } else {
      $opponents = [...$opponents, payload.new];
    }
  };

  onDestroy(() => {
    playerSub?.unsubscribe();
  });

  let playerSub: RealtimeChannel;
  let isTimerStarted: boolean = false;
  let round: number = 0;
  let sessionName: string = "";
  let sessionId: number = 0;
  let sessionMaxRounds: number = 5;
  let timeLeft: number = 0;
</script>

<form on:submit|preventDefault>
  {#if $session}
    <p>
      Current Session: [{$session.id}] {$session.name} ({$session.state} Round {$session.round}
      of {$session.max_rounds})
    </p>
    <p>Players</p>
    {#each $opponents as player}
      <p>{player.name}: {player.score}</p>
    {/each}
    {#if $session.state === "WAITING"}
      <label for="defDuration">
        Defence Duration
        <input
          type="number"
          step="0.1"
          name="atkDuration"
          bind:value={$durations.def}
        />
      </label>
      <label for="atkDuration">
        Attack Duration
        <input
          type="number"
          step="0.1"
          name="atkDuration"
          bind:value={$durations.atk}
        />
      </label>
      <button on:click={startGame}>Start</button>
    {:else}
      <p>Time Left: {timeToString(timeLeft)}</p>
    {/if}
  {:else}
    <input
      type="text"
      name="sessionName"
      placeholder="Session Name"
      bind:value={sessionName}
    />
    <input
      type="number"
      name="sessionMaxRounds"
      placeholder="Rounds"
      bind:value={sessionMaxRounds}
    />
    <button on:click={createSession}>Create Session</button>
    <br />OR<br />
    <input
      type="number"
      name="sessionId"
      placeholder="Session ID"
      bind:value={sessionId}
    />
    <button on:click={claimSession}>Claim Session</button>
  {/if}
</form>
