<script lang="ts">
  import AttackBox from "$lib/components/AttackBox.svelte";
  import { opponents } from "$lib/stores";

  export let error: string;

  $: console.log($opponents);
</script>
<table class="grid-container">
  {#each Array(3) as _, row}
    <tr class="grid-row">
      {#each Array(3) as _, col}
        <td class="grid-cell">
          <AttackBox opponent={$opponents[3 * row + col]} bind:error />
        </td>
      {/each}
    </tr>
  {/each}
</table>
<style>
  .grid-container {
    border-spacing: var(--space-xs);
    table-layout: fixed;
    width: 100%;
  }

  .grid-row {
    height: calc(100% / 3);
  }

  .grid-cell {
    width: calc(100% / 3);
    max-height: 100%;
  }
</style>