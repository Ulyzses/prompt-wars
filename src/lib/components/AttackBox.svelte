<script lang="ts">
  import type { Player, GameState } from "$lib/types";
  import { player, session } from "$lib/stores";

  export let opponent: Player;
  export let error: string;

  async function sendAttack() {
    completion = '';
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          session: $session,
          attacker: $player.id,
          defender: opponent.id,
          prompt: attack
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
      const response = await fetch('/api/verify', {
        method: 'POST',
        body: JSON.stringify({
          session: $session,
          attacker: $player.id,
          defender: opponent.id,
          password,
        }), 
      });

      const data = await response.json();
      const { correct } = data;

      status = correct ? `You got the password: ${password}` : `The submitted password is wrong`;
    } catch (e) {
      error = e as string;
    }
  }

  let attack = '';
  let completion = '';
  let password = '';
  let status = '';
</script>
<div>
  {opponent.name}
  <textarea placeholder="Chat completions go here" bind:value={completion} disabled></textarea>
  <input type="text" name="attack" bind:value={attack}>
  <button type="submit" on:click|preventDefault={sendAttack}>Submit</button>
  <input type="text" name="password" bind:value={password}>
  <button type="submit" on:click|preventDefault={verifyPassword}>Verify</button>
  {#if status}
    <p>{status}</p>
  {/if}
</div>