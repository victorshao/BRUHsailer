document.addEventListener("DOMContentLoaded", function () {
  GuideDataLoader.loadGuideData();
  FilterManager.loadFilterState();

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

  UIManager.initializeDarkMode();
});
