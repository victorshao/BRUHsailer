document.addEventListener("DOMContentLoaded", async function () {
  await GuideDataLoader.loadGuideData();
  FilterManager.loadFilterState();
  UIManager.initializeHighlights();
  UIManager.initializeHighlightColor();

  document
    .getElementById("resetProgressBtn")
    .addEventListener("click", function (e) {
      e.preventDefault();
      if (confirm("Are you sure you want to reset your progress?")) {
        ProgressManager.resetProgress();
      }
    });

  document
    .getElementById("darkModeToggle")
    .addEventListener("click", function () {
      UIManager.toggleDarkMode();
    });

  document
    .getElementById("jumpToLastBtn")
    .addEventListener("click", function () {
      UIManager.jumpToLastCompletedStep();
    });

  document
    .getElementById("minimizeCompletedToggle")
    .addEventListener("click", function () {
      this.classList.toggle("active");
      FilterManager.saveFilterState();
      const activeFilter = document
        .querySelector(".filter-btn.active")
        .getAttribute("data-filter");
      FilterManager.applyCurrentFilter(activeFilter);
    });

  const removeAllHighlightsBtn = document.getElementById(
    "removeAllHighlightsBtn"
  );
  if (removeAllHighlightsBtn) {
    removeAllHighlightsBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (confirm("Are you sure you want to remove all highlights?")) {
        UIManager.removeAllHighlights();
      }
    });
  } else {
    console.warn("Remove All Highlights button not found.");
  }

  document.querySelectorAll(".color-picker-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const color = this.dataset.color;
      UIManager.setHighlightColor(color);
    });
  });

  // UIManager.attachEventListeners(); // Removed: Called within guideDataLoader after content is loaded
  UIManager.initializeDarkMode();
});
