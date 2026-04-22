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
        document.querySelector('.home-details h1').textContent = home.name;

        const h2 = document.querySelector('.home-details h2');
        const rolesHtml = home.roles.map((role, i) => {
            const idx = home.roles.length - i;
            const safe = escapeHtml(role);
            return `<span style="--i:${idx};" data-text="${safe}">${safe}</span>`;
        }).join('\n');
        h2.innerHTML = `I'm a ${rolesHtml}`;

        document.querySelector('.home-details > p').textContent = home.description;

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
                <p class="year">${escapeHtml(it.year)}</p>
                <h3>${escapeHtml(it.title)}</h3>
                <div class="company">${escapeHtml(it.company)}</div>
                <p>${escapeHtml(it.description)}</p>
            </div>
        `).join('');

        const expEl = document.querySelector('.resume-details.experience');
        expEl.querySelector('.desc').textContent = resume.experience.description;
        expEl.querySelector('.resume-list').innerHTML = renderItems(resume.experience.items);

        const eduEl = document.querySelector('.resume-details.education');
        eduEl.querySelector('.desc').textContent = resume.education.description;
        eduEl.querySelector('.resume-list').innerHTML = renderItems(resume.education.items);

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
        const box = document.querySelector('#portfolio-box');
        const imgSlide = document.querySelector('#img-slide');

        box.innerHTML = projects.map((p, i) => {
            const num = String(i + 1).padStart(2, '0');
            const techHtml = p.tech.map(t => `
                <span class="tech-icon" data-tooltip="${escapeHtml(t.name)}">
                    <i class='bx ${escapeHtml(t.icon)}' style='color:${escapeHtml(t.color)}'></i>
                </span>
            `).join('');
            const demoLink = p.demoUrl ? `
                <a href="${escapeHtml(p.demoUrl)}" target="_blank" rel="noopener" data-tooltip="Live Demo">
                    <i class='bx bx-arrow-back'></i>
                </a>` : '';
            const githubLink = p.githubUrl ? `
                <a href="${escapeHtml(p.githubUrl)}" target="_blank" rel="noopener" data-tooltip="GitHub">
                    <i class='bx bxl-github'></i>
                </a>` : '';
            return `
                <div class="portfolio-details ${i === 0 ? 'active' : ''}">
                    <p class="numb">${num}</p>
                    <h3>${escapeHtml(p.title)}</h3>
                    <p>${escapeHtml(p.description)}</p>
                    <div class="tech"><p>${techHtml}</p></div>
                    <div class="live-github">${demoLink}${githubLink}</div>
                </div>
            `;
        }).join('');

        imgSlide.innerHTML = projects.map((p, i) => `
            <div class="img-item">
                <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}">
            </div>
        `).join('');
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

        const saved = localStorage.getItem('mode');
        if (saved === 'dark') {
            mode.href = './css/dark.css';
            icon.classList.add('bxs-sun');
        } else {
            mode.href = './css/light.css';
            icon.classList.add('bxs-moon');
        }

        btn.addEventListener('click', () => {
            if (mode.href.includes('light.css')) {
                mode.href = './css/dark.css';
                icon.classList.replace('bxs-moon', 'bxs-sun');
                localStorage.setItem('mode', 'dark');
            } else {
                mode.href = './css/light.css';
                icon.classList.replace('bxs-sun', 'bxs-moon');
                localStorage.setItem('mode', 'light');
            }
        });
    };

    const setFooterYear = () => {
        const el = document.getElementById('year');
        if (el) el.textContent = new Date().getFullYear();
    };

    try {
        const data = await loadData();
        renderHome(data.home);
        renderResume(data.resume);
        renderProjects(data.projects);
        renderContact(data.contact);
        initNav();
        initResumeTabs();
        initCarousel(data.projects.length);
        initDarkMode();
        setFooterYear();
    } catch (err) {
        console.error('Failed to load portfolio data:', err);
    } finally {
        document.body.classList.add('loaded');
    }
})();
