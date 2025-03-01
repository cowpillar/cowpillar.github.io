window.addEventListener("scroll", function () {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });

    setTimeout(() => {
        window.location.href = "next.html";
    }, 500); // Slight delay before redirecting
});
