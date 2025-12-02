import fetch from 'node-fetch';

// This function acts as a proxy for the Imagen image generation endpoint.
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

    // 3. Define the actual Imagen API URL
    const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;

    try {
        // 4. Forward the payload received from the client
        const imagenResponse = await fetch(imagenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        // 5. Check API response status
        if (!imagenResponse.ok) {
            const errorBody = await imagenResponse.json();
            console.error('Imagen API Error:', errorBody);
            // Forward the error status and message back to the client
            return res.status(imagenResponse.status).json({ 
                error: 'Gemini Image API Error', 
                message: errorBody.error?.message || 'Unknown API error'
            });
        }

        // 6. Return the successful response body to the client
        const data = await imagenResponse.json();
        res.status(200).json(data);

    } catch (error) {
        console.error('Proxy Fetch Error:', error);
        res.status(500).json({ error: 'Internal server error during image generation proxy.', details: error.message });
    }
}
