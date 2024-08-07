<script lang="ts">
  import GameHeader from "$lib/components/GameHeader.svelte";
  import GameStateAttacking from "$lib/components/GameStateAttacking.svelte";
  import GameStateConcluded from "$lib/components/GameStateConcluded.svelte";
  import GameStateDefending from "$lib/components/GameStateDefending.svelte";
  import GameStateWaiting from "$lib/components/GameStateWaiting.svelte";

  import { opponents, session } from "$lib/stores";

  export let error: string;
</script>
<div class="main-container">
  <GameHeader />
  <div class="game-body">
    {#if $session.state === "WAITING"}
      <GameStateWaiting />
    {:else if $session.state === "DEFENDING"}
      <GameStateDefending bind:error />
    {:else if $session.state === "ATTACKING"}
      <GameStateAttacking bind:error />
    {:else}
      <GameStateConcluded />
    {/if}
  </div>
</div>
<style>
  .main-container {
    display: flex;
    flex-direction: column;

    height: 100vh;
  }

  .game-body {
    flex-grow: 1;
    width: 100vw;
  }
</style>