(async () => {
    const DATA_URL = './data.json';

    const loadData = async () => {
        try {
            const remote = await window.SupabaseAPI.fetchPortfolio();
            if (remote && Object.keys(remote).length > 0) {
                return remote;
            }
        } catch (err) {
            console.warn('Supabase fetch failed, falling back to data.json', err);
        }
        const res = await fetch(DATA_URL);
        return await res.json();
    };

    const escapeHtml = (str) => String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const renderHome = (home) => {
        const details = document.querySelector('.home-details');

        // Availability badge (top of home)
        let badge = details.querySelector('.status-badge');
        if (home.available) {
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'status-badge';
                badge.innerHTML = `<span class="status-dot"></span><span>Available for work</span>`;
                details.insertBefore(badge, details.firstChild);
            }
        } else if (badge) {
            badge.remove();
        }

        document.querySelector('.home-details h1').textContent = home.name;

        const h2 = document.querySelector('.home-details h2');
        const rolesHtml = home.roles.map((role, i) => {
            const idx = home.roles.length - i;
            const safe = escapeHtml(role);
            return `<span style="--i:${idx};" data-text="${safe}">${safe}</span>`;
        }).join('\n');
        h2.innerHTML = `I'm a ${rolesHtml}`;

        document.querySelector('.home-details > p').textContent = home.description;

        // Stats row
        let statsEl = details.querySelector('.hero-stats');
        if (Array.isArray(home.stats) && home.stats.length) {
            if (!statsEl) {
                statsEl = document.createElement('div');
                statsEl.className = 'hero-stats';
                const socialSection = details.querySelector('.social-section');
                details.insertBefore(statsEl, socialSection);
            }
            statsEl.innerHTML = home.stats.map(s => `
                <div class="stat-item">
                    <div class="stat-value">${escapeHtml(s.value)}</div>
                    <div class="stat-label">${escapeHtml(s.label)}</div>
                </div>
            `).join('');
        } else if (statsEl) {
            statsEl.remove();
        }

        const cvBtn = document.querySelector('.home-details .social-section .btn');
        cvBtn.href = home.cvLink;

        const socialBox = document.querySelector('.home-details .social-section .social');
        socialBox.innerHTML = home.socials.map(s => `
            <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener" title="${escapeHtml(s.name)}" class="bx-burst-hover">
                <i class="bx ${escapeHtml(s.icon)}"></i>
            </a>
        `).join('');

        const profileImg = document.querySelector('.home-img .img-item img');
        profileImg.src = home.profileImage;
        profileImg.alt = `${home.name} profile picture`;
    };

    const renderResume = (resume) => {
        const mainBox = document.querySelector('.resume-main-box');
        mainBox.querySelector('h2').textContent = resume.headline;
        mainBox.querySelector('.desc').textContent = resume.summary;

        const renderItems = (items) => items.map(it => `
            <div class="resume-item">
                <span class="resume-item-arrow"></span>
                <p class="year">${escapeHtml(it.year)}</p>
                <h3>${escapeHtml(it.title)}</h3>
                <div class="company">${escapeHtml(it.company)}</div>
                <p>${escapeHtml(it.description)}</p>
            </div>
        `).join('');

        const expEl = document.querySelector('.resume-details.experience');
        expEl.querySelector('.desc').textContent = resume.experience.description;
        const expList = expEl.querySelector('.resume-list');
        expList.classList.add('timeline');
        expList.innerHTML = renderItems(resume.experience.items);

        const eduEl = document.querySelector('.resume-details.education');
        eduEl.querySelector('.desc').textContent = resume.education.description;
        const eduList = eduEl.querySelector('.resume-list');
        eduList.classList.add('timeline');
        eduList.innerHTML = renderItems(resume.education.items);

        const skillsEl = document.querySelector('.resume-details.skills');
        skillsEl.querySelector('.desc').innerHTML = resume.skills.description;
        skillsEl.querySelector('.resume-list').innerHTML = resume.skills.items.map(s => `
            <div class="resume-item skill">
                <i class='bx ${escapeHtml(s.icon)}' style='color:${escapeHtml(s.color)}'></i>
                <span>${escapeHtml(s.name)}</span>
            </div>
        `).join('');

        const aboutEl = document.querySelector('.resume-details.about');
        aboutEl.querySelector('.desc').textContent = resume.about.description;
        aboutEl.querySelector('.resume-list').innerHTML = resume.about.info.map(item => `
            <div class="resume-item">
                <p>${escapeHtml(item.label)} :<span>${escapeHtml(item.value)}</span></p>
            </div>
        `).join('');
    };

    const renderProjects = (projects) => {
        // Legacy carousel (hidden now) — kept alive for initCarousel
        const box = document.querySelector('#portfolio-box');
        const imgSlide = document.querySelector('#img-slide');
        if (box) {
            box.innerHTML = projects.map((p, i) => {
                const num = String(i + 1).padStart(2, '0');
                return `<div class="portfolio-details ${i === 0 ? 'active' : ''}"><p class="numb">${num}</p><h3>${escapeHtml(p.title)}</h3></div>`;
            }).join('');
        }
        if (imgSlide) {
            imgSlide.innerHTML = projects.map(p => `
                <div class="img-item"><img src="${escapeHtml(p.image || '')}" alt="${escapeHtml(p.title)}"></div>
            `).join('');
        }

        renderFeaturedProject(projects);
        renderProjectsGrid(projects);
    };

    const techBadge = (t) => `
        <span class="tech-pill" data-tooltip="${escapeHtml(t.name)}">
            <i class='bx ${escapeHtml(t.icon)}' style='color:${escapeHtml(t.color)}'></i>
            <span>${escapeHtml(t.name)}</span>
        </span>
    `;

    const renderFeaturedProject = (projects) => {
        const el = document.getElementById('featured-project');
        if (!el || !projects?.length) return;
        // Pick the project marked as featured, otherwise fall back to the first one
        const featuredIndex = projects.findIndex(p => p && p.featured);
        const p = featuredIndex >= 0 ? projects[featuredIndex] : projects[0];
        const displayNum = String((featuredIndex >= 0 ? featuredIndex : 0) + 1).padStart(2, '0');
        const demoLink = p.demoUrl ? `
            <a href="${escapeHtml(p.demoUrl)}" target="_blank" rel="noopener" class="featured-cta">
                <i class='bx bx-link-external'></i> View Live
            </a>` : '';
        const githubLink = p.githubUrl ? `
            <a href="${escapeHtml(p.githubUrl)}" target="_blank" rel="noopener" class="featured-cta ghost">
                <i class='bx bxl-github'></i> Source Code
            </a>` : '';
        const imgOrPlaceholder = p.image
            ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}">`
            : `<div class="img-placeholder"><i class='bx bx-image'></i><span>Add screenshot from admin</span></div>`;

        el.innerHTML = `
            <div class="featured-visual">
                <div class="featured-badge"><span class="pulse-dot"></span> FEATURED</div>
                ${imgOrPlaceholder}
            </div>
            <div class="featured-content">
                <p class="featured-index">${displayNum} / ${String(projects.length).padStart(2, '0')}</p>
                <h3 class="featured-title">${escapeHtml(p.title)}</h3>
                <p class="featured-desc">${escapeHtml(p.description)}</p>
                <div class="featured-tech">${(p.tech || []).map(techBadge).join('')}</div>
                <div class="featured-actions">${demoLink}${githubLink}</div>
            </div>
        `;
    };

    const renderProjectsGrid = (projects) => {
        const grid = document.getElementById('projects-grid');
        if (!grid) return;
        // Exclude whichever project is shown as featured
        const featuredIndex = projects.findIndex(p => p && p.featured);
        const skipIndex = featuredIndex >= 0 ? featuredIndex : 0;
        const rest = projects.filter((_, i) => i !== skipIndex);
        if (!rest.length) {
            grid.innerHTML = '';
            grid.previousElementSibling?.style.setProperty('display', 'none');
            return;
        }

        grid.innerHTML = rest.map((p, i) => {
            // Preserve original project index for display number
            const origIndex = projects.indexOf(p);
            const num = String(origIndex + 1).padStart(2, '0');
            const demoLink = p.demoUrl ? `
                <a href="${escapeHtml(p.demoUrl)}" target="_blank" rel="noopener" class="card-link primary">
                    <i class='bx bx-link-external'></i><span>Live Demo</span>
                </a>` : '';
            const githubLink = p.githubUrl ? `
                <a href="${escapeHtml(p.githubUrl)}" target="_blank" rel="noopener" class="card-link ghost">
                    <i class='bx bxl-github'></i><span>Code</span>
                </a>` : '';
            const img = p.image
                ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" loading="lazy">`
                : `<div class="img-placeholder small"><i class='bx bx-image'></i></div>`;
            const techPreview = (p.tech || []).slice(0, 4).map(t => `
                <span class="mini-tech" title="${escapeHtml(t.name)}">
                    <i class='bx ${escapeHtml(t.icon)}' style='color:${escapeHtml(t.color)}'></i>
                </span>
            `).join('');
            const extra = (p.tech || []).length > 4
                ? `<span class="mini-tech more">+${(p.tech || []).length - 4}</span>` : '';

            return `
                <article class="project-card">
                    <div class="project-card-visual">
                        ${img}
                    </div>
                    <div class="project-card-body">
                        <span class="project-card-num">${num}</span>
                        <h4>${escapeHtml(p.title)}</h4>
                        <p>${escapeHtml(p.description)}</p>
                        <div class="project-card-tech">${techPreview}${extra}</div>
                        <div class="project-card-actions">${demoLink}${githubLink}</div>
                    </div>
                </article>
            `;
        }).join('');
    };

    const renderContact = (contact) => {
        const contactBox = document.querySelector('.contact .contact-box');
        contactBox.querySelector('h2').textContent = contact.heading;
        contactBox.querySelector('.desc').textContent = contact.description;

        const [phoneDetails, emailDetails] = contactBox.querySelectorAll('.contact-details:not(.contact-socials)');
        phoneDetails.querySelectorAll('.details p')[1].textContent = contact.phone;
        emailDetails.querySelectorAll('.details p')[1].textContent = contact.email;

        const socialsEl = contactBox.querySelector('.contact-socials');
        socialsEl.innerHTML = contact.socials.map(s => `
            <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener" title="${escapeHtml(s.name)}">
                <i class="bx ${escapeHtml(s.icon)} bx-tada-hover"></i>
            </a>
        `).join('');
    };

    const initNav = () => {
        const menuIcon = document.querySelector('#menu-icon');
        const nav = document.querySelector('header nav');
        const navLinks = document.querySelectorAll('header nav a');
        const sections = document.querySelectorAll('section[id]');

        menuIcon.addEventListener('click', () => {
            menuIcon.classList.toggle('bx-x');
            nav.classList.toggle('open');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuIcon.classList.remove('bx-x');
                nav.classList.remove('open');
            });
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => {
                        const target = link.getAttribute('href').replace('#', '');
                        link.classList.toggle('active', target === entry.target.id);
                    });
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

        sections.forEach(s => observer.observe(s));
    };

    const initResumeTabs = () => {
        const btns = document.querySelectorAll('.resume-btn');
        const details = document.querySelectorAll('.resume-details');
        btns.forEach((btn, i) => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                details.forEach(d => d.classList.remove('active'));
                btn.classList.add('active');
                details[i].classList.add('active');
            });
        });
    };

    const initCarousel = (projectsCount) => {
        const arrowRight = document.querySelector('.portfolio-box .navigation .arrow-right');
        const arrowLeft = document.querySelector('.portfolio-box .navigation .arrow-left');
        const imgSlide = document.querySelector('.portfolio-carousel .img-slide');
        const details = document.querySelectorAll('.portfolio-details');
        let current = 0;

        const update = () => {
            imgSlide.style.transform = `translateX(calc(${current * -100}% - ${current * 2}rem))`;
            details.forEach(d => d.classList.remove('active'));
            details[current].classList.add('active');
            arrowLeft.classList.toggle('disabled', current === 0);
            arrowRight.classList.toggle('disabled', current === projectsCount - 1);
        };

        arrowRight.addEventListener('click', () => {
            if (current < projectsCount - 1) { current++; update(); }
        });
        arrowLeft.addEventListener('click', () => {
            if (current > 0) { current--; update(); }
        });

        update();
    };

    const initDarkMode = () => {
        const btn = document.getElementById('mode-btn');
        const icon = btn.querySelector('i');
        const mode = document.getElementById('mode');

        const applyMode = (which) => {
            if (which === 'dark') {
                mode.href = './css/dark.css';
                document.body.classList.add('dark-mode');
                document.body.classList.remove('light-mode');
                icon.classList.remove('bxs-moon');
                icon.classList.add('bxs-sun');
            } else {
                mode.href = './css/light.css';
                document.body.classList.add('light-mode');
                document.body.classList.remove('dark-mode');
                icon.classList.remove('bxs-sun');
                icon.classList.add('bxs-moon');
            }
        };

        const saved = localStorage.getItem('mode');
        applyMode(saved === 'light' ? 'light' : 'dark');

        btn.addEventListener('click', () => {
            const next = mode.href.includes('light.css') ? 'dark' : 'light';
            applyMode(next);
            localStorage.setItem('mode', next);
        });
    };

    const setFooterYear = () => {
        const el = document.getElementById('year');
        if (el) el.textContent = new Date().getFullYear();
    };

    const initContactForm = () => {
        const form = document.getElementById('contact-form');
        if (!form) return;
        const cfg = window.PORTFOLIO_CONFIG || {};
        const successEl = document.getElementById('success-message');
        const errorEl = document.getElementById('error-message');
        const submitBtn = form.querySelector('input[type="submit"]');
        const originalBtnValue = submitBtn?.value || 'Send Message';

        if (!window.emailjs || !cfg.EMAILJS_PUBLIC_KEY) {
            console.warn('EmailJS not configured');
            return;
        }
        try {
            window.emailjs.init({ publicKey: cfg.EMAILJS_PUBLIC_KEY });
        } catch (e) { console.warn('EmailJS init failed:', e); }

        const hideMessages = () => {
            if (successEl) successEl.style.display = 'none';
            if (errorEl) errorEl.style.display = 'none';
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideMessages();

            const fd = new FormData(form);
            const params = {
                from_name: (fd.get('name') || '').toString().trim(),
                reply_to: (fd.get('email') || '').toString().trim(),
                email: (fd.get('email') || '').toString().trim(),
                subject: (fd.get('title') || '').toString().trim(),
                message: (fd.get('message') || '').toString().trim(),
            };

            if (!params.from_name || !params.reply_to || !params.message) {
                if (errorEl) {
                    errorEl.textContent = 'Please fill in all required fields.';
                    errorEl.style.display = 'block';
                }
                return;
            }

            submitBtn.disabled = true;
            submitBtn.value = 'Sending...';

            try {
                await window.emailjs.send(
                    cfg.EMAILJS_SERVICE_ID,
                    cfg.EMAILJS_TEMPLATE_ID,
                    params
                );
                if (successEl) {
                    successEl.textContent = 'Your message has been sent successfully!';
                    successEl.style.display = 'block';
                }
                form.reset();
            } catch (err) {
                console.error('EmailJS send failed:', err);
                if (errorEl) {
                    errorEl.textContent = 'Could not send message. Please try again later.';
                    errorEl.style.display = 'block';
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.value = originalBtnValue;
            }
        });
    };

    const initHeaderScroll = () => {
        const onScroll = () => {
            document.body.classList.toggle('scrolled', window.scrollY > 20);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    };

    const renderMarquee = (skills) => {
        const track = document.getElementById('marquee-track');
        if (!track || !Array.isArray(skills) || !skills.length) return;

        // Pick a curated subset for the marquee (skip duplicates-looking items)
        const preferred = ['Laravel', 'PHP', 'MySQL', 'Node.js', 'TypeScript', 'Angular', 'React',
            'JavaScript', 'MongoDB', 'Firebase', 'Git', 'REST API', 'Tailwind', 'Bootstrap', 'AI'];
        const chosen = skills.filter(s => preferred.includes(s.name));
        const list = chosen.length >= 6 ? chosen : skills.slice(0, 14);

        const itemHtml = (s) => `
            <span class="marquee-item">
                <i class='bx ${escapeHtml(s.icon)}' style='color:${escapeHtml(s.color)}'></i>
                <span>${escapeHtml(s.name)}</span>
            </span>
            <span class="marquee-separator">◆</span>
        `;
        // Duplicate content so the scroll wraps seamlessly
        track.innerHTML = list.map(itemHtml).join('') + list.map(itemHtml).join('');
    };

    const initScrollReveal = () => {
        const targets = document.querySelectorAll('section > .heading, .resume-container, .portfolio-containber, .contact-container, footer p');
        targets.forEach((el, i) => {
            el.classList.add('reveal');
            if (i % 3 === 1) el.classList.add('reveal-delay-1');
            if (i % 3 === 2) el.classList.add('reveal-delay-2');
        });
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
        targets.forEach(el => io.observe(el));
    };

    try {
        const data = await loadData();
        renderHome(data.home);
        renderResume(data.resume);
        renderMarquee(data.resume?.skills?.items);
        renderProjects(data.projects);
        renderContact(data.contact);
        initNav();
        initResumeTabs();
        initCarousel(data.projects.length);
        initDarkMode();
        setFooterYear();
        initHeaderScroll();
        initScrollReveal();
        initContactForm();
    } catch (err) {
        console.error('Failed to load portfolio data:', err);
    } finally {
        document.body.classList.add('loaded');
    }
})();
