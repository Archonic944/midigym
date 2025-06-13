<script lang="ts">
  import Card from './Card.svelte';

  import type { CardOption } from '$lib/types/CardOption';

  export let cards: CardOption[] = [];
  export let onPick: (card: CardOption, idx: number) => void = () => {};

  // Helper for click
  function handlePick(card: CardOption, idx: number) {
    onPick(card, idx);
  }
</script>

{#if cards.length === 2}
  <div class="picker-row">
    <Card {...cards[0]} on:click={() => handlePick(cards[0], 0)} />
    <div class="or">or</div>
    <Card {...cards[1]} on:click={() => handlePick(cards[1], 1)} />
  </div>
{:else if cards.length === 3}
  <div class="picker-3 picker-vertical-center">
    <div class="picker-row">
      <Card {...cards[0]} on:click={() => handlePick(cards[0], 0)} />
      <Card {...cards[1]} on:click={() => handlePick(cards[1], 1)} />
    </div>
    <div class="or or-center-absolute">or</div>
    <div class="picker-row picker-row-bottom">
      <div class="spacer"></div>
      <Card {...cards[2]} on:click={() => handlePick(cards[2], 2)} />
      <div class="spacer"></div>
    </div>
  </div>
{:else if cards.length === 4}
  <div class="picker-4 picker-vertical-center">
    <div class="picker-row">
      <Card {...cards[0]} on:click={() => handlePick(cards[0], 0)} />
      <Card {...cards[1]} on:click={() => handlePick(cards[1], 1)} />
    </div>
    <div class="picker-row picker-row-bottom">
      <Card {...cards[2]} on:click={() => handlePick(cards[2], 2)} />
      <Card {...cards[3]} on:click={() => handlePick(cards[3], 3)} />
    </div>
    <div class="or or-center-absolute">or</div>
  </div>
{:else if cards.length === 1}
  <div class="picker-row">
    <Card {...cards[0]} on:click={() => handlePick(cards[0], 0)} />
  </div>
{:else}
  <div>No cards to pick.</div>
{/if}

<style>
.picker-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem; /* Reduced from 2.5rem */
  margin-bottom: 0;
}
.or {
  font-size: 1.2rem; /* Reduced from 1.3rem */
  font-weight: 700;
  color: #2196f3;
  margin: 0 0.6rem; /* Reduced from 0.7rem */
  user-select: none;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.picker-3 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem; /* Reduced from 1.2rem */
  position: relative;
}
.picker-row-bottom {
  margin-top: 1rem; /* Reduced from 1.1rem */
}
.spacer {
  flex: 1;
}
.or-center-vertical {
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
}
.picker-4 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem; /* Reduced from 1.2rem */
  position: relative;
}
.or-middle {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 0 0.6rem; /* Reduced from 0.7rem */
  border-radius: 1rem;
  box-shadow: 0 2px 12px rgba(33,150,243,0.10);
  z-index: 3;
  font-size: 1.2rem; /* Reduced from 1.3rem */
  color: #2196f3;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.picker-vertical-center {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.or-center-absolute {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: none;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
  z-index: 3;
  font-size: 1.2rem; /* Reduced from 1.3rem */
  color: #2196f3;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
@media (max-width: 900px) {
  .picker-row, .picker-3, .picker-4 {
    gap: 0.7rem;
  }
  .or, .or-middle {
    font-size: 1rem;
  }
}

/* Add additional responsive styles for even smaller screens */
@media (max-width: 600px) {
  .picker-row {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .or {
    margin: 0.5rem 0;
  }
  
  .picker-row-bottom {
    margin-top: 1.5rem;
  }
  
  .or-center-absolute {
    display: none; /* Hide the 'or' for very small screens */
  }
  
  .picker-4 {
    gap: 1.5rem;
  }
}

@media (max-height: 700px) {
  .picker-row, .picker-3, .picker-4 {
    gap: 0.6rem;
  }
  
  .picker-row-bottom {
    margin-top: 0.8rem;
  }
}
</style>
