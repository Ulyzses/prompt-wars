<script lang="ts">
  import { opponents, player } from "$lib/stores";

  $: allPlayers = [$player, ...$opponents];
</script>
<div class="main-body">
  <h1 class="title">Game has concluded</h1>
  <h2 class="subtitle">Results</h2>

  <div class="scores">
    {#each allPlayers as player}
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
<style>
  .main-body {
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    width: 100%;
  }

  .player-name {
    float: left;
    margin-right: var(--space-xxl);
  }

  .player-score {
    float: right;
  }

  .score {
    margin-bottom: var(--space-l);
  }

  .scores {
    max-width: var(--width-s);
  }

  .subtitle {
    margin-bottom: var(--space-l);
  }

  .title {
    margin-bottom: var(--space-xl);
  }
</style>