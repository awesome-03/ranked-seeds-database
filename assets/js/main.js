document.querySelectorAll(".overworld-extras button").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("open");
    const content = btn.nextElementSibling;
    if (content && content.classList.contains("expandable-content")) {
      content.classList.toggle("open");
    }
  });
});
