<script lang="ts">
  import { supabase } from "$lib/supabaseClient";

  import { durations, opponents, session } from "$lib/stores";
  import type { Attack, Break, GameState, Player, Session } from "$lib/types";
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
      }, 990); // Naive fix for drift
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

  async function getRoundBreaks() {
    const { data, error } = await supabase
      .from("breaks")
      .select()
      .eq("session", $session.id)
      .eq("round", $session.round);
    
    if (error) return error;

    roundBreaks = data;
  }

  async function loadSession(data: Session) {
    $session = data;
    $durations = { atk: 3, def: 2 };

    const { data: queryData, error: queryError } = await supabase
      .from("players")
      .select()
      .eq("session", $session.id);

    if (queryError) return console.error(queryError);

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
    
    const breakError = await getRoundBreaks();
    if (breakError) return console.error(breakError);

    breakSub = supabase
      .channel("breaks")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "breaks" },
        handleBreakInserts
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

    if (action === "DEFENDING" || action === "ATTACKING") {
      await getRoundBreaks();
    }
  }

  function getPlayerName(attackerId: number) {
    const player = $opponents.find(x => x.id === attackerId);

    return player?.name ?? "Unknown Player";
  }

  function clearTime() {
    timeLeft = 0;
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

  const handleBreakInserts = async(
    payload: RealtimePostgresInsertPayload<Break>,
  ) => {
    if (payload.new.session !== $session.id ||
      payload.new.round !== $session.round
    ) return;

    roundBreaks = [...roundBreaks, payload.new];
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
    breakSub?.unsubscribe();
    playerSub?.unsubscribe();
  });

  let playerBreaks = {};
  let roundBreaks: Break[] = [];
  let breakSub: RealtimeChannel;
  let playerSub: RealtimeChannel;
  let isTimerStarted: boolean = false;
  let round: number = 0;
  let sessionName: string = "";
  let sessionId: number = 0;
  let sessionMaxRounds: number = 5;
  let timeLeft: number = 0;
</script>

<div class="main-container">
  <div class="main-body">
    <form on:submit|preventDefault>
      {#if $session}
        {#if $session.state === "WAITING"}
          <h1>WAITING [Session {$session.id}]</h1>
          <h2>Players</h2>
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
          <button on:click={clearTime}>Clear Time</button>
        {/if}
        <div class="players">
          <div class="scores">
            {#each $opponents as player}
              <div class="score">
                <span class="player-name">
                  {player.name}
                </span>
                <span class="player-score">
                  {player.score}
                </span>
              </div>
            {/each}
          </div>
        </div>
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
  </div>
</div>
<style>
  .main-body {
    height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .player-name {
    float: left;
    margin-right: var(--space-xxl);
  }

  .player-score {
    float: right;
  }

  .score {
    margin-bottom: var(--space-s);
  }

  .scores {
    max-width: var(--width-s);
  }
</style>