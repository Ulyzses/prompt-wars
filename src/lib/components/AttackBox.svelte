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

<div>
  {opponent.name}
  <textarea
    placeholder="Chat completions go here"
    bind:value={completion}
    disabled
  ></textarea>
  <input type="text" name="attack" bind:value={attack} />
  <button
    type="submit"
    on:click|preventDefault={sendAttack}
    disabled={isDisabled}
    >Submit{isDisabled ? ` (in ${cooldown.toFixed(1)}s)` : ""}</button
  >
  <input type="text" name="password" bind:value={password} />
  <button type="submit" on:click|preventDefault={verifyPassword}>Verify</button>
  {#if status}
    <p>{status}</p>
  {/if}
</div>
