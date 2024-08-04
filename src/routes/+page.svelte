<script lang="ts">
  async function submit() {
    const res = await fetch("/api/chat", {
      method: "POST",
    });
    const completion = await res.json();

    console.log(completion);
  }
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>
<button on:click={submit}>Generate</button>
