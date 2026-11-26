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
        midias: ["Imagem Matricial", "Imagem Vetorial"]
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
        midias: ["Imagem Vetorial", "Animação", "Áudio"]
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
        midias: ["Vídeo", "Imagem Matricial"]
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
        midias: ["Música MIDI", "Áudio"]
      }
    ]
  };

  global.ConectaDados = CURSO_DADOS;
})(window);
