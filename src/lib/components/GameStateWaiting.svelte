<script lang="ts">
  import { opponents, player, session } from "$lib/stores";
  import type { Player } from "$lib/types";

  const compareName = (a: Player, b: Player) => a.name > b.name ? 1 : -1;

  $: allPlayers = [...$opponents, $player].toSorted(compareName);
</script>
<div class="main-body">
  <h1 class="title">{$session.name}</h1>
  <h2 class="subtitle">Waiting for the host to start the game.</h2>
  <h3 class="players">Players</h3>
  {#each allPlayers as player}
    <p class="player-name">{player.name}</p>
  {/each}
</div>
<style>
  .main-body {
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    width: 100%;
  }

  .players {
    margin-bottom: var(--space-s);
  }

  .subtitle {
    margin-bottom: var(--space-l);
  }

  .title {
    margin-bottom: var(--space-xl);
  }
</style>