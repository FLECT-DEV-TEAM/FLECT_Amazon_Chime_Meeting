
export const with_time = (name:string, func:any) =>{
    const start = performance.now();
    func();
    const end = performance.now();
    
    const elapsed = (end - start);
    const elapsedStr = elapsed.toFixed(3);
    console.log(`[WITH TIME] ${name}: ${elapsedStr} ms`);
}

export const with_time_async = async(name:string, func:any) =>{
    const start = performance.now();
    await func();
    const end = performance.now();
    
    const elapsed = (end - start);
    const elapsedStr = elapsed.toFixed(3);
    console.log(`[WITH TIME] ${name}: ${elapsedStr} ms`);
}



