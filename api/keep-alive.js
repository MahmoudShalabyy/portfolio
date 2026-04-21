export default async function handler(req, res) {
    const SUPABASE_URL = 'https://mfneajdyjldywiumpimm.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_4-qQPodvLA9AMBsDcv-JHw_qcuWMNst';

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/portfolio?select=id&limit=1`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Supabase returned ${response.status}`);
        }

        return res.status(200).json({
            ok: true,
            timestamp: new Date().toISOString(),
            message: 'Supabase keep-alive ping successful',
        });
    } catch (err) {
        return res.status(500).json({
            ok: false,
            error: err.message,
        });
    }
}
