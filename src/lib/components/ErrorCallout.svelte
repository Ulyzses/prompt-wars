<script lang="ts">
  export let error;
</script>
{#if error}
  <div class="error-box">
    <p class="error-message">{error}</p>
  </div>
{/if}
<style>
  .error-box {
    background-color: var(--callout-alert);
    border: 1px solid red;
    padding: var(--space-m);
  }

  .error-message {
    font-size: var(--font-s);
  }
</style>