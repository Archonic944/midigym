<script lang="ts">

  export let timeLeft: number | null = null;
  export let timeElapsed: number = 0;
  export let chordProgress: string = '';
  export let cpm: number = 0;
  export let accuracy: number = 100;
  export let streak: number = 0;
  export let chordsPlayed: number = 0;
  export let learnMode: boolean = false;

  $: streakColor = streak > 0 ? '#2ecc71' : streak < 0 ? '#e74c3c' : '#aaa';
  $: streakSign = streak > 0 ? '+' : streak < 0 ? '' : '';

  function formatTime(sec: number) {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
</script>

{#if learnMode}
  <div class="learn-mode-header">LEARN MODE</div>
{/if}

<div class="live-stats-bar">
  <div class="stats-left stats-side">
    <span class="stat-label">CPM</span> <span class="stat-value">{cpm.toFixed(1)}</span>
    <span class="stat-label">Acc</span> <span class="stat-value">{accuracy.toFixed(0)}%</span>
    <span class="stat-label">Streak</span> <span class="stat-value" style="color: {streakColor}">{streakSign}{streak}</span>
  </div>
  <div class="stats-center">
    {#if timeLeft !== null}
      <span class="main-stat">{formatTime(timeLeft)} left</span>
    {:else}
      <span class="main-stat">{chordProgress}</span>
    {/if}
  </div>
  <div class="stats-right stats-side">
    {#if timeLeft !== null}
      <span class="stat-label">Played</span> <span class="stat-value">{chordsPlayed}</span>
    {:else}
      <span class="stat-label">Elapsed</span> <span class="stat-value">{formatTime(timeElapsed)}</span>
    {/if}
  </div>
</div>

<style>
  .learn-mode-header {
    width: 100vw;
    text-align: center;
    font-family: monospace;
    font-size: 1.08rem;
    font-weight: bold;
    color: #2196f3;
    background: rgba(30, 30, 30, 0.97);
    letter-spacing: 0.13em;
    padding: 0.18em 0 0.18em 0;
    border-bottom: 1.5px solid #222;
    text-transform: uppercase;
    opacity: 0.93;
  }
  .live-stats-bar {
    width: 100vw;
    min-height: 3em; /* Reduced from 3.5em */
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(30, 30, 30, 0.92);
    border-bottom: 1.5px solid #222;
    font-family: monospace;
    font-size: 1.05rem; /* Reduced from 1.18rem */
    color: var(--accent-color, #f9f570);
    box-sizing: border-box;
    padding: 0.4em 0; /* Reduced from 0.5em */
    gap: 0;
    position: relative;
  }
  .stats-side {
    flex: 0 0 220px; /* Reduced from 260px */
    display: flex;
    align-items: center;
    gap: 0.8em; /* Reduced from 1.1em */
    min-width: 0;
    justify-content: flex-start;
    padding: 0 1.5vw; /* Reduced from 2vw */
    box-sizing: border-box;
  }
  .stats-right.stats-side {
    justify-content: flex-end;
  }
  .stats-center {
    flex: 1 1 0%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.35em; /* Reduced from 1.45em */
    font-weight: bold;
    color: var(--accent-color, #f9f570);
    letter-spacing: 0.03em;
    min-width: 0;
    text-align: center;
    pointer-events: none;
    z-index: 1;
  }
.main-stat {
  font-size: 1.15em; /* Reduced from 1.25em */
  font-weight: bold;
  color: var(--accent-color, #f9f570);
  letter-spacing: 0.04em;
  background: linear-gradient(to bottom, var(--accent-color, #f9f570) 0%, white 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: brightness(1.1);
}
.stat-label {
  color: #aaa;
  font-size: 0.9em;
  margin-right: 0.18em;
}
.stat-value {
  font-weight: bold;
  margin-right: 0.6em;
}

@media (max-width: 640px) {
  .live-stats-bar {
    font-size: 0.95rem;
  }
  
  .stats-side {
    flex: 0 0 180px;
    gap: 0.6em;
  }
  
  .stats-center {
    font-size: 1.25em;
  }
  
  .main-stat {
    font-size: 1.1em;
  }
}
</style>
