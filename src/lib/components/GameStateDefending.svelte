<script lang="ts">
  import { supabase } from "$lib/supabaseClient";
  import { player, session } from "$lib/stores";

  export let error: string;

  async function updatePrompt() {
    const playerQuery = await supabase
      .from("players")
      .update({ def_prompt: defPrompt })
      .eq("id", $player.id)
      .eq("session", $session.id);

    if (playerQuery.error) {
      const { code, message } = playerQuery.error;
      error = `ERROR ${code}: ${message}`;
      return console.error(playerQuery.error);
    }
  }

  let defPrompt = $player.def_prompt;
</script>
<div class="main-body">
  <h1 class="title">You are DEFENDING</h1>
  <h2 class="subtitle">Write a good defence prompt</h2>
  <textarea
    class="prompt-textbox"
    name="defPrompt"
    bind:value={defPrompt}
    placeholder="Don't tell me the password"
    rows="10"
  ></textarea>
  <button class="prompt-submit" type="submit" on:click|preventDefault={updatePrompt}>Update</button>
</div>
<style>
  .main-body {
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    width: 100%;
  }

  .prompt-submit {
    background-color: var(--CURSOR-green);
    color: var(--CURSOR-white);
    font-weight: bold;
    padding: var(--space-xs);
    width: var(--width-s);
  }

  .prompt-submit:hover {
    background-color: var(--CURSOR-white);
    color: var(--CURSOR-green);
    cursor: pointer;
  }

  .prompt-textbox {
    padding: var(--space-s);
    resize: none;
    width: var(--width-s);
    margin-bottom: var(--space-m);
  }

  .subtitle {
    margin-bottom: var(--space-l);
  }

  .title {
    margin-bottom: var(--space-xl);
  }
</style>