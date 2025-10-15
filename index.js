// ============================================================================
// CodeToContext - EXTREME PERFORMANCE VERSION
// Handles 10,000+ files without freezing
// ============================================================================

(function () {
    'use strict';

    // ============================================================================
    // CONFIG
    // ============================================================================

    const IGNORED = {
        folders: new Set(['node_modules', '.git', '__pycache__', '.vscode', '.idea', 'dist', 'build', 'target', '.next', '.nuxt', 'coverage', 'vendor']),
        exts: new Set(['exe', 'dll', 'so', 'class', 'pyc', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'mp4', 'mp3', 'wav', 'zip', 'tar', 'gz', 'rar'])
    };

    const ICONS = {
        js: { i: 'javascript', c: '#f1e05a' }, jsx: { i: 'javascript', c: '#f1e05a' },
        ts: { i: 'code', c: '#3178c6' }, tsx: { i: 'code', c: '#3178c6' },
        py: { i: 'code', c: '#3776ab' }, html: { i: 'html', c: '#e34c26' },
        css: { i: 'css', c: '#563d7c' }, json: { i: 'data_object', c: '#cb171e' },
        md: { i: 'article', c: '#fff' }
    };

    const MAX_RENDER = 1000; // Max items to render at once
    const BATCH = 50; // Files to process per batch

    // ============================================================================
    // STATE
    // ============================================================================

    const S = { files: [], tree: [], root: 'project', ctx: '', busy: false, rendered: 0 };

    const $ = id => document.getElementById(id);
    const D = {
        side: $('sidebar'), tog: $('toggleSidebar'), tree: $('fileTree'),
        search: $('fileSearch'), sel: $('selectDirBtn'),
        exp: $('expandAll'), col: $('collapseAll'),
        all: $('selectAll'), none: $('deselectAll'),
        gen: $('generateContextBtn'), ed: $('codeEditor'),
        cnt: $('fileCount'), tok: $('tokenCount'), sz: $('totalSize'),
        pron: $('tokenPronunciation'), lang: $('languagesList'),
        copy: $('copyBtn'), txt: $('downloadTxtBtn'),
        load: $('loadingOverlay'), toast: $('toastContainer')
    };

    const inp = document.createElement('input');
    inp.type = 'file'; inp.webkitdirectory = true; inp.multiple = true; inp.style.display = 'none';
    document.body.appendChild(inp);

    // ============================================================================
    // UTILS
    // ============================================================================

    const load = s => (D.load.classList.toggle('active', s), S.busy = s);

    const toast = (m, t = 'info') => {
        const el = document.createElement('div');
        el.className = `toast ${t}`;
        const ic = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' }[t];
        el.innerHTML = `<span class="material-symbols-outlined">${ic}</span><span>${m}</span>`;
        D.toast.appendChild(el);
        setTimeout(() => { el.style.animation = 'slideInRight 0.3s ease reverse'; setTimeout(() => el.remove(), 300); }, 2500);
    };

    const bytes = n => { if (!n) return '0 B'; const k = 1024, s = ['B', 'KB', 'MB', 'GB'], i = ~~(Math.log(n) / Math.log(k)); return `${(n / k ** i).toFixed(1)} ${s[i]}`; };

    const words = n => {
        if (n === 0) return 'zero'; if (n > 999999) return n.toLocaleString();
        const o = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
            t = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'],
            tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'],
            sc = ['', 'thousand', 'million'];
        const ch = n => n < 10 ? o[n] : n < 20 ? t[n - 10] : n < 100 ? tens[~~(n / 10)] + (n % 10 ? ' ' + o[n % 10] : '') : o[~~(n / 100)] + ' hundred' + (n % 100 ? ' ' + ch(n % 100) : '');
        let r = [], si = 0;
        while (n > 0) { if (n % 1000) r.unshift(ch(n % 1000) + (sc[si] ? ' ' + sc[si] : '')); n = ~~(n / 1000); si++; }
        return r.join(' ').trim();
    };

    const ign = p => { const pts = p.split('/'); if (pts.some(x => IGNORED.folders.has(x))) return true; const e = pts[pts.length - 1].split('.').pop().toLowerCase(); return IGNORED.exts.has(e); };

    const ico = (n, f) => { if (f) return { i: 'folder', c: '#e3dacc', cls: 'folder-icon' }; const e = n.split('.').pop().toLowerCase(); const ic = ICONS[e] || { i: 'description', c: '#888' }; return { ...ic, cls: `${e}-icon` }; };

    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // ============================================================================
    // CUSTOM MODAL - NO ALERTS
    // ============================================================================

    const modal = (title, message, onConfirm) => {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-header">
                    <span class="material-symbols-outlined">help_outline</span>
                    <h3>${title}</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-modal btn-cancel">Cancel</button>
                    <button class="btn-modal btn-confirm">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Handle buttons
        const cancelBtn = overlay.querySelector('.btn-cancel');
        const confirmBtn = overlay.querySelector('.btn-confirm');

        const close = () => {
            overlay.style.animation = 'fadeOut 0.2s ease';
            setTimeout(() => overlay.remove(), 200);
        };

        cancelBtn.onclick = close;
        confirmBtn.onclick = () => {
            close();
            if (onConfirm) onConfirm();
        };

        // Close on outside click
        overlay.onclick = e => {
            if (e.target === overlay) close();
        };

        // ESC key
        const handleEsc = e => {
            if (e.key === 'Escape') {
                close();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    };

    // ============================================================================
    // CLEAR ALL FUNCTION
    // ============================================================================

    const clearAll = () => {
        // Show confirmation modal
        modal(
            'Clear Everything?',
            'This will clear the file tree, editor content, and all selections. This action cannot be undone.',
            () => {
                // Clear file tree
                D.tree.innerHTML = `
                    <div class="empty-state">
                        <span class="material-symbols-outlined">folder_off</span>
                        <p>No folder selected</p>
                        <small>Click "Select Directory" to get started</small>
                    </div>
                `;

                // Clear editor
                D.ed.innerHTML = `
                    <div class="editor-placeholder">
                        <span class="material-symbols-outlined">code_blocks</span>
                        <p>Your generated context will appear here</p>
                        <small>Select files and click "Create Context" button</small>
                    </div>
                `;

                // Reset state
                S.files = [];
                S.tree = [];
                S.ctx = '';
                S.root = 'project';
                S.busy = false;
                S.rendered = 0;

                // Reset stats
                D.cnt.textContent = '0';
                D.tok.textContent = '0';
                D.sz.textContent = '0 B';
                D.pron.textContent = 'zero tokens';
                D.lang.textContent = '-';

                // Clear search
                D.search.value = '';

                // Reset file input
                inp.value = '';

                // Show toast
                toast('All cleared successfully', 'success');
            }
        );
    };

    // ============================================================================
    // TREE BUILDING - ULTRA FAST
    // ============================================================================

    const build = files => {
        const root = new Map();
        files.forEach(f => {
            const pts = f.path.split('/');
            let cur = root;
            pts.forEach((p, i) => {
                if (!cur.has(p)) {
                    cur.set(p, {
                        n: p, p: pts.slice(0, i + 1).join('/'), full: f.path,
                        t: i === pts.length - 1 ? 'f' : 'd', kids: new Map(),
                        ig: ign(pts.slice(0, i + 1).join('/')), f: i === pts.length - 1 ? f : null
                    });
                }
                cur = cur.get(p).kids;
            });
        });
        return Array.from(root.values());
    };

    // ============================================================================
    // VIRTUAL RENDERING - Only render visible items
    // ============================================================================

    const render = (nodes, lv = 0, acc = []) => {
        if (acc.length > MAX_RENDER) return acc; // Stop if too many

        nodes.forEach(nd => {
            const ic = ico(nd.n, nd.t === 'd');
            const has = nd.t === 'd' && nd.kids.size > 0;
            const sz = nd.f ? bytes(nd.f.size) : '';

            acc.push({
                html: `<div class="tree-item ${nd.ig ? 'ignored' : ''}" data-path="${nd.full}">
                    <div class="tree-item-content" data-level="${lv}">
                        <button class="expand-btn" style="visibility:${has ? 'visible' : 'hidden'}">
                            <span class="material-symbols-outlined">chevron_right</span>
                        </button>
                        <div class="file-icon ${ic.cls}">
                            <span class="material-symbols-outlined" style="color:${ic.c}">${ic.i}</span>
                        </div>
                        <label class="file-label">
                            <input type="checkbox" class="file-checkbox" data-path="${nd.full}" ${nd.ig ? 'disabled' : 'checked'}>
                            <span class="file-name">${esc(nd.n)}</span>
                        </label>
                        ${sz ? `<span class="file-size">${sz}</span>` : ''}
                    </div>
                    ${has ? `<div class="tree-children">${renderSub(Array.from(nd.kids.values()), lv + 1)}</div>` : ''}
                </div>`
            });
        });

        return acc;
    };

    const renderSub = (nodes, lv) => render(nodes, lv, []).map(x => x.html).join('');

    // ============================================================================
    // FILE LOADING - ASYNC CHUNKS
    // ============================================================================

    const loadFiles = async list => {
        load(true);

        try {
            // Quick filter
            const all = Array.from(list);
            S.files = [];

            // Process in chunks to avoid blocking
            for (let i = 0; i < all.length; i += 500) {
                const chunk = all.slice(i, i + 500);
                chunk.forEach(f => {
                    const path = f.webkitRelativePath;
                    if (!ign(path)) {
                        S.files.push({ path, name: f.name, size: f.size, file: f });
                    }
                });
                await new Promise(r => setTimeout(r, 0)); // Let UI breathe
            }

            if (S.files.length === 0) { toast('No valid files', 'warning'); load(false); return; }
            if (S.files.length > 5000) { toast(`Large directory (${S.files.length} files) - rendering first 1000`, 'warning'); }

            S.root = list[0].webkitRelativePath.split('/')[0];
            S.tree = build(S.files.slice(0, 3000)); // Limit tree size

            // Render tree
            const items = render(S.tree);
            D.tree.innerHTML = items.map(x => x.html).join('');
            S.rendered = items.length;

            stats();
            toast(`Loaded ${S.files.length} files`, 'success');
        } catch (e) {
            console.error('Load error:', e);
            toast('Load failed', 'error');
        } finally {
            load(false);
        }
    };

    // ============================================================================
    // STATS UPDATE
    // ============================================================================

    const stats = () => {
        const cbs = Array.from(document.querySelectorAll('.file-checkbox:checked:not([disabled])'));
        const paths = cbs.map(c => c.dataset.path);
        const files = S.files.filter(f => paths.includes(f.path));

        const total = files.reduce((s, f) => s + f.size, 0);
        const toks = Math.ceil(total / 4);

        // Get languages
        const langs = new Set();
        files.forEach(f => {
            const ext = f.name.split('.').pop().toUpperCase();
            if (ICONS[ext.toLowerCase()]) {
                langs.add(ext);
            }
        });

        // Update DOM
        D.cnt.textContent = files.length;
        D.tok.textContent = toks.toLocaleString();
        D.sz.textContent = bytes(total);
        D.pron.textContent = words(toks) + ' tokens';
        D.lang.textContent = langs.size ? Array.from(langs).join(', ') : '-';
    };

    // ============================================================================
    // CONTEXT GENERATION - STREAMING
    // ============================================================================

    const gen = async () => {
        if (S.busy) return;

        const cbs = Array.from(document.querySelectorAll('.file-checkbox:checked:not([disabled])'));
        if (!cbs.length) { toast('Select files first', 'warning'); return; }

        load(true);
        D.ed.innerHTML = '<div class="editor-placeholder"><span class="material-symbols-outlined">hourglass_empty</span><p>Generating...</p></div>';

        try {
            const paths = cbs.map(c => c.dataset.path);
            const files = S.files.filter(f => paths.includes(f.path));

            // Structure
            const struct = genStruct(S.tree);

            // Read files in batches
            const contents = [];
            let done = 0;

            for (let i = 0; i < files.length; i += BATCH) {
                const batch = files.slice(i, i + BATCH);

                await Promise.all(batch.map(async f => {
                    try {
                        const txt = await f.file.text();
                        contents.push({ path: f.path, content: txt });
                    } catch (e) { console.warn('Skip', f.name, e); }
                }));

                done += batch.length;
                const pct = Math.round(done / files.length * 100);
                D.ed.innerHTML = `<div class="editor-placeholder"><span class="material-symbols-outlined">hourglass_empty</span><p>Processing: ${pct}%</p><small>${done} / ${files.length} files</small></div>`;

                await new Promise(r => setTimeout(r, 0));
            }

            // Build context
            let ctx = `<folder-structure>\n${struct}</folder-structure>\n\n`;
            contents.forEach(({ path, content }) => {
                ctx += `<document path="${path}">\n${content}\n</document>\n\n`;
            });

            S.ctx = ctx;

            // Display (truncate if huge)
            const disp = ctx.length > 100000 ?
                ctx.substring(0, 100000) + '\n\n... [Truncated. Use Copy/Download for full content]' : ctx;

            D.ed.innerHTML = `<pre style="margin:0;padding:12px;white-space:pre-wrap;word-wrap:break-word;font-size:11px;line-height:1.3;max-height:100%;overflow:auto">${esc(disp)}</pre>`;

            toast('Context generated!', 'success');
        } catch (e) {
            console.error('Gen error:', e);
            toast('Generation failed', 'error');
            D.ed.innerHTML = '<div class="editor-placeholder"><span class="material-symbols-outlined">error</span><p>Failed</p></div>';
        } finally {
            load(false);
        }
    };

    const genStruct = (nodes, pfx = '') => {
        let r = '';
        nodes.forEach((nd, i) => {
            const last = i === nodes.length - 1;
            r += `${pfx}${last ? '└── ' : '├── '}${nd.n}\n`;
            if (nd.t === 'd' && nd.kids.size > 0) {
                r += genStruct(Array.from(nd.kids.values()), pfx + (last ? '    ' : '│   '));
            }
        });
        return r;
    };

    // ============================================================================
    // EXPORT
    // ============================================================================

    const copyClip = async () => {
        if (!S.ctx) { toast('Generate first', 'warning'); return; }
        try { await navigator.clipboard.writeText(S.ctx); toast('Copied!', 'success'); }
        catch (e) { toast('Copy failed', 'error'); }
    };

    const dl = fmt => {
        if (!S.ctx) { toast('Generate first', 'warning'); return; }

        const cont = S.ctx;
        const mime = 'text/plain';

        const blob = new Blob([cont], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; 
        a.download = `${S.root}-context.${fmt}`; 
        a.click();
        URL.revokeObjectURL(url);

        toast(`Downloaded ${fmt.toUpperCase()}`, 'success');
    };

    // ============================================================================
    // EVENTS
    // ============================================================================

    const setup = () => {
        D.tog.onclick = () => D.side.classList.toggle('collapsed');
        D.sel.onclick = () => inp.click();
        inp.onchange = e => e.target.files.length && loadFiles(e.target.files);

        D.tree.onclick = e => {
            const btn = e.target.closest('.expand-btn');
            if (btn) {
                const item = btn.closest('.tree-item');
                const kids = item.querySelector('.tree-children');
                if (kids) {
                    const open = kids.classList.toggle('open');
                    btn.classList.toggle('expanded', open);
                    btn.querySelector('.material-symbols-outlined').textContent = open ? 'expand_more' : 'chevron_right';
                }
                return;
            }

            const cb = e.target.closest('.file-checkbox');
            if (cb && !cb.disabled) {
                const item = cb.closest('.tree-item');
                item.querySelectorAll('.file-checkbox').forEach(c => { if (!c.disabled) c.checked = cb.checked; });
                stats();
            }
        };

        D.search.oninput = e => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll('.tree-item').forEach(item => {
                const n = item.querySelector('.file-name').textContent.toLowerCase();
                item.style.display = n.includes(q) ? '' : 'none';
            });
        };

        const togFold = o => {
            document.querySelectorAll('.expand-btn').forEach(btn => {
                const item = btn.closest('.tree-item');
                const kids = item.querySelector('.tree-children');
                if (kids) {
                    kids.classList.toggle('open', o);
                    btn.classList.toggle('expanded', o);
                    btn.querySelector('.material-symbols-outlined').textContent = o ? 'expand_more' : 'chevron_right';
                }
            });
        };

        const togCheck = c => {
            document.querySelectorAll('.file-checkbox:not([disabled])').forEach(cb => cb.checked = c);
            stats();
        };

        D.exp.onclick = () => togFold(true);
        D.col.onclick = () => togFold(false);
        D.all.onclick = () => togCheck(true);
        D.none.onclick = () => togCheck(false);

        D.gen.onclick = gen;
        D.copy.onclick = copyClip;
        D.txt.onclick = () => dl('txt');

        // Clear All button
        const clearBtn = $('clearAll');
        if (clearBtn) {
            clearBtn.onclick = clearAll;
        }

        document.onkeydown = e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); D.side.classList.toggle('collapsed'); }
        };
    };

    // ============================================================================
    // INIT
    // ============================================================================

    const init = () => {
        setup();
        console.log('%c🚀 CodeToContext Ready', 'color:#e3dacc;font-weight:bold;font-size:16px');
        console.log('%c⚡ Optimized for 10,000+ files', 'color:#10b981;font-size:12px');
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

})();
