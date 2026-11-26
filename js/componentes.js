/* ==========================================================================
   ConectaEdu — Componentes Compartilhados de Interface (Sidebar, Topbar, Modal, Toast)
   ========================================================================== */

(function (global) {
  function garantirContainers() {
    if (!document.getElementById("toast-container")) {
      const tc = document.createElement("div");
      tc.id = "toast-container";
      tc.className = "toast-container";
      tc.setAttribute("aria-live", "polite");
      document.body.appendChild(tc);
    }

    if (!document.getElementById("modal-backdrop")) {
      const mb = document.createElement("div");
      mb.id = "modal-backdrop";
      mb.className = "modal-backdrop";
      mb.setAttribute("role", "dialog");
      mb.setAttribute("aria-modal", "true");
      mb.innerHTML = '<div class="modal-dialog" id="modal-dialog"></div>';
      document.body.appendChild(mb);

      mb.addEventListener("click", (e) => {
        if (e.target === mb) fecharModal();
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && mb.classList.contains("is-open")) {
          fecharModal();
        }
      });
    }
  }

  function mostrarToast(titulo, texto, iconeNome) {
    garantirContainers();
    const { icone } = global.ConectaIcones;
    const container = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
      <span class="toast-icon">${icone(iconeNome || "info", 18)}</span>
      <div>
        <div class="toast-title">${titulo}</div>
        ${texto ? `<div class="toast-text">${texto}</div>` : ""}
      </div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      toast.style.transition = "opacity 200ms ease, transform 200ms ease";
      setTimeout(() => toast.remove(), 220);
    }, 3400);
  }

  function fecharModal() {
    const mb = document.getElementById("modal-backdrop");
    if (mb) mb.classList.remove("is-open");
  }

  function abrirModal({ titulo, descricao, conteudoHtml, textoConfirmar, classeConfirmar, aoConfirmar }) {
    garantirContainers();
    const { icone } = global.ConectaIcones;
    const mb = document.getElementById("modal-backdrop");
    const dialog = document.getElementById("modal-dialog");

    dialog.innerHTML = `
      <div class="modal-header">
        <div>
          <h3 class="modal-title">${titulo}</h3>
          ${descricao ? `<p class="modal-desc">${descricao}</p>` : ""}
        </div>
        <button type="button" class="btn btn-ghost btn-icon" id="modal-close-x" aria-label="Fechar janela">
          ${icone("x", 18)}
        </button>
      </div>
      ${conteudoHtml || ""}
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" id="modal-cancel">Cancelar</button>
        <button type="button" class="btn ${classeConfirmar || "btn-primary"}" id="modal-confirm">
          ${textoConfirmar || "Confirmar"}
        </button>
      </div>
    `;

    mb.classList.add("is-open");

    const input = dialog.querySelector("input");
    if (input) {
      setTimeout(() => {
        input.focus();
        input.select();
      }, 40);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          dialog.querySelector("#modal-confirm").click();
        }
      });
    }

    dialog.querySelector("#modal-close-x").addEventListener("click", fecharModal);
    dialog.querySelector("#modal-cancel").addEventListener("click", fecharModal);
    dialog.querySelector("#modal-confirm").addEventListener("click", () => {
      const fechar = aoConfirmar ? aoConfirmar(dialog) : true;
      if (fechar !== false) fecharModal();
    });
  }

  function renderizarSidebar(paginaAtual) {
    const { icone } = global.ConectaIcones;
    const dados = global.ConectaDados;
    const resumo = global.ConectaStorage.calcularResumoProgresso();
    const concluidos = resumo.estado.capitulosConcluidos;

    const capitulosLinks = dados.capitulos
      .map((cap) => {
        const ativo = paginaAtual === cap.arquivo ? "is-active" : "";
        const feito = concluidos.includes(cap.id) ? "is-done" : "";
        return `
          <li>
            <a href="${cap.arquivo}" class="nav-item ${ativo}" data-rota="${cap.arquivo}" data-rotulo="Capítulo ${cap.numero}: ${cap.titulo}">
              <span class="nav-item-main">
                ${icone("bookOpen", 17)}
                <span class="nav-item-label">${cap.numero}. ${cap.titulo}</span>
              </span>
              <span class="nav-status-dot ${feito}" title="${feito ? "Concluído" : "Pendente"}"></span>
            </a>
          </li>
        `;
      })
      .join("");

    return `
      <div class="sidebar-backdrop" id="sidebar-backdrop"></div>
      <aside class="sidebar" id="app-sidebar" aria-label="Navegação principal">
        <div class="sidebar-brand">
          <a href="index.html" class="brand-link">
            <span class="brand-logo">${icone("audioLines", 20)}</span>
            <span>
              <span class="brand-name" style="display:block;">ConectaEdu</span>
              <span class="brand-sub" style="display:block;">Áudio Digital · Multimídia</span>
            </span>
          </a>
          <button type="button" class="btn btn-ghost btn-icon sidebar-close-btn" id="sidebar-close-btn" aria-label="Fechar menu">
            ${icone("x", 18)}
          </button>
        </div>

        <nav class="sidebar-nav">
          <div>
            <div class="nav-group-label">Visão Geral</div>
            <ul class="nav-list">
              <li>
                <a href="index.html" class="nav-item ${paginaAtual === "index.html" ? "is-active" : ""}" data-rota="index.html" data-rotulo="Dashboard">
                  <span class="nav-item-main">
                    ${icone("layoutDashboard", 17)}
                    <span class="nav-item-label">Dashboard</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="modulos.html" class="nav-item ${paginaAtual === "modulos.html" ? "is-active" : ""}" data-rota="modulos.html" data-rotulo="Módulos e Progresso">
                  <span class="nav-item-main">
                    ${icone("layers", 17)}
                    <span class="nav-item-label">Módulos</span>
                  </span>
                  <span class="nav-pill">${resumo.concluidosCount}/${resumo.totalCapitulos}</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div class="nav-group-label">Capítulos (Não-Linear)</div>
            <ul class="nav-list">
              ${capitulosLinks}
            </ul>
          </div>

          <div>
            <div class="nav-group-label">Avaliação</div>
            <ul class="nav-list">
              <li>
                <a href="quiz.html" class="nav-item ${paginaAtual === "quiz.html" ? "is-active" : ""}" data-rota="quiz.html" data-rotulo="Quiz Interativo">
                  <span class="nav-item-main">
                    ${icone("helpCircle", 17)}
                    <span class="nav-item-label">Quiz Interativo</span>
                  </span>
                  <span class="nav-pill">${resumo.melhorNota !== null ? resumo.melhorNota + "%" : "15+ Q"}</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-progress-box">
            <div class="sidebar-progress-top">
              <span>Progresso do Curso</span>
              <span>${resumo.percentualGeral}%</span>
            </div>
            <div class="progress progress-sm" role="progressbar" aria-valuenow="${resumo.percentualGeral}" aria-valuemin="0" aria-valuemax="100">
              <div class="progress-fill" style="width: ${resumo.percentualGeral}%;"></div>
            </div>
            <div class="sidebar-progress-meta">
              ${resumo.concluidosCount} de ${resumo.totalCapitulos} módulos · ${resumo.midiasVistasCount}/${resumo.totalMidias} mídias
            </div>
          </div>
        </div>
      </aside>
    `;
  }

  function renderizarTopbar(tituloPagina) {
    const { icone } = global.ConectaIcones;
    const estado = global.ConectaStorage.carregarEstado();
    const inicial = (estado.nomeEstudante || "E").charAt(0).toUpperCase();
    const temaIcone = estado.tema === "dark" ? "sun" : "moon";
    const temaLabel = estado.tema === "dark" ? "Ativar tema claro" : "Ativar tema escuro";

    return `
      <header class="topbar">
        <div class="topbar-left">
          <button type="button" class="btn btn-outline btn-icon mobile-menu-btn" id="mobile-menu-btn" aria-label="Abrir menu lateral">
            ${icone("menu", 18)}
          </button>
          <nav class="breadcrumb" aria-label="Localização atual">
            <span>ConectaEdu</span>
            ${icone("chevronRight", 14)}
            <span class="breadcrumb-current">${tituloPagina}</span>
          </nav>
        </div>

        <div class="topbar-actions">
          <button type="button" class="student-chip" id="btn-editar-estudante" title="Editar nome do estudante">
            <span class="student-avatar">${inicial}</span>
            <span class="student-chip-name">${estado.nomeEstudante}</span>
          </button>
          <button type="button" class="btn btn-outline btn-icon" id="btn-alternar-tema" aria-label="${temaLabel}" title="${temaLabel}">
            ${icone(temaIcone, 17)}
          </button>
        </div>
      </header>
    `;
  }

  function aplicarSpotlightCards() {
    document.querySelectorAll(".card-spotlight").forEach((card) => {
      if (card.dataset.spotlightBound === "1") return;
      card.dataset.spotlightBound = "1";
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        card.style.setProperty("--my", `${e.clientY - rect.top}px`);
      });
    });
  }

  global.ConectaUI = {
    renderizarSidebar,
    renderizarTopbar,
    aplicarSpotlightCards,
    mostrarToast,
    abrirModal,
    fecharModal
  };
})(window);
