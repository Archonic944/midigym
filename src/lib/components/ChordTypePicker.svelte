<script lang="ts">
    import { chordCategories, type ChordCategory } from "$lib/util/chordCategories";
    
    export let selectedOptions: string[] = [];
    export let onSelectionChange: ((selected: string[]) => void) | null = null;

    let categories: ChordCategory[] = chordCategories;

    // Initialize with default selections
    if (selectedOptions.length === 0) {
        selectedOptions = categories
            .filter((cat) => cat.defaultEnabled)
            .flatMap((cat) => cat.chords);

        if (onSelectionChange) {
            onSelectionChange(selectedOptions);
        }
    }

    function toggleCategory(categoryIndex: number): void {
        // Close all other categories first
        categories = categories.map((cat, index) => ({
            ...cat,
            expanded: index === categoryIndex ? !cat.expanded : false,
        }));
    }

    function toggleCategoryMaster(categoryIndex: number): void {
        const category = categories[categoryIndex];
        const allSelected = category.chords.every((chord) =>
            selectedOptions.includes(chord),
        );

        let newSelected: string[];
        if (allSelected) {
            // Deselect all chords in this category
            newSelected = selectedOptions.filter(
                (chord) => !category.chords.includes(chord),
            );
        } else {
            // Select all chords in this category
            const toAdd = category.chords.filter(
                (chord) => !selectedOptions.includes(chord),
            );
            newSelected = [...selectedOptions, ...toAdd];
        }

        if (onSelectionChange) {
            onSelectionChange(newSelected);
        } else {
            selectedOptions = newSelected;
        }
    }

    function toggleOption(option: string): void {
        let newSelected: string[];

        if (selectedOptions.includes(option)) {
            newSelected = selectedOptions.filter((item) => item !== option);
        } else {
            newSelected = [...selectedOptions, option];
        }

        if (onSelectionChange) {
            onSelectionChange(newSelected);
        } else {
            selectedOptions = newSelected;
        }
    }

    function getCategoryState(
        category: ChordCategory,
    ): "all" | "some" | "none" {
        const selectedCount = category.chords.filter((chord) =>
            selectedOptions.includes(chord),
        ).length;
        if (selectedCount === 0) return "none";
        if (selectedCount === category.chords.length) return "all";
        return "some";
    }
</script>

<div class="checkbox-picker">
    {#each categories as category, categoryIndex}
        <div class="category">
            <div
                class="category-header"
                on:click={() => toggleCategory(categoryIndex)}
            >
                <label
                    class="category-master"
                    on:click|stopPropagation={() =>
                        toggleCategoryMaster(categoryIndex)}
                >
                    <input
                        type="checkbox"
                        checked={getCategoryState(category) === "all"}
                        indeterminate={getCategoryState(category) === "some"}
                        on:change|stopPropagation={() =>
                            toggleCategoryMaster(categoryIndex)}
                    />
                    <span class="category-name">{category.name}</span>
                </label>
                <span class="expand-icon" class:expanded={category.expanded}
                    >▼</span
                >
            </div>

            {#if category.expanded}
                <div class="category-options">
                    {#each category.chords as chord}
                        <label class="checkbox-option">
                            <input
                                type="checkbox"
                                checked={selectedOptions.includes(chord)}
                                on:change={() => toggleOption(chord)}
                            />
                            <span class="checkbox-label">{chord}</span>
                        </label>
                    {/each}
                </div>
            {/if}
        </div>
    {/each}
</div>

<style>
    .checkbox-picker {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
    }

    .category {
        border: 1px solid #555;
        border-radius: 6px;
        overflow: hidden;
    }

    .category-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: rgba(255, 255, 255, 0.05);
        padding: 10px 12px;
        cursor: pointer;
        transition: background-color 0.2s ease;
        user-select: none;
    }

    .category-header:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .category-master {
        display: flex;
        align-items: center;
        cursor: pointer;
        font-family: monospace;
        font-weight: bold;
        text-transform: uppercase;
        color: var(--text-color);
        flex: 1;
    }

    .category-name {
        font-size: 0.95rem;
        color: var(--header-color);
    }

    .expand-icon {
        color: var(--text-color);
        font-size: 0.8rem;
        transition: transform 0.2s ease;
        transform: rotate(-90deg);
    }

    .expand-icon.expanded {
        transform: rotate(0deg);
    }

    .category-options {
        padding: 12px;
        background-color: rgba(0, 0, 0, 0.2);
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 8px 12px;
        max-height: 120px;
        overflow-y: auto;
    }

    .checkbox-option {
        display: flex;
        align-items: center;
        cursor: pointer;
        font-family: monospace;
        font-weight: bold;
        text-transform: uppercase;
        color: var(--text-color);
        transition: all 0.2s ease;
        padding: 4px 6px;
        border-radius: 4px;
        user-select: none;
    }

    .checkbox-option:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    input[type="checkbox"] {
        margin-right: 6px;
        width: 14px;
        height: 14px;
        accent-color: var(--accent-color);
        cursor: pointer;
    }

    .checkbox-label {
        font-size: 0.8rem;
        transition: color 0.2s ease;
    }

    .checkbox-option:has(input:checked) .checkbox-label {
        color: var(--accent-color);
    }

    .category-master:has(input:checked) .category-name {
        color: var(--accent-color);
    }

    .checkbox-option:focus-within,
    .category-master:focus-within {
        outline: 2px solid var(--header-color);
        outline-offset: 2px;
    }
</style>
