const Utils = {
  showToast: function (message = "Progress saved", duration = 2000) {
    const toast = document.getElementById("saveToast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, duration);
  },
};
