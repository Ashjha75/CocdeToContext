// ============================================================================
// CodeToContext - EXTREME PERFORMANCE VERSION (MODIFIED AGAIN)
// Handles 10,000+ files without freezing, better memory management
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
            '.gitignore',
            
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
            'site-packages',
            
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
            '.apt_generated',
            '.apt_generated_tests',
            
            // IDE Files (VS Code, IntelliJ, Eclipse, etc.)
            '.vscode',
            '.idea',
            '.eclipse',
            '.settings',
            '.classpath',
            '.project',
            '.factorypath',
            'nbproject',
            '.nb-gradle',
            '.vs',
            '.vscode-test',
            '*.iml',
            
            // JavaScript/TypeScript Build
            '.next',
            '.nuxt',
            '.output',
            '.cache',
            '.parcel-cache',
            '.turbo',
            'dist',
            'coverage',
            '.nyc_output',
            'build',
            'public/build',
            '.webpack',
            
            // PHP
            'vendor',
            
            // Ruby
            '.bundle',
            
            // Logs & Temp
            'logs',
            'temp',
            'tmp',
            '.log',
            '.tmp',
            
            // OS
            '.DS_Store',
            'Thumbs.db',
            'desktop.ini',
            
            // Other
            'coverage',
            '.sass-cache',
            '.eslintcache'
        ]),
        
        exts: new Set([
            // Executables & Binaries
            'exe', 'dll', 'so', 'dylib', 'a', 'o', 'obj', 'bin',
            
            // Java Compiled
            'class', 'jar', 'war', 'ear',
            
            // Python Compiled
            'pyc', 'pyo', 'pyd',
            
            // Images (CRITICAL: These appear as binary in output!)
            'png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'webp', 'svg', 'tiff', 'psd', 'ai',
            
            // Media (Videos, Audio)
            'mp4', 'mp3', 'wav', 'avi', 'mov', 'flv', 'wmv', 'ogg', 'webm', 'mkv', 'flac', 'aac',
            
            // Archives
            'zip', 'tar', 'gz', 'rar', '7z', 'bz2', 'xz', 'tgz', 'iso',
            
            // Fonts
            'ttf', 'woff', 'woff2', 'eot', 'otf',
            
            // Documents (Binary formats)
            'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
            
            // Database
            'db', 'sqlite', 'sqlite3',
            
            // Minified/Compiled (CRITICAL: Skip compiled code!)
            'min.js', 'min.css', 'bundle.js', 'chunk.js',
            
            // Logs & Cache
            'log', 'cache', 'swp', 'swo', 'bak', 'tmp',
            
            // Lock files
            'lock',
            
            // IDE specific
            'iml', 'ipr', 'iws'
        ])
    };
    // Download the bundled Python script (combine.py) and notify user to update paths
    const downloadPythonScript = async () => {
        try {
            const res = await fetch('combine.py');
            if (!res.ok) throw new Error('Failed to fetch combine.py');
            const txt = await res.text();
            const blob = new Blob([txt], { type: 'text/x-python' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'combine.py';
            a.click();
            URL.revokeObjectURL(url);
            // Show a toast instructing the user to change the path inside the script
            toast('combine.py downloaded — edit the script to change any file paths before running.', 'info');
        } catch (e) {
            console.error('Download combine.py error:', e);
            toast('Failed to download combine.py: ' + (e.message || ''), 'error');
        }
    };
    // Expose to global so inline onclick in HTML can access it
    window.downloadPythonScript = downloadPythonScript;
    // Binary file extensions - show in structure but don't read content
    const BINARY_EXTS = new Set([
        // Images
        'png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'webp', 'svg', 'tiff', 'psd',
        // Media
        'mp4', 'mp3', 'wav', 'avi', 'mov', 'flv', 'wmv', 'ogg', 'webm', 'mkv',
        // Documents
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
        // Archives
        'zip', 'tar', 'gz', 'rar', '7z', 'bz2', 'xz', 'tgz',
        // Executables
        'exe', 'dll', 'so', 'dylib', 'bin',
        // Fonts
        'ttf', 'woff', 'woff2', 'eot', 'otf',
        // Database
        'db', 'sqlite', 'sqlite3',
        // Compiled
        'class', 'pyc', 'o', 'obj'
    ]);
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
    const DOWNLOAD_THRESHOLD = 5 * 1024 * 1024; // 5MB - Projects larger than this will trigger download immediately
    // ============================================================================
    // STATE
    // ============================================================================
    const S = { files: [], tree: [], root: 'project', ctx: '', busy: false, rendered: 0, basePath: '', basePathSet: false, model: 'gpt' };
    const $ = id => document.getElementById(id);
    const $safe = id => {
        const el = document.getElementById(id);
        if (!el) console.warn(`Missing DOM element with id="${id}"`);
        return el;
    };
    const D = {
        side: $safe('sidebar'), tog: $safe('toggleSidebar'), tree: $safe('fileTree'),
        search: $safe('fileSearch'), searchMeta: $safe('searchMeta'), searchClear: $safe('searchClear'),
        sel: $safe('selectDirBtn'),
        exp: $safe('expandAll'), col: $safe('collapseAll'),
        all: $safe('selectAll'), none: $safe('deselectAll'),
        gen: $safe('generateContextBtn'), ed: $safe('codeEditor'),
        resizer: $safe('sidebarResizer'),
        cnt: $safe('fileCount'), tok: $safe('tokenCount'), sz: $safe('totalSize'),
        pron: $safe('tokenPronunciation'), lang: $safe('languagesList'),
        copy: $safe('copyBtn'), txt: $safe('downloadTxtBtn'),
        load: $safe('loadingOverlay'), toast: $safe('toastContainer'),
        model: $safe('modelSelector'),
        loadingText: $safe('loadingText')
    };
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.multiple = true;
    inp.setAttribute('webkitdirectory', '');
    inp.setAttribute('mozdirectory', '');
    inp.setAttribute('directory', '');
    inp.style.display = 'none';
    document.body.appendChild(inp);

    // ============================================================================
    // MEMORY MANAGEMENT FUNCTION (ENHANCED)
    // ============================================================================
    const clearMemory = () => {
        console.log("Clearing memory...");
        if (S.ctx) {
            // Revoke Blob URL if S.ctx was an array (for download)
            if (S.isArray && Array.isArray(S.ctx)) {
                // If S.ctx holds a Blob URL string, revoke it
                // This scenario is less likely now, but keeping for safety
                // S.ctx is usually the string content or the parts array
                // If it's an array of parts, just nullify it
                 S.ctx.length = 0; // Clear the array elements
                 S.ctx = null;     // Nullify the reference
            } else if (typeof S.ctx === 'string') {
                 // If it's a string, just nullify it
                 S.ctx = null;
            } else {
                 // Fallback nullification
                 S.ctx = null;
            }
            S.isArray = false;
        }
        if (S.files) {
            // Nullify the file object references inside S.files array elements before clearing the array
            S.files.forEach(fileObj => {
                if (fileObj && fileObj.file) {
                    fileObj.file = null; // Release the File object reference
                }
            });
            S.files.length = 0; // Clear the array
            S.files = null;      // Nullify the reference
        }
        if (S.tree) {
            S.tree.length = 0; // Clear the array
            S.tree = null;     // Nullify the reference
        }
        console.log("Memory cleared.");
    };

    // ============================================================================
    // UTILS
    // ============================================================================
    // Enhanced load function with optional message
    const load = (s, msg) => {
        D.load.classList.toggle('active', s);
        S.busy = s;
        if (D.loadingText && msg) D.loadingText.textContent = msg;
        else if (D.loadingText && s) D.loadingText.textContent = 'Processing files...';
    };
    const toast = (m, t = 'info') => {
        const el = document.createElement('div');
        el.className = `toast ${t}`;
        const ic = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' }[t];
        el.innerHTML = `<span class="material-symbols-outlined">${ic}</span><span>${m}</span>`;
        D.toast.appendChild(el);
    setTimeout(() => { el.style.animation = 'slideInRight 0.3s ease reverse'; setTimeout(() => el.remove(), 300); }, 4500);
    };
    const bytes = n => { if (!n) return '0 B'; const k = 1024, s = ['B', 'KB', 'MB', 'GB'], i = ~~(Math.log(n) / Math.log(k)); return `${(n / k ** i).toFixed(1)} ${s[i]}`; };
    const words = n => {
        if (n === 0) return 'zero';
        // Handle very large numbers with abbreviations
        if (n >= 1000000000) { // Billions
            const billions = Math.floor(n / 1000000000);
            const remainder = n % 1000000000;
            const millions = Math.floor(remainder / 1000000);
            if (millions > 0) {
                return `${billions.toLocaleString()} billion ${millions.toLocaleString()} million`;
            }
            return `${billions.toLocaleString()} billion`;
        }
        if (n >= 1000000) { // Millions
            const millions = Math.floor(n / 1000000);
            const remainder = n % 1000000;
            const thousands = Math.floor(remainder / 1000);
            if (thousands > 0) {
                return `${millions.toLocaleString()} million ${thousands.toLocaleString()} thousand`;
            }
            return `${millions.toLocaleString()} million`;
        }
        if (n >= 1000) { // Thousands
            const thousands = Math.floor(n / 1000);
            const remainder = n % 1000;
            if (remainder > 0) {
                return `${thousands.toLocaleString()} thousand ${remainder}`;
            }
            return `${thousands.toLocaleString()} thousand`;
        }
        // For numbers under 1000, use full word conversion
        const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
        const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
        const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        const convertHundreds = num => {
            if (num === 0) return '';
            if (num < 10) return ones[num];
            if (num < 20) return teens[num - 10];
            if (num < 100) {
                const ten = Math.floor(num / 10);
                const one = num % 10;
                return tens[ten] + (one ? ' ' + ones[one] : '');
            }
            const hundred = Math.floor(num / 100);
            const remainder = num % 100;
            return ones[hundred] + ' hundred' + (remainder ? ' ' + convertHundreds(remainder) : '');
        };
        return convertHundreds(n);
    };
    // Build a full path string by optionally prepending a user-supplied base path.
    // If no base path is provided, return the relative path unchanged.
    const getFullPath = rel => {
        if (!rel) return rel;
        const r = String(rel);
        if (S.basePath) {
            const base = S.basePath.replace(/[\\/]+$/, '');
            const relNorm = r.replace(/^[\\/]+/, '');
            // If base looks like a Windows path (contains backslash) join with backslashes
            if (base.indexOf('\\') !== -1) {
                return base + '\\' + relNorm.replace(/\//g, '\\');
            }
            // Default to POSIX-style join
            return base + '/' + relNorm.replace(/\\/g, '/');
        }
        return r;
    };
    // Enhanced ignore function with better detection
    const ign = p => { 
        const pts = p.split('/'); 
        
        // Check if path contains ignored folders
        if (pts.some(x => IGNORED.folders.has(x))) return true; 
        
        const filename = pts[pts.length - 1].toLowerCase();
        
        // Check for minified files (CRITICAL: Skip .min.js, .min.css, etc.)
        if (filename.includes('.min.')) return true;
        if (filename.includes('.bundle.')) return true;
        if (filename.includes('.chunk.')) return true;
        
        // Check for specific IDE files
        if (filename.startsWith('.') && filename !== '.gitignore') {
            // Allow some dotfiles but skip most
            const allowed = ['.env.example', '.editorconfig', '.prettierrc'];
            if (!allowed.some(a => filename.includes(a))) return true;
        }
        
        // Check extension
        const e = filename.split('.').pop().toLowerCase();
        return IGNORED.exts.has(e);
    };
    
    const isBinary = filename => {
        const ext = filename.split('.').pop().toLowerCase();
        return BINARY_EXTS.has(ext);
    };
    
    // Check if file is likely minified/compiled (additional safety check)
    const isMinified = filename => {
        const lower = filename.toLowerCase();
        return lower.includes('.min.') || 
               lower.includes('.bundle.') || 
               lower.includes('.chunk.') ||
               lower.endsWith('.map'); // source maps
    };
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
        // =============================
        // NEXT.JS
        // =============================
        if (
            fileName === 'next.config.js' ||
            fileName === 'next.config.ts' ||
            fileName === 'next-env.d.ts' ||
            fileName === 'middleware.js' ||
            fileName === 'middleware.ts' ||
            fileName === 'middleware.tsx' ||
            fileName === 'middleware.mjs' ||
            fileName === 'middleware.cjs'
        ) {
            return {
                type: 'svg',
                url: 'public/nextjs.svg',
                color: '#000000',
                cls: 'nextjs-icon'
            };
        }
        // =============================
        // SPRING BOOT & ECOSYSTEM
        // =============================
        if (
            fileName === 'spring-boot-starter-parent.pom' ||
            fileName === 'spring.factories' ||
            fileName === 'application.properties' ||
            fileName === 'application.yml' ||
            fileName === 'application.yaml' ||
            fileName.endsWith('.spring')
        ) {
            return {
                type: 'svg',
                url: 'public/springboot.svg',
                color: '#6db33f',
                cls: 'springboot-icon'
            };
        }
        // =============================
        // ANGULAR
        // =============================
        if (
            fileName === 'angular.json' ||
            fileName === 'angular-cli.json' ||
            fileName === 'main.ts' ||
            fileName === 'polyfills.ts' ||
            fileName === 'test.ts' ||
            fileName === 'tsconfig.app.json' ||
            fileName === 'tsconfig.spec.json' ||
            fileName === 'karma.conf.js' ||
            fileName === 'karma.conf.ts' ||
            fileName === 'protractor.conf.js' ||
            fileName === 'protractor.conf.ts'
        ) {
            return {
                type: 'svg',
                url: 'public/angular.svg',
                color: '#dd0031',
                cls: 'angular-icon'
            };
        }
        // =============================
        // EXPRESS.JS
        // =============================
        if (
            fileName === 'app.js' ||
            fileName === 'app.ts' ||
            fileName === 'server.js' ||
            fileName === 'server.ts' ||
            fileName === 'express.js' ||
            fileName === 'express.ts'
        ) {
            return {
                type: 'svg',
                url: 'public/express.svg',
                color: '#000000',
                cls: 'express-icon'
            };
        }
        // =============================
        // SQL
        // =============================
        if (
            fileName.endsWith('.sql') ||
            fileName.endsWith('.sqlite') ||
            fileName.endsWith('.sqlite3')
        ) {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'database.svg',
                color: '#e38c00',
                cls: 'sql-icon'
            };
        }
        // =============================
        // DOCKER
        // =============================
        if (
            fileName === 'dockerfile' ||
            fileName.startsWith('dockerfile.') ||
            fileName === 'docker-compose.yml' ||
            fileName === 'docker-compose.yaml'
        ) {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'docker.svg',
                color: '#0db7ed',
                cls: 'docker-icon'
            };
        }
        // =============================
        // KUBERNETES
        // =============================
        if (
            fileName === 'kubernetes.yaml' ||
            fileName === 'kubernetes.yml' ||
            fileName.endsWith('.k8s.yaml') ||
            fileName.endsWith('.k8s.yml') ||
            fileName === 'deployment.yaml' ||
            fileName === 'deployment.yml' ||
            fileName === 'service.yaml' ||
            fileName === 'service.yml' ||
            fileName === 'pod.yaml' ||
            fileName === 'pod.yml'
        ) {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'kubernetes.svg',
                color: '#326ce5',
                cls: 'k8s-icon'
            };
        }
        // =============================
        // AWS
        // =============================
        if (
            fileName === 'aws.json' ||
            fileName === 'aws.yml' ||
            fileName === 'aws.yaml' ||
            fileName === 'cloudformation.yml' ||
            fileName === 'cloudformation.yaml' ||
            fileName === 'template.yml' ||
            fileName === 'template.yaml' ||
            fileName.endsWith('.aws.json') ||
            fileName.endsWith('.aws.yml') ||
            fileName.endsWith('.aws.yaml')
        ) {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'aws.svg',
                color: '#ff9900',
                cls: 'aws-icon'
            };
        }
        // =============================
        // ENV FILES
        // =============================
        if (fileName.startsWith('.env')) {
            return {
                type: 'svg',
                url: ICON_BASE_URL + 'tune.svg',
                color: '#e7c547',
                cls: 'env-icon'
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
            cls: '' // No custom classes needed - icons are already colored
        };
    };
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '<').replace(/>/g, '>');
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
    // CLEAR ALL FUNCTION (ENHANCED)
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
                if (D.search) D.search.value = '';
                updateTreeSearch('');
                D.lang.textContent = '-';
                // Clear search
                D.search.value = '';
                // Reset file input
                inp.value = '';
                // Clear memory explicitly
                clearMemory();
                // Show toast
                toast('All cleared successfully', 'success');
            }
        );
    };
    // ============================================================================
    // TREE BUILDING - ULTRA FAST (ENSURE FILTERING)
    // ============================================================================
    const build = files => {
        const root = new Map();
        // Ensure files passed here are already filtered by `ign`
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
    // Helper to build tree lines array for each node
    function getTreeLines(parents, isLast) {
        let lines = '';
        for (let i = 0; i < parents.length; ++i) {
            if (parents[i]) {
                lines += `<span class="tree-vline"></span>`;
            } else {
                lines += `<span class="tree-vline" style="opacity:0"></span>`;
            }
        }
        if (parents.length > 0) {
            lines += `<span class="tree-branch${isLast ? ' tree-branch-last' : ''}"></span>`;
        }
        return lines;
    }

    const render = (nodes, lv = 0, acc = [], parents = []) => {
        if (acc.length > MAX_RENDER) return acc;
        nodes.forEach((nd, idx) => {
            const ic = ico(nd.n, nd.t === 'd');
            const has = nd.t === 'd' && nd.kids.size > 0;
            const sz = nd.f ? bytes(nd.f.size) : '';
            const isLast = idx === nodes.length - 1;
            // Tree lines
            const lines = getTreeLines(parents, isLast);
            // Arrow SVGs
            let arrow = '';
            if (has) {
                arrow = `<img class="tree-arrow" src="public/arrowRight.svg" data-arrow="right" style="display:inline;" />`;
            } else {
                arrow = `<span class="tree-arrow-placeholder"></span>`;
            }
            acc.push({
                html: `<div class="tree-item${nd.ig ? ' ignored' : ''}${has ? ' folder' : ''}" data-path="${nd.full}">
                    <div class="tree-item-content" data-level="${lv}">
                        <span class="tree-lines">${lines}</span>
                        <button class="expand-btn" style="visibility:${has ? 'visible' : 'hidden'}">
                            ${arrow}
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
                    ${has ? `<div class="tree-children">${renderSub(Array.from(nd.kids.values()), lv + 1, parents.concat(!isLast))}</div>` : ''}
                </div>`
            });
        });
        return acc;
    };
    // Pass parents array for lines
    const renderSub = (nodes, lv, parents) => render(nodes, lv, [], parents).map(x => x.html).join('');

    const openTreeParents = item => {
        let current = item.parentElement;
        while (current) {
            if (current.classList && current.classList.contains('tree-children')) {
                current.classList.add('open');
                const parentItem = current.parentElement;
                if (parentItem && parentItem.classList.contains('tree-item')) {
                    parentItem.style.display = '';
                    const btn = parentItem.querySelector('.expand-btn');
                    if (btn) {
                        btn.classList.add('expanded');
                        const arrowImg = btn.querySelector('.tree-arrow');
                        if (arrowImg) {
                            arrowImg.src = 'public/arrowDown.svg';
                            arrowImg.setAttribute('data-arrow', 'down');
                        }
                    }
                }
                current = parentItem ? parentItem.parentElement : null;
                continue;
            }
            current = current.parentElement;
        }
    };

    const updateTreeSearch = query => {
        const term = (query || '').trim().toLowerCase();
        const items = document.querySelectorAll('.tree-item');
        let matches = 0;
        const total = items.length;
        
        items.forEach(item => {
            const nameEl = item.querySelector('.file-name');
            const name = nameEl ? nameEl.textContent.toLowerCase() : '';
            
            // Only search by name, support partial matching
            const match = !term || name.includes(term);
            
            item.style.display = match ? '' : 'none';
            item.classList.toggle('search-match', !!term && match);
            
            if (term && match) {
                matches += 1;
                openTreeParents(item);
            }
        });
        
        if (D.searchMeta) {
            D.searchMeta.textContent = term
                ? `${matches} match${matches === 1 ? '' : 'es'} of ${total}`
                : 'Search by file or folder name (partial match supported)';
        }
        if (D.searchClear) {
            D.searchClear.hidden = !term;
        }
    };
    // ============================================================================
    // FILE LOADING - ASYNC CHUNKS (ENHANCED FILTERING & UI UPDATE)
    // ============================================================================
    const loadFiles = async list => {
        try {
            // Clear previous memory before loading new files
            clearMemory();

            const loadingText = D.load.querySelector('p');
            if (loadingText) loadingText.textContent = `Loading ${list.length} files...`;
            // Fast path: convert FileList to Array
            const all = Array.from(list);
            if (loadingText) loadingText.textContent = 'Filtering files...';
            await new Promise(r => setTimeout(r, 0));
            // Filter files - CRITICAL: Ensure all ignored files are removed here
            S.files = all.filter(f => !ign(f.webkitRelativePath))
                .map(f => ({
                    path: f.webkitRelativePath,
                    name: f.name,
                    size: f.size,
                    file: f
                }));
            // Auto-detect absolute base path when running in desktop/Electron environments
            // where File objects may expose a non-standard `path` property.
            if (!S.basePathSet) {
                const cand = S.files.find(ff => ff.file && ff.file.path);
                if (cand && cand.file && cand.file.path) {
                    try {
                        const full = String(cand.file.path);
                        const rel = String(cand.path);
                        const sep = full.indexOf('\\') !== -1 ? '\\' : '/';
                        const relConv = rel.split('/').join(sep);
                        let base = '';
                        if (full.endsWith(relConv)) {
                            base = full.slice(0, full.length - relConv.length);
                            base = base.replace(/[\\/]+$/, '');
                        } else {
                            const idx = full.indexOf(relConv);
                            if (idx !== -1) base = full.slice(0, idx).replace(/[\\/]+$/, '');
                        }
                        if (base) {
                            S.basePath = base;
                            S.basePathSet = true;
                            console.info('Auto-detected base path:', base);
                        }
                    } catch (e) {
                        // ignore; leave base path unset
                    }
                }
            }
            if (S.files.length === 0) { toast('No valid files', 'warning'); load(false); return; }
            if (S.files.length > 5000) { toast(`Large directory (${S.files.length} files) - rendering first 1000`, 'warning'); }
            if (loadingText) loadingText.textContent = 'Building file tree...';
            S.root = S.files[0].path.split('/')[0];
            // Let UI update before building tree
            await new Promise(r => setTimeout(r, 0));
            S.tree = build(S.files.slice(0, 3000)); // Limit tree size, but build from fully filtered list
            if (loadingText) loadingText.textContent = 'Rendering tree...';
            await new Promise(r => setTimeout(r, 0));
            // Render tree
            const items = render(S.tree);
            D.tree.innerHTML = items.map(x => x.html).join('');
            S.rendered = items.length;
            if (D.search) updateTreeSearch(D.search.value);
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
    // CONTEXT GENERATION - STREAMING (MODIFIED AGAIN)
    // ============================================================================
    const gen = async () => {
        if (S.busy) return;
        const cbs = Array.from(document.querySelectorAll('.file-checkbox:checked:not([disabled])'));
        if (!cbs.length) { toast('Select files first', 'warning'); return; }
        load(true, 'Generating context...');
        D.ed.innerHTML = '<div class="editor-placeholder"><span class="material-symbols-outlined">hourglass_empty</span><p>Preparing...</p></div>';

        // Get selected model
        S.model = D.model ? D.model.value : 'gpt';

        try {
            const paths = cbs.map(c => c.dataset.path);
            // Ensure we only use files that were originally loaded (and thus already filtered)
            const files = S.files.filter(f => paths.includes(f.path));
            // Separate binary and text files
            const textFiles = [];
            const binaryFiles = []; // This list is now only for stats/display in the tree, not for content inclusion
            files.forEach(f => {
                // Skip binary files
                if (isBinary(f.name)) {
                    binaryFiles.push(f);
                    return;
                }
                
                // Skip minified/compiled files
                if (isMinified(f.name)) {
                    console.log('Skipping minified file:', f.name);
                    return;
                }
                
                // Skip files that shouldn't be in output
                const filename = f.name.toLowerCase();
                
                // Skip SVG files (can contain binary/encoded data)
                if (filename.endsWith('.svg')) {
                    binaryFiles.push(f);
                    return;
                }
                
                // Skip large files that might be compiled/minified
                if (f.size > 500 * 1024) { // 500KB
                    console.log('Skipping large file (possibly compiled):', f.name, bytes(f.size));
                    return;
                }
                
                textFiles.push(f);
            });

            const totalTextSize = textFiles.reduce((s, f) => s + f.size, 0);
            const isHuge = totalTextSize > 500 * 1024 * 1024;
            const isAboveDownloadThreshold = totalTextSize > DOWNLOAD_THRESHOLD; // Check against new threshold

            if (totalTextSize > 100 * 1024 * 1024) {
                toast(`⚠️ Large project (${bytes(totalTextSize)})`, 'warning');
            }

            const struct = genStruct(S.tree);

            // PRIORITIZE DOWNLOAD: If above threshold, skip full display and go straight to download
            if (isAboveDownloadThreshold) {
                console.log("Project size exceeds threshold, triggering download immediately.");
                D.ed.innerHTML = `<div class="editor-placeholder"><span class="material-symbols-outlined">warning</span><h3 style="color:#fbbf24;margin:10px 0">Large Project!</h3><p>Size: <strong>${bytes(totalTextSize)}</strong></p><p>Downloading automatically...</p></div>`;
                await genAndDL(struct, textFiles, binaryFiles); // Pass both for stats display in genAndDL
                toast('Download ready!', 'success');
                load(false);
                return; // Exit gen function after download
            }

            const isLarge = totalTextSize > 50 * 1024 * 1024;
            const contents = [];
            let done = 0, failed = 0, skipped = binaryFiles.length;
            // Process text files in larger batches with better progress
            const FAST_BATCH = 100;
            for (let i = 0; i < textFiles.length; i += FAST_BATCH) {
                const batch = textFiles.slice(i, i + FAST_BATCH);
                // Read all files in parallel for speed
                const results = await Promise.allSettled(
                    batch.map(f => f.file.text()) // Only read files from the 'textFiles' list
                );
                results.forEach((result, idx) => {
                    if (result.status === 'fulfilled') {
                        const content = result.value;
                        const path = batch[idx].path;
                        const filename = batch[idx].name;
                        // Validate content is actually text (not binary disguised as text)
                        if (content.indexOf('\0') !== -1) {
                            console.warn('Skipping file with null bytes (binary):', filename);
                            failed++;
                            return;
                        }
                        // Skip if content looks like base64 encoded data (common in compiled files)
                        const lines = content.split('\n');
                        const longBase64Lines = lines.filter(line => 
                            line.length > 200 && /^[A-Za-z0-9+/=]+$/.test(line.trim())
                        ).length;
                        if (longBase64Lines > 10) {
                            console.warn('Skipping file with encoded data:', filename);
                            failed++;
                            return;
                        }
                        // Skip extremely long single lines (typical of minified code)
                        const hasVeryLongLine = lines.some(line => line.length > 10000);
                        if (hasVeryLongLine) {
                            console.warn('Skipping file with very long lines (minified):', filename);
                            failed++;
                            return;
                        }
                        contents.push({
                            path: path,
                            content: content
                        });
                    } else {
                        console.warn('Skip', batch[idx].name, result.reason);
                        failed++;
                    }
                });
                done += batch.length;
                const pct = Math.round(done / textFiles.length * 100);
                const status = [];
                status.push(`<strong>${done}/${textFiles.length}</strong> files`);
                if (skipped > 0) status.push(`<span style=\"color:#3b82f6\">${skipped} binary</span>`);
                if (failed > 0) status.push(`<span style=\"color:#fbbf24\">${failed} failed</span>`);
                D.ed.innerHTML = `<div class=\"editor-placeholder\"><span class=\"material-symbols-outlined\">hourglass_empty</span><p>Reading files: ${pct}%</p><small>${status.join(' • ')}</small></div>`;
                load(true, `Reading files: ${pct}%`);
                // Yield to UI only every 5 batches for better performance
                if (i % (FAST_BATCH * 5) === 0) {
                    await new Promise(r => setTimeout(r, 0));
                }
            }

            D.ed.innerHTML = '<div class="editor-placeholder"><span class="material-symbols-outlined">hourglass_empty</span><p>Building output...</p></div>';
            load(true, 'Building output...');
            await new Promise(r => setTimeout(r, 10));
            
            // Gather metadata
            const now = new Date();
            const timestamp = now.toISOString();
            const formattedDate = now.toLocaleString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
                hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' 
            });
            const totalFiles = textFiles.length;
            const totalSize = textFiles.reduce((s, f) => s + f.size, 0);
            const estimatedTokens = Math.ceil(totalSize / 4);
            
            // Get language statistics
            const langStats = {};
            textFiles.forEach(f => {
                const ext = f.name.split('.').pop().toUpperCase();
                langStats[ext] = (langStats[ext] || 0) + 1;
            });
            const languageList = Object.entries(langStats)
                .sort((a, b) => b[1] - a[1])
                .map(([lang, count]) => `${lang} (${count} file${count > 1 ? 's' : ''})`)
                .join(', ');
            
            const parts = [];
            // === AI Model Template Logic ===
            if (S.model === 'gpt') {
                parts.push('# 🤖 PROJECT CONTEXT FOR GPT-4\n');
                parts.push('='.repeat(80) + '\n\n');
                
                parts.push('## 📋 METADATA\n');
                parts.push(`**Generated:** ${formattedDate}\n`);
                parts.push(`**Timestamp:** ${timestamp}\n`);
                parts.push(`**Project Root:** ${S.root}\n`);
                parts.push(`**Total Files:** ${totalFiles.toLocaleString()}\n`);
                parts.push(`**Total Size:** ${bytes(totalSize)}\n`);
                parts.push(`**Estimated Tokens:** ~${estimatedTokens.toLocaleString()}\n`);
                parts.push(`**Languages Used:** ${languageList}\n\n`);
                
                parts.push('## 🎯 SYSTEM PROMPT\n');
                parts.push('```\n');
                parts.push('You are an expert software engineer analyzing a complete codebase.\n\n');
                parts.push('INSTRUCTIONS:\n');
                parts.push('- Treat this as the COMPLETE and AUTHORITATIVE source of truth for this project\n');
                parts.push('- Analyze the code structure, architecture, and design patterns\n');
                parts.push('- Understand dependencies and relationships between files\n');
                parts.push('- Maintain consistency with existing code patterns and conventions\n');
                parts.push('- Always reference specific file paths when discussing code\n');
                parts.push('- Consider the project holistically before making suggestions\n');
                parts.push('- Respect the established coding style and naming conventions\n\n');
                parts.push('DATA FORMAT:\n');
                parts.push('- Each file is presented with its full path and language\n');
                parts.push('- Code blocks use appropriate syntax highlighting\n');
                parts.push('- The project structure is provided first for context\n');
                parts.push('```\n\n');
                
                parts.push('## 📁 PROJECT STRUCTURE\n```\n', struct, '```\n\n');
                parts.push('='.repeat(80) + '\n');
                parts.push('## 📄 SOURCE FILES\n');
                parts.push('='.repeat(80) + '\n\n');
            } else if (S.model === 'claude') {
                parts.push('<codebase_context>\n\n');
                
                parts.push('<metadata>\n');
                parts.push(`  <generated_at>${timestamp}</generated_at>\n`);
                parts.push(`  <formatted_date>${formattedDate}</formatted_date>\n`);
                parts.push(`  <project_root>${S.root}</project_root>\n`);
                parts.push(`  <statistics>\n`);
                parts.push(`    <total_files>${totalFiles}</total_files>\n`);
                parts.push(`    <total_size>${bytes(totalSize)}</total_size>\n`);
                parts.push(`    <estimated_tokens>${estimatedTokens}</estimated_tokens>\n`);
                parts.push(`  </statistics>\n`);
                parts.push(`  <languages>\n`);
                Object.entries(langStats).sort((a, b) => b[1] - a[1]).forEach(([lang, count]) => {
                    parts.push(`    <language name="${lang}" count="${count}" />\n`);
                });
                parts.push(`  </languages>\n`);
                parts.push('</metadata>\n\n');
                
                parts.push('<system_prompt>\n');
                parts.push('  <role>Expert Software Engineer</role>\n');
                parts.push('  <task>Analyze and work with this complete codebase</task>\n');
                parts.push('  <instructions>\n');
                parts.push('    - This is the COMPLETE and AUTHORITATIVE codebase\n');
                parts.push('    - Analyze architecture, patterns, and code organization\n');
                parts.push('    - Understand file dependencies and relationships\n');
                parts.push('    - Maintain existing code style and conventions\n');
                parts.push('    - Reference specific file paths in your responses\n');
                parts.push('    - Think holistically about the entire project\n');
                parts.push('    - Respect established patterns and best practices\n');
                parts.push('  </instructions>\n');
                parts.push('  <data_format>\n');
                parts.push('    - Files are in XML format with path and language metadata\n');
                parts.push('    - Project structure provided first for navigation\n');
                parts.push('    - All file contents are complete and unmodified\n');
                parts.push('  </data_format>\n');
                parts.push('</system_prompt>\n\n');
                
                parts.push('<project_structure>\n', struct, '</project_structure>\n\n');
                parts.push('<source_files>\n');
            } else if (S.model === 'gemini') {
                parts.push('# 🚀 COMPLETE PROJECT CONTEXT FOR GEMINI\n');
                parts.push('═'.repeat(80) + '\n\n');
                
                parts.push('## 📊 PROJECT METADATA\n\n');
                parts.push('| **Attribute** | **Value** |\n');
                parts.push('|---------------|-----------|\n');
                parts.push(`| Generated | ${formattedDate} |\n`);
                parts.push(`| ISO Timestamp | ${timestamp} |\n`);
                parts.push(`| Project Root | \`${S.root}\` |\n`);
                parts.push(`| Total Files | ${totalFiles.toLocaleString()} |\n`);
                parts.push(`| Total Size | ${bytes(totalSize)} |\n`);
                parts.push(`| Estimated Tokens | ~${estimatedTokens.toLocaleString()} |\n\n`);
                
                parts.push('### 🔤 Languages Distribution\n\n');
                Object.entries(langStats).sort((a, b) => b[1] - a[1]).forEach(([lang, count]) => {
                    const percentage = ((count / totalFiles) * 100).toFixed(1);
                    parts.push(`- **${lang}**: ${count} file${count > 1 ? 's' : ''} (${percentage}%)\n`);
                });
                parts.push('\n');
                
                parts.push('## 🧠 SYSTEM PROMPT & INSTRUCTIONS\n\n');
                parts.push('> **Role**: Expert Software Engineer and Code Analyst\n\n');
                parts.push('**📌 Key Instructions:**\n\n');
                parts.push('1. **Complete Context**: This is the FULL and AUTHORITATIVE codebase\n');
                parts.push('2. **Analyze Thoroughly**: Understand architecture, patterns, and dependencies\n');
                parts.push('3. **Maintain Consistency**: Follow existing code style and conventions\n');
                parts.push('4. **Reference Precisely**: Always cite specific file paths\n');
                parts.push('5. **Think Holistically**: Consider the entire project ecosystem\n');
                parts.push('6. **Respect Patterns**: Honor established design patterns and practices\n\n');
                
                parts.push('**📝 Data Format:**\n\n');
                parts.push('- Each file includes full path and language identifier\n');
                parts.push('- Project structure provided for navigation\n');
                parts.push('- All content is unmodified source code\n');
                parts.push('- Syntax highlighting applied per language\n\n');
                
                parts.push('═'.repeat(80) + '\n');
                parts.push('## 🗂️ PROJECT STRUCTURE\n\n');
                parts.push('```\n', struct, '```\n\n');
                parts.push('═'.repeat(80) + '\n');
                parts.push('## 📦 FILE CONTENTS\n\n');
            }
            // Binary files are intentionally excluded from the generated output (they remain visible in the tree)
            // Build document sections faster - no UI updates during build
            contents.forEach(({ path, content }) => {
                const full = getFullPath(path);
                const ext = path.split('.').pop().toLowerCase();
                
                if (S.model === 'gpt') {
                    // GPT-4 format: Clear markdown with code blocks
                    parts.push(`### ${full}\n`);
                    parts.push('```', ext, '\n', content, '\n```\n\n');
                } else if (S.model === 'claude') {
                    // Claude format: XML-style with clear metadata
                    parts.push(`<file path="${full}">\n`);
                    parts.push(`<language>${ext}</language>\n`);
                    parts.push(`<content>\n${content}\n</content>\n`);
                    parts.push('</file>\n\n');
                } else if (S.model === 'gemini') {
                    // Gemini format: Structured with clear delimiters
                    parts.push(`## File: ${full}\n`);
                    parts.push(`**Language:** ${ext}\n\n`);
                    parts.push('```', ext, '\n', content, '\n```\n\n');
                }
            });
            
            // Add closing tags for Claude
            if (S.model === 'claude') {
                parts.push('</source_files>\n</context>\n');
            }

            let ctx;
            try {
                ctx = parts.join(''); // This is now only done for smaller projects
            } catch (e) {
                console.error('Too large for string join (unexpected):', e);
                D.ed.innerHTML = `<div class=\"editor-placeholder\"><span class=\"material-symbols-outlined\">warning</span><h3 style=\"color:#fbbf24;margin:10px 0\">Too Large!</h3><p>Size: <strong>${bytes(parts.reduce((s, p) => s + p.length, 0))}</strong></p><p>Use download button.</p></div>`;
                S.ctx = parts;
                S.isArray = true;
                toast('Ready for download!', 'success');
                load(false);
                // Explicitly clear parts array
                parts.length = 0;
                return;
            }
            // Explicitly clear parts array after join for smaller projects
            parts.length = 0;

            S.ctx = ctx;
            S.isArray = false;

            if (isLarge) {
                const prev = ctx.substring(0, 50000);
                const rem = ctx.length - 50000;
                D.ed.innerHTML = `<div style=\"padding:12px;background:#1e1e1e;border-radius:4px;\"><div style=\"background:#2d2d30;padding:8px;border-radius:4px;margin-bottom:12px;border-left:3px solid #fbbf24;\"><strong style=\"color:#fbbf24;\">⚠️ Preview</strong><br><small style=\"color:#888;\">First ${bytes(50000)} of ${bytes(ctx.length)}</small><br><small style=\"color:#888;\">Use download for full</small></div><pre style=\"margin:0;white-space:pre-wrap;word-wrap:break-word;font-size:11px;line-height:1.3;max-height:500px;overflow:auto\">${esc(prev)}</pre><div style=\"background:#2d2d30;padding:8px;border-radius:4px;margin-top:12px;text-align:center;\"><small style=\"color:#888;\">... ${bytes(rem)} more</small></div></div>`;
            } else {
                D.ed.innerHTML = `<pre style=\"margin:0;padding:12px;white-space:pre-wrap;word-wrap:break-word;font-size:11px;line-height:1.3;max-height:100%;overflow:auto\">${esc(ctx)}</pre>`;
            }
            const stats = [];
            stats.push(`${textFiles.length} files`);
            if (binaryFiles.length > 0) stats.push(`${binaryFiles.length} binary excluded`);
            stats.push(`${bytes(ctx.length)}`);
            toast(`✓ Done! ${stats.join(' • ')}`, 'success');

            // Explicitly clear contents array after display
            contents.length = 0;

        } catch (e) {
            console.error('Gen error:', e);
            toast('Failed: ' + e.message, 'error');
            D.ed.innerHTML = `<div class=\"editor-placeholder\"><span class=\"material-symbols-outlined\">error</span><p>Failed</p><small style=\"color:#ef4444\">${e.message}</small></div>`;
        } finally {
            load(false);
        }
    };

    const genAndDL = async (struct, textFiles, binaryFiles) => {
        // Gather metadata
        const now = new Date();
        const timestamp = now.toISOString();
        const formattedDate = now.toLocaleString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
            hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' 
        });
        const totalFiles = textFiles.length;
        const totalSize = textFiles.reduce((s, f) => s + f.size, 0);
        const estimatedTokens = Math.ceil(totalSize / 4);
        
        // Get language statistics
        const langStats = {};
        textFiles.forEach(f => {
            const ext = f.name.split('.').pop().toUpperCase();
            langStats[ext] = (langStats[ext] || 0) + 1;
        });
        const languageList = Object.entries(langStats)
            .sort((a, b) => b[1] - a[1])
            .map(([lang, count]) => `${lang} (${count} file${count > 1 ? 's' : ''})`)
            .join(', ');
        
        const parts = [];
        
        // Add model-specific headers for download
        if (S.model === 'gpt') {
            parts.push('# 🤖 PROJECT CONTEXT FOR GPT-4\n');
            parts.push('='.repeat(80) + '\n\n');
            
            parts.push('## 📋 METADATA\n');
            parts.push(`**Generated:** ${formattedDate}\n`);
            parts.push(`**Timestamp:** ${timestamp}\n`);
            parts.push(`**Project Root:** ${S.root}\n`);
            parts.push(`**Total Files:** ${totalFiles.toLocaleString()}\n`);
            parts.push(`**Total Size:** ${bytes(totalSize)}\n`);
            parts.push(`**Estimated Tokens:** ~${estimatedTokens.toLocaleString()}\n`);
            parts.push(`**Languages Used:** ${languageList}\n\n`);
            
            parts.push('## 🎯 SYSTEM PROMPT\n');
            parts.push('```\n');
            parts.push('You are an expert software engineer analyzing a complete codebase.\n\n');
            parts.push('INSTRUCTIONS:\n');
            parts.push('- Treat this as the COMPLETE and AUTHORITATIVE source of truth for this project\n');
            parts.push('- Analyze the code structure, architecture, and design patterns\n');
            parts.push('- Understand dependencies and relationships between files\n');
            parts.push('- Maintain consistency with existing code patterns and conventions\n');
            parts.push('- Always reference specific file paths when discussing code\n');
            parts.push('- Consider the project holistically before making suggestions\n');
            parts.push('- Respect the established coding style and naming conventions\n\n');
            parts.push('DATA FORMAT:\n');
            parts.push('- Each file is presented with its full path and language\n');
            parts.push('- Code blocks use appropriate syntax highlighting\n');
            parts.push('- The project structure is provided first for context\n');
            parts.push('```\n\n');
            
            parts.push('## 📁 PROJECT STRUCTURE\n```\n', struct, '```\n\n');
            parts.push('='.repeat(80) + '\n');
            parts.push('## 📄 SOURCE FILES\n');
            parts.push('='.repeat(80) + '\n\n');
        } else if (S.model === 'claude') {
            parts.push('<codebase_context>\n\n');
            
            parts.push('<metadata>\n');
            parts.push(`  <generated_at>${timestamp}</generated_at>\n`);
            parts.push(`  <formatted_date>${formattedDate}</formatted_date>\n`);
            parts.push(`  <project_root>${S.root}</project_root>\n`);
            parts.push(`  <statistics>\n`);
            parts.push(`    <total_files>${totalFiles}</total_files>\n`);
            parts.push(`    <total_size>${bytes(totalSize)}</total_size>\n`);
            parts.push(`    <estimated_tokens>${estimatedTokens}</estimated_tokens>\n`);
            parts.push(`  </statistics>\n`);
            parts.push(`  <languages>\n`);
            Object.entries(langStats).sort((a, b) => b[1] - a[1]).forEach(([lang, count]) => {
                parts.push(`    <language name="${lang}" count="${count}" />\n`);
            });
            parts.push(`  </languages>\n`);
            parts.push('</metadata>\n\n');
            
            parts.push('<system_prompt>\n');
            parts.push('  <role>Expert Software Engineer</role>\n');
            parts.push('  <task>Analyze and work with this complete codebase</task>\n');
            parts.push('  <instructions>\n');
            parts.push('    - This is the COMPLETE and AUTHORITATIVE codebase\n');
            parts.push('    - Analyze architecture, patterns, and code organization\n');
            parts.push('    - Understand file dependencies and relationships\n');
            parts.push('    - Maintain existing code style and conventions\n');
            parts.push('    - Reference specific file paths in your responses\n');
            parts.push('    - Think holistically about the entire project\n');
            parts.push('    - Respect established patterns and best practices\n');
            parts.push('  </instructions>\n');
            parts.push('  <data_format>\n');
            parts.push('    - Files are in XML format with path and language metadata\n');
            parts.push('    - Project structure provided first for navigation\n');
            parts.push('    - All file contents are complete and unmodified\n');
            parts.push('  </data_format>\n');
            parts.push('</system_prompt>\n\n');
            
            parts.push('<project_structure>\n', struct, '</project_structure>\n\n');
            parts.push('<source_files>\n');
        } else if (S.model === 'gemini') {
            parts.push('# 🚀 COMPLETE PROJECT CONTEXT FOR GEMINI\n');
            parts.push('═'.repeat(80) + '\n\n');
            
            parts.push('## 📊 PROJECT METADATA\n\n');
            parts.push('| **Attribute** | **Value** |\n');
            parts.push('|---------------|-----------|\n');
            parts.push(`| Generated | ${formattedDate} |\n`);
            parts.push(`| ISO Timestamp | ${timestamp} |\n`);
            parts.push(`| Project Root | \`${S.root}\` |\n`);
            parts.push(`| Total Files | ${totalFiles.toLocaleString()} |\n`);
            parts.push(`| Total Size | ${bytes(totalSize)} |\n`);
            parts.push(`| Estimated Tokens | ~${estimatedTokens.toLocaleString()} |\n\n`);
            
            parts.push('### 🔤 Languages Distribution\n\n');
            Object.entries(langStats).sort((a, b) => b[1] - a[1]).forEach(([lang, count]) => {
                const percentage = ((count / totalFiles) * 100).toFixed(1);
                parts.push(`- **${lang}**: ${count} file${count > 1 ? 's' : ''} (${percentage}%)\n`);
            });
            parts.push('\n');
            
            parts.push('## 🧠 SYSTEM PROMPT & INSTRUCTIONS\n\n');
            parts.push('> **Role**: Expert Software Engineer and Code Analyst\n\n');
            parts.push('**📌 Key Instructions:**\n\n');
            parts.push('1. **Complete Context**: This is the FULL and AUTHORITATIVE codebase\n');
            parts.push('2. **Analyze Thoroughly**: Understand architecture, patterns, and dependencies\n');
            parts.push('3. **Maintain Consistency**: Follow existing code style and conventions\n');
            parts.push('4. **Reference Precisely**: Always cite specific file paths\n');
            parts.push('5. **Think Holistically**: Consider the entire project ecosystem\n');
            parts.push('6. **Respect Patterns**: Honor established design patterns and practices\n\n');
            
            parts.push('**📝 Data Format:**\n\n');
            parts.push('- Each file includes full path and language identifier\n');
            parts.push('- Project structure provided for navigation\n');
            parts.push('- All content is unmodified source code\n');
            parts.push('- Syntax highlighting applied per language\n\n');
            
            parts.push('═'.repeat(80) + '\n');
            parts.push('## 🗂️ PROJECT STRUCTURE\n\n');
            parts.push('```\n', struct, '```\n\n');
            parts.push('═'.repeat(80) + '\n');
            parts.push('## 📦 FILE CONTENTS\n\n');
        }

        let done = 0;
        const FAST_BATCH = 100;
        for (let i = 0; i < textFiles.length; i += FAST_BATCH) {
            const batch = textFiles.slice(i, i + FAST_BATCH);
            const results = await Promise.allSettled(
                batch.map(f => f.file.text())
            );
            results.forEach((result, idx) => {
                if (result.status === 'fulfilled') {
                    const content = result.value;
                    const p = batch[idx].path;
                    const filename = batch[idx].name;
                    
                    if (content.indexOf('\0') !== -1) {
                        console.warn('Download: Skipping file with null bytes:', filename);
                        return;
                    }
                    
                    const lines = content.split('\n');
                    const longBase64Lines = lines.filter(line => 
                        line.length > 200 && /^[A-Za-z0-9+/=]+$/.test(line.trim())
                    ).length;
                    
                    if (longBase64Lines > 10) {
                        console.warn('Download: Skipping file with encoded data:', filename);
                        return;
                    }
                    
                    const hasVeryLongLine = lines.some(line => line.length > 10000);
                    if (hasVeryLongLine) {
                        console.warn('Download: Skipping minified file:', filename);
                        return;
                    }
                    
                    // Format based on selected AI model
                    const full = getFullPath(p);
                    const ext = p.split('.').pop().toLowerCase();
                    
                    if (S.model === 'gpt') {
                        parts.push(`### ${full}\n`);
                        parts.push('```', ext, '\n', content, '\n```\n\n');
                    } else if (S.model === 'claude') {
                        parts.push(`<file path="${full}">\n`);
                        parts.push(`<language>${ext}</language>\n`);
                        parts.push(`<content>\n${content}\n</content>\n`);
                        parts.push('</file>\n\n');
                    } else if (S.model === 'gemini') {
                        parts.push(`## File: ${full}\n`);
                        parts.push(`**Language:** ${ext}\n\n`);
                        parts.push('```', ext, '\n', content, '\n```\n\n');
                    }
                    
                    const sFileIndex = S.files.findIndex(sf => sf.path === p);
                    if (sFileIndex !== -1) {
                        S.files[sFileIndex].file = null;
                    }
                } else {
                    console.warn('Skip', batch[idx].name, result.reason);
                }
            });
            done += batch.length;
            const pct = Math.round(done / textFiles.length * 100);
            const status = [];
            status.push(`${done}/${textFiles.length}`);
            if (binaryFiles && binaryFiles.length > 0) {
                status.push(`${binaryFiles.length} binary`);
            }
            D.ed.innerHTML = `<div class="editor-placeholder"><span class="material-symbols-outlined">download</span><p>Preparing: ${pct}%</p><small>${status.join(' • ')}</small></div>`;

            if (i % (FAST_BATCH * 5) === 0) {
                 await new Promise(r => setTimeout(r, 0));
            }
        }

        // Add closing tags for Claude format
        if (S.model === 'claude') {
            parts.push('</source_files>\n</context>\n');
        }

        await new Promise(r => setTimeout(r, 0));

        const blob = new Blob(parts, { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${S.root}-context.txt`;
        a.click();
        URL.revokeObjectURL(url);

        const stats = [];
        stats.push(`${textFiles.length} files`);
        if (binaryFiles && binaryFiles.length > 0) {
            stats.push(`${binaryFiles.length} binary`);
        }
        stats.push(bytes(blob.size));
        D.ed.innerHTML = `<div class="editor-placeholder"><span class="material-symbols-outlined">check_circle</span><p>Downloaded!</p><small>File: ${S.root}-context.txt</small><small>${stats.join(' • ')}</small></div>`;

        parts.length = 0;
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
    // PYTHON SCRIPT DOWNLOAD
    // ============================================================================
   

    // ============================================================================
    // EXPORT
    // ============================================================================
    const copyClip = async () => {
        if (!S.ctx) { toast('Generate first', 'warning'); return; }
        try {
            const text = S.isArray ? S.ctx.join('') : S.ctx;
            if (text.length > 20 * 1024 * 1024) {
                toast('Too large for clipboard. Use download.', 'warning');
                return;
            }
            await navigator.clipboard.writeText(text);
            toast('Copied!', 'success');
        } catch (e) {
            console.error('Copy error:', e);
            toast('Copy failed: ' + e.message, 'error');
        }
    };
    const dl = fmt => {
        if (!S.ctx) { toast('Generate first', 'warning'); return; }
        try {
            const text = S.isArray ? S.ctx.join('') : S.ctx;
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${S.root}-context.${fmt}`;
            a.click();
            URL.revokeObjectURL(url);
            toast('Downloaded!', 'success');
        } catch (e) {
            console.error('Download error:', e);
            toast('Download failed: ' + e.message, 'error');
        }
    };
    // ============================================================================
    // EVENTS
    // ============================================================================
    const initSidebarResizer = () => {
        const handle = D.resizer;
        const panel = D.side;
        if (!handle || !panel) return;

        const minWidth = panel.getBoundingClientRect().width;
        const safeMax = Math.max(minWidth, window.innerWidth - 320);
        let startX = 0;
        let startWidth = panel.offsetWidth;

        const onMove = e => {
            const delta = e.clientX - startX;
            let targetWidth = startWidth + delta;
            if (targetWidth < minWidth) targetWidth = minWidth;
            if (targetWidth > safeMax) targetWidth = safeMax;
            panel.style.width = `${targetWidth}px`;
        };

        const stopDrag = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', stopDrag);
            document.body.style.cursor = '';
            handle.classList.remove('active');
        };

        handle.addEventListener('mousedown', e => {
            e.preventDefault();
            startX = e.clientX;
            startWidth = panel.offsetWidth;
            document.body.style.cursor = 'ew-resize';
            handle.classList.add('active');
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', stopDrag);
        });
    };

    const setup = () => {
        console.log('Setting up event handlers...');
        if (D.tog) D.tog.addEventListener('click', () => D.side && D.side.classList.toggle('collapsed'));
        
        if (D.sel) {
            D.sel.addEventListener('click', () => {
                console.log('Select folder clicked');
                try { 
                    inp.click(); 
                } catch (e) { 
                    console.error('Failed to open directory picker:', e); 
                    toast('Directory picker blocked', 'error'); 
                }
            });
        } else {
            console.warn('selectDirBtn not found — directory selection unavailable');
        }
        // Model selector event
        if (D.model) {
            D.model.addEventListener('change', () => {
                S.model = D.model.value;
                const templates = {
                    gpt: '📝 GPT-4: Markdown format with clear code blocks and instructions',
                    claude: '🤖 Claude: XML-structured context with semantic tags for better understanding',
                    gemini: '✨ Gemini: Hybrid format with metadata and organized sections'
                };
                console.log(`%c${templates[S.model]}`, 'color:#10b981;font-weight:bold');
                toast(`Template: ${S.model.toUpperCase()}`, 'info');
            });
        }
        
        // Drag and Drop functionality on main content area
        const dragDropZone = $('dragDropZone');
        const dragDropOverlay = $('dragDropOverlay');
        const codeEditor = $('codeEditor');
        
        if (dragDropZone) {
            // Prevent default drag behaviors on the entire document
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                document.addEventListener(eventName, e => {
                    e.preventDefault();
                    e.stopPropagation();
                }, false);
            });
            
            // Highlight drop zone when dragging over it
            ['dragenter', 'dragover'].forEach(eventName => {
                dragDropZone.addEventListener(eventName, () => {
                    dragDropZone.classList.add('drag-over');
                }, false);
            });
            
            // Remove highlight when leaving or dropping
            ['dragleave'].forEach(eventName => {
                dragDropZone.addEventListener(eventName, e => {
                    // Only remove if leaving the drop zone itself, not child elements
                    if (e.target === dragDropZone) {
                        dragDropZone.classList.remove('drag-over');
                    }
                }, false);
            });
            
            // Handle dropped items (folders/files)
            document.addEventListener('drop', async e => {
                dragDropZone.classList.remove('drag-over');
                
                const items = e.dataTransfer.items;
                if (!items || items.length === 0) {
                    toast('No items detected. Please try using "Select Directory" button', 'warning');
                    return;
                }
                
                // Hide drag-drop zone and show editor
                dragDropZone.style.display = 'none';
                if (codeEditor) codeEditor.style.display = 'block';
                
                // Show loader IMMEDIATELY
                load(true, 'Processing dropped folder...');
                
                // Process dropped items
                const allFiles = [];
                
                // Use webkitGetAsEntry for folder support
                for (let i = 0; i < items.length; i++) {
                    const item = items[i].webkitGetAsEntry();
                    if (item) {
                        if (item.isDirectory) {
                            await traverseDirectory(item, '', allFiles);
                        } else if (item.isFile) {
                            const file = items[i].getAsFile();
                            if (file) {
                                // Add webkitRelativePath property
                                Object.defineProperty(file, 'webkitRelativePath', {
                                    value: file.name,
                                    writable: false
                                });
                                allFiles.push(file);
                            }
                        }
                    }
                }
                
                if (allFiles.length === 0) {
                    toast('No files found in dropped folder', 'warning');
                    load(false);
                    dragDropZone.style.display = 'flex';
                    if (codeEditor) codeEditor.style.display = 'none';
                    return;
                }
                
                // Create a FileList-like object
                const fileList = {
                    length: allFiles.length,
                    item: i => allFiles[i],
                    [Symbol.iterator]: function* () {
                        for (let i = 0; i < allFiles.length; i++) {
                            yield allFiles[i];
                        }
                    }
                };
                
                // Add array access
                allFiles.forEach((file, idx) => {
                    fileList[idx] = file;
                });
                
                // Process files
                setTimeout(() => loadFiles(fileList), 0);
            }, false);
            
            // Recursive function to traverse directory structure
            async function traverseDirectory(entry, path, files) {
                if (entry.isFile) {
                    return new Promise((resolve) => {
                        entry.file(file => {
                            // Add webkitRelativePath property
                            const relativePath = path + file.name;
                            Object.defineProperty(file, 'webkitRelativePath', {
                                value: relativePath,
                                writable: false
                            });
                            files.push(file);
                            resolve();
                        });
                    });
                } else if (entry.isDirectory) {
                    const dirReader = entry.createReader();
                    return new Promise((resolve) => {
                        const readEntries = () => {
                            dirReader.readEntries(async entries => {
                                if (entries.length === 0) {
                                    resolve();
                                    return;
                                }
                                for (const childEntry of entries) {
                                    await traverseDirectory(
                                        childEntry,
                                        path + entry.name + '/',
                                        files
                                    );
                                }
                                readEntries(); // Continue reading if there are more entries
                            });
                        };
                        readEntries();
                    });
                }
            }
            
            // Click on zone to trigger folder selection
            dragDropZone.addEventListener('click', () => {
                if (D.sel) D.sel.click();
            });
        }
        
        // Optimize file input change handler
        inp.onchange = e => {
            if (!e.target.files.length) return;
            
            // Hide drag-drop zone and show editor when files are selected
            const dragDropZone = $('dragDropZone');
            const codeEditor = $('codeEditor');
            if (dragDropZone) dragDropZone.style.display = 'none';
            if (codeEditor) codeEditor.style.display = 'block';
            
            // Show loader IMMEDIATELY
            load(true, 'Loading files...');
            // Process files in next tick to let loader render
            setTimeout(() => loadFiles(e.target.files), 0);
        };
        D.tree.onclick = e => {
            const btn = e.target.closest('.expand-btn');
            if (btn) {
                const item = btn.closest('.tree-item');
                const kids = item.querySelector('.tree-children');
                const arrowImg = btn.querySelector('.tree-arrow');
                if (kids) {
                    const open = kids.classList.toggle('open');
                    btn.classList.toggle('expanded', open);
                    if (arrowImg) {
                        arrowImg.src = open ? 'public/arrowDown.svg' : 'public/arrowRight.svg';
                        arrowImg.setAttribute('data-arrow', open ? 'down' : 'right');
                    }
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
        if (D.search) {
            D.search.addEventListener('input', e => updateTreeSearch(e.target.value));
            D.search.addEventListener('keydown', e => {
                if (e.key === 'Escape') {
                    e.target.value = '';
                    updateTreeSearch('');
                }
            });
        }
        if (D.searchClear) {
            D.searchClear.hidden = true;
            D.searchClear.addEventListener('click', () => {
                if (D.search) {
                    D.search.value = '';
                    updateTreeSearch('');
                    D.search.focus();
                }
            });
        }
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
        if (D.exp) D.exp.addEventListener('click', () => togFold(true));
        if (D.col) D.col.addEventListener('click', () => togFold(false));
        if (D.all) D.all.addEventListener('click', () => togCheck(true));
        if (D.none) D.none.addEventListener('click', () => togCheck(false));
        if (D.gen) D.gen.addEventListener('click', gen);
        if (D.copy) D.copy.addEventListener('click', copyClip);
        if (D.txt) D.txt.addEventListener('click', () => dl('txt'));
        initSidebarResizer();
        // Clear All button
        const clearBtn = $('clearAll');
        if (clearBtn) {
            clearBtn.onclick = clearAll;
        }
        document.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') { 
                e.preventDefault(); 
                if (D.side) D.side.classList.toggle('collapsed'); 
            }
        });
    }
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
