import type { GameSettings } from '$lib/stores/gameSettings';
import { Chord, Note } from 'tonal';
import { chordCategories } from './chordCategories';

/**
 * Generate an array of tonaljs chord objects based on the provided game settings.
 *
 * @param settings - The current game settings containing chordTypes and rootNotes.
 * @param count - The number of chords to generate.
 * @returns A new array of chord objects with notes and names.
 */
export function generateChords(settings: GameSettings, count: number): Array<{ name: string; notes: string[] }> {
    const { chordTypes, rootNotes: settingRootNotes, learnMode } = settings;
    
    // Default to Major & Minor if no chord types selected
    const defaultChordTypes = chordCategories.find(cat => cat.name === "Major & Minor")?.chords || ['Major', 'Minor'];
    const availableChordTypes = Array.isArray(chordTypes) && chordTypes.length > 0
        ? chordTypes
        : defaultChordTypes;
        
    // Map chord type names to Tonal chord symbols
    const chordSymbolMap: Record<string, string> = {
        'Major': 'M',
        'Minor': 'm',
        'Sus2': 'sus2',
        'Sus4': 'sus4',
        'Maj7': 'maj7',
        'Min7': 'm7',
        'Dom7': '7',
        'MinMaj7': 'm/ma7',
        'Maj9': 'maj9',
        'Min9': 'm9',
        'Dom9': '9',
        'Add9': 'Madd9',
        'Dim': 'dim',
        'Aug': 'aug',
        'Dim7': 'dim7',
        'HalfDim7': 'm7b5',
        'Aug7': '7#5'
    };

    const defaultRootNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const rootNotes = Array.isArray(settingRootNotes) && settingRootNotes.length > 0
        ? settingRootNotes
        : defaultRootNotes;
    
    const result: Array<{ name: string; notes: string[] }> = [];

    for (let i = 0; i < count; i++) {
        const randomRoot = rootNotes[Math.floor(Math.random() * rootNotes.length)];
        const randomChordType = availableChordTypes[Math.floor(Math.random() * availableChordTypes.length)];
        const chordSymbol = chordSymbolMap[randomChordType] || 'M';
        
        const chordName = `${randomRoot}${chordSymbol}`;
        const chord = Chord.get(chordName);
        console.log(chord);
        
        result.push({
            name: chord.symbol || chordName,
            notes: chord.notes || []
        });
    }

    return result;
}

if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].endsWith('generate_chords.ts')) {
    const allChordTypes = chordCategories.flatMap(cat => cat.chords);
    const dummySettings: GameSettings = {
        durationSeconds: null,
        durationLength: null,
        chordTypes: allChordTypes,
        rootNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        learnMode: false
    };
    const count = 15;
    console.log("Generating", count, "chords with settings:", dummySettings);
    const chords = generateChords(dummySettings, count);
    console.log("Generated chords:");
    chords.forEach((chord, index) => {
        console.log(`${index + 1}. ${chord.name} - Notes: [${chord.notes.join(', ')}]`);
    });
}