<script lang="ts">
  import { attacks } from "$lib/stores";
  import AttackGrid from "$lib/components/AttackGrid.svelte";

  export let error: string;
</script>
<div class="main-body">
  <div class="main-content">
    <AttackGrid bind:error />
  </div>
  <div class="logs">
    <h1>Logs</h1>
    {#each $attacks as attack}
      <p>{attack.attacker} ⚔️: "{attack.atk_prompt}"</p>
    {/each}
  </div>
  
</div>
<style>
  .main-body {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: 1fr;
    grid-column-gap: 0px;
    grid-row-gap: 0px;
  }

  .main-content {
    grid-area: 1 / 1 / 2 / 4;
  }

  .logs {
    grid-area: 1 / 4 / 2 / 5;
  }
</style>