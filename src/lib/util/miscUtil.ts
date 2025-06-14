export function reverseMap<K extends string | number | symbol, A extends string | number | symbol>(map: Record<K, A>): Record<A, K> {
    let newRecord = {} as Record<A,K>;
    let entries = Object.entries(map);
    for(const [key,value] of entries){
        newRecord[value as A] = key as K;
    }
    return newRecord;
}