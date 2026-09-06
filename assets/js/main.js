import { getFilterConfiguration } from "./filterParser.js";
import { initDatabase, executeQuery, renderSeedResults } from "./db.js";

// Overworld Dropdown selection handler
const overworldSelect = document.getElementById("overworlds");

function updateOverworldExtras() {
  const selectedValue = overworldSelect ? overworldSelect.value : "ALL";
  const container = document.querySelector(".overworld-extras");
  const nextExtra = document.getElementById(`extras-${selectedValue}`);

  if (!container) return;

  const currentExtra = container.querySelector(".structure-extras.active");
  if (currentExtra === nextExtra) return;

  const startHeight = container.getBoundingClientRect().height;

  container.style.height = `${startHeight}px`;
  if (startHeight > 0) {
    container.classList.add("active");
  }
  void container.offsetHeight;

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

    container.style.height = "auto";
    const targetHeight = container.getBoundingClientRect().height;

    container.style.height = `${startHeight}px`;
    void container.offsetHeight;

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
document.querySelectorAll(".overworld-extras button, .bastion-extras button").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("open");
    const content = btn.nextElementSibling;
    if (content && content.classList.contains("expandable-content")) {
      content.classList.toggle("open");
    }
  });
});

// 3-Way Switch Handler
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

// 2-Way Switch Handler
document.querySelectorAll(".switch").forEach((sw) => {
  const checkbox = sw.querySelector("input[type='checkbox']");

  sw.addEventListener("click", (e) => {
    e.preventDefault();
    const rect = sw.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    if (checkbox) {
      const newState = clickX < 30;
      if (checkbox.checked !== newState) {
        checkbox.checked = newState;
        checkbox.dispatchEvent(new Event("change"));
      }
    }
  });
});

// Stables Rampart Type Switch Handler
const stablesRampartToggle = document.querySelector("#stables-rampart-toggle input[type='checkbox']");
const stablesRampartContent = document.getElementById("stables-rampart-type-content");

if (stablesRampartToggle && stablesRampartContent) {
  stablesRampartToggle.addEventListener("change", () => {
    if (stablesRampartToggle.checked) {
      stablesRampartContent.classList.add("open");
    } else {
      stablesRampartContent.classList.remove("open");
    }
  });
}

// 4-Way Numeric Switch Handler
document.querySelectorAll(".switch-4way-num").forEach((sw) => {
  sw.addEventListener("click", (e) => {
    let targetState = e.target.getAttribute("data-set-state");

    if (!targetState) {
      const rect = sw.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX < 30) {
        targetState = "0";
      } else if (clickX < 60) {
        targetState = "1";
      } else if (clickX < 90) {
        targetState = "2";
      } else {
        targetState = "3";
      }
    }

    const hiddenInput = sw.querySelector("input[type='hidden']");
    sw.setAttribute("data-state", targetState);
    if (hiddenInput) hiddenInput.value = targetState;

    // If a rampart type is 3, set others to 0
    if (sw.hasAttribute("data-rampart-type") && targetState === "3") {
      const currentType = sw.getAttribute("data-rampart-type");
      document.querySelectorAll(".switch-4way-num[data-rampart-type]").forEach((otherSw) => {
        if (otherSw.getAttribute("data-rampart-type") !== currentType) {
          otherSw.setAttribute("data-state", "0");
          const otherInput = otherSw.querySelector("input[type='hidden']");
          if (otherInput) otherInput.value = "0";
        }
      });
    }
  });
});

// Bastion Dropdown selection handler
const bastionSelect = document.getElementById("bastions");

function updateBastionExtras() {
  const selectedValue = bastionSelect ? bastionSelect.value : "ALL";
  const container = document.querySelector(".bastion-extras");
  const nextExtra = document.getElementById(`bastion-extras-${selectedValue}`);

  if (!container) return;

  const currentExtra = container.querySelector(".bastion-structure-extras.active");
  if (currentExtra === nextExtra) return;

  const startHeight = container.getBoundingClientRect().height;

  container.style.height = `${startHeight}px`;
  if (startHeight > 0) {
    container.classList.add("active");
  }
  void container.offsetHeight;

  if (currentExtra) {
    currentExtra.style.opacity = "0";
    currentExtra.style.transform = "translateY(-4px)";
  }

  const hasContent = nextExtra && nextExtra.children.length > 0;

  clearTimeout(container._swapTimeout);
  container._swapTimeout = setTimeout(() => {
    document.querySelectorAll(".bastion-structure-extras").forEach((el) => {
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

    container.style.height = "auto";
    const targetHeight = container.getBoundingClientRect().height;

    container.style.height = `${startHeight}px`;
    void container.offsetHeight;

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
        document.querySelectorAll(".bastion-structure-extras").forEach((el) => {
          el.classList.remove("active");
          el.style.opacity = "";
          el.style.transform = "";
        });
        container.style.height = "0px";
      }
    }, 220);
  }, currentExtra ? 40 : 0);
}

if (bastionSelect) {
  bastionSelect.addEventListener("change", updateBastionExtras);
  updateBastionExtras(); // Sync on load
}

// --- Database Search ---
function handleSearch() {
  const config = getFilterConfiguration();
  console.log("Search config:", config);
  window.lastSearchConfig = config;

  const results = executeQuery(config);
  renderSeedResults(results);
}

const searchBtn = document.querySelector("#search-container button");
if (searchBtn) {
  searchBtn.addEventListener("click", handleSearch);
}

initDatabase().then((success) => {
  if (success) {
    handleSearch();
  }
});
