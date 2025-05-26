<script lang="ts">
  export let options: string[] = [];
  export let selectedOption: string | null = null;
  export let onSelect: ((option: string) => void) | null = null;
  
  function selectOption(option: string): void {
    if (onSelect) {
      onSelect(option);
    } else {
      selectedOption = option;
    }
  }
</script>

<div class="row-picker">
    {#each options as option}
        <div
            class="row-option"
            class:selected={selectedOption === option}
            on:click={() => selectOption(option)}
            role="button"
            tabindex="0"
            on:keydown={(e) => e.key === "Enter" && selectOption(option)}
        >
            {option}
        </div>
    {/each}
</div>

<style>
    .row-picker {
        display: flex;
        justify-content: space-around;
        align-items: center;
        border-bottom: 1px solid #444;
        padding: 16px 0;
        width: 100%;
    }

    .row-option {
        cursor: pointer;
        padding: 8px 16px;
        font-family: monospace;
        font-weight: bold;
        text-transform: uppercase;
        color: var(--text-color);
        transition: all 0.2s ease;
        border-radius: 4px;
        user-select: none;
    }

    .row-option:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.8);
    }

    .row-option.selected {
        color: var(--accent-color);
    }

    .row-option:focus {
        outline: 2px solid var(--header-color);
        outline-offset: 2px;
    }
</style>
