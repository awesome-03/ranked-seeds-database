import { renderSetSeeds } from "./db.js";

const PREDETERMINED_COLORS = [
  "var(--set-color-1)",
  "var(--set-color-2)",
  "var(--set-color-3)",
  "var(--set-color-4)",
  "var(--set-color-5)",
  "var(--set-color-6)",
  "var(--set-color-7)",
  "var(--set-color-8)",
];

const DEFAULT_PLAYED_SET = {
  id: "played",
  name: "Played",
  enabled: true,
  colorVar: "var(--set-color-played)",
  seeds: [],
};

let sets = [];
let activeSetId = null; // null when no set selected

// Load sets from LocalStorage or initialize default
export function initCollection() {
  const savedSets = localStorage.getItem("seed_sets");
  const savedActive = localStorage.getItem("active_set");

  if (savedSets) {
    try {
      sets = JSON.parse(savedSets);
    } catch (e) {
      sets = [{ ...DEFAULT_PLAYED_SET }];
    }
  } else {
    sets = [{ ...DEFAULT_PLAYED_SET }];
  }

  // Ensure that the "Played" set exists
  const hasPlayed = sets.some((s) => s.id === "played");
  if (!hasPlayed) {
    sets.unshift({ ...DEFAULT_PLAYED_SET });
  }

  if (savedActive && sets.some((s) => s.id === savedActive)) {
    activeSetId = savedActive;
  } else {
    activeSetId = null; // Start in Search Results mode if not specified
  }

  saveSets();
  renderCollection();
  syncActiveSetToDataSection();
  setupEventListeners();
}

function saveSets() {
  localStorage.setItem("seed_sets", JSON.stringify(sets));
  if (activeSetId) {
    localStorage.setItem("active_set", activeSetId);
  } else {
    localStorage.removeItem("active_set");
  }
}

export function getActiveSet() {
  if (!activeSetId) return null;
  return sets.find((s) => s.id === activeSetId) || null;
}

export function getAllSets() {
  return sets;
}

// Return list of seeds in disabled sets
export function getDisabledSeeds() {
  const disabledSeeds = [];
  sets.forEach((set) => {
    if (!set.enabled && set.seeds && set.seeds.length > 0) {
      set.seeds.forEach((seed) => {
        disabledSeeds.push(seed);
      });
    }
  });
  return disabledSeeds;
}

// Unselect active set and return to search mode
export function unselectActiveSet(skipReSearch = false) {
  activeSetId = null;
  saveSets();
  renderCollection();
  if (!skipReSearch) {
    syncActiveSetToDataSection();
  } else {
    const dataBgBox = document.querySelector("section#data .bg-box");
    if (dataBgBox) {
      dataBgBox.style.backgroundColor = "var(--bg-dark)";
    }
  }
}
window.unselectActiveSet = unselectActiveSet;

// Return list of currently checked seeds
export function getCheckedSeeds() {
  const checked = [];
  const rows = document.querySelectorAll(".data-list .data-row");
  rows.forEach((row) => {
    const cb = row.querySelector("input[type='checkbox']");
    if (cb && cb.checked) {
      const owSeed = row.querySelector(".ow-seed")?.textContent.trim() || "";
      const netherSeed = row.querySelector(".nether-seed")?.textContent.trim() || "";
      const notes = row.querySelector(".notes-box")?.value || "";
      checked.push({ owSeed, netherSeed, notes });
    }
  });
  return checked;
}

// Trash Can state
export function updateTrashButtonState() {
  const trashBtn = document.getElementById("trash-set-btn");
  if (!trashBtn) return;

  const activeSet = getActiveSet();
  const checkedSeeds = getCheckedSeeds();

  if (activeSet) {
    if (checkedSeeds.length > 0) {
      trashBtn.disabled = false;
      trashBtn.title = `Remove ${checkedSeeds.length} selected seed${checkedSeeds.length === 1 ? "" : "s"} from "${activeSet.name}"`;
    } else if (activeSet.id === "played") {
      trashBtn.disabled = true;
      trashBtn.title = `The Played set cannot be deleted`;
    } else {
      trashBtn.disabled = false;
      trashBtn.title = `Delete "${activeSet.name}" set`;
    }
  } else {
    trashBtn.disabled = true;
    trashBtn.title = `Select a set or seed to enable delete`;
  }
}
window.updateTrashButtonState = updateTrashButtonState;

// Pop Up
export function showPopUp({ title, message, bodyHTML, confirmText, confirmClass, onConfirm, cancelText }) {
  const overlay = document.getElementById("pop-up");
  const titleEl = document.getElementById("pop-up-title");
  const msgEl = document.getElementById("pop-up-message");
  const bodyEl = document.getElementById("pop-up-body");
  const confirmBtn = document.getElementById("pop-up-confirm-btn");
  const cancelBtn = document.getElementById("pop-up-cancel-btn");

  if (!overlay || !confirmBtn || !cancelBtn) return;

  titleEl.textContent = title || "Confirmation";
  msgEl.textContent = message || "";
  bodyEl.innerHTML = bodyHTML || "";

  confirmBtn.textContent = confirmText || "Confirm";
  cancelBtn.textContent = cancelText || "Cancel";

  confirmBtn.className = confirmClass || "";

  overlay.style.display = "flex";

  const closePopUp = () => {
    overlay.style.display = "none";
    confirmBtn.className = "";
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;
  };

  cancelBtn.onclick = closePopUp;
  overlay.onclick = (e) => {
    if (e.target === overlay) closePopUp();
  };

  confirmBtn.onclick = () => {
    if (typeof onConfirm === "function") {
      onConfirm();
    }
    closePopUp();
  };
}
window.showPopUp = showPopUp;

// Render Collection Set Cards
function renderCollection() {
  const container = document.getElementById("collection-sets-list");
  if (!container) return;

  container.innerHTML = "";

  sets.forEach((set) => {
    const isSelected = set.id === activeSetId;

    const setCard = document.createElement("div");
    setCard.className = `set-card ${isSelected ? "active" : ""}`;
    setCard.setAttribute("data-id", set.id);
    setCard.style.backgroundColor = set.colorVar || set.colorVal || "var(--set-color-played)";

    const seedCount = set.seeds ? set.seeds.length : 0;

    setCard.innerHTML = `
      <div class="drag-handle" title="Hold & drag vertically to reorder">
        <div class="dots-grid">
          <span></span><span></span>
          <span></span><span></span>
          <span></span><span></span>
        </div>
      </div>

      <div class="set-info">
        <span class="set-name">${escapeHtml(set.name)}</span>
        <span class="set-count">(${seedCount} seed${seedCount === 1 ? "" : "s"})</span>
      </div>

      <div class="set-toggle-btn ${set.enabled ? "enabled" : "disabled"}" title="Click to toggle ENABLED/DISABLED">
        <span class="set-toggle-text">${set.enabled ? "ENABLED" : "DISABLED"}</span>
      </div>
    `;

    setCard.addEventListener("click", (e) => {
      if (e.target.closest(".set-toggle-btn") || e.target.closest(".drag-handle") || e.target.tagName === "INPUT") {
        return;
      }

      if (activeSetId === set.id) {
        unselectActiveSet();
      } else {
        activeSetId = set.id;
        saveSets();
        renderCollection();
        syncActiveSetToDataSection();
      }
    });

    // Edit Name
    const nameSpan = setCard.querySelector(".set-name");
    if (nameSpan && set.id !== "played") {
      nameSpan.addEventListener("click", (e) => {
        e.stopPropagation();
        makeSetNameEditable(nameSpan, set);
      });
    }

    // Toggle ENABLED / DISABLED
    const toggleBtn = setCard.querySelector(".set-toggle-btn");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        set.enabled = !set.enabled;
        saveSets();
        renderCollection();

        // Re-run search if in search mode so disabled seeds update immediately
        if (!activeSetId && typeof window.executeAndRenderSearch === "function") {
          window.executeAndRenderSearch();
        }
      });
    }

    // Linear Pointer-based Drag & Drop Reordering on 6-dot handle
    const handle = setCard.querySelector(".drag-handle");
    if (handle) {
      handle.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        startPointerDrag(e, setCard, set.id);
      });
    }

    container.appendChild(setCard);
  });

  updateTrashButtonState();
}

// Linear 1:1 Pointer Drag and Drop Reordering with Sibling Push Animations
function startPointerDrag(e, cardEl, setId) {
  const container = document.getElementById("collection-sets-list");
  if (!container) return;

  const cards = Array.from(container.children);
  const initialIndex = sets.findIndex((s) => s.id === setId);
  if (initialIndex === -1) return;

  const cardHeight = cardEl.offsetHeight;
  const gap = 14; // gap between cards
  const totalItemHeight = cardHeight + gap;

  const startY = e.clientY;
  let currentIndex = initialIndex;

  cardEl.classList.add("is-dragging");
  cardEl.style.zIndex = "1000";
  cardEl.style.transition = "none";

  // Set smooth transition on sibling cards so they push up or down out of the way
  cards.forEach((c) => {
    if (c !== cardEl) {
      c.style.transition = "transform 0.22s cubic-bezier(0.2, 0, 0.2, 1)";
    }
  });

  function onPointerMove(ev) {
    ev.preventDefault();
    const deltaY = ev.clientY - startY;

    cardEl.style.transform = `translateY(${deltaY}px)`;

    // Calculate virtual target index based on mouse offset
    const dragOffsetIndex = Math.round(deltaY / totalItemHeight);
    let targetIndex = initialIndex + dragOffsetIndex;
    targetIndex = Math.max(0, Math.min(sets.length - 1, targetIndex));

    if (targetIndex !== currentIndex) {
      currentIndex = targetIndex;
    }

    // Visually shift all sibling cards to their pushed positions
    cards.forEach((c, idx) => {
      if (c === cardEl) return;

      if (initialIndex < currentIndex) {
        if (idx > initialIndex && idx <= currentIndex) {
          c.style.transform = `translateY(${-totalItemHeight}px)`;
        } else {
          c.style.transform = `translateY(0px)`;
        }
      } else if (initialIndex > currentIndex) {
        if (idx >= currentIndex && idx < initialIndex) {
          c.style.transform = `translateY(${totalItemHeight}px)`;
        } else {
          c.style.transform = `translateY(0px)`;
        }
      } else {
        c.style.transform = `translateY(0px)`;
      }
    });
  }

  function onPointerUp() {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);

    // Reset transforms and transitions
    cardEl.classList.remove("is-dragging");
    cardEl.style.zIndex = "";
    cardEl.style.transition = "";
    cardEl.style.transform = "";

    cards.forEach((c) => {
      c.style.transition = "";
      c.style.transform = "";
    });

    if (currentIndex !== initialIndex) {
      const [movedSet] = sets.splice(initialIndex, 1);
      sets.splice(currentIndex, 0, movedSet);
      saveSets();
    }
    renderCollection();
  }

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
}

function makeSetNameEditable(nameSpan, set) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "set-name-input";
  input.value = set.name;

  nameSpan.replaceWith(input);
  input.focus();
  input.select();

  const commitEdit = () => {
    const val = input.value.trim();
    if (val) {
      set.name = val;
    }
    saveSets();
    renderCollection();
  };

  input.addEventListener("blur", commitEdit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      commitEdit();
    } else if (e.key === "Escape") {
      renderCollection();
    }
  });
}

// Sync Data Section background color and contents with active set
export function syncActiveSetToDataSection() {
  const activeSet = getActiveSet();
  const dataBgBox = document.querySelector("section#data .bg-box");

  if (!activeSet) {
    // Search Results mode
    if (dataBgBox) {
      dataBgBox.style.backgroundColor = "var(--bg-dark)";
    }
    if (typeof window.executeAndRenderSearch === "function") {
      window.executeAndRenderSearch();
    }
    updateTrashButtonState();
    return;
  }

  // Set View mode
  if (dataBgBox) {
    dataBgBox.style.backgroundColor = activeSet.colorVar || activeSet.colorVal || "var(--bg-dark)";
  }

  renderSetSeeds(activeSet);
  updateTrashButtonState();
}

// Set up listeners
function setupEventListeners() {
  const addBtn = document.getElementById("add-set-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const randomColor = PREDETERMINED_COLORS[Math.floor(Math.random() * PREDETERMINED_COLORS.length)];
      const newSet = {
        id: "set_" + Date.now(),
        name: "New Set",
        enabled: true,
        colorVar: randomColor,
        seeds: [],
      };

      sets.push(newSet);
      activeSetId = newSet.id;
      saveSets();
      renderCollection();
      syncActiveSetToDataSection();
    });
  }

  // Add to Set Handler
  const addToSetBtn = document.getElementById("add-to-set-btn");
  if (addToSetBtn) {
    addToSetBtn.addEventListener("click", () => {
      const checkedSeeds = getCheckedSeeds();
      if (checkedSeeds.length === 0) {
        showPopUp({
          title: "No Seeds Selected",
          message: "Please select at least one seed to add it to a set.",
          confirmText: "OK",
          confirmClass: "green-btn",
        });
        return;
      }

      let optionsHTML = sets.map((s) => `<option value="${s.id}">${escapeHtml(s.name)} (${s.seeds ? s.seeds.length : 0} seeds)</option>`).join("");
      optionsHTML += `<option value="__new_set__">+ Create New Set</option>`;

      const bodyHTML = `
        <label style="font-size: 0.88rem; color: var(--text-muted);">Select Set:</label>
        <select id="pop-up-set-select">
          ${optionsHTML}
        </select>
      `;

      showPopUp({
        title: "Add Seeds to Set",
        message: `Add ${checkedSeeds.length} selected seed${checkedSeeds.length === 1 ? "" : "s"} to set:`,
        bodyHTML,
        confirmText: "Add to Set",
        confirmClass: "green-btn",
        onConfirm: () => {
          const select = document.getElementById("pop-up-set-select");
          if (!select) return;
          const targetId = select.value;

          let targetSet = null;
          if (targetId === "__new_set__") {
            const randomColor = PREDETERMINED_COLORS[Math.floor(Math.random() * PREDETERMINED_COLORS.length)];
            targetSet = {
              id: "set_" + Date.now(),
              name: "New Set",
              enabled: true,
              colorVar: randomColor,
              seeds: [],
            };
            sets.push(targetSet);
          } else {
            targetSet = sets.find((s) => s.id === targetId);
          }

          if (!targetSet) return;
          if (!targetSet.seeds) targetSet.seeds = [];

          checkedSeeds.forEach((seed) => {
            const idx = targetSet.seeds.findIndex((s) => s.owSeed === seed.owSeed && s.netherSeed === seed.netherSeed);
            if (idx >= 0) {
              if (seed.notes) targetSet.seeds[idx].notes = seed.notes;
            } else {
              targetSet.seeds.push(seed);
            }
          });

          saveSets();
          renderCollection();
          if (activeSetId === targetSet.id) {
            syncActiveSetToDataSection();
          }
          updateTrashButtonState();
        },
      });
    });
  }

  // Trash Can Button Handler
  const trashBtn = document.getElementById("trash-set-btn");
  if (trashBtn) {
    trashBtn.addEventListener("click", () => {
      const activeSet = getActiveSet();
      const checkedSeeds = getCheckedSeeds();

      if (activeSet && checkedSeeds.length > 0) {
        // Confirm before removing
        showPopUp({
          title: "Remove Seeds",
          message: `Are you sure you want to remove ${checkedSeeds.length} selected seed${checkedSeeds.length === 1 ? "" : "s"} from "${activeSet.name}"?`,
          confirmText: "Remove from Set",
          confirmClass: "",
          onConfirm: () => {
            activeSet.seeds = activeSet.seeds.filter((s) => 
              !checkedSeeds.some((cs) => cs.owSeed === s.owSeed && cs.netherSeed === s.netherSeed)
            );
            saveSets();
            renderCollection();
            syncActiveSetToDataSection();
            updateTrashButtonState();
          },
        });
      } else if (activeSet && activeSet.id !== "played") {
        // Confirm Deletion of Active Set
        showPopUp({
          title: "Delete Set",
          message: `Are you sure you want to delete "${activeSet.name}"? This action cannot be undone.`,
          confirmText: "Delete Set",
          confirmClass: "",
          onConfirm: () => {
            sets = sets.filter((s) => s.id !== activeSetId);
            unselectActiveSet();
            saveSets();
            renderCollection();
            updateTrashButtonState();
          },
        });
      }
    });
  }

  const dataList = document.querySelector(".data-list");
  if (dataList) {
    dataList.addEventListener("change", (e) => {
      updateTrashButtonState();
    });

    dataList.addEventListener("input", (e) => {
      if (e.target && e.target.classList.contains("notes-box")) {
        const row = e.target.closest(".data-row");
        if (!row) return;

        const owSeed = row.querySelector(".ow-seed")?.textContent.trim() || "";
        const netherSeed = row.querySelector(".nether-seed")?.textContent.trim() || "";
        const notes = e.target.value;

        const activeSet = getActiveSet();
        if (activeSet && activeSet.seeds) {
          const seed = activeSet.seeds.find((s) => s.owSeed === owSeed && s.netherSeed === netherSeed);
          if (seed) {
            seed.notes = notes;
            saveSets();
          }
        }
      }
    });
  }
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
