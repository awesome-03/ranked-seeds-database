const shipwreckBtn = document.getElementById("shipwreck-btn");
const shipwreckContent = document.getElementById("shipwreck-content");

if (shipwreckBtn && shipwreckContent) {
  shipwreckBtn.addEventListener("click", () => {
    shipwreckBtn.classList.toggle("open");
    shipwreckContent.classList.toggle("open");
  });
}
