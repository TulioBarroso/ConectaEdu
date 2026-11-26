/* ==========================================================================
   ConectaEdu — Página de Módulos e Progresso do Estudante
   ========================================================================== */

(function (global) {
  let filtroModulo = "todos";
  let termoBusca = "";
  const ementasAbertas = new Set();

  function normalizarTexto(texto) {
    return (texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function renderizarCabecalhoProgresso(resumo) {
    const { icone } = global.ConectaIcones;
    const btnProx = document.getElementById("btn-modulos-continuar");
    if (btnProx) {
      const prox = resumo.proximoCapitulo;
      btnProx.setAttribute("href", prox.arquivo);
      btnProx.innerHTML = `${icone("play", 16)} <span>${
        resumo.concluidosCount === resumo.totalCapitulos
          ? `Revisar Cap. ${prox.numero}`
          : `Continuar: Cap. ${prox.numero}`
      }</span>`;
    }

    // Anel SVG de conclusão
    const circulo = document.getElementById("ring-fg-progresso");
    const valorEl = document.getElementById("ring-percentual-valor");
    const descEl = document.getElementById("ring-progresso-desc");
    const raio = 38;
    const circunferencia = 2 * Math.PI * raio;

    if (circulo) {
      circulo.style.strokeDasharray = `${circunferencia}`;
      const offset = circunferencia - (resumo.percentualGeral / 100) * circunferencia;
      circulo.style.strokeDashoffset = `${offset}`;
    }
    if (valorEl) {
      valorEl.textContent = `${resumo.percentualGeral}%`;
    }
    if (descEl) {
      descEl.textContent =
        resumo.percentualGeral === 100
          ? "Trilha completa! Todos os módulos e o quiz foram concluídos."
          : `${resumo.concluidosCount} de ${resumo.totalCapitulos} capítulos (80%) + Quiz ${
              resumo.tentativasCount > 0 ? "realizado (20%)" : "pendente (20%)"
            }.`;
    }

    // Status concluídos vs pendentes
    const elConcluidos = document.getElementById("split-concluidos-val");
    const elPendentes = document.getElementById("split-pendentes-val");
    const elMidias = document.getElementById("split-midias-val");
    if (elConcluidos) elConcluidos.textContent = `${resumo.concluidosCount} / ${resumo.totalCapitulos}`;
    if (elPendentes) elPendentes.textContent = `${resumo.pendentesCount}`;
    if (elMidias) elMidias.textContent = `${resumo.midiasVistasCount} / ${resumo.totalMidias}`;

    // Desempenho no Quiz
    const elMelhor = document.getElementById("quiz-stat-melhor");
    const elUltima = document.getElementById("quiz-stat-ultima");
    const elTentativas = document.getElementById("quiz-stat-tentativas");
    const elQuizMsg = document.getElementById("quiz-stat-msg");

    if (elMelhor) elMelhor.textContent = resumo.melhorNota !== null ? `${resumo.melhorNota}%` : "—";
    if (elUltima) elUltima.textContent = resumo.ultimaNota !== null ? `${resumo.ultimaNota}%` : "—";
    if (elTentativas) elTentativas.textContent = `${resumo.tentativasCount}`;
    if (elQuizMsg) {
      elQuizMsg.textContent =
        resumo.tentativasCount === 0
          ? "Realize o Quiz Interativo (mín. 5 perguntas sorteadas) para registrar seu desempenho."
          : `Média geral: ${resumo.mediaNota}% nas ${resumo.tentativasCount} tentativa(s) registrada(s).`;
    }
  }

  function renderizarCatalogoModulos(resumo) {
    const { icone } = global.ConectaIcones;
    const container = document.getElementById("modulos-catalogo-lista");
    const contadorEl = document.getElementById("modulos-contador-resultado");
    if (!container) return;

    const concluidos = resumo.estado.capitulosConcluidos;
    const buscaNorm = normalizarTexto(termoBusca.trim());

    const filtrados = global.ConectaDados.capitulos.filter((cap) => {
      const estaConcluido = concluidos.includes(cap.id);
      if (filtroModulo === "concluidos" && !estaConcluido) return false;
      if (filtroModulo === "pendentes" && estaConcluido) return false;

      if (buscaNorm) {
        const textoAlvo = normalizarTexto(
          [
            cap.numero,
            cap.titulo,
            cap.descricao,
            ...(cap.topicos || []),
            ...(cap.subtopicos || []),
            ...(cap.midias || [])
          ].join(" ")
        );
        if (!textoAlvo.includes(buscaNorm)) return false;
      }

      return true;
    });

    if (contadorEl) {
      contadorEl.textContent = `Exibindo ${filtrados.length} de ${global.ConectaDados.capitulos.length} capítulos`;
    }

    if (filtrados.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          Nenhum módulo corresponde aos filtros aplicados. Tente limpar a busca ou alternar o status.
        </div>
      `;
      return;
    }

    container.innerHTML = filtrados
      .map((cap, idx) => {
        const concluido = concluidos.includes(cap.id);
        const pct = concluido ? 100 : 0;
        const aberta = ementasAbertas.has(cap.id);

        const badgeStatus = concluido
          ? `<span class="badge badge-success">${icone("check", 13)} Concluído</span>`
          : `<span class="badge badge-warning">Pendente</span>`;

        const topicosHtml = cap.topicos
          .map((t) => `<span class="topic-chip">${t}</span>`)
          .join("");

        const subtopicosHtml = (cap.subtopicos || [])
          .map((s) => `<li>${s}</li>`)
          .join("");

        return `
          <article class="card card-interactive card-spotlight module-detail-card animate-in delay-${idx + 1}">
            <div>
              <div class="module-card-head">
                <span class="module-num">MÓDULO ${cap.numero} · ${cap.slidesRef}</span>
                ${badgeStatus}
              </div>

              <h3 class="module-title">${cap.titulo}</h3>
              <p class="module-desc">${cap.descricao}</p>

              <div class="module-topics">${topicosHtml}</div>

              <div class="module-progress-row">
                <span>Progresso do módulo · ${cap.duracao}</span>
                <span>${pct}%</span>
              </div>
              <div class="progress progress-sm">
                <div class="progress-fill ${concluido ? "progress-fill-success" : ""}" style="width: ${pct}%;"></div>
              </div>

              <button
                type="button"
                class="syllabus-toggle"
                data-toggle-ementa="${cap.id}"
                aria-expanded="${aberta ? "true" : "false"}"
              >
                <span>Ver ementa do módulo (${(cap.subtopicos || []).length} tópicos)</span>
                ${icone("chevronDown", 15)}
              </button>

              <ul class="module-syllabus ${aberta ? "is-open" : ""}" id="ementa-cap-${cap.id}">
                ${subtopicosHtml}
              </ul>
            </div>

            <div class="module-detail-actions">
              <button
                type="button"
                class="btn ${concluido ? "btn-outline" : "btn-ghost"} btn-sm"
                data-concluir-cap="${cap.id}"
              >
                ${icone(concluido ? "checkCircle2" : "check", 15)}
                <span>${concluido ? "Concluído" : "Marcar concluído"}</span>
              </button>

              <div style="display:flex; align-items:center; gap:8px;">
                <span class="badge badge-neutral" title="Mídias integradas neste capítulo">
                  ${cap.midias.join(" · ")}
                </span>
                <a href="${cap.arquivo}" class="btn btn-primary btn-sm">
                  <span>Abrir aula</span>
                  ${icone("arrowRight", 14)}
                </a>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    // Eventos das ementas expansíveis
    container.querySelectorAll("[data-toggle-ementa]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const capId = Number(btn.getAttribute("data-toggle-ementa"));
        const lista = document.getElementById(`ementa-cap-${capId}`);
        if (!lista) return;

        const abrir = !ementasAbertas.has(capId);
        if (abrir) ementasAbertas.add(capId);
        else ementasAbertas.delete(capId);

        btn.setAttribute("aria-expanded", abrir ? "true" : "false");
        lista.classList.toggle("is-open", abrir);
      });
    });

    // Eventos de marcar/desmarcar conclusão
    container.querySelectorAll("[data-concluir-cap]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const capId = Number(btn.getAttribute("data-concluir-cap"));
        const agoraConcluido = global.ConectaStorage.alternarConclusaoCapitulo(capId);
        const cap = global.ConectaDados.capitulos.find((c) => c.id === capId);

        global.ConectaPrincipal.montarShell();
        atualizarPaginaModulos();

        if (cap) {
          global.ConectaUI.mostrarToast(
            agoraConcluido ? "Módulo concluído" : "Módulo marcado como pendente",
            `Capítulo ${cap.numero} — ${cap.titulo}`,
            agoraConcluido ? "checkCircle2" : "bookOpen"
          );
        }
      });
    });

    global.ConectaUI.aplicarSpotlightCards();
  }

  function renderizarMapaMidias(resumo) {
    const { icone } = global.ConectaIcones;
    const container = document.getElementById("modulos-mapa-midias");
    if (!container) return;

    const vistas = resumo.estado.midiasExploradas || [];

    container.innerHTML = global.ConectaDados.midiasObrigatorias
      .map((m) => {
        const explorada = vistas.includes(m.id);
        return `
          <div class="media-map-item ${explorada ? "is-explored" : ""}">
            <span class="media-map-icon">
              ${icone(explorada ? "check" : m.icone, 16)}
            </span>
            <div>
              <div class="media-map-title">${m.nome}</div>
              <div class="media-map-meta">
                Capítulo 0${m.capitulo} · ${explorada ? "Explorada" : "Pendente"}
              </div>
              <code class="media-map-path">${m.pasta}</code>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function renderizarPendencias(resumo) {
    const { icone } = global.ConectaIcones;
    const container = document.getElementById("modulos-lista-pendencias");
    if (!container) return;

    const concluidos = resumo.estado.capitulosConcluidos;
    const pendentes = global.ConectaDados.capitulos.filter(
      (cap) => !concluidos.includes(cap.id)
    );

    const itens = pendentes.map(
      (cap) => `
        <li class="pending-item">
          <div>
            <div class="pending-item-title">Capítulo ${cap.numero}: ${cap.titulo}</div>
            <div class="pending-item-sub">${cap.duracao} · ${cap.midias.join(", ")}</div>
          </div>
          <a href="${cap.arquivo}" class="btn btn-outline btn-sm">
            <span>Estudar</span>
            ${icone("arrowRight", 14)}
          </a>
        </li>
      `
    );

    if (resumo.tentativasCount === 0) {
      itens.push(`
        <li class="pending-item">
          <div>
            <div class="pending-item-title">Quiz Interativo de Áudio Digital</div>
            <div class="pending-item-sub">5 questões sorteadas de um banco com 15+ perguntas</div>
          </div>
          <a href="quiz.html" class="btn btn-outline btn-sm">
            <span>Fazer Quiz</span>
            ${icone("arrowRight", 14)}
          </a>
        </li>
      `);
    }

    if (itens.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          Parabéns! Você não possui conteúdos pendentes no curso.
        </div>
      `;
      return;
    }

    container.innerHTML = `<ul class="pending-list">${itens.join("")}</ul>`;
  }

  function atualizarPaginaModulos() {
    const resumo = global.ConectaStorage.calcularResumoProgresso();
    renderizarCabecalhoProgresso(resumo);
    renderizarCatalogoModulos(resumo);
    renderizarMapaMidias(resumo);
    renderizarPendencias(resumo);
  }

  function iniciarControles() {
    const botoes = document.querySelectorAll("[data-filtro-catalogo]");
    botoes.forEach((btn) => {
      btn.addEventListener("click", () => {
        filtroModulo = btn.getAttribute("data-filtro-catalogo");
        botoes.forEach((b) => b.classList.toggle("is-active", b === btn));
        renderizarCatalogoModulos(global.ConectaStorage.calcularResumoProgresso());
      });
    });

    const inputBusca = document.getElementById("busca-modulos");
    if (inputBusca) {
      inputBusca.addEventListener("input", (e) => {
        termoBusca = e.target.value || "";
        renderizarCatalogoModulos(global.ConectaStorage.calcularResumoProgresso());
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    iniciarControles();
    atualizarPaginaModulos();
  });
})(window);
