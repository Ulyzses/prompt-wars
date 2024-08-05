<script lang="ts">
  import AttackBox from "$lib/components/AttackBox.svelte";
  import GameHeader from "$lib/components/GameHeader.svelte";
  import GameStateConcluded from "$lib/components/GameStateConcluded.svelte";

  import { attacks, opponents, session } from "$lib/stores";
  import GameStateAttacking from "./GameStateAttacking.svelte";
  import GameStateDefending from "./GameStateDefending.svelte";

  export let error: string;
</script>
<div class="main-container">
  <GameHeader />
  <div class="game-body">
    {#if $session.state === "WAITING"}
      <p>Waiting for admin to start the game</p>
      <p>Opponents</p>
      {#each $opponents as opponent}
        {opponent.name}
      {/each}
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
  }

  .game-body {
    flex-grow: 1;
    width: 100vw;
  }
</style>