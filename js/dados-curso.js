/* ==========================================================================
   ConectaEdu — Dados Estruturados do Curso (Baseado no PDF de Áudio Digital)
   ========================================================================== */

(function (global) {
  const CURSO_DADOS = {
    titulo: "Áudio Digital",
    disciplina: "Sistemas Multimídia",
    midiasObrigatorias: [
      { id: "matricial", nome: "Imagem Matricial", pasta: "assets/img/", capitulo: 1, icone: "image" },
      { id: "vetorial", nome: "Imagem Vetorial", pasta: "assets/svg/", capitulo: 1, icone: "penTool" },
      { id: "audio", nome: "Áudio Digitalizado", pasta: "assets/audio/", capitulo: 2, icone: "volume2" },
      { id: "animacao", nome: "Animação", pasta: "assets/animacao/", capitulo: 2, icone: "sparkles" },
      { id: "video", nome: "Vídeo", pasta: "assets/video/", capitulo: 3, icone: "video" },
      { id: "midi", nome: "Música MIDI", pasta: "assets/midi/", capitulo: 4, icone: "music" }
    ],
    capitulos: [
      {
        id: 1,
        arquivo: "capitulo1.html",
        numero: "01",
        titulo: "Propriedades Físicas do Som",
        descricao:
          "Ondas de pressão atmosférica, transdutores (microfones e alto-falantes), ondas senoidais, Análise de Fourier e representação analógica.",
        duracao: "15 min",
        slidesRef: "Slides 3–7",
        topicos: ["Transdutores", "Onda Senoidal", "Fourier", "Sinal Analógico"],
        subtopicos: [
          "Propagação sonora como ondas de pressão atmosférica",
          "Transdutores acústico-elétrico (microfones) e elétrico-acústico (alto-falantes)",
          "Potência proporcional ao quadrado da amplitude",
          "Síntese aditiva e Análise de Fourier (combinação de senoides)",
          "Armazenamento analógico e contaminação por ruído"
        ],
        midias: ["Imagem Matricial", "Imagem Vetorial"],
        midiasIds: ["matricial", "vetorial"]
      },
      {
        id: 2,
        arquivo: "capitulo2.html",
        numero: "02",
        titulo: "Representação Digital do Som",
        descricao:
          "Conversão ADC/DAC, modulação PCM, limitação em banda (300–3400 Hz), Critério de Nyquist, quantização, ruído e codificação binária.",
        duracao: "25 min",
        slidesRef: "Slides 8–26",
        topicos: ["PCM", "Critério de Nyquist", "Quantização", "Bitrate"],
        subtopicos: [
          "Amostras de som, arquivos e cadeia ADC → Sistema Digital → DAC",
          "Filtragem passa-baixas para voz (300 Hz a 3400 Hz)",
          "Teorema da amostragem (Fa ≥ 2 · Fmax) e telefonia (8000 Hz, Ta = 125 µs)",
          "Quantização PAM, erro/ruído de quantização e codificação q = μ^ν",
          "Cálculos de taxa e tamanho: Telefonia (64 kbps) vs. CD Audio (705,6 kbps/canal)"
        ],
        midias: ["Imagem Vetorial", "Animação", "Áudio"],
        midiasIds: ["vetorial", "animacao", "audio"]
      },
      {
        id: 3,
        arquivo: "capitulo3.html",
        numero: "03",
        titulo: "Processamento Digital do Som",
        descricao:
          "Operações no domínio do tempo (corte, cópia, mixagem) e no domínio da frequência (filtragem, síntese musical e equalizador gráfico).",
        duracao: "18 min",
        slidesRef: "Slides 27–30",
        topicos: ["Domínio do Tempo", "Domínio da Frequência", "Equalizador Gráfico"],
        subtopicos: [
          "Domínio do tempo: operações sobre amostras separadas",
          "Edição básica: armazenar, cortar, copiar, colar, realçar, atenuar e mixar",
          "Domínio da frequência: análise de sequências de amostras",
          "Filtragem digital, ajustes de duração/altura, síntese e reconhecimento de voz",
          "Funcionamento do equalizador gráfico multibanda (31 Hz a 16 kHz)"
        ],
        midias: ["Vídeo", "Imagem Matricial"],
        midiasIds: ["video", "matricial"]
      },
      {
        id: 4,
        arquivo: "capitulo4.html",
        numero: "04",
        titulo: "Compressão e Formatos de Áudio",
        descricao:
          "Codecs, princípios de compressão (redundâncias), codificações PCM/ADPCM/MP3, comparação MPEG e AC-3, e formatos de armazenamento.",
        duracao: "20 min",
        slidesRef: "Slides 31–35",
        topicos: ["Codecs", "Redundâncias", "MPEG & AC-3", "Formatos WAV/MP3"],
        subtopicos: [
          "Codecs de compactação de áudio em sistemas multimídia",
          "Princípios: redundância estatística, temporal, do conhecimento e sistema auditivo",
          "Codificações PCM (não comprimido), ADPCM e MP3 (MPEG Camada 3)",
          "Comparativo de algoritmos MPEG Camada 1/2/3 e AC-3 Dolby",
          "Formatos de armazenamento: AIFF, AU, MOV, MPA/MP2, MP3, QT, RA/RAM, WAV e WMA"
        ],
        midias: ["Música MIDI", "Áudio"],
        midiasIds: ["midi", "audio"]
      }
    ]
  };

  global.ConectaDados = CURSO_DADOS;
})(window);
