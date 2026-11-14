(() => {
  const views = [...document.querySelectorAll("[data-view]")];
  const navItems = [...document.querySelectorAll(".nav-item")];
  const toast = document.getElementById("toast");
  let toastTimer;
  function notify(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
  }
  function navigate(name) {
    if (!views.some(view => view.dataset.view === name)) return;
    views.forEach(view => view.classList.toggle("active", view.dataset.view === name));
    navItems.forEach(item => item.classList.toggle("selected", item.dataset.go === name));
    window.scrollTo({top: 0, behavior: "smooth"});
    history.replaceState(null, "", "#" + name);
  }
  document.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => navigate(button.dataset.go)));
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  const taskCards = [...document.querySelectorAll(".task-card[data-status]")];
  filterButtons.forEach(button => button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(item => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    taskCards.forEach(card => { card.hidden = filter !== "all" && card.dataset.status !== filter; });
  }));
  document.querySelectorAll(".detail-toggle").forEach(button => button.addEventListener("click", () => {
    const detail = button.closest(".task-card").querySelector(".task-detail");
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    detail.hidden = expanded;
    button.innerHTML = expanded ? 'Dettagli <span>⌄</span>' : 'Chiudi <span>⌃</span>';
  }));
  document.getElementById("alertsButton").addEventListener("click", () => {
    navigate("approvals");
    notify("Nessuna richiesta dimostrativa in attesa");
  });
  const initial = location.hash.slice(1);
  navigate(views.some(view => view.dataset.view === initial) ? initial : "home");
  let installPrompt = null;
  const installButton = document.getElementById("installButton");
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
  });
  installButton.addEventListener("click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
  });
  window.addEventListener("appinstalled", () => notify("Jupiter aggiunto al dispositivo"));
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => notify("Modalità offline non disponibile in questa anteprima")));
  }
})();