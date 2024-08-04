<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let password = "";

  async function login() {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    const result: { success: boolean } = await response.json();
    if (result.success) {
      goto("/admin");
    } else {
      alert("Incorrect password");
    }
  }

  onMount(() => {
    // If already authenticated, redirect to admin
    if (document.cookie.includes("auth=true")) {
      goto("/admin");
    }
  });
</script>

<form on:submit|preventDefault={login}>
  <label>
    Password:
    <input type="password" bind:value={password} />
  </label>
  <button type="submit">Login</button>
</form>
