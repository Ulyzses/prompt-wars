<script lang="ts">
  import { attacks, opponents } from "$lib/stores";
  import AttackGrid from "$lib/components/AttackGrid.svelte";
  import AttackBox from "$lib/components/AttackBox.svelte";

  function getAttackerName(attackerId: number) {
    const player = $opponents.find(x => x.id === attackerId);

    return player?.name ?? "Unknown Player";
  }

  export let error: string;
</script>
<div class="main-body">
  <div class="main-content">
    <AttackGrid bind:error />
  </div>
  <div class="section-logs">
    <h1>Logs</h1>
    <div class="logs">
      {#each $attacks as attack}
        <p>{getAttackerName(attack.attacker ?? 0)} ⚔️: "{attack.atk_prompt}"</p>
      {/each}
    </div>
  </div>
</div>
<style>
  .main-body {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: 1fr;
    grid-column-gap: 0px;
    grid-row-gap: 0px;

    min-height: 100vh;
  }

  .main-content {
    grid-area: 1 / 1 / 2 / 4;
  }

  .section-logs {
    grid-area: 1 / 4 / 2 / 5;
  }
</style>