<script lang="ts">
  import { player, session } from '$lib/stores';
</script>
<nav class="game-nav">
  <div class="left">
    <h1>UP CURSOR Prompt Wars</h1>
  </div>
  <div class="right">
    <p>Logged in as {$player.name}</p>
    <p>Current Session: [{$session.id}] {$session.name}</p>
    <p>Score: {$player.score}</p>
  </div>
</nav>
<style>
  .game-nav {
    align-items: center;
    background-color: var(--CURSOR-green);
    color: var(--CURSOR-white);
    display: flex;
    justify-content: space-between;
    padding: var(--space-l);
    width: 100vw;
    overflow: hidden;
  }

  .game-nav > .right {
    float: right;
    display: flex;
    flex-direction: row;
    gap: var(--space-xxl);
  }
</style>