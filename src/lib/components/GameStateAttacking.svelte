<script lang="ts">
  import AttackBox from "$lib/components/AttackBox.svelte";
  import { attacks, opponents } from "$lib/stores";

  export let error: string;
</script>
<div class="main-body">
  <div class="main-content">
    {#each $opponents as opponent}
      <AttackBox {opponent} bind:error />
    {/each}
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
    display: flex;
  }

  .main-content {
    flex-grow: 2;
  }

  .logs {
    flex-grow: 1;
  }
</style>