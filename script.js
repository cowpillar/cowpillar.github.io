document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;

    function toggleTheme() {
        body.classList.toggle("light-mode");
        body.classList.toggle("animated-gradient");
        localStorage.setItem("theme", body.classList.contains("light-mode") ? "light" : "dark");
    }

    if (localStorage.getItem("theme") === "light") {
        body.classList.add("light-mode");
    } else {
        body.classList.add("animated-gradient");
    }

    document.querySelector(".theme-toggle").addEventListener("click", toggleTheme);
});
