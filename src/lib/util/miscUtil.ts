import type { Chord } from "@tonaljs/chord";
import { flatToSharp } from "./flatToSharp";

export function reverseMap<K extends string | number | symbol, A extends string | number | symbol>(map: Record<K, A>): Record<A, K> {
    let newRecord = {} as Record<A,K>;
    let entries = Object.entries(map);
    for(const [key,value] of entries){
        newRecord[value as A] = key as K;
    }
    return newRecord;
}

const pc = ["C", "D#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export function pcNum(note: string): number{ //C = 0, C# = 1, D = 2, etc
    return pc.indexOf(note);
}

// Builds a chord based on pitch classes starting from C3 (lowest point on our virtual piano)
export function assignOctaveNumbers(notes: string[]): string[]{
    
    let octave = 3;
    let finalNotes = [];
    let lastNum = 0;
    for(let note of notes){
        let pc = pcNum(note);
        if(pc == -1) console.warn("Pitch class not found in pc map: " + note);
        else if(pc < lastNum) octave++;
        lastNum = pc;
        finalNotes.push(note + "" + pc);
    }
    return finalNotes;
}