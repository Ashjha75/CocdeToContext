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
        folders: new Set([
            // Node.js
            'node_modules',
            '.npm',
            '.yarn',
            'bower_components',

            // Version Control
            '.git',
            '.svn',
            '.hg',

            // Python
            '__pycache__',
            '.pytest_cache',
            '.mypy_cache',
            '.tox',
            'venv',
            'env',
            '.env',
            '.venv',
            'virtualenv',
            '.python-version',
            'dist',
            'build',
            '*.egg-info',
            '.eggs',

            // Java/Spring Boot/Maven/Gradle
            'target',
            'build',
            'out',
            'bin',
            '.gradle',
            '.mvn',
            '.m2',
            'classes',
            'generated',
            'generated-sources',
            'generated-test-sources',

            // IDE Files
            '.vscode',
            '.idea',
            '.eclipse',
            '.settings',
            '.classpath',
            '.project',
            '.factorypath',
            '.apt_generated',
            '.apt_generated_tests',
            'nbproject',
            '.nb-gradle',

            // JavaScript/TypeScript
            '.next',
            '.nuxt',
            '.output',
            '.cache',
            '.parcel-cache',
            '.turbo',
            'dist',
            'coverage',
            '.nyc_output',

            // PHP
            'vendor',

            // Logs & Temp
            'logs',
            'temp',
            'tmp',
            '.log',

            // OS
            '.DS_Store',
            'Thumbs.db'
        ]),

        exts: new Set([
            // Executables & Binaries
            'exe', 'dll', 'so', 'dylib', 'a', 'o', 'obj',

            // Java Compiled (we'll handle .class specially for icons)
            'class', // REMOVED - we want to show .class files with special icons

            // Python Compiled
            'pyc', 'pyo', 'pyd',

            // Images (optional - you can show them)
            // 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp',

            // Media
            'mp4', 'mp3', 'wav', 'avi', 'mov', 'flv', 'wmv', 'ogg',

            // Archives
            'zip', 'tar', 'gz', 'rar', '7z', 'bz2', 'xz', 'tgz',

            // Fonts
            'ttf', 'woff', 'woff2', 'eot', 'otf',

            // Lock files (optional)
            // 'lock', // If you want to hide lock files

            // Other
            'log', 'cache', 'swp', 'swo', 'bak', 'tmp'
        ])
    };


    // VS Code Material Icon Theme - Professional file icons
    const ICONS = {
        // JavaScript
        js: { icon: 'javascript.svg', color: '#f1e05a' },
        jsx: { icon: 'react.svg', color: '#61dafb' },
        mjs: { icon: 'javascript.svg', color: '#f1e05a' },
        cjs: { icon: 'javascript.svg', color: '#f1e05a' },

        // TypeScript
        ts: { icon: 'typescript.svg', color: '#3178c6' },
        tsx: { icon: 'react_ts.svg', color: '#3178c6' },

        // Python
        py: { icon: 'python.svg', color: '#3776ab' },
        pyc: { icon: 'python-misc.svg', color: '#3776ab' },
        pyi: { icon: 'python.svg', color: '#3776ab' },
        pyx: { icon: 'python.svg', color: '#3776ab' },
        pyd: { icon: 'python-misc.svg', color: '#3776ab' },
        pyw: { icon: 'python.svg', color: '#3776ab' },

        // Web
        html: { icon: 'html.svg', color: '#e34c26' },
        htm: { icon: 'html.svg', color: '#e34c26' },
        css: { icon: 'css.svg', color: '#563d7c' },
        scss: { icon: 'sass.svg', color: '#c6538c' },
        sass: { icon: 'sass.svg', color: '#c6538c' },
        less: { icon: 'less.svg', color: '#1d365d' },

        // Data
        json: { icon: 'json.svg', color: '#cbcb41' },
        xml: { icon: 'xml.svg', color: '#ff6600' },
        yaml: { icon: 'yaml.svg', color: '#cb171e' },
        yml: { icon: 'yaml.svg', color: '#cb171e' },
        toml: { icon: 'toml.svg', color: '#9c4221' },

        // Documentation
        md: { icon: 'markdown.svg', color: '#083fa1' },
        mdx: { icon: 'mdx.svg', color: '#fcb32c' },
        txt: { icon: 'document.svg', color: '#a0a0a0' },

        // Config
        gitignore: { icon: 'git.svg', color: '#f34f29' },
        env: { icon: 'tune.svg', color: '#e7c547' },
        config: { icon: 'settings.svg', color: '#6d8086' },

        // Java/Spring Boot
        java: { icon: 'java.svg', color: '#b07219' },
        class: { icon: 'javaclass.svg', color: '#b07219' }, // Compiled Java
        jar: { icon: 'jar.svg', color: '#b07219' },
        war: { icon: 'jar.svg', color: '#b07219' },
        ear: { icon: 'jar.svg', color: '#b07219' },
        gradle: { icon: 'gradle.svg', color: '#02303a' },
        kt: { icon: 'kotlin.svg', color: '#7f52ff' }, // Kotlin
        kts: { icon: 'kotlin.svg', color: '#7f52ff' },

        // Maven/Gradle files (special handling below)
        properties: { icon: 'settings.svg', color: '#6d8086' },

        // C/C++
        c: { icon: 'c.svg', color: '#555555' },
        cpp: { icon: 'cpp.svg', color: '#f34b7d' },
        h: { icon: 'h.svg', color: '#555555' },
        hpp: { icon: 'hpp.svg', color: '#f34b7d' },
        cc: { icon: 'cpp.svg', color: '#f34b7d' },
        cxx: { icon: 'cpp.svg', color: '#f34b7d' },

        // C#
        cs: { icon: 'csharp.svg', color: '#178600' },
        csproj: { icon: 'csharp.svg', color: '#178600' },

        // PHP
        php: { icon: 'php.svg', color: '#4f5d95' },

        // Ruby
        rb: { icon: 'ruby.svg', color: '#701516' },

        // Go
        go: { icon: 'go.svg', color: '#00add8' },

        // Rust
        rs: { icon: 'rust.svg', color: '#dea584' },

        // Shell
        sh: { icon: 'shell.svg', color: '#89e051' },
        bash: { icon: 'shell.svg', color: '#89e051' },
        zsh: { icon: 'shell.svg', color: '#89e051' },
        fish: { icon: 'shell.svg', color: '#89e051' },

        // Docker
        dockerfile: { icon: 'docker.svg', color: '#0db7ed' },

        // Images
        png: { icon: 'image.svg', color: '#a074c4' },
        jpg: { icon: 'image.svg', color: '#a074c4' },
        jpeg: { icon: 'image.svg', color: '#a074c4' },
        gif: { icon: 'image.svg', color: '#a074c4' },
        svg: { icon: 'svg.svg', color: '#ffb13b' },
        ico: { icon: 'image.svg', color: '#a074c4' },
        webp: { icon: 'image.svg', color: '#a074c4' },

        // Vue/Angular/React
        vue: { icon: 'vue.svg', color: '#42b883' },

        // Lock files
        lock: { icon: 'lock.svg', color: '#a0a0a0' },

        // Others
        sql: { icon: 'database.svg', color: '#e38c00' },
        pdf: { icon: 'pdf.svg', color: '#f40f02' },
        zip: { icon: 'zip.svg', color: '#f9dc5c' },

        // Default
        default: { icon: 'document.svg', color: '#a0a0a0' }
    };

    // Special folder types
    const FOLDER_ICONS = {
        // Node.js
        'node_modules': { icon: 'folder-node.svg', color: '#8cc84b' },

        // Source folders
        'src': { icon: 'folder-src.svg', color: '#f0eee6' },
        'source': { icon: 'folder-src.svg', color: '#f0eee6' },
        'sources': { icon: 'folder-src.svg', color: '#f0eee6' },

        // Build/Output folders
        'dist': { icon: 'folder-dist.svg', color: '#f0eee6' },
        'build': { icon: 'folder-build.svg', color: '#f0eee6' },
        'out': { icon: 'folder-dist.svg', color: '#f0eee6' },
        'target': { icon: 'folder-dist.svg', color: '#f0eee6' }, // Maven target

        // Public/Static
        'public': { icon: 'folder-public.svg', color: '#f0eee6' },
        'static': { icon: 'folder-public.svg', color: '#f0eee6' },
        'assets': { icon: 'folder-images.svg', color: '#f0eee6' },
        'resources': { icon: 'folder-resource.svg', color: '#f0eee6' },

        // Images
        'images': { icon: 'folder-images.svg', color: '#f0eee6' },
        'img': { icon: 'folder-images.svg', color: '#f0eee6' },
        'imgs': { icon: 'folder-images.svg', color: '#f0eee6' },

        // Components
        'components': { icon: 'folder-component.svg', color: '#f0eee6' },
        'widgets': { icon: 'folder-component.svg', color: '#f0eee6' },

        // Views/Pages
        'pages': { icon: 'folder-views.svg', color: '#f0eee6' },
        'views': { icon: 'folder-views.svg', color: '#f0eee6' },
        'screens': { icon: 'folder-views.svg', color: '#f0eee6' },
        'templates': { icon: 'folder-views.svg', color: '#f0eee6' },

        // Tests
        'tests': { icon: 'folder-test.svg', color: '#f0eee6' },
        'test': { icon: 'folder-test.svg', color: '#f0eee6' },
        '__tests__': { icon: 'folder-test.svg', color: '#f0eee6' },
        'spec': { icon: 'folder-test.svg', color: '#f0eee6' },

        // Utils/Helpers
        'utils': { icon: 'folder-helper.svg', color: '#f0eee6' },
        'helpers': { icon: 'folder-helper.svg', color: '#f0eee6' },
        'lib': { icon: 'folder-lib.svg', color: '#f0eee6' },
        'libs': { icon: 'folder-lib.svg', color: '#f0eee6' },
        'libraries': { icon: 'folder-lib.svg', color: '#f0eee6' },

        // Config
        'config': { icon: 'folder-config.svg', color: '#f0eee6' },
        'configs': { icon: 'folder-config.svg', color: '#f0eee6' },
        'configuration': { icon: 'folder-config.svg', color: '#f0eee6' },

        // Java/Spring specific
        'main': { icon: 'folder-src.svg', color: '#f0eee6' },
        'java': { icon: 'folder-src.svg', color: '#dcb67a' },
        'kotlin': { icon: 'folder-src.svg', color: '#7f52ff' },
        'controller': { icon: 'folder-controller.svg', color: '#f0eee6' },
        'controllers': { icon: 'folder-controller.svg', color: '#f0eee6' },
        'service': { icon: 'folder-helper.svg', color: '#f0eee6' },
        'services': { icon: 'folder-helper.svg', color: '#f0eee6' },
        'repository': { icon: 'folder-database.svg', color: '#f0eee6' },
        'repositories': { icon: 'folder-database.svg', color: '#f0eee6' },
        'entity': { icon: 'folder-database.svg', color: '#f0eee6' },
        'entities': { icon: 'folder-database.svg', color: '#f0eee6' },
        'model': { icon: 'folder-model.svg', color: '#f0eee6' },
        'models': { icon: 'folder-model.svg', color: '#f0eee6' },
        'dto': { icon: 'folder-interface.svg', color: '#f0eee6' },
        'dao': { icon: 'folder-database.svg', color: '#f0eee6' },

        // Python specific
        'venv': { icon: 'folder-python.svg', color: '#3776ab' },
        'env': { icon: 'folder-python.svg', color: '#3776ab' },
        '__pycache__': { icon: 'folder-python.svg', color: '#3776ab' },

        // IDE
        '.git': { icon: 'folder-git.svg', color: '#f34f29' },
        '.github': { icon: 'folder-github.svg', color: '#6e5494' },
        '.vscode': { icon: 'folder-vscode.svg', color: '#007acc' },
        '.idea': { icon: 'folder-intellij.svg', color: '#087cfa' },

        // Default
        'default': { icon: 'folder.svg', color: '#dcb67a' }
    };
    const ICON_BASE_URL = 'https://raw.githack.com/PKief/vscode-material-icon-theme/main/icons/';

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

    // Get icon for file or folder
    const ico = (name, isFolder) => {
        if (isFolder) {
            // Check for special folder names
            const folderName = name.toLowerCase();
            const folderIcon = FOLDER_ICONS[folderName] || FOLDER_ICONS['default'];
            return {
                type: 'svg',
                url: ICON_BASE_URL + folderIcon.icon,
                color: folderIcon.color,
                cls: 'folder-icon'
            };
        }

        // File icon
        const fileName = name.toLowerCase();

        // ========================================
        // SPRING BOOT / JAVA SPECIAL FILES
        // ========================================
        if (fileName === 'pom.xml') {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'maven.svg',
                color: '#c71a36',
                cls: 'maven-icon'
            };
        }

        if (fileName === 'build.gradle' || fileName === 'build.gradle.kts' || fileName === 'settings.gradle' || fileName === 'settings.gradle.kts') {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'gradle.svg',
                color: '#02303a',
                cls: 'gradle-icon'
            };
        }

        if (fileName === 'application.properties' || fileName === 'application.yml' || fileName === 'application.yaml') {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'spring.svg',
                color: '#6db33f',
                cls: 'spring-icon'
            };
        }

        if (fileName.startsWith('application-') && (fileName.endsWith('.properties') || fileName.endsWith('.yml') || fileName.endsWith('.yaml'))) {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'spring.svg',
                color: '#6db33f',
                cls: 'spring-icon'
            };
        }

        // ========================================
        // PYTHON SPECIAL FILES
        // ========================================
        if (fileName === 'requirements.txt' || fileName === 'requirements-dev.txt') {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'python.svg',
                color: '#3776ab',
                cls: 'python-icon'
            };
        }

        if (fileName === 'setup.py' || fileName === 'setup.cfg') {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'python.svg',
                color: '#3776ab',
                cls: 'python-icon'
            };
        }

        if (fileName === 'pipfile' || fileName === 'pipfile.lock') {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'python.svg',
                color: '#3776ab',
                cls: 'python-icon'
            };
        }

        if (fileName === 'pyproject.toml') {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'python.svg',
                color: '#3776ab',
                cls: 'python-icon'
            };
        }

        if (fileName === 'manage.py') { // Django
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'django.svg',
                color: '#092e20',
                cls: 'django-icon'
            };
        }

        // ========================================
        // JAVASCRIPT/NODE SPECIAL FILES
        // ========================================
        if (fileName === 'package.json') {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'nodejs.svg',
                color: '#8cc84b',
                cls: 'nodejs-icon'
            };
        }

        if (fileName === 'package-lock.json') {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'npm.svg',
                color: '#cb3837',
                cls: 'npm-icon'
            };
        }

        if (fileName === 'yarn.lock') {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'yarn.svg',
                color: '#2c8ebb',
                cls: 'yarn-icon'
            };
        }

        if (fileName === 'tsconfig.json') {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'typescript-def.svg',
                color: '#3178c6',
                cls: 'typescript-icon'
            };
        }

        if (fileName === 'webpack.config.js' || fileName === 'webpack.config.ts') {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'webpack.svg',
                color: '#8dd6f9',
                cls: 'webpack-icon'
            };
        }

        if (fileName === 'vite.config.js' || fileName === 'vite.config.ts') {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'vite.svg',
                color: '#646cff',
                cls: 'vite-icon'
            };
        }

        if (fileName === 'next.config.js' || fileName === 'next.config.ts') {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'next.svg',
                color: '#000000',
                cls: 'next-icon'
            };
        }

        // ========================================
        // GIT FILES
        // ========================================
        if (fileName === '.gitignore' || fileName === '.gitattributes' || fileName === '.gitmodules') {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'git.svg',
                color: '#f34f29',
                cls: 'git-icon'
            };
        }

        // ========================================
        // DOCKER FILES
        // ========================================
        if (fileName === 'dockerfile' || fileName.startsWith('dockerfile.')) {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'docker.svg',
                color: '#0db7ed',
                cls: 'docker-icon'
            };
        }

        if (fileName === 'docker-compose.yml' || fileName === 'docker-compose.yaml') {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'docker.svg',
                color: '#0db7ed',
                cls: 'docker-icon'
            };
        }

        // ========================================
        // ENV FILES
        // ========================================
        if (fileName.startsWith('.env')) {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'tune.svg',
                color: '#e7c547',
                cls: 'env-icon'
            };
        }

        // ========================================
        // README FILES
        // ========================================
        if (fileName === 'readme.md' || fileName === 'readme' || fileName === 'readme.txt') {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'readme.svg',
                color: '#4caf50',
                cls: 'readme-icon'
            };
        }

        // ========================================
        // LICENSE FILES
        // ========================================
        if (fileName === 'license' || fileName === 'license.md' || fileName === 'license.txt') {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'license.svg',
                color: '#cbcb41',
                cls: 'license-icon'
            };
        }

        // ========================================
        // GET BY EXTENSION (DEFAULT)
        // ========================================
        const ext = name.split('.').pop().toLowerCase();
        const iconData = ICONS[ext] || ICONS['default'];

        return {
            type: 'svg',
            url: ICON_BASE_URL + iconData.icon,
            color: iconData.color,
            cls: `${ext}-icon`
        };
    };

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
                            <img src="${ic.url}" alt="${nd.n}" class="vscode-icon" onerror="this.style.display='none'" />
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
        // Loader is already shown by inp.onchange handler

        try {
            // Update loading message
            const loadingText = D.load.querySelector('p');
            if (loadingText) loadingText.textContent = `Processing ${list.length} files...`;

            // Convert FileList to Array in small chunks to avoid blocking
            const all = [];
            const batchSize = 1000;

            for (let i = 0; i < list.length; i += batchSize) {
                const end = Math.min(i + batchSize, list.length);
                for (let j = i; j < end; j++) {
                    all.push(list[j]);
                }

                // Update progress
                if (loadingText) {
                    const progress = Math.round((i / list.length) * 100);
                    loadingText.textContent = `Processing files... ${progress}%`;
                }

                // Let UI breathe
                await new Promise(r => setTimeout(r, 0));
            }

            if (loadingText) loadingText.textContent = 'Filtering files...';
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

                // Update progress
                if (loadingText) {
                    const progress = Math.round((i / all.length) * 100);
                    loadingText.textContent = `Filtering files... ${progress}%`;
                }

                await new Promise(r => setTimeout(r, 0)); // Let UI breathe
            }

            if (S.files.length === 0) { toast('No valid files', 'warning'); load(false); return; }
            if (S.files.length > 5000) { toast(`Large directory (${S.files.length} files) - rendering first 1000`, 'warning'); }

            if (loadingText) loadingText.textContent = 'Building file tree...';
            S.root = list[0].webkitRelativePath.split('/')[0];

            // Let UI update before building tree
            await new Promise(r => setTimeout(r, 10));

            S.tree = build(S.files.slice(0, 3000)); // Limit tree size

            if (loadingText) loadingText.textContent = 'Rendering tree...';
            await new Promise(r => setTimeout(r, 10));

            // Render tree
            const items = render(S.tree);
            D.tree.innerHTML = items.map(x => x.html).join('');
            S.rendered = items.length;

            stats();

            // Reset loading message
            if (loadingText) loadingText.textContent = 'Processing files...';

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

            // Display full content (no truncation - let browser handle scrolling)
            D.ed.innerHTML = `<pre style="margin:0;padding:12px;white-space:pre-wrap;word-wrap:break-word;font-size:11px;line-height:1.3;max-height:100%;overflow:auto">${esc(ctx)}</pre>`;

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

        // Optimize file input change handler
        inp.onchange = async e => {
            if (!e.target.files.length) return;

            // Show loader IMMEDIATELY before any processing
            load(true);

            // Let the loader render before starting heavy work
            await new Promise(r => setTimeout(r, 50));

            // Now load files
            loadFiles(e.target.files);
        };

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
