// Overworld Dropdown selection handler
const overworldSelect = document.getElementById("overworlds");

function updateOverworldExtras() {
  const selectedValue = overworldSelect ? overworldSelect.value : "ALL";
  const container = document.querySelector(".overworld-extras");
  const nextExtra = document.getElementById(`extras-${selectedValue}`);

  if (!container) return;

  // 1. Measure starting height of the container
  const startHeight = container.getBoundingClientRect().height;

  // 2. Temporarily fix height to startHeight in pixels to prevent jumping
  container.style.height = `${startHeight}px`;
  if (startHeight > 0) {
    container.classList.add("active");
  }
  void container.offsetHeight;

  // 3. Swap active structure section
  const hasContent = nextExtra && nextExtra.children.length > 0;

  // Keep old content visible during collapse for a smooth shrink
  if (hasContent) {
    document.querySelectorAll(".structure-extras").forEach((el) => {
      if (el !== nextExtra) el.classList.remove("active");
    });
    nextExtra.classList.add("active");
  }

  // 4. Measure natural target height with new content
  container.style.height = "auto";
  const targetHeight = container.getBoundingClientRect().height;

  // 5. Reset to startHeight before starting CSS height transition
  container.style.height = `${startHeight}px`;
  void container.offsetHeight;

  // 6. Transition height and active state simultaneously in ONE single motion
  if (hasContent && targetHeight > 0) {
    container.classList.add("active");
    container.style.height = `${targetHeight}px`;
  } else {
    // Closing to 0: remove 'active' immediately so height, margin, and opacity animate together
    container.classList.remove("active");
    container.style.height = "0px";
  }

  clearTimeout(container._heightTimeout);
  container._heightTimeout = setTimeout(() => {
    if (hasContent && targetHeight > 0) {
      container.style.height = "auto";
    } else {
      document.querySelectorAll(".structure-extras").forEach((el) => {
        el.classList.remove("active");
      });
      container.style.height = "0px";
    }
  }, 380);
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
