import fetch from 'node-fetch';

// This function acts as a proxy for the Gemini text generation endpoint.
export default async function handler(req, res) {
    // 1. Check for valid method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Get API Key from Environment Variables (SECURE)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error: GEMINI_API_KEY not set.' });
    }

    // 3. Define the actual Gemini API URL
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    try {
        // 4. Forward the payload received from the client
        const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body) // req.body contains the payload from index.html
        });

        // 5. Check API response status
        if (!geminiResponse.ok) {
            const errorBody = await geminiResponse.json();
            console.error('Gemini API Error:', errorBody);
            // Forward the error status and message back to the client
            return res.status(geminiResponse.status).json({ 
                error: 'Gemini Text API Error', 
                message: errorBody.error?.message || 'Unknown API error'
            });
        }

        // 6. Return the successful response body to the client
        const data = await geminiResponse.json();
        res.status(200).json(data);

    } catch (error) {
        console.error('Proxy Fetch Error:', error);
        res.status(500).json({ error: 'Internal server error during text generation proxy.', details: error.message });
    }
}
