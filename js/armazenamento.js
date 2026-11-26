/* ==========================================================================
   ConectaEdu — Persistência Local do Estudante (localStorage)
   ========================================================================== */

(function (global) {
  const CHAVE_ESTADO = "conectaedu_audio_digital_v1";

  function criarEstadoPadrao() {
    return {
      nomeEstudante: "Estudante",
      tema: "light",
      capitulosConcluidos: [],
      ultimoCapitulo: null,
      midiasExploradas: [],
      quizTentativas: [],
      atividadesRecentes: [
        {
          id: "init-1",
          titulo: "Ambiente educativo de Áudio Digital iniciado",
          icone: "audioLines",
          timestamp: new Date().toISOString()
        }
      ]
    };
  }

  function carregarEstado() {
    try {
      const bruto = global.localStorage.getItem(CHAVE_ESTADO);
      if (!bruto) {
        const padrao = criarEstadoPadrao();
        salvarEstado(padrao);
        return padrao;
      }
      const parsed = JSON.parse(bruto);
      return Object.assign(criarEstadoPadrao(), parsed);
    } catch (e) {
      return criarEstadoPadrao();
    }
  }

  function salvarEstado(estado) {
    try {
      global.localStorage.setItem(CHAVE_ESTADO, JSON.stringify(estado));
    } catch (e) {
      // Fallback silencioso caso o navegador bloqueie storage local
    }
  }

  function registrarAtividade(titulo, icone) {
    const estado = carregarEstado();
    const nova = {
      id: "act-" + Date.now(),
      titulo: titulo,
      icone: icone || "info",
      timestamp: new Date().toISOString()
    };
    estado.atividadesRecentes = [nova, ...(estado.atividadesRecentes || [])].slice(0, 6);
    salvarEstado(estado);
    return estado;
  }

  function definirNomeEstudante(nome) {
    const limpo = (nome || "").trim().slice(0, 32) || "Estudante";
    const estado = carregarEstado();
    estado.nomeEstudante = limpo;
    salvarEstado(estado);
    registrarAtividade(`Perfil atualizado para ${limpo}`, "user");
    return carregarEstado();
  }

  function alternarTema() {
    const estado = carregarEstado();
    estado.tema = estado.tema === "dark" ? "light" : "dark";
    salvarEstado(estado);
    return estado.tema;
  }

  function calcularResumoProgresso() {
    const estado = carregarEstado();
    const dados = global.ConectaDados;
    const totalCapitulos = dados.capitulos.length;
    const concluidos = estado.capitulosConcluidos.filter((id) =>
      dados.capitulos.some((c) => c.id === id)
    );
    const totalMidias = dados.midiasObrigatorias.length;
    const midiasVistas = estado.midiasExploradas.length;
    const tentativas = estado.quizTentativas || [];
    const ultimaTentativa = tentativas.length > 0 ? tentativas[tentativas.length - 1] : null;
    const melhorNota =
      tentativas.length > 0
        ? Math.max(...tentativas.map((t) => t.percentual))
        : null;
    const mediaNota =
      tentativas.length > 0
        ? Math.round(
            tentativas.reduce((acc, t) => acc + t.percentual, 0) / tentativas.length
          )
        : null;

    // 80% pelos 4 capítulos (20% cada) + 20% por realizar o quiz
    const pesoCapitulos = (concluidos.length / totalCapitulos) * 80;
    const pesoQuiz = tentativas.length > 0 ? 20 : 0;
    const percentualGeral = Math.round(pesoCapitulos + pesoQuiz);

    const proximoCapitulo =
      dados.capitulos.find((c) => !concluidos.includes(c.id)) ||
      dados.capitulos[0];

    return {
      estado,
      totalCapitulos,
      concluidosCount: concluidos.length,
      pendentesCount: totalCapitulos - concluidos.length,
      totalMidias,
      midiasVistasCount: midiasVistas,
      tentativasCount: tentativas.length,
      ultimaNota: ultimaTentativa ? ultimaTentativa.percentual : null,
      melhorNota,
      mediaNota,
      percentualGeral,
      proximoCapitulo
    };
  }

  function alternarConclusaoCapitulo(capituloId) {
    const estado = carregarEstado();
    const dados = global.ConectaDados;
    const cap = dados.capitulos.find((c) => c.id === capituloId);
    if (!cap) return false;

    const jaConcluido = estado.capitulosConcluidos.includes(capituloId);
    if (jaConcluido) {
      estado.capitulosConcluidos = estado.capitulosConcluidos.filter((id) => id !== capituloId);
      salvarEstado(estado);
      registrarAtividade(`Capítulo ${cap.numero} reaberto para estudo`, "bookOpen");
      return false;
    }

    estado.capitulosConcluidos = [...estado.capitulosConcluidos, capituloId];
    estado.ultimoCapitulo = capituloId;
    salvarEstado(estado);
    registrarAtividade(`Capítulo ${cap.numero} (${cap.titulo}) concluído`, "checkCircle2");
    return true;
  }

  function marcarMidiaExplorada(midiaId) {
    const estado = carregarEstado();
    const midia = global.ConectaDados.midiasObrigatorias.find((m) => m.id === midiaId);
    if (!midia || estado.midiasExploradas.includes(midiaId)) return false;

    estado.midiasExploradas = [...estado.midiasExploradas, midiaId];
    salvarEstado(estado);
    registrarAtividade(`Recurso explorado: ${midia.nome}`, midia.icone);
    return true;
  }

  function reiniciarProgresso() {
    const atual = carregarEstado();
    const novo = criarEstadoPadrao();
    novo.tema = atual.tema;
    novo.nomeEstudante = atual.nomeEstudante;
    novo.atividadesRecentes = [
      {
        id: "reset-" + Date.now(),
        titulo: "Progresso reiniciado pelo estudante",
        icone: "rotateCcw",
        timestamp: new Date().toISOString()
      }
    ];
    salvarEstado(novo);
    return novo;
  }

  global.ConectaStorage = {
    carregarEstado,
    salvarEstado,
    registrarAtividade,
    definirNomeEstudante,
    alternarTema,
    calcularResumoProgresso,
    alternarConclusaoCapitulo,
    marcarMidiaExplorada,
    reiniciarProgresso
  };
})(window);
