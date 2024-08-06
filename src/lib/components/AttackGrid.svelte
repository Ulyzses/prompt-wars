<script lang="ts">
  import AttackBox from "$lib/components/AttackBox.svelte";
  import { opponents } from "$lib/stores";

  export let error: string;
</script>
<div class="grid-container">
  {#each Array(6) as _, i}
    <AttackBox opponent={$opponents[i]} bind:error />
  {/each}
</div>
<style>
  .grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: var(--space-xs);
  }
</style>