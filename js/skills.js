
let skillsBox = document.getElementById("skills-box");

let skills = [
    {
        icon: "<i class='bx bxl-html5' style='color:#e34c26'></i>",
        tag: "HTML5",
    },
    {
        icon: "<i class='bx bxl-css3' style='color:#264de4'></i>",
        tag: "CSS3",
    },
    {
        icon: "<i class='bx bxl-javascript' style='color:#f0db4f'></i>",
        tag: "JavaScript",
    },
    {
        icon: "<i class='bx bxl-typescript' style='color:#007acc'></i>",
        tag: "TypeScript",
    },
    {
        icon: "<i class='bx bxl-angular' style='color:#dd0031'></i>",
        tag: "Angular",
    },
    {
        icon: "<i class='bx bxl-bootstrap' style='color:#563d7c'></i>",
        tag: "Bootstrap",
    },
    {
        icon: "<i class='bx bxl-tailwind-css' style='color:#38bdf8'></i>",
        tag: "Tailwind",
    },
    {
        icon: "<i class='bx bxl-figma' style='color:#a259ff'></i>",
        tag: "Figma",
    },

    // ======= Back-End =======
    {
        icon: "<i class='bx bxl-php' style='color:#8892be'></i>",
        tag: "PHP",
    },
    {
        icon: "<i class='bx bxs-component' style='color:#ff2d20'></i>",
        tag: "Laravel",
    },
    {
        icon: "<i class='bx bxl-nodejs' style='color:#3c873a'></i>",
        tag: "Node.js",
    },

    // ======= Database =======
    {
        icon: "<i class='bx bxs-data' style='color:#4db33d'></i>",
        tag: "Database",
    },
    {
        icon: "<i class='bx bxl-mongodb' style='color:#47a248'></i>",
        tag: "MongoDB",
    },
    {
        icon: "<i class='bx bxl-postgresql' style='color:#336791'></i>",
        tag: "PostgreSQL",
    },
    {
        icon: "<i class='bx bxl-firebase' style='color:#ffcb2b'></i>",
        tag: "Firebase",
    },

    // ======= Tools =======
    {
        icon: "<i class='bx bxl-git' style='color:#f1502f'></i>",
        tag: "Git",
    },
    {
        icon: "<i class='bx bxl-github' style='color:#171515'></i>",
        tag: "GitHub",
    },
    {
        icon: "<i class='bx bx-code-block' style='color:#6c63ff'></i>",
        tag: "Code-Block",
    },
    {
        icon: "<i class='bx bxl-visual-studio' style='color:#0078d7'></i>",
        tag: "VS Code",
    },
    {
        icon: "<i class='bx bx-terminal' style='color:#4caf50'></i>",
        tag: "Terminal",
    },
    {
        icon: "<i class='bx bxl-netlify' style='color:#00c7b7'></i>",
        tag: "Netlify",
    },
    {
        icon: "<i class='bx bxl-paypal' style='color:#003087'></i>",
        tag: "PayPal API",
    },

    // ======= Other Skills =======
    {
        icon: "<i class='bx bxl-c-plus-plus' style='color:#00599c'></i>",
        tag: "C++",
    },
    {
        icon: "<i class='bx bxl-python' style='color:#FFCA3A'></i>",
        tag: "Python",
    },
    {
        icon: "<i class='bx bxl-java' style='color:#5382a1'></i>",
        tag: "Java",
    },
    {
        icon: "<i class='bx bxs-network-chart' style='color:#2b6777'></i>",
        tag: "Networking",
    },
    {
        icon: "<i class='bx bxs-cloud' style='color:#00aaff'></i>",
        tag: "Cloud",
    },
    {
        icon: "<i class='bx bxs-brain' style='color:#ff6f61'></i>",
        tag: "AI",
    },
]
;

skills.forEach((skill) => {
    skillsBox.innerHTML += `
        <div class="resume-item skill">
            ${skill.icon}
            <span>${skill.tag}</span>
        </div>
    `;
});
