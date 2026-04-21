(() => {
    const { SUPABASE_URL, SUPABASE_KEY, STORAGE_BUCKET } = window.PORTFOLIO_CONFIG;
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const api = {
        client,
        bucket: STORAGE_BUCKET,

        async fetchPortfolio() {
            const { data, error } = await client
                .from('portfolio')
                .select('data')
                .limit(1)
                .single();
            if (error) throw error;
            return data?.data || null;
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
