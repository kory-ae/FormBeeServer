import { supabase } from '../config/supabase.js';


export const pingSupabase = async (samples) => {
    const results = []
    
    for (let i = 0; i < samples; i++) {
        const start = process.hrtime.bigint()
        
        try {
        // Using a lightweight system table query as our ping
        await supabase
            .from('_realtime')
            .select('count(*)', { count: 'exact' })
            .limit(1)
        
        const end = process.hrtime.bigint()
        const latencyMs = Number(end - start) / 1e6 // Convert nanoseconds to milliseconds
        results.push(latencyMs)
        } catch (error) {
        console.error('Ping failed:', error.message)
        results.push(null)
        }
        
        // Add a small delay between pings
        await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // Calculate statistics
    const validResults = results.filter(r => r !== null)
    const stats = {
        samples: results.length,
        successfulSamples: validResults.length,
        min: Math.min(...validResults),
        max: Math.max(...validResults),
        avg: validResults.reduce((a, b) => a + b, 0) / validResults.length,
        results: results
    }
    
    return stats
}

