// Overworld Dropdown selection handler
const overworldSelect = document.getElementById("overworlds");

function updateOverworldExtras() {
  const selectedValue = overworldSelect ? overworldSelect.value : "ALL";
  const container = document.querySelector(".overworld-extras");

  // Hide all structure extra sections
  document.querySelectorAll(".structure-extras").forEach((el) => {
    el.classList.remove("active");
  });

  // Show selected structure extra section if it exists and has content
  const activeExtra = document.getElementById(`extras-${selectedValue}`);
  if (activeExtra && activeExtra.children.length > 0) {
    activeExtra.classList.add("active");
    if (container) container.classList.add("active");
  } else {
    if (container) container.classList.remove("active");
  }
}

if (overworldSelect) {
  overworldSelect.addEventListener("change", updateOverworldExtras);
  updateOverworldExtras(); // Sync on load
}

// Expandable content toggle
document.querySelectorAll(".overworld-extras button").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("open");
    const content = btn.nextElementSibling;
    if (content && content.classList.contains("expandable-content")) {
      content.classList.toggle("open");
    }
  });
});

// 3-Way Switch Handler (Direct icon click + state cycle)
document.querySelectorAll(".switch-3way").forEach((sw) => {
  sw.addEventListener("click", (e) => {
    const targetState = e.target.getAttribute("data-set-state");
    const currentState = sw.getAttribute("data-state") || "neutral";
    const hiddenInput = sw.querySelector("input[type='hidden']");

    let newState = currentState;

    if (targetState) {
      newState = targetState;
    } else {
      if (currentState === "neutral") newState = "check";
      else if (currentState === "check") newState = "cross";
      else newState = "neutral";
    }

    sw.setAttribute("data-state", newState);
    if (hiddenInput) hiddenInput.value = newState;
  });
});

// 2-Way Switch Handler
document.querySelectorAll(".switch").forEach((sw) => {
  const checkbox = sw.querySelector("input[type='checkbox']");
  const checkIcon = sw.querySelector(".check-icon");
  const crossIcon = sw.querySelector(".cross-icon");

  if (checkIcon && checkbox) {
    checkIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      checkbox.checked = true;
    });
  }

  if (crossIcon && checkbox) {
    crossIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      checkbox.checked = false;
    });
  }
});
