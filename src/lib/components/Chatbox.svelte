<script lang="ts">
  import type { Player, GameState } from "$lib/types";
  import { player, session } from "$lib/stores";

  export let opponent: Player;
  export let error: string;

  async function sendAttack() {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          session: $session.id,
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

  let attack = '';
  let completion = '';
</script>
<div>
  {opponent.name}
  <textarea placeholder="Chat completions go here" bind:value={completion} disabled></textarea>
  <input type="text" name="attack" bind:value={attack}>
  <button type="submit" on:click|preventDefault={sendAttack}>Submit</button>
</div>