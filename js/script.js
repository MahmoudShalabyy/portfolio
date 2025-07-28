const navLinks = document.querySelectorAll('header nav a');
const logoLink = document.querySelector('.logo');
const sections = document.querySelectorAll('section');
const menuIcon = document.querySelector('#menu-icon');
const nav = document.querySelector('nav');

const resumeBtns = document.querySelectorAll('.resume-btn');




menuIcon.addEventListener('click', () => {
    menuIcon.classList.toggle('bx-x');
    if (menuIcon.classList.contains('bx-x')) {
        nav.style.display = 'block';
    } else {
        nav.style.display = 'none';
    }
});

const activePage = () => {
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    sections.forEach(section => {
        section.classList.remove('active');
    });
    if (menuIcon.classList.contains('bx-x')) {
        nav.style.display = 'none';
    }
    menuIcon.classList.remove('bx-x');
}


navLinks.forEach((link, index) => {
    link.addEventListener('click', () => {
        if (!link.classList.contains('active')) {
            activePage();
            link.classList.add('active');
            sections[index].classList.add('active');
        }
    });
});

logoLink.addEventListener('click', () => {
    if (!navLinks[0].classList.contains('active')) {
        activePage();
        navLinks[0].classList.add('active');
        sections[0].classList.add('active');
    }
});



resumeBtns.forEach((btn, index) => {
    // index is refere to the button which clicked
    btn.addEventListener('click', () => {
        const resumeDetails = document.querySelectorAll('.resume-details');
        resumeBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        btn.classList.add('active');

        resumeDetails.forEach(details => {
            details.classList.remove('active');
        });
        resumeDetails[index].classList.add('active');
    });
});
