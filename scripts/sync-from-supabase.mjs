/**
 * Pulls the live portfolio content out of Supabase and writes it back into the
 * repo as data.json — the offline fallback the site uses when Supabase is
 * paused or unreachable.
 *
 * Any image still hosted on Supabase Storage is downloaded into
 * images/synced/ and its URL rewritten to a relative path, so the fallback
 * renders complete (text *and* pictures) with Supabase completely down.
 *
 * Running this also counts as activity on the Supabase project, which is what
 * keeps the free tier from auto-pausing it.
 *
 * Usage: node scripts/sync-from-supabase.mjs
 */

import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SYNCED_DIR = join(ROOT, 'images', 'synced');
const DATA_FILE = join(ROOT, 'data.json');

// Read the same credentials the browser uses, so there is one source of truth.
const readConfig = async () => {
    const src = await readFile(join(ROOT, 'js', 'config.js'), 'utf8');
    const pick = (key) => {
        const m = src.match(new RegExp(`${key}\\s*:\\s*['"]([^'"]+)['"]`));
        if (!m) throw new Error(`${key} not found in js/config.js`);
        return m[1];
    };
    return { url: pick('SUPABASE_URL'), key: pick('SUPABASE_KEY') };
};

const fetchPortfolio = async ({ url, key }) => {
    const res = await fetch(`${url}/rest/v1/portfolio?select=data&limit=1`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(`Supabase returned ${res.status} ${res.statusText}`);
    const rows = await res.json();
    const data = rows?.[0]?.data;
    if (!data || typeof data !== 'object') throw new Error('Supabase row is empty');
    return data;
};

/** Sanity check so a half-empty response can never overwrite a good backup. */
const assertLooksComplete = (data) => {
    const problems = [];
    if (!data.home?.name) problems.push('home.name is missing');
    if (!Array.isArray(data.projects) || data.projects.length === 0) problems.push('projects is empty');
    if (!data.resume?.experience?.items?.length) problems.push('resume.experience.items is empty');
    if (!data.contact?.email) problems.push('contact.email is missing');
    if (problems.length) throw new Error(`Refusing to write a broken backup: ${problems.join(', ')}`);
};

const isStorageUrl = (value, supabaseUrl) =>
    typeof value === 'string' && value.startsWith(`${supabaseUrl}/storage/v1/object/public/`);

/** Stable local filename, derived from the storage path so re-runs reuse it. */
const localNameFor = (url) => {
    const path = decodeURIComponent(new URL(url).pathname);
    return path.split('/object/public/').pop().split('/').slice(1).join('-');
};

const downloadImage = async (url) => {
    const name = localNameFor(url);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    await writeFile(join(SYNCED_DIR, name), Buffer.from(await res.arrayBuffer()));
    return { name, relative: `./images/synced/${name}` };
};

const LOCAL_PREFIX = './images/synced/';

/**
 * Walks the data tree, downloading every Supabase-hosted image and swapping in
 * the local path. Mutates in place and reports which files are now referenced.
 *
 * Note that a path may already be local: once a backup is published back to
 * Supabase, the stored URLs *are* the local ones. Those count as referenced
 * just as much as a fresh download does.
 */
const localiseImages = async (data, supabaseUrl) => {
    const keep = new Set();
    let downloaded = 0;
    let failed = 0;

    const walk = async (node) => {
        if (Array.isArray(node)) {
            await Promise.all(node.map(walk));
            return;
        }
        if (!node || typeof node !== 'object') return;

        for (const [key, value] of Object.entries(node)) {
            if (isStorageUrl(value, supabaseUrl)) {
                try {
                    const { name, relative } = await downloadImage(value);
                    node[key] = relative;
                    keep.add(name);
                    downloaded++;
                    console.log(`  ✓ ${key} → ${relative}`);
                } catch (err) {
                    // Keep the remote URL rather than losing the reference.
                    failed++;
                    console.warn(`  ✗ ${key}: ${err.message} (kept remote URL)`);
                }
            } else if (typeof value === 'string' && value.startsWith(LOCAL_PREFIX)) {
                keep.add(value.slice(LOCAL_PREFIX.length));
            } else if (value && typeof value === 'object') {
                await walk(value);
            }
        }
    };

    await walk(data);
    return { keep, downloaded, failed };
};

/**
 * Drop synced files nothing points at any more, so the folder cannot grow
 * forever. Refuses to run on an empty keep set: that means the walk found no
 * image references at all, which is a bug rather than a licence to delete
 * every image the site depends on.
 */
const pruneOrphans = async (keep) => {
    const files = (await readdir(SYNCED_DIR)).filter((f) => f !== '.gitkeep');
    if (files.length && keep.size === 0) {
        console.warn('  ! no image references found — skipping prune to avoid deleting live images');
        return 0;
    }

    let removed = 0;
    for (const file of files) {
        if (keep.has(file)) continue;
        await unlink(join(SYNCED_DIR, file));
        console.log(`  – removed unused ${file}`);
        removed++;
    }
    return removed;
};

const main = async () => {
    const config = await readConfig();
    console.log(`Fetching portfolio from ${config.url} ...`);

    const data = await fetchPortfolio(config);
    assertLooksComplete(data);
    console.log(`Got ${data.projects.length} projects, ${data.resume.experience.items.length} experience entries.`);

    await mkdir(SYNCED_DIR, { recursive: true });

    console.log('Localising images ...');
    const { keep, downloaded, failed } = await localiseImages(data, config.url);
    const removed = await pruneOrphans(keep);

    const serialised = JSON.stringify(data, null, 2) + '\n';
    const previous = await readFile(DATA_FILE, 'utf8').catch(() => null);
    await writeFile(DATA_FILE, serialised);

    console.log(
        `\nDone — ${downloaded} image(s) downloaded, ${failed} failed, ${removed} pruned. ` +
        `data.json ${previous === serialised ? 'unchanged' : 'updated'}.`
    );
};

main().catch((err) => {
    console.error(`\nSync failed: ${err.message}`);
    process.exit(1);
});
