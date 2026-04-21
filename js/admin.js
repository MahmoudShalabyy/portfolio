(() => {
    const DRAFT_KEY = 'portfolio-draft';

    let data = null;
    let dirty = false;

    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const loginError = document.getElementById('login-error');
    const loginSubmit = document.getElementById('login-submit');
    const saveStatus = document.getElementById('save-status');
    const saveBtn = document.getElementById('save-btn');

    function showDashboard() {
        loginScreen.hidden = true;
        dashboard.hidden = false;
        init();
    }

    function showLogin() {
        loginScreen.hidden = false;
        dashboard.hidden = true;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.textContent = '';
        loginSubmit.disabled = true;
        loginSubmit.textContent = 'Signing in...';
        try {
            await window.SupabaseAPI.signIn(emailInput.value.trim(), passwordInput.value);
            showDashboard();
        } catch (err) {
            loginError.textContent = err.message || 'Login failed';
            passwordInput.value = '';
            passwordInput.focus();
        } finally {
            loginSubmit.disabled = false;
            loginSubmit.textContent = 'Sign In';
        }
    });

    const togglePasswordBtn = document.getElementById('toggle-password');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const icon = togglePasswordBtn.querySelector('i');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.replace('bx-show', 'bx-hide');
            } else {
                passwordInput.type = 'password';
                icon.classList.replace('bx-hide', 'bx-show');
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (e.target.closest('#logout-btn')) {
            window.SupabaseAPI.signOut().then(() => location.reload());
        }
    });

    const loadData = async () => {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) {
            try { return { data: JSON.parse(draft), isDraft: true }; } catch (e) { /* fall through */ }
        }
        try {
            const remote = await window.SupabaseAPI.fetchPortfolio();
            if (remote && Object.keys(remote).length > 0) {
                return { data: remote, isDraft: false };
            }
        } catch (err) {
            console.warn('Fetch from Supabase failed, using data.json:', err);
        }
        const res = await fetch('./data.json');
        const seed = await res.json();
        return { data: seed, isDraft: true, needsSeed: true };
    };

    const saveDraft = () => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
        dirty = true;
        setStatus('Unsaved changes (draft)', 'unsaved');
    };

    const setStatus = (text, state = '') => {
        saveStatus.textContent = text;
        saveStatus.classList.toggle('unsaved', state === 'unsaved');
    };

    const init = async () => {
        try {
            const { data: loaded, isDraft, needsSeed } = await loadData();
            data = loaded;
            renderAll();
            attachTabs();
            attachSubTabs();
            attachGlobalButtons();
            attachPanelChangeListeners();
            if (needsSeed) {
                setStatus('Initial data loaded — click Publish Changes to sync with Supabase', 'unsaved');
                dirty = true;
                saveDraft();
            } else if (isDraft) {
                setStatus('Unsaved changes (draft)', 'unsaved');
                dirty = true;
            } else {
                setStatus('Published ✓');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to load portfolio data: ' + err.message);
        }
    };

    const renderAll = () => {
        renderHomePanel();
        renderResumePanel();
        renderProjectsPanel();
        renderContactPanel();
    };

    const attachTabs = () => {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                document.querySelector(`.tab-panel[data-panel="${tab}"]`).classList.add('active');
            });
        });
    };

    const attachSubTabs = () => {
        document.querySelectorAll('.sub-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.subtab;
                document.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                document.querySelector(`.sub-panel[data-subpanel="${tab}"]`).classList.add('active');
            });
        });
    };

    const attachGlobalButtons = () => {
        document.getElementById('download-btn').addEventListener('click', downloadJSON);
        document.getElementById('preview-btn').addEventListener('click', () => {
            window.open('./index.html', '_blank');
        });
        saveBtn.addEventListener('click', publishChanges);

        const reloadBtn = document.getElementById('reload-btn');
        if (reloadBtn) {
            reloadBtn.addEventListener('click', async () => {
                if (!confirm('Reload data from data.json file? This will discard your unsaved changes and load the latest data.json. You will need to click Publish Changes to save to Supabase.')) return;
                try {
                    localStorage.removeItem(DRAFT_KEY);
                    const res = await fetch('./data.json?t=' + Date.now());
                    data = await res.json();
                    renderAll();
                    saveDraft();
                    setStatus('Loaded from data.json — click Publish Changes to sync', 'unsaved');
                    dirty = true;
                } catch (err) {
                    alert('Failed to reload: ' + err.message);
                }
            });
        }

        document.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (!action) return;
            const actions = {
                'add-role': addRole,
                'add-home-social': () => addSocial('home'),
                'add-contact-social': () => addSocial('contact'),
                'add-experience': () => addResumeItem('experience'),
                'add-education': () => addResumeItem('education'),
                'add-skill': addSkill,
                'add-about': addAboutItem,
                'add-project': addProject,
                'add-tech': (btn) => addTech(btn),
            };
            if (actions[action]) {
                actions[action](e.target.closest('[data-action]'));
            }
        });
    };

    const publishChanges = async () => {
        if (!dirty) {
            alert('No changes to publish');
            return;
        }
        saveBtn.disabled = true;
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = "<i class='bx bx-loader bx-spin'></i> Publishing...";
        try {
            await window.SupabaseAPI.savePortfolio(data);
            localStorage.removeItem(DRAFT_KEY);
            dirty = false;
            setStatus('Published ✓');
            alert('Changes published successfully! Your portfolio is now updated.');
        } catch (err) {
            console.error(err);
            alert('Failed to publish: ' + err.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    };

    const attachPanelChangeListeners = () => {
        document.querySelector('.main-content').addEventListener('input', (e) => {
            const target = e.target;
            if (!target.matches('input, textarea')) return;
            handleFieldChange(target);
        });
    };

    const handleFieldChange = (el) => {
        const id = el.id;
        const path = el.dataset.path;

        if (id) {
            const simpleMap = {
                'home-name': ['home', 'name'],
                'home-description': ['home', 'description'],
                'home-cv-link': ['home', 'cvLink'],
                'home-profile-image': ['home', 'profileImage'],
                'resume-headline': ['resume', 'headline'],
                'resume-summary': ['resume', 'summary'],
                'experience-description': ['resume', 'experience', 'description'],
                'education-description': ['resume', 'education', 'description'],
                'skills-description': ['resume', 'skills', 'description'],
                'about-description': ['resume', 'about', 'description'],
                'contact-heading': ['contact', 'heading'],
                'contact-description': ['contact', 'description'],
                'contact-phone': ['contact', 'phone'],
                'contact-email': ['contact', 'email'],
            };
            if (simpleMap[id]) {
                setPath(data, simpleMap[id], el.value);
                saveDraft();
                return;
            }
        }

        if (path) {
            setPath(data, path.split('.'), el.value);
            saveDraft();
        }
    };

    const setPath = (obj, path, value) => {
        let cur = obj;
        for (let i = 0; i < path.length - 1; i++) {
            const key = path[i];
            const nextKey = path[i + 1];
            if (cur[key] === undefined || cur[key] === null) {
                cur[key] = /^\d+$/.test(nextKey) ? [] : {};
            }
            cur = cur[key];
        }
        cur[path[path.length - 1]] = value;
    };

    // ============ IMAGE COMPRESSION ============
    const compressImage = (file, maxDimension = 1600, quality = 0.82) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.onload = (e) => {
            const img = new Image();
            img.onerror = () => reject(new Error('Failed to load image'));
            img.onload = () => {
                let { width, height } = img;
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round(height * (maxDimension / width));
                        width = maxDimension;
                    } else {
                        width = Math.round(width * (maxDimension / height));
                        height = maxDimension;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                canvas.toBlob((blob) => {
                    if (!blob) return reject(new Error('Compression failed'));
                    const ext = mime === 'image/png' ? 'png' : 'jpg';
                    const compressed = new File([blob], `compressed.${ext}`, { type: mime });
                    resolve(compressed);
                }, mime, quality);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    // ============ IMAGE UPLOAD ============
    const attachImageUpload = (input, folder) => {
        const wrap = document.createElement('div');
        wrap.className = 'image-upload-wrap';
        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(input);

        const fileBtn = document.createElement('button');
        fileBtn.type = 'button';
        fileBtn.className = 'btn-upload';
        fileBtn.innerHTML = "<i class='bx bx-upload'></i> Upload";
        wrap.appendChild(fileBtn);

        const hiddenFile = document.createElement('input');
        hiddenFile.type = 'file';
        hiddenFile.accept = 'image/*';
        hiddenFile.style.display = 'none';
        wrap.appendChild(hiddenFile);

        fileBtn.addEventListener('click', () => hiddenFile.click());

        hiddenFile.addEventListener('change', async () => {
            const file = hiddenFile.files[0];
            if (!file) return;
            fileBtn.disabled = true;
            fileBtn.innerHTML = "<i class='bx bx-loader bx-spin'></i>";
            try {
                fileBtn.innerHTML = "<i class='bx bx-loader bx-spin'></i> Compressing...";
                const compressed = await compressImage(file);
                fileBtn.innerHTML = "<i class='bx bx-loader bx-spin'></i> Uploading...";
                const url = await window.SupabaseAPI.uploadImage(compressed, folder);
                input.value = url;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            } catch (err) {
                alert('Upload failed: ' + err.message);
            } finally {
                fileBtn.disabled = false;
                fileBtn.innerHTML = "<i class='bx bx-upload'></i> Upload";
                hiddenFile.value = '';
            }
        });
    };

    // ============ HOME ============
    const renderHomePanel = () => {
        document.getElementById('home-name').value = data.home?.name || '';
        document.getElementById('home-description').value = data.home?.description || '';
        document.getElementById('home-cv-link').value = data.home?.cvLink || '';
        const profileInput = document.getElementById('home-profile-image');
        profileInput.value = data.home?.profileImage || '';
        if (!profileInput.dataset.uploadAttached) {
            attachImageUpload(profileInput, 'profile');
            profileInput.dataset.uploadAttached = '1';
        }
        renderRoles();
        renderSocials('home');
    };

    const renderRoles = () => {
        const box = document.getElementById('home-roles');
        const roles = data.home?.roles || [];
        box.innerHTML = roles.map((role, i) => `
            <div class="list-item">
                <div class="item-header">
                    <span class="item-title">Role #${i + 1}</span>
                    <div class="item-actions">
                        <button class="icon-btn" data-move="home.roles" data-index="${i}" data-dir="up" ${i === 0 ? 'disabled' : ''}><i class='bx bx-up-arrow-alt'></i></button>
                        <button class="icon-btn" data-move="home.roles" data-index="${i}" data-dir="down" ${i === roles.length - 1 ? 'disabled' : ''}><i class='bx bx-down-arrow-alt'></i></button>
                        <button class="icon-btn danger" data-delete="home.roles" data-index="${i}"><i class='bx bx-trash'></i></button>
                    </div>
                </div>
                <div class="item-body">
                    <input type="text" value="${escAttr(role)}" data-path="home.roles.${i}">
                </div>
            </div>
        `).join('');
    };

    const addRole = () => {
        if (!data.home) data.home = {};
        if (!Array.isArray(data.home.roles)) data.home.roles = [];
        data.home.roles.push('New Role');
        saveDraft();
        renderRoles();
    };

    const renderSocials = (section) => {
        const box = document.getElementById(`${section}-socials`);
        if (!data[section]) data[section] = {};
        if (!Array.isArray(data[section].socials)) data[section].socials = [];
        const list = data[section].socials;
        box.innerHTML = list.map((s, i) => `
            <div class="list-item">
                <div class="item-header">
                    <span class="item-title">${escHtml(s.name || 'Social')}</span>
                    <div class="item-actions">
                        <button class="icon-btn" data-move="${section}.socials" data-index="${i}" data-dir="up" ${i === 0 ? 'disabled' : ''}><i class='bx bx-up-arrow-alt'></i></button>
                        <button class="icon-btn" data-move="${section}.socials" data-index="${i}" data-dir="down" ${i === list.length - 1 ? 'disabled' : ''}><i class='bx bx-down-arrow-alt'></i></button>
                        <button class="icon-btn danger" data-delete="${section}.socials" data-index="${i}"><i class='bx bx-trash'></i></button>
                    </div>
                </div>
                <div class="item-body cols-2">
                    <div><label>Name</label><input type="text" value="${escAttr(s.name)}" data-path="${section}.socials.${i}.name"></div>
                    <div><label>Icon (Boxicons)</label><input type="text" value="${escAttr(s.icon)}" data-path="${section}.socials.${i}.icon" placeholder="bxl-github"></div>
                    <div class="full-row"><label>URL</label><input type="url" value="${escAttr(s.url)}" data-path="${section}.socials.${i}.url"></div>
                </div>
            </div>
        `).join('');
    };

    const addSocial = (section) => {
        if (!data[section]) data[section] = {};
        if (!Array.isArray(data[section].socials)) data[section].socials = [];
        data[section].socials.push({ name: 'New', url: '', icon: 'bx-link' });
        saveDraft();
        renderSocials(section);
    };

    // ============ RESUME ============
    const ensureResume = () => {
        if (!data.resume) data.resume = {};
        if (!data.resume.experience) data.resume.experience = { description: '', items: [] };
        if (!data.resume.education) data.resume.education = { description: '', items: [] };
        if (!data.resume.skills) data.resume.skills = { description: '', items: [] };
        if (!data.resume.about) data.resume.about = { description: '', info: [] };
    };

    const renderResumePanel = () => {
        ensureResume();
        document.getElementById('resume-headline').value = data.resume.headline || '';
        document.getElementById('resume-summary').value = data.resume.summary || '';
        document.getElementById('experience-description').value = data.resume.experience.description || '';
        document.getElementById('education-description').value = data.resume.education.description || '';
        document.getElementById('skills-description').value = data.resume.skills.description || '';
        document.getElementById('about-description').value = data.resume.about.description || '';
        renderResumeItems('experience');
        renderResumeItems('education');
        renderSkills();
        renderAboutItems();
    };

    const renderResumeItems = (which) => {
        ensureResume();
        const box = document.getElementById(`${which}-items`);
        const list = data.resume[which].items || [];
        box.innerHTML = list.map((it, i) => `
            <div class="list-item">
                <div class="item-header">
                    <span class="item-title">${escHtml(it.title || 'Item')}</span>
                    <div class="item-actions">
                        <button class="icon-btn" data-move="resume.${which}.items" data-index="${i}" data-dir="up" ${i === 0 ? 'disabled' : ''}><i class='bx bx-up-arrow-alt'></i></button>
                        <button class="icon-btn" data-move="resume.${which}.items" data-index="${i}" data-dir="down" ${i === list.length - 1 ? 'disabled' : ''}><i class='bx bx-down-arrow-alt'></i></button>
                        <button class="icon-btn danger" data-delete="resume.${which}.items" data-index="${i}"><i class='bx bx-trash'></i></button>
                    </div>
                </div>
                <div class="item-body cols-2">
                    <div><label>Year</label><input type="text" value="${escAttr(it.year)}" data-path="resume.${which}.items.${i}.year"></div>
                    <div><label>Title</label><input type="text" value="${escAttr(it.title)}" data-path="resume.${which}.items.${i}.title"></div>
                    <div class="full-row"><label>Company / Institution</label><input type="text" value="${escAttr(it.company)}" data-path="resume.${which}.items.${i}.company"></div>
                    <div class="full-row"><label>Description</label><textarea data-path="resume.${which}.items.${i}.description">${escHtml(it.description)}</textarea></div>
                </div>
            </div>
        `).join('');
    };

    const addResumeItem = (which) => {
        ensureResume();
        data.resume[which].items.push({
            year: new Date().getFullYear().toString(),
            title: 'New Item',
            company: '',
            description: '',
        });
        saveDraft();
        renderResumeItems(which);
    };

    const renderSkills = () => {
        ensureResume();
        const box = document.getElementById('skills-items');
        const list = data.resume.skills.items || [];
        box.innerHTML = list.map((s, i) => `
            <div class="list-item">
                <div class="item-header">
                    <span class="item-title">${escHtml(s.name || 'Skill')}</span>
                    <div class="item-actions">
                        <button class="icon-btn" data-move="resume.skills.items" data-index="${i}" data-dir="up" ${i === 0 ? 'disabled' : ''}><i class='bx bx-up-arrow-alt'></i></button>
                        <button class="icon-btn" data-move="resume.skills.items" data-index="${i}" data-dir="down" ${i === list.length - 1 ? 'disabled' : ''}><i class='bx bx-down-arrow-alt'></i></button>
                        <button class="icon-btn danger" data-delete="resume.skills.items" data-index="${i}"><i class='bx bx-trash'></i></button>
                    </div>
                </div>
                <div class="item-body cols-icon">
                    <div><label>Name</label><input type="text" value="${escAttr(s.name)}" data-path="resume.skills.items.${i}.name"></div>
                    <div><label>Icon</label><input type="text" value="${escAttr(s.icon)}" data-path="resume.skills.items.${i}.icon" placeholder="bxl-html5"></div>
                    <div><label>Color</label><input type="color" value="${escAttr(s.color || '#3b82f6')}" data-path="resume.skills.items.${i}.color"></div>
                </div>
            </div>
        `).join('');
    };

    const addSkill = () => {
        ensureResume();
        data.resume.skills.items.push({ name: 'New Skill', icon: 'bx-code', color: '#3b82f6' });
        saveDraft();
        renderSkills();
    };

    const renderAboutItems = () => {
        ensureResume();
        const box = document.getElementById('about-items');
        const list = data.resume.about.info || [];
        box.innerHTML = list.map((it, i) => `
            <div class="list-item">
                <div class="item-header">
                    <span class="item-title">${escHtml(it.label || 'Field')}</span>
                    <div class="item-actions">
                        <button class="icon-btn" data-move="resume.about.info" data-index="${i}" data-dir="up" ${i === 0 ? 'disabled' : ''}><i class='bx bx-up-arrow-alt'></i></button>
                        <button class="icon-btn" data-move="resume.about.info" data-index="${i}" data-dir="down" ${i === list.length - 1 ? 'disabled' : ''}><i class='bx bx-down-arrow-alt'></i></button>
                        <button class="icon-btn danger" data-delete="resume.about.info" data-index="${i}"><i class='bx bx-trash'></i></button>
                    </div>
                </div>
                <div class="item-body cols-2">
                    <div><label>Label</label><input type="text" value="${escAttr(it.label)}" data-path="resume.about.info.${i}.label"></div>
                    <div><label>Value</label><input type="text" value="${escAttr(it.value)}" data-path="resume.about.info.${i}.value"></div>
                </div>
            </div>
        `).join('');
    };

    const addAboutItem = () => {
        ensureResume();
        data.resume.about.info.push({ label: 'New', value: '' });
        saveDraft();
        renderAboutItems();
    };

    // ============ PROJECTS ============
    const renderProjectsPanel = () => {
        if (!Array.isArray(data.projects)) data.projects = [];
        const box = document.getElementById('projects-list');
        box.innerHTML = data.projects.map((p, i) => renderProjectCard(p, i, data.projects.length)).join('');
        box.querySelectorAll('input[data-image-path]').forEach(input => {
            if (!input.dataset.uploadAttached) {
                attachImageUpload(input, 'projects');
                input.dataset.uploadAttached = '1';
            }
        });
    };

    const renderProjectCard = (p, i, total) => `
        <div class="project-item">
            <div class="item-header">
                <span class="item-title">#${i + 1} ${escHtml(p.title || 'Project')}</span>
                <div class="item-actions">
                    <button class="icon-btn" data-move="projects" data-index="${i}" data-dir="up" ${i === 0 ? 'disabled' : ''}><i class='bx bx-up-arrow-alt'></i></button>
                    <button class="icon-btn" data-move="projects" data-index="${i}" data-dir="down" ${i === total - 1 ? 'disabled' : ''}><i class='bx bx-down-arrow-alt'></i></button>
                    <button class="icon-btn danger" data-delete="projects" data-index="${i}"><i class='bx bx-trash'></i></button>
                </div>
            </div>
            <div class="item-body">
                <div class="full-row"><label>Title</label><input type="text" value="${escAttr(p.title)}" data-path="projects.${i}.title"></div>
                <div class="full-row"><label>Description</label><textarea data-path="projects.${i}.description">${escHtml(p.description)}</textarea></div>
                <div><label>Demo URL</label><input type="url" value="${escAttr(p.demoUrl)}" data-path="projects.${i}.demoUrl"></div>
                <div><label>GitHub URL</label><input type="url" value="${escAttr(p.githubUrl)}" data-path="projects.${i}.githubUrl"></div>
                <div class="full-row"><label>Image</label><input type="text" value="${escAttr(p.image)}" data-path="projects.${i}.image" data-image-path="1" placeholder="Upload or paste URL"></div>
                <div class="tech-section">
                    <label>Tech Stack</label>
                    <div class="tech-list">
                        ${(p.tech || []).map((t, ti) => `
                            <div class="tech-row">
                                <input type="text" value="${escAttr(t.name)}" placeholder="Name" data-path="projects.${i}.tech.${ti}.name">
                                <input type="text" value="${escAttr(t.icon)}" placeholder="bxl-..." data-path="projects.${i}.tech.${ti}.icon">
                                <input type="color" value="${escAttr(t.color || '#3b82f6')}" data-path="projects.${i}.tech.${ti}.color">
                                <button class="icon-btn danger" data-delete="projects.${i}.tech" data-index="${ti}"><i class='bx bx-x'></i></button>
                            </div>
                        `).join('')}
                    </div>
                    <button type="button" class="btn-add small-add" data-action="add-tech" data-project-index="${i}"><i class='bx bx-plus'></i> Add Tech</button>
                </div>
            </div>
        </div>
    `;

    const addProject = () => {
        if (!Array.isArray(data.projects)) data.projects = [];
        data.projects.push({ title: 'New Project', description: '', demoUrl: '', githubUrl: '', image: '', tech: [] });
        saveDraft();
        renderProjectsPanel();
    };

    const addTech = (btn) => {
        const idx = parseInt(btn.dataset.projectIndex, 10);
        if (!Array.isArray(data.projects[idx].tech)) data.projects[idx].tech = [];
        data.projects[idx].tech.push({ name: 'New', icon: 'bx-code', color: '#3b82f6' });
        saveDraft();
        renderProjectsPanel();
    };

    // ============ CONTACT ============
    const renderContactPanel = () => {
        if (!data.contact) data.contact = { socials: [] };
        document.getElementById('contact-heading').value = data.contact.heading || '';
        document.getElementById('contact-description').value = data.contact.description || '';
        document.getElementById('contact-phone').value = data.contact.phone || '';
        document.getElementById('contact-email').value = data.contact.email || '';
        renderSocials('contact');
    };

    // ============ MOVE / DELETE ============
    document.addEventListener('click', (e) => {
        const delBtn = e.target.closest('[data-delete]');
        const moveBtn = e.target.closest('[data-move]');

        if (delBtn) {
            const path = delBtn.dataset.delete.split('.');
            const idx = parseInt(delBtn.dataset.index, 10);
            const arr = getPath(data, path);
            if (!Array.isArray(arr)) return;
            if (!confirm('Delete this item?')) return;
            arr.splice(idx, 1);
            saveDraft();
            rerenderAfterMutation(path);
            return;
        }

        if (moveBtn) {
            const path = moveBtn.dataset.move.split('.');
            const idx = parseInt(moveBtn.dataset.index, 10);
            const dir = moveBtn.dataset.dir;
            const arr = getPath(data, path);
            if (!Array.isArray(arr)) return;
            const newIdx = dir === 'up' ? idx - 1 : idx + 1;
            if (newIdx < 0 || newIdx >= arr.length) return;
            [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
            saveDraft();
            rerenderAfterMutation(path);
        }
    });

    const getPath = (obj, path) => path.reduce((cur, key) => cur?.[key], obj);

    const rerenderAfterMutation = (path) => {
        const joined = path.join('.');
        if (joined === 'home.roles') return renderRoles();
        if (joined === 'home.socials') return renderSocials('home');
        if (joined === 'contact.socials') return renderSocials('contact');
        if (joined === 'resume.experience.items') return renderResumeItems('experience');
        if (joined === 'resume.education.items') return renderResumeItems('education');
        if (joined === 'resume.skills.items') return renderSkills();
        if (joined === 'resume.about.info') return renderAboutItems();
        if (joined === 'projects' || joined.startsWith('projects')) return renderProjectsPanel();
        renderAll();
    };

    const downloadJSON = () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const escHtml = (str) => String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const escAttr = (str) => String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // ============ AUTO-LOGIN ============
    window.SupabaseAPI.getSession().then(session => {
        if (session) {
            showDashboard();
        } else {
            showLogin();
        }
    });
})();
