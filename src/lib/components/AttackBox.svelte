<script lang="ts">
  import type { Player } from "$lib/types";
  import { player, session } from "$lib/stores";

  export let opponent: Player;
  export let error: string;

  async function setCooldown(s: number, step: number = 0.1) {
    cooldown = 10;

    const countDown = setInterval(() => {
      if (cooldown <= 0) {
        return clearInterval(countDown);
      }

      cooldown -= step;
    }, step * 1000);
  }

  async function sendAttack() {
    completion = "";
    setCooldown(10);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          session: $session,
          attacker: $player.id,
          defender: opponent.id,
          prompt: attack,
        }),
      });

      const data = await response.json();
      completion = data.content;
    } catch (e) {
      error = e as string;
    }
  }

  async function verifyPassword() {
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        body: JSON.stringify({
          session: $session,
          attacker: $player.id,
          defender: opponent.id,
          password,
        }),
      });

      const data = await response.json();
      const { correct } = data;

      status = correct
        ? `You got the password: ${password}`
        : `The submitted password is wrong`;
    } catch (e) {
      error = e as string;
    }
  }

  let attack = "";
  let completion = "";
  let cooldown = 0;
  let password = "";
  let status = "";

  $: isDisabled = cooldown > 0;
</script>

<div class="card">
  {#if opponent}
    <h3>{opponent.name}</h3>
    <textarea
      placeholder="Chat completions go here"
      id="completion"
      rows="3"
      bind:value={completion}
      disabled
    ></textarea>
    <div class="section-prompt">
      <textarea
      placeholder="Attack here"
      id="prompt"
      name="attack" 
      rows="3"
      bind:value={attack}
      ></textarea>
      <button
        type="submit"
        on:click|preventDefault={sendAttack}
        disabled={isDisabled}
        >Submit Prompt{isDisabled ? ` (in ${cooldown.toFixed(1)}s)` : ""}</button
      >
    </div>
    <div class="section-password">
      <input type="text" placeholder="Password" name="password" bind:value={password} />
      <button type="submit" on:click|preventDefault={verifyPassword}>Verify</button>
    </div>
    {#if status}
      <p>{status}</p>
    {/if}
  {/if}
</div>
<style>
  .card {
    background-color: white;
    border-radius: var(--space-s);
    box-shadow: #ddd 0 0 var(--space-m);
    padding: var(--space-s);
    max-width: 100%;
  }

  .section-prompt {
    width: 100%;
  }

  textarea {
    padding: var(--space-xs);
    resize: none;
  }
  
  #completion {
    background-color: var(--CURSOR-white);
    width: 100%;
  }
</style>