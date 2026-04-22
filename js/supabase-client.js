(() => {
    const { SUPABASE_URL, SUPABASE_KEY, STORAGE_BUCKET } = window.PORTFOLIO_CONFIG;
    // Single auth client for login/save. Public reads go through raw fetch
    // so expired JWTs don't break the public portfolio page.
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage,
        },
    });

    const api = {
        client,
        bucket: STORAGE_BUCKET,

        async fetchPortfolio() {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/portfolio?select=data&limit=1`, {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                },
            });
            if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
            const rows = await res.json();
            return rows?.[0]?.data || null;
        },

        async savePortfolio(portfolioData) {
            const { data: rows, error: selectErr } = await client
                .from('portfolio')
                .select('id')
                .limit(1);
            if (selectErr) throw selectErr;

            if (rows && rows.length > 0) {
                const { error } = await client
                    .from('portfolio')
                    .update({ data: portfolioData })
                    .eq('id', rows[0].id);
                if (error) throw error;
            } else {
                const { error } = await client
                    .from('portfolio')
                    .insert({ data: portfolioData });
                if (error) throw error;
            }
        },

        async signIn(email, password) {
            const { data, error } = await client.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return data;
        },

        async signOut() {
            await client.auth.signOut();
        },

        async getSession() {
            const { data } = await client.auth.getSession();
            return data.session;
        },

        onAuthChange(callback) {
            return client.auth.onAuthStateChange((event, session) => callback(event, session));
        },

        async uploadImage(file, folder = 'uploads') {
            const ext = file.name.split('.').pop();
            const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
            const { error } = await client.storage
                .from(STORAGE_BUCKET)
                .upload(filename, file, { cacheControl: '3600', upsert: false });
            if (error) throw error;
            const { data: urlData } = client.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
            return urlData.publicUrl;
        },
    };

    window.SupabaseAPI = api;
})();
