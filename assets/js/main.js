// Overworld Dropdown selection handler
const overworldSelect = document.getElementById("overworlds");

function updateOverworldExtras() {
  const selectedValue = overworldSelect ? overworldSelect.value : "ALL";
  const container = document.querySelector(".overworld-extras");
  const nextExtra = document.getElementById(`extras-${selectedValue}`);

  if (!container) return;

  const currentExtra = container.querySelector(".structure-extras.active");
  if (currentExtra === nextExtra) return;

  // 1. Measure starting height of the container
  const startHeight = container.getBoundingClientRect().height;

  // 2. Temporarily fix height to startHeight in pixels to prevent jumping
  container.style.height = `${startHeight}px`;
  if (startHeight > 0) {
    container.classList.add("active");
  }
  void container.offsetHeight;

  // Fade out current content slightly if changing between sections
  if (currentExtra) {
    currentExtra.style.opacity = "0";
    currentExtra.style.transform = "translateY(-4px)";
  }

  const hasContent = nextExtra && nextExtra.children.length > 0;

  clearTimeout(container._swapTimeout);
  container._swapTimeout = setTimeout(() => {
    document.querySelectorAll(".structure-extras").forEach((el) => {
      if (el !== nextExtra) {
        el.classList.remove("active");
        el.style.opacity = "";
        el.style.transform = "";
      }
    });

    if (hasContent) {
      nextExtra.classList.add("active");
      container.classList.add("active");
    }

    // 4. Measure natural target height with new content
    container.style.height = "auto";
    const targetHeight = container.getBoundingClientRect().height;

    // 5. Reset to startHeight before starting CSS height transition
    container.style.height = `${startHeight}px`;
    void container.offsetHeight;

    // 6. Transition height and active state
    if (hasContent && targetHeight > 0) {
      container.classList.add("active");
      container.style.height = `${targetHeight}px`;
    } else {
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
          el.style.opacity = "";
          el.style.transform = "";
        });
        container.style.height = "0px";
      }
    }, 220);
  }, currentExtra ? 40 : 0);
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

// 3-Way Switch Handler (Seamless click regions with zero gaps)
document.querySelectorAll(".switch-3way").forEach((sw) => {
  sw.addEventListener("click", (e) => {
    let targetState = e.target.getAttribute("data-set-state");

    if (!targetState) {
      const rect = sw.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX < 30) {
        targetState = "neutral";
      } else if (clickX < 60) {
        targetState = "check";
      } else {
        targetState = "cross";
      }
    }

    const hiddenInput = sw.querySelector("input[type='hidden']");
    sw.setAttribute("data-state", targetState);
    if (hiddenInput) hiddenInput.value = targetState;
  });
});

// 2-Way Switch Handler (Seamless click regions: left half = checkmark, right half = cross)
document.querySelectorAll(".switch").forEach((sw) => {
  const checkbox = sw.querySelector("input[type='checkbox']");

  sw.addEventListener("click", (e) => {
    e.preventDefault();
    const rect = sw.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    if (checkbox) {
      checkbox.checked = clickX < 30;
    }
  });
});
