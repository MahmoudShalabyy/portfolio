let counter = 1;

let box = document.getElementById("portfolio-box");
let imgBox = document.getElementById("img-slide");

let Projects = [
    {
        headProj: "Paper Shelf - Online Bookstore",
        descProj: "A Full-Featured Online Bookstore Platform (Front-End & Back-End & AI) Offering Multi-Role Access (Admin, Author, User) with Advanced Authentication, Ai Summary of Books, Complete E-Commerce Experience, and Integrated Payment Gateway.",
        techProj: `
        <span class="tech-icon" data-tooltip="Angular"><i class='bx bxl-angular' style='color:#dd0031'></i></span>
        <span class="tech-icon" data-tooltip="TypeScript"><i class='bx bxl-typescript' style='color:#3178c6'></i></span>
        <span class="tech-icon" data-tooltip="Bootstrap 5"><i class='bx bxl-bootstrap' style='color:#7952b3'></i></span>
        <span class="tech-icon" data-tooltip="Node.js"><i class='bx bxl-nodejs' style='color:#68a063'></i></span>
        <span class="tech-icon" data-tooltip="MongoDB"><i class='bx bxl-mongodb' style='color:#47a248'></i></span>
        <span class="tech-icon" data-tooltip="Paypal API"><i class='bx bxl-paypal' style='color:#003087'></i></span>
        <span class="tech-icon" data-tooltip="AI Integration"><i class='bx bxs-brain' style='color:#ff6f61'></i></span>
`,
        demoProj: "https://paper-shelf-front-endd-pent.vercel.app/",
        githubProj: "https://github.com/MahmoudShalabyy/PaperShelf-backEnd.git",
        imgProj: "../images/project/papershelf.png",
    },
    {
        headProj: "Pack&Go E-commerce",
        descProj: "Complete e-commerce website for travel bags and accessories, featuring responsive web design for mobile and desktop. Integrated Firebase authentication with Google sign-in, secure checkout with PayPal, and Firestore for real-time order tracking. Included admin dashboard for product and user management.",
        techProj: `
        <span class="tech-icon" data-tooltip="HTML5"><i class='bx bxl-html5' style='color:#e34c26'></i></span>
        <span class="tech-icon" data-tooltip="CSS3"><i class='bx bxl-css3' style='color:#264de4'></i></span>
        <span class="tech-icon" data-tooltip="Javascript"><i class='bx bxl-javascript' style='color:#f0db4f'></i></span>
        <span class="tech-icon" data-tooltip="Firebase"><i class='bx bxl-firebase' style='color:#ffcb2b'></i></span>
        <span class="tech-icon" data-tooltip="Paypal APi"><i class='bx bxl-paypal' style='color:#003087'></i></span>
        <span class="tech-icon" data-tooltip="Netlify Hosting"><i class='bx bxl-netlify' style='color:#00c7b7'></i></span>
`,
        demoProj: "https://packgotrial.netlify.app/",
        githubProj: "https://github.com/MahmoudShalabyy/PackAndGo.git",
        imgProj: "./images/project/packandgo.png",
    },

    {
        headProj: "Hair Pilot Salon With AI",
        descProj: "Smart Angular-based web app for personalized haircut suggestions using AI-powered face shape detection. Features include real-time recommendations with visual previews, online salon booking stored in Firestore, form validation, and a responsive UI. Includes service galleries, booking system, and organized navigation.",
        techProj: `
                <span class="tech-icon" data-tooltip="Angular"><i class='bx bxl-angular' style='color:#dd0031'></i></span>
                <span class="tech-icon" data-tooltip="face-api"><i class='bx bxs-brain' style='color:#ff6f61'></i></span>
                <span class="tech-icon" data-tooltip="Firebase"><i class='bx bxl-firebase' style='color:#ffcb2b'></i></span>
                <span class="tech-icon" data-tooltip="HTML5"><i class='bx bxl-html5' style='color:#e34c26'></i></span>
                <span class="tech-icon" data-tooltip="CSS3"><i class='bx bxl-css3' style='color:#264de4'></i></span>
                <span class="tech-icon" data-tooltip="Bootstrap5"><i class='bx bxl-bootstrap' style='color:#563d7c'></i></span>
`,
        demoProj: "https://hair-pilot.vercel.app/home",
        githubProj: "https://github.com/MahmoudShalabyy/HairPilot.git",
        imgProj: "./images/project/hairpilot.png"
    },

    {
        headProj: "MEDNIOVA - Medical Clinic",
        descProj: "Designed and developed a modern, responsive landing page for a medical clinic using vanilla HTML, CSS, and JavaScript. Features smooth scrolling, a clean menu layout with service images and pricing, and optimized responsiveness across all devices. Perfect for showcasing services and engaging patients online.",
        techProj: `
        <span class="tech-icon" data-tooltip="HTML5"><i class='bx bxl-html5' style='color:#e34c26'></i></span>
        <span class="tech-icon" data-tooltip="CSS3"><i class='bx bxl-css3' style='color:#264de4'></i></span>
        <span class="tech-icon" data-tooltip="Javascript"><i class='bx bxl-javascript' style='color:#f0db4f'></i></span>
        <span class="tech-icon" data-tooltip="Animation"><i class='bx bx-font' style='color:#000000'></i></span>
        <span class="tech-icon" data-tooltip="GitHub"><i class='bx bxl-github' style='color:#171515'></i></span>
`,
        demoProj: "https://mahmoudshalabyy.github.io/site1/3.html",
        githubProj: "https://github.com/MahmoudShalabyy/site1.git",
        imgProj: "./images/project/d.png"
    },
    {
        headProj: "Coffee Corner Landing Page",
        descProj: "Designed and developed a modern, responsive landing page for a coffee shop using vanilla HTML, CSS, and JavaScript. Features smooth scrolling, a clean menu layout with product images and pricing, and optimized responsiveness across all devices. Perfect for showcasing services and engaging customers online.",
        techProj: `
        <span class="tech-icon" data-tooltip="HTML5"><i class='bx bxl-html5' style='color:#e34c26'></i></span>
        <span class="tech-icon" data-tooltip="CSS3"><i class='bx bxl-css3' style='color:#264de4'></i></span>
        <span class="tech-icon" data-tooltip="Javascript"><i class='bx bxl-javascript' style='color:#f0db4f'></i></span>
        <span class="tech-icon" data-tooltip="Animation"><i class='bx bx-font' style='color:#000000'></i></span>
        <span class="tech-icon" data-tooltip="GitHub"><i class='bx bxl-github' style='color:#171515'></i></span>
`,
        demoProj: "https://badawy24.github.io/Coffee_Corner/",
        githubProj: "https://github.com/Badawy24/Coffee_Corner",
        imgProj: "./images/project/coffeecorner.png"
    },

];

Projects.forEach((project) => {
    box.innerHTML += `
        <div class="portfolio-details ${counter === 1 ? 'active' : ''}">
            <p class="numb">0${counter}</p>
            <h3>${project.headProj}</h3>
            <p>${project.descProj}</p>
            <div class="tech">
            <p>
            ${project.techProj}
            </p>
            </div>
           <div class="live-github" name="live-github">
             <a href="${project.demoProj}" target="_blank" data-tooltip="Live Demo">
              <i class='bx bx-arrow-back'></i>
             </a>
                <a href="${project.githubProj}" target="_blank" data-tooltip="GitHub">
                    <i class='bx bxl-github'></i>
                </a>
</div>

        </div>
    `;
    imgBox.innerHTML += `
        <div class="img-item">
            <img src="${project.imgProj}" alt="slide${counter}">
        </div>
    `;
    counter++;
});

// ************************************************
let arrowRight = document.querySelector('.portfolio-box .navigation .arrow-right');
let arrowLeft = document.querySelector('.portfolio-box .navigation .arrow-left');

let currentSlide = 0;

let activePortfolio = () => {
    let imgSlide = document.querySelector('.portfolio-carousel .img-slide');
    let portfolioDetails = document.querySelectorAll('.portfolio-details');


    imgSlide.style.transform = `translateX(calc(${currentSlide * -100}% - ${currentSlide * 2}rem))`;

    portfolioDetails.forEach(detail => {
        detail.classList.remove('active');
    });
    portfolioDetails[currentSlide].classList.add('active');

}

arrowRight.addEventListener('click', () => {
    if (currentSlide < Projects.length - 1) {
        currentSlide++;
        arrowLeft.classList.remove('disabled');
    }
    else {
        arrowRight.classList.add('disabled');
    }
    activePortfolio();
});
arrowLeft.addEventListener('click', () => {
    if (currentSlide > 0) {
        currentSlide--;
        arrowRight.classList.remove('disabled');
    }
    else {
        currentSlide = 0;
        arrowLeft.classList.add('disabled');
    }
    activePortfolio();
});
