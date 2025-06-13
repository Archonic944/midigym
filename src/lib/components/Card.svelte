<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let title: string;
  export let icon: string; // emoji, SVG string, or SVG file path
  export let description: string;

  $: isSvgFile = typeof icon === 'string' && (
    icon.trim().toLowerCase().endsWith('.svg') ||
    icon.trim().toLowerCase().includes('.svg?')
  );
  const dispatcher = createEventDispatcher();
</script>

<button class="card" type="button" on:click={() => dispatcher('click')}
  tabindex="0"
  aria-label={title}
  style="font-family: monospace;"
>
  <div class="card-title">{title}</div>
  <div class="card-icon" aria-hidden="true">
    {#if isSvgFile}
      <img src={icon} alt={title + " icon"} class="icon-img" />
    {:else}
      {@html icon}
    {/if}
  </div>
  <div class="card-description">{description}</div>
</button>

<style>
.card {
  aspect-ratio: 3 / 4;
  width: min(80vw, 240px); /* Reduced from 260px */
  min-width: 160px; /* Reduced from 180px */
  max-width: 260px; /* Reduced from 280px */
  /* Remove background color */
  background: none;
  border-radius: 1.3rem; /* Reduced from 1.5rem */
  border: 3px solid white;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 1.3rem 0.9rem 1rem 0.9rem; /* Reduced from 1.5rem 1rem 1.2rem 1rem */
  transition: 
    transform 0.18s cubic-bezier(.4,2,.6,1), 
    box-shadow 0.18s,
    background 0.18s,
    color 0.18s,
    border-color 0.18s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  color: white;
  display: inline-block;
  font-family: monospace;
}
.card:hover {
  background: white;
  color: #222;
  border-color: white;
}
.card-title {
  font-size: 1.2rem; /* Reduced from 1.25rem */
  font-weight: 700;
  margin-bottom: 1rem; /* Reduced from 1.1rem */
  text-align: center;
  color: var(--header-color, #689fe8);
  width: 100%;
  letter-spacing: 0.01em;
  transition: color 0.18s;
  font-family: monospace;
}
.card:hover .card-title {
  color: #689fe8;
}
.card-icon {
  font-size: 6.5rem; /* Reduced from 7rem */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem; /* Reduced from 1.1rem */
  min-height: 6.5rem; /* Reduced from 7rem */
  width: 100%;
  text-align: center;
  user-select: none;
  transition: color 0.18s;
}
.icon-img {
  width: 6.5rem; /* Reduced from 7rem */
  height: 6.5rem; /* Reduced from 7rem */
  object-fit: contain;
  display: block;
  margin: 0 auto;
  filter: invert(1) brightness(2) contrast(1.2);
  transition: filter 0.18s;
}
.card:hover .icon-img {
  filter: invert(0) brightness(1) contrast(1);
}
.card-description {
  font-size: 1.05rem; /* Reduced from 1.13rem */
  color: inherit;
  text-align: center;
  margin-top: 0.4rem; /* Reduced from 0.5rem */
  margin-bottom: 0;
  flex-grow: 0;
  transition: color 0.18s;
  font-family: monospace;
}
.card:hover .card-description {
  color: #222;
}

/* Add responsive design for even smaller screens */
@media (max-width: 768px) {
  .card {
    width: min(80vw, 220px);
    min-width: 140px;
    padding: 1.2rem 0.8rem 0.9rem 0.8rem;
    border-radius: 1.2rem;
  }
  
  .card-icon {
    font-size: 6rem;
    min-height: 6rem;
    margin-bottom: 0.9rem;
  }
  
  .icon-img {
    width: 6rem;
    height: 6rem;
  }
  
  .card-description {
    font-size: 1rem;
  }
}

@media (max-height: 700px) {
  .card {
    aspect-ratio: 2.8 / 3.8;
    padding: 1.1rem 0.8rem 0.8rem 0.8rem;
  }
  
  .card-icon {
    font-size: 5.5rem;
    min-height: 5.5rem;
  }
  
  .icon-img {
    width: 5.5rem;
    height: 5.5rem;
  }
}
</style>
