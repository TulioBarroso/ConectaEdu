/* ==========================================================================
   ConectaEdu — Lógica da Página de Dashboard (KPIs, Módulos, Atividades e Onda)
   ========================================================================== */

(function (global) {
  let filtroAtual = "todos";
  let audioCtx = null;
  let osciladorAtivo = null;

  function animarContador(elemento, valorFinal, sufixo) {
    if (!elemento) return;
    const duracao = 520;
    const inicio = performance.now();

    function passo(agora) {
      const progresso = Math.min((agora - inicio) / duracao, 1);
      const ease = 1 - Math.pow(1 - progresso, 3);
      const atual = Math.round(valorFinal * ease);
      elemento.textContent = `${atual}${sufixo || ""}`;
      if (progresso < 1) {
        requestAnimationFrame(passo);
      }
    }

    requestAnimationFrame(passo);
  }

  function formatarHorario(iso) {
    try {
      const data = new Date(iso);
      return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "Agora";
    }
  }

  function renderizarHero(resumo) {
    const { icone } = global.ConectaIcones;
    const saudacaoEl = document.getElementById("hero-saudacao");
    const btnContinuar = document.getElementById("btn-continuar-estudos");
    const dicaProximo = document.getElementById("hero-proximo-texto");

    if (saudacaoEl) {
      saudacaoEl.textContent = `Olá, ${resumo.estado.nomeEstudante}! Explore o universo do Áudio Digital`;
    }

    if (btnContinuar) {
      const prox = resumo.proximoCapitulo;
      const textoBtn =
        resumo.concluidosCount === 0
          ? `Iniciar Cap. ${prox.numero}`
          : resumo.concluidosCount === resumo.totalCapitulos
          ? "Revisar Capítulos"
          : `Continuar: Cap. ${prox.numero}`;

      btnContinuar.setAttribute("href", prox.arquivo);
      btnContinuar.setAttribute("data-rota", prox.arquivo);
      btnContinuar.setAttribute("data-rotulo", `Capítulo ${prox.numero}: ${prox.titulo}`);
      btnContinuar.innerHTML = `${icone("play", 16)} <span>${textoBtn}</span>`;
    }

    if (dicaProximo) {
      const prox = resumo.proximoCapitulo;
      dicaProximo.textContent =
        resumo.concluidosCount === resumo.totalCapitulos
          ? "Todos os 4 capítulos concluídos! Teste seus conhecimentos no Quiz Interativo."
          : `Próximo passo sugerido: Capítulo ${prox.numero} — ${prox.titulo} (${prox.duracao})`;
    }
  }

  function renderizarKPIs(resumo) {
    const kpiNota = document.getElementById("kpi-nota-valor");
    const kpiNotaSub = document.getElementById("kpi-nota-sub");
    const kpiCaps = document.getElementById("kpi-capitulos-valor");
    const kpiCapsSub = document.getElementById("kpi-capitulos-sub");
    const kpiProg = document.getElementById("kpi-progresso-valor");
    const kpiProgBar = document.getElementById("kpi-progresso-barra");
    const kpiMidias = document.getElementById("kpi-midias-valor");
    const kpiMidiasSub = document.getElementById("kpi-midias-sub");

    if (kpiNota) {
      if (resumo.ultimaNota === null) {
        kpiNota.textContent = "—";
        kpiNotaSub.textContent = "Nenhuma tentativa realizada";
      } else {
        animarContador(kpiNota, resumo.ultimaNota, "%");
        kpiNotaSub.textContent = `Melhor: ${resumo.melhorNota}% · ${resumo.tentativasCount} tentativa(s)`;
      }
    }

    if (kpiCaps) {
      kpiCaps.textContent = `${resumo.concluidosCount} / ${resumo.totalCapitulos}`;
      kpiCapsSub.textContent =
        resumo.pendentesCount === 0
          ? "Todos os capítulos concluídos"
          : `${resumo.pendentesCount} capítulo(s) pendente(s)`;
    }

    if (kpiProg) {
      animarContador(kpiProg, resumo.percentualGeral, "%");
      if (kpiProgBar) kpiProgBar.style.width = `${resumo.percentualGeral}%`;
    }

    if (kpiMidias) {
      kpiMidias.textContent = `${resumo.midiasVistasCount} / ${resumo.totalMidias}`;
      kpiMidiasSub.textContent =
        resumo.midiasVistasCount === resumo.totalMidias
          ? "Todas as 6 mídias exploradas"
          : "6 tipos obrigatórios no curso";
    }
  }

  function renderizarModulos(resumo) {
    const { icone } = global.ConectaIcones;
    const container = document.getElementById("dashboard-modulos-lista");
    if (!container) return;

    const concluidos = resumo.estado.capitulosConcluidos;
    const filtrados = global.ConectaDados.capitulos.filter((cap) => {
      const estaConcluido = concluidos.includes(cap.id);
      if (filtroAtual === "concluidos") return estaConcluido;
      if (filtroAtual === "pendentes") return !estaConcluido;
      return true;
    });

    if (filtrados.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          Nenhum módulo encontrado para o filtro selecionado.
        </div>
      `;
      return;
    }

    container.innerHTML = filtrados
      .map((cap, idx) => {
        const concluido = concluidos.includes(cap.id);
        const badge = concluido
          ? `<span class="badge badge-success">${icone("check", 13)} Concluído</span>`
          : `<span class="badge badge-neutral">Pendente</span>`;

        const topicosHtml = cap.topicos
          .map((t) => `<span class="topic-chip">${t}</span>`)
          .join("");

        return `
          <article class="card card-interactive card-spotlight module-card animate-in delay-${idx + 1}">
            <div>
              <div class="module-card-head">
                <span class="module-num">CAPÍTULO ${cap.numero} · ${cap.slidesRef}</span>
                ${badge}
              </div>
              <h3 class="module-title">${cap.titulo}</h3>
              <p class="module-desc">${cap.descricao}</p>
              <div class="module-topics">${topicosHtml}</div>
            </div>

            <div class="module-footer">
              <span class="module-media-tags" title="Mídias integradas neste capítulo">
                ${icone("clock", 14)} ${cap.duracao} · ${cap.midias.join(" + ")}
              </span>
              <a
                href="${cap.arquivo}"
                class="btn btn-outline btn-sm"
                data-rota="${cap.arquivo}"
                data-rotulo="Capítulo ${cap.numero}: ${cap.titulo}"
              >
                <span>Acessar</span>
                ${icone("arrowRight", 14)}
              </a>
            </div>
          </article>
        `;
      })
      .join("");

    global.ConectaUI.aplicarSpotlightCards();
  }

  function renderizarChecklistMidias(resumo) {
    const { icone } = global.ConectaIcones;
    const lista = document.getElementById("dashboard-midias-checklist");
    const barra = document.getElementById("midias-progresso-barra");
    if (!lista) return;

    const vistas = resumo.estado.midiasExploradas || [];
    const pct = Math.round((vistas.length / resumo.totalMidias) * 100);
    if (barra) barra.style.width = `${pct}%`;

    lista.innerHTML = global.ConectaDados.midiasObrigatorias
      .map((m) => {
        const explorada = vistas.includes(m.id);
        return `
          <div class="media-check-item ${explorada ? "is-explored" : ""}" title="Prevista no Capítulo 0${m.capitulo} (${m.pasta})">
            <span class="media-check-dot">
              ${explorada ? icone("check", 11) : icone(m.icone, 11)}
            </span>
            <span>${m.nome}</span>
          </div>
        `;
      })
      .join("");
  }

  function renderizarAtividades(resumo) {
    const { icone } = global.ConectaIcones;
    const lista = document.getElementById("dashboard-atividades-lista");
    if (!lista) return;

    const atividades = resumo.estado.atividadesRecentes || [];
    if (atividades.length === 0) {
      lista.innerHTML = '<div class="empty-state">Nenhuma atividade registrada ainda.</div>';
      return;
    }

    lista.innerHTML = atividades
      .map(
        (act) => `
          <li class="activity-item">
            <span class="activity-icon">${icone(act.icone || "info", 15)}</span>
            <div>
              <div class="activity-title">${act.titulo}</div>
              <div class="activity-time">${formatarHorario(act.timestamp)}</div>
            </div>
          </li>
        `
      )
      .join("");
  }

  function atualizarDashboard() {
    const resumo = global.ConectaStorage.calcularResumoProgresso();
    renderizarHero(resumo);
    renderizarKPIs(resumo);
    renderizarModulos(resumo);
    renderizarChecklistMidias(resumo);
    renderizarAtividades(resumo);
  }

  function iniciarFiltros() {
    const botoes = document.querySelectorAll("[data-filtro-modulo]");
    botoes.forEach((btn) => {
      btn.addEventListener("click", () => {
        filtroAtual = btn.getAttribute("data-filtro-modulo");
        botoes.forEach((b) => b.classList.toggle("is-active", b === btn));
        renderizarModulos(global.ConectaStorage.calcularResumoProgresso());
      });
    });
  }

  function iniciarResetProgresso() {
    const btnReset = document.getElementById("btn-reiniciar-progresso");
    if (!btnReset) return;

    btnReset.addEventListener("click", () => {
      global.ConectaUI.abrirModal({
        titulo: "Reiniciar progresso do curso?",
        descricao:
          "Isso limpará os capítulos concluídos, o histórico do quiz e as mídias exploradas salvos neste navegador.",
        textoConfirmar: "Sim, reiniciar",
        classeConfirmar: "btn-primary",
        aoConfirmar: () => {
          global.ConectaStorage.reiniciarProgresso();
          global.ConectaPrincipal.montarShell();
          atualizarDashboard();
          global.ConectaUI.mostrarToast(
            "Progresso reiniciado",
            "Seus indicadores voltaram ao estado inicial.",
            "rotateCcw"
          );
        }
      });
    });
  }

  /* Visualizador Acústico Interativo no Hero (Onda Senoidal vs Síntese Aditiva/Fourier) */
  function iniciarOndaAcustica() {
    const canvas = document.getElementById("hero-wave-canvas");
    const btnModo = document.getElementById("btn-wave-modo");
    const btnSom = document.getElementById("btn-wave-som");
    const labelModo = document.getElementById("wave-freq-label");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let modo = "fourier"; // 'senoidal' | 'fourier'
    let fase = 0;
    let freqFator = 1;

    function ajustarResolucao() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const xNorm = (e.clientX - rect.left) / Math.max(rect.width, 1);
      freqFator = 0.7 + xNorm * 1.1;
      if (osciladorAtivo && audioCtx) {
        osciladorAtivo.frequency.setTargetAtTime(220 * freqFator, audioCtx.currentTime, 0.04);
      }
    });

    canvas.addEventListener("mouseleave", () => {
      freqFator = 1;
      if (osciladorAtivo && audioCtx) {
        osciladorAtivo.frequency.setTargetAtTime(220, audioCtx.currentTime, 0.08);
      }
    });

    if (btnModo) {
      btnModo.addEventListener("click", () => {
        modo = modo === "fourier" ? "senoidal" : "fourier";
        btnModo.textContent = modo === "fourier" ? "Modo: Fourier (Complexa)" : "Modo: Onda Senoidal";
        if (labelModo) {
          labelModo.textContent = modo === "fourier" ? "f₁ + f₂ + f₃" : "220 Hz pura";
        }
      });
    }

    if (btnSom) {
      btnSom.addEventListener("click", () => {
        const { icone } = global.ConectaIcones;
        if (osciladorAtivo) {
          osciladorAtivo.stop();
          osciladorAtivo.disconnect();
          osciladorAtivo = null;
          btnSom.innerHTML = `${icone("volume2", 14)} <span>Ouvir tom</span>`;
          return;
        }
        try {
          const AudioContext = global.AudioContext || global.webkitAudioContext;
          if (!audioCtx) audioCtx = new AudioContext();
          if (audioCtx.state === "suspended") audioCtx.resume();

          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = modo === "fourier" ? "triangle" : "sine";
          osc.frequency.value = 220 * freqFator;
          gain.gain.value = 0.035;
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osciladorAtivo = osc;
          btnSom.innerHTML = `${icone("pause", 14)} <span>Silenciar</span>`;
        } catch (err) {
          global.ConectaUI.mostrarToast("Áudio indisponível", "Seu navegador bloqueou a Web Audio API.", "info");
        }
      });
    }

    function desenhar() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) {
        requestAnimationFrame(desenhar);
        return;
      }

      const estilo = getComputedStyle(document.documentElement);
      const corBorda = estilo.getPropertyValue("--border").trim() || "#e2e8f0";
      const corAccent = estilo.getPropertyValue("--accent").trim() || "#2563eb";
      const corIndigo = estilo.getPropertyValue("--indigo").trim() || "#4f46e5";

      ctx.clearRect(0, 0, w, h);

      // Linha central (eixo de equilíbrio de pressão)
      ctx.beginPath();
      ctx.strokeStyle = corBorda;
      ctx.lineWidth = 1;
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, corAccent);
      grad.addColorStop(1, corIndigo);

      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.4;

      for (let x = 0; x <= w; x += 2) {
        const t = (x / w) * Math.PI * 4 * freqFator + fase;
        let yNorm = Math.sin(t) * 0.68;
        if (modo === "fourier") {
          yNorm =
            Math.sin(t) * 0.52 +
            Math.sin(t * 2) * 0.24 +
            Math.sin(t * 3) * 0.14;
        }
        const y = h / 2 - yNorm * (h * 0.38);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      fase += 0.045;
      requestAnimationFrame(desenhar);
    }

    ajustarResolucao();
    window.addEventListener("resize", ajustarResolucao);
    requestAnimationFrame(desenhar);
  }

  document.addEventListener("DOMContentLoaded", () => {
    atualizarDashboard();
    iniciarFiltros();
    iniciarResetProgresso();
    iniciarOndaAcustica();
  });

  global.atualizarDashboard = atualizarDashboard;
})(window);
