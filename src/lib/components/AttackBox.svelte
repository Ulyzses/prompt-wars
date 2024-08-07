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

      if (correct) {
        completion = `You got the password: ${password}`;
        isSolved = true;
      } else {
        completion = "The submitted password is wrong";
      }
    } catch (e) {
      error = e as string;
    }
  }

  let attack = "";
  let completion = "";
  let cooldown = 0;
  let password = "";
  let isSolved = false;

  $: isDisabled = cooldown > 0;
</script>

{#if opponent}
  <div class="card">
    <h3>{opponent.name}</h3>
    <textarea
      placeholder="Chat completions go here"
      id="completion"
      rows="3"
      bind:value={completion}
      disabled
    ></textarea>
    <textarea
      placeholder="Attack here"
      id="prompt"
      name="attack" 
      rows="3"
      bind:value={attack}
      disabled={isSolved}
    ></textarea>
    <input type="text" placeholder="Password" name="password" bind:value={password} disabled={isSolved} />
    <div class="section-buttons">
      <button
        type="submit"
        on:click|preventDefault={sendAttack}
        disabled={isDisabled || isSolved}
        >Submit Prompt{isDisabled ? ` (in ${cooldown.toFixed(1)}s)` : ""}</button
      >
      <button type="submit" on:click|preventDefault={verifyPassword} disabled={isSolved}>Verify Password</button>
    </div>
  </div>
{/if}
<style>
  .card {
    background-color: white;
    border-radius: var(--space-s);
    box-shadow: #ddd 0 0 var(--space-m);
    padding: var(--space-s);
    overflow: hidden;
    height: 100%;
    width: 100%;
  }

  textarea {
    width: 100%;
    padding: var(--space-xs);
    resize: none;
  }

  input {
    margin-bottom: var(--space-xs);
    max-width: var(--width-xxs);
    padding: var(--space-xxs);
    text-align: center;
    width: 100%;
  }
  
  #completion {
    background-color: var(--CURSOR-white);
    width: 100%;
  }

  .section-buttons {
    width: 100%;
    display: flex;
  }

  button {
    padding: var(--space-xxs);
    flex-grow: 1;
  }
</style>