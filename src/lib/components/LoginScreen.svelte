<script lang="ts">
  import ErrorCallout from "./ErrorCallout.svelte";

  export let error: string;
  export let joinSession: (
    sessionId: number,
    playerName: string,
  ) => Promise<void>;

  let playerName: string = "";
  let sessionId: number;
</script>

<div class="main-container">
  <form on:submit|preventDefault class="login-form">
    <h1 class="title">Prompt Wars</h1>
    <select
      name="name"
      class="form-control"
      bind:value={playerName}
      required
    >
      <option value="">Select your team</option>
      <option value="Knave of Hearts">Knave of Hearts</option>
      <option value="White Rabbit">White Rabbit</option>
      <option value="Mallymkun (Dormouse)">Mallymkun (Dormouse)</option>
      <option value="Tweedle Dee">Tweedle Dee</option>
      <option value="Tweedle Dum">Tweedle Dum</option>
      <option value="Mad Hatter">Mad Hatter</option>
      <option value="Cheshire Cat">Cheshire Cat</option>
      <option value="Thackery Earwicket (March Hare)">Thackery Earwicket (March Hare)</option>
      <option value="Caterpillar">Caterpillar</option>
    </select>
    <input
      type="number"
      name="sessionId"
      placeholder="Session ID"
      class="form-control no-spinners"
      bind:value={sessionId}
      required
    />
    <button class="form-control" on:click={() => joinSession(sessionId, playerName)}
      >Join Session</button
    >
    <ErrorCallout bind:error />
  </form>
</div>

<style>
  .main-container {
    align-items: center;
    display: flex;
    justify-content: center;
  }

  .login-form {
    align-items: center;
    display: flex;
    flex-direction: column;
    max-width: var(--width-xs);
    width: 50%;
  }

  .title {
    color: var(--CURSOR-green);
    margin-bottom: var(--space-xl);
  }

  .form-control {
    margin-bottom: var(--space-xs);
    max-width: var(--width-xxs);
    padding: var(--space-xs);
    text-align: center;
    width: 100%;
  }

  button.form-control {
    background-color: var(--CURSOR-green);
    color: var(--CURSOR-white);
    font-weight: bold;
  }

  input.form-control:focus {
    outline: 0;
  }
</style>
