const ProgressManager = {
  saveProgress: function () {
    const progress = {};
    document.querySelectorAll(".checkbox").forEach((checkbox) => {
      progress[checkbox.id] = checkbox.checked;
    });
    localStorage.setItem("guideProgress", JSON.stringify(progress));
    UIManager.showSaveToast();
  },

  saveSubstepProgress: function() {
    const progress = {};
    document.querySelectorAll(".substep-checkbox").forEach((checkbox) => {
      if (checkbox.checked) {
        progress[checkbox.id] = true;
      }
    });
    localStorage.setItem("substepProgress", JSON.stringify(progress));
  },

  loadProgress: function () {
    const savedProgress = localStorage.getItem("guideProgress");
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      for (const id in progress) {
        const checkbox = document.getElementById(id);
        if (checkbox) {
          checkbox.checked = progress[id];
          if (progress[id]) {
            const stepId = id.replace("check-", "");
            const stepElement = document.getElementById(`step-${stepId}`);
            if (stepElement) {
              stepElement.classList.add("completed");
            }
          }
        }
      }
    }
  },

  loadSubstepProgress: function() {
    const savedProgress = localStorage.getItem("substepProgress");
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      for (const id in progress) {
        const checkbox = document.getElementById(id);
        if (checkbox) {
          checkbox.checked = true;
        }
      }
    }
  },

  resetProgress: function () {
    localStorage.removeItem("guideProgress");
    document.querySelectorAll(".checkbox").forEach((checkbox) => {
      checkbox.checked = false;
    });
    document.querySelectorAll(".substep-checkbox").forEach((checkbox) => {
      checkbox.checked = false;
    });
    document.querySelectorAll(".step").forEach((step) => {
      step.classList.remove("completed");
    });
    this.updateProgress();
    UIManager.showSaveToast("Progress reset");
  },

  updateProgress: function () {
    const totalSteps = document.querySelectorAll(".checkbox").length;
    const completedSteps =
      document.querySelectorAll(".checkbox:checked").length;
    const progressPercent = Math.round((completedSteps / totalSteps) * 100);

    const progressBar = document.getElementById("progressBar");
    progressBar.style.width = `${progressPercent}%`;
    progressBar.querySelector(
      ".progress-text"
    ).textContent = `${progressPercent}% Complete`;

    this.highlightLastCompletedStep();
  },

  highlightLastCompletedStep: function () {
    document.querySelectorAll(".step.highlight").forEach((step) => {
      step.classList.remove("highlight");
    });

    const completedSteps = document.querySelectorAll(".step.completed");
    if (completedSteps.length > 0) {
      const lastCompletedStep = completedSteps[completedSteps.length - 1];
      lastCompletedStep.classList.add("highlight");
    }
  },
};
