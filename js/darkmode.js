
const btnDarkToLight = document.getElementById("mode-btn");
const iconDarkToLight = document.querySelector("#mode-btn i");
const mode = document.getElementById("mode");


if (localStorage.getItem("mode") === "dark") {
    mode.href = "./css/dark.css";
}
if (localStorage.getItem("mode") === "dark") {
    mode.href = "./css/dark.css";
    iconDarkToLight.classList.add("bxs-sun");
} else {
    mode.href = "./css/light.css";
    iconDarkToLight.classList.add("bxs-moon");
}

btnDarkToLight.addEventListener("click", () => {
    if (mode.href.includes("light.css")) {
        mode.href = "./css/dark.css";

        iconDarkToLight.classList.remove("bxs-moon");
        iconDarkToLight.classList.add("bxs-sun");
        localStorage.setItem("mode", "dark");
    } else {
        mode.href = "./css/light.css";
        iconDarkToLight.classList.remove("bxs-sun");
        iconDarkToLight.classList.add("bxs-moon");
        localStorage.setItem("mode", "light");
    }
});
