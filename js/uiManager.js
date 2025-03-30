const UIManager = {
  isHighlightModeActive: false,
  highlightColor: "green",

  getHighlightColorStorageKey: function () {
    return "highlightColorPreference";
  },
  setHighlightColor: function (color) {
    const validColors = ["green", "yellow", "blue", "pink"];
    if (validColors.includes(color)) {
      this.highlightColor = color;
      localStorage.setItem(this.getHighlightColorStorageKey(), color);
      document.querySelectorAll(".color-picker-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.color === color);
      });
    } else {
      console.warn(`Invalid highlight color: ${color}`);
    }
  },
  initializeHighlightColor: function () {
    const savedColor = localStorage.getItem(this.getHighlightColorStorageKey());
    if (savedColor) {
      this.setHighlightColor(savedColor);
    } else {
      this.setHighlightColor(this.highlightColor);
    }
  },
  attachEventListeners: function () {
    document.querySelectorAll(".color-picker-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const color = e.target.dataset.color;
        this.setHighlightColor(color);
      });
    });

    document.querySelectorAll(".section-header").forEach((header) => {
      header.addEventListener("click", function () {
        const sectionElement = this.closest(".guide-section");
        if (sectionElement) {
          const content = sectionElement.querySelector(".section-content");
          if (content) {
            content.classList.toggle("active");
            this.classList.toggle("active");
          } else {
            console.warn(
              "Could not find .section-content within section:",
              sectionElement
            );
          }
        } else {
          console.warn(
            "Could not find parent .guide-section for header:",
            this
          );
        }
      });
    });

    document.querySelectorAll(".chapter-title").forEach((header) => {
      header.addEventListener("click", function () {
        const chapterElement = this.closest(".guide-chapter");
        if (chapterElement) {
          const content = chapterElement.querySelector(".chapter-content");
          if (content) {
            content.classList.toggle("active");
            this.classList.toggle("active");
          } else {
            console.warn(
              "Could not find .chapter-content within chapter:",
              chapterElement
            );
          }
        } else {
          console.warn("Could not find parent .guide-chapter for title:", this);
        }
      });
    });

    document.querySelectorAll(".checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        const stepId = this.id.replace("check-", "");
        const stepElement = document.getElementById(`step-${stepId}`);

        if (this.checked) {
          stepElement.classList.add("completed");

          const isMinimized = document
            .getElementById("minimizeCompletedToggle")
            .classList.contains("active");

          if (isMinimized) {
            const stepContent = stepElement.querySelector(".step-content");
            if (stepContent) {
              stepContent.classList.add("hidden-by-completion");
            }
          }
        } else {
          stepElement.classList.remove("completed");

          const stepContent = stepElement.querySelector(".step-content");
          if (stepContent) {
            stepContent.classList.remove("hidden-by-completion");
          }
        }

        ProgressManager.saveProgress();
        ProgressManager.updateProgress();

        const activeFilter = document
          .querySelector(".filter-btn.active")
          .getAttribute("data-filter");
        FilterManager.applyCurrentFilter(activeFilter);
      });
    });

    document.querySelectorAll(".step-header").forEach((header) => {
      header.addEventListener("click", function (e) {
        if (e.target.type !== "checkbox") {
          const checkbox = this.querySelector(".checkbox");
          checkbox.checked = !checkbox.checked;

          const changeEvent = new Event("change");
          checkbox.dispatchEvent(changeEvent);
        }
      });
    });

    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".filter-btn").forEach((b) => {
          b.classList.remove("active");
        });
        this.classList.add("active");

        const filter = this.getAttribute("data-filter");
        FilterManager.applyCurrentFilter(filter);
      });
    });

    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      const steps = document.querySelectorAll(".step");

      steps.forEach((step) => {
        const content = step
          .querySelector(".step-description")
          .textContent.toLowerCase();
        const isVisible = content.includes(searchTerm);
        step.classList.toggle("hidden-by-search", !isVisible);
      });

      document.querySelectorAll(".guide-section").forEach((section) => {
        const visibleSteps = Array.from(section.querySelectorAll(".step")).some(
          (step) => step.style.display !== "none"
        );

        section.classList.toggle("hidden-by-search", !visibleSteps);

        if (visibleSteps) {
          section.querySelector(".section-content").classList.add("active");
          section.querySelector(".section-header").classList.add("active");
        }
      });
    });

    const highlightToggleButton = document.getElementById("highlightToggle");
    const guideContent = document.getElementById("guideContent");

    if (highlightToggleButton) {
      highlightToggleButton.addEventListener("click", () => {
        this.toggleHighlightMode();
      });
    }

    if (guideContent) {
      guideContent.addEventListener("mouseup", () => {
        this.handleHighlightSelection();
      });
    }
    guideContent.addEventListener("click", (event) => {
      if (
        this.isHighlightModeActive &&
        event.target.classList.contains("highlighted-text")
      ) {
        this.removeHighlight(event.target);
      }
    });
    const highlightControlWrapper = document.querySelector(
      ".highlight-control-wrapper"
    );
    const highlightColorPicker = document.getElementById(
      "highlightColorPicker"
    );
    let leaveTimeout;

    if (highlightControlWrapper && highlightColorPicker) {
      highlightControlWrapper.addEventListener("mouseenter", () => {
        clearTimeout(leaveTimeout);
        const button = document.getElementById("highlightToggle");
        if (!button) return;

        highlightColorPicker.classList.add("visible");
      });

      const hidePicker = () => {
        leaveTimeout = setTimeout(() => {
          highlightColorPicker.classList.remove("visible");
        }, 350);
      };

      highlightControlWrapper.addEventListener("mouseleave", hidePicker);
      highlightColorPicker.addEventListener("mouseenter", () => {
        clearTimeout(leaveTimeout);
      });
      highlightColorPicker.addEventListener("mouseleave", hidePicker);
    }
  },

  getHighlightStorageKey: function () {
    return "userHighlights";
  },
  saveHighlights: function () {
    const highlights = [];
    document
      .querySelectorAll("#guideContent .highlighted-text")
      .forEach((span, index) => {
        const range = document.createRange();
        range.selectNodeContents(span);
        const parentStep = span.closest(".step");
        if (!parentStep || !parentStep.id) {
          console.warn(
            "Highlighted text found outside a step or step lacks ID, cannot save reliably.",
            span
          );
          return;
        }
        const parentId = parentStep.id;
        const colorClass = Array.from(span.classList).find((cls) =>
          cls.startsWith("highlight-")
        );
        const color = colorClass
          ? colorClass.replace("highlight-", "")
          : this.highlightColor;

        highlights.push({
          parentId: parentId,
          htmlContent: span.innerHTML,
          color: color,
        });
      });
    localStorage.setItem(
      this.getHighlightStorageKey(),
      JSON.stringify(highlights)
    );
  },

  loadHighlights: function () {
    const savedHighlights = JSON.parse(
      localStorage.getItem(this.getHighlightStorageKey()) || "[]"
    );
    if (!savedHighlights.length) return;
    savedHighlights.forEach((highlightData) => {
      const parentElement = document.getElementById(highlightData.parentId);
      if (!parentElement) {
        console.warn(
          `Parent element ${highlightData.parentId} not found for highlight.`
        );
        return;
      }
      const walker = document.createTreeWalker(
        parentElement,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      let node;
      while ((node = walker.nextNode())) {
        const index = node.nodeValue.indexOf(highlightData.htmlContent);
        if (index !== -1) {
          if (node.parentElement.classList.contains("highlighted-text")) {
            continue;
          }

          try {
            const range = document.createRange();
            range.setStart(node, index);
            range.setEnd(node, index + highlightData.htmlContent.length);

            const span = document.createElement("span");
            const colorToApply = highlightData.color || "green";
            span.className = `highlighted-text highlight-${colorToApply}`;
            range.surroundContents(span);
            break;
          } catch (e) {
            console.error("Error re-applying highlight:", e, highlightData);
          }
        }
      }
    });
  },
  removeHighlight: function (spanElement) {
    if (!spanElement || !spanElement.classList.contains("highlighted-text"))
      return;

    const parent = spanElement.parentNode;
    while (spanElement.firstChild) {
      parent.insertBefore(spanElement.firstChild, spanElement);
    }
    parent.removeChild(spanElement);
    parent.normalize();

    this.saveHighlights();
  },

  removeAllHighlights: function () {
    document
      .querySelectorAll("#guideContent .highlighted-text")
      .forEach((span) => {
        const parent = span.parentNode;
        while (span.firstChild) {
          parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
        parent.normalize();
      });
    localStorage.removeItem(this.getHighlightStorageKey());
  },
  showSaveToast: function (message = "Progress saved") {
    Utils.showToast(message);
  },
  jumpToLastCompletedStep: function () {
    const completedSteps = document.querySelectorAll(".step.completed");
    if (completedSteps.length > 0) {
      const lastCompletedStep = completedSteps[completedSteps.length - 1];

      const chapterContent = lastCompletedStep.closest(".chapter-content");
      if (chapterContent) {
        chapterContent.classList.add("active");
        const chapterHeader = chapterContent.previousElementSibling;
        if (chapterHeader) {
          chapterHeader.classList.add("active");
        }
      }
      const sectionContent = lastCompletedStep.closest(".section-content");
      if (sectionContent) {
        sectionContent.classList.add("active");
        const sectionHeader = sectionContent.previousElementSibling;
        if (sectionHeader) {
          sectionHeader.classList.add("active");
        }
      }

      setTimeout(() => {
        lastCompletedStep.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  },
  toggleHighlightMode: function () {
    this.isHighlightModeActive = !this.isHighlightModeActive;
    document.body.classList.toggle(
      "highlight-mode-active",
      this.isHighlightModeActive
    );
    const highlightToggleButton = document.getElementById("highlightToggle");
    if (highlightToggleButton) {
      highlightToggleButton.classList.toggle(
        "active",
        this.isHighlightModeActive
      );
    }
    document.body.classList.toggle(
      "highlight-cursor-active",
      this.isHighlightModeActive
    );
  },
  handleHighlightSelection: function () {
    if (!this.isHighlightModeActive) return;

    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const guideContent = document.getElementById("guideContent");

    if (
      !guideContent ||
      !guideContent.contains(range.commonAncestorContainer)
    ) {
      return;
    }

    try {
      const span = document.createElement("span");
      span.className = "highlighted-text";
      span.className = `highlighted-text highlight-${this.highlightColor}`;

      range.surroundContents(span);

      selection.removeAllRanges();

      this.saveHighlights();
    } catch (e) {
      console.error("Error applying highlight:", e);
      selection.removeAllRanges();
    }
  },
  initializeHighlights: function () {
    this.loadHighlights();
  },
  toggleDarkMode: function () {
    document.body.classList.toggle("dark-mode");
    const isDarkMode = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDarkMode);
  },
  initializeDarkMode: function () {
    if (localStorage.getItem("darkMode") === "true") {
      document.body.classList.add("dark-mode");
    } else if (localStorage.getItem("darkMode") === "false") {
      document.body.classList.remove("dark-mode");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.body.classList.add("dark-mode");
      }
    }
  },
};
