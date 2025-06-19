export interface ChordCategory {
    name: string;
    chords: string[];
    expanded?: boolean;
    defaultEnabled?: boolean;
}

export const chordCategories: ChordCategory[] = [
    {
        name: "Major & Minor",
        chords: ["Major", "Minor"],
        expanded: false,
        defaultEnabled: true,
    },
    {
        name: "Sus",
        chords: ["Sus2", "Sus4"],
        expanded: false,
        defaultEnabled: false,
    },
    {
        name: "Extended",
        chords: [
            "Maj7",
            "Min7",
            "Dom7",
            "MinMaj7",
            "Maj9",
            "Min9",
            "Dom9",
            "Add9",
        ],
        expanded: false,
        defaultEnabled: false,
    },
    {
        name: "Dim & Aug",
        chords: ["Dim", "Aug", "Dim7", "HalfDim7", "Aug7"],
        expanded: false,
        defaultEnabled: false,
    },
];

// Helper function to get chord categories as a Record for use in consolidation
export function getChordTypeGroups(): Record<string, string[]> {
    const groups: Record<string, string[]> = {};
    chordCategories.forEach(category => {
        groups[category.name] = category.chords;
    });
    return groups;
}
