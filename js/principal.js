/* ==========================================================================
   ConectaEdu — Inicialização Global (Shell LMS, Tema, Perfil e Eventos)
   ========================================================================== */

(function (global) {
  function aplicarTema(tema) {
    document.documentElement.setAttribute("data-theme", tema === "dark" ? "dark" : "light");
  }

  function montarShell() {
    const pagina = document.body.dataset.page || "index.html";
    const titulo = document.body.dataset.title || "Dashboard";

    const sidebarSlot = document.getElementById("sidebar-slot");
    const topbarSlot = document.getElementById("topbar-slot");

    if (sidebarSlot) {
      sidebarSlot.innerHTML = global.ConectaUI.renderizarSidebar(pagina);
    }
    if (topbarSlot) {
      topbarSlot.innerHTML = global.ConectaUI.renderizarTopbar(titulo);
    }

    const sidebar = document.getElementById("app-sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    const openBtn = document.getElementById("mobile-menu-btn");
    const closeBtn = document.getElementById("sidebar-close-btn");

    function fecharMenu() {
      if (sidebar) sidebar.classList.remove("is-open");
      if (backdrop) backdrop.classList.remove("is-open");
    }

    if (openBtn) {
      openBtn.addEventListener("click", () => {
        if (sidebar) sidebar.classList.add("is-open");
        if (backdrop) backdrop.classList.add("is-open");
      });
    }
    if (closeBtn) closeBtn.addEventListener("click", fecharMenu);
    if (backdrop) backdrop.addEventListener("click", fecharMenu);

    const temaBtn = document.getElementById("btn-alternar-tema");
    if (temaBtn) {
      temaBtn.addEventListener("click", () => {
        const novoTema = global.ConectaStorage.alternarTema();
        aplicarTema(novoTema);
        montarShell();
        global.ConectaUI.mostrarToast(
          novoTema === "dark" ? "Tema escuro ativado" : "Tema claro ativado",
          "Sua preferência visual foi salva.",
          novoTema === "dark" ? "moon" : "sun"
        );
      });
    }

    const editarBtn = document.getElementById("btn-editar-estudante");
    if (editarBtn) {
      editarBtn.addEventListener("click", () => {
        const estado = global.ConectaStorage.carregarEstado();
        global.ConectaUI.abrirModal({
          titulo: "Personalizar perfil do estudante",
          descricao: "Informe como gostaria de ser chamado(a) no ambiente educativo.",
          conteudoHtml: `
            <input
              type="text"
              class="modal-input"
              id="input-nome-estudante"
              maxlength="32"
              value="${estado.nomeEstudante.replace(/"/g, "&quot;")}"
              placeholder="Seu nome"
            />
          `,
          textoConfirmar: "Salvar nome",
          aoConfirmar: (dialog) => {
            const val = dialog.querySelector("#input-nome-estudante").value;
            global.ConectaStorage.definirNomeEstudante(val);
            montarShell();
            if (typeof global.atualizarDashboard === "function") {
              global.atualizarDashboard();
            }
            global.ConectaUI.mostrarToast("Perfil atualizado", "Saudação personalizada com sucesso.", "user");
          }
        });
      });
    }

  }

  document.addEventListener("DOMContentLoaded", () => {
    const estado = global.ConectaStorage.carregarEstado();
    aplicarTema(estado.tema);
    montarShell();
    global.ConectaUI.aplicarSpotlightCards();
  });

  global.ConectaPrincipal = { montarShell, aplicarTema };
})(window);
