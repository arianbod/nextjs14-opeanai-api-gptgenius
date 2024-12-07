export async function POST(req) {
    try {
        // Clear any server-side sessions/tokens
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}