// =====================================================================
//  DADOS DO MONITOR — edite somente este arquivo para atualizar o site
// =====================================================================
//
//  status possíveis:
//    "aguardando"   -> mandato ainda não começou / sem avaliação
//    "nao_iniciada" -> nenhuma ação concreta identificada
//    "em_andamento" -> projeto em tramitação, programa em implantação etc.
//    "parcial"      -> parte do critério foi atingida
//    "cumprida"     -> critério de cumprimento atingido
//    "abandonada"   -> retirada, rejeitada ou descartada oficialmente
//
//  Para registrar um avanço, adicione um item em "evidencias":
//    { data: "2027-03-15", descricao: "PEC aprovada na CCJ da Câmara", link: "https://..." }
//  e atualize "status".
// =====================================================================

window.META = {
  titulo: "Monitor de Promessas",
  subtitulo: "Acompanhamento das propostas do plano de governo registrado no TSE pela chapa eleita",
  mandato: "2027–2030",
  fontePlano: "https://static.congressoemfoco.com.br/2026/08/08/attachment/2026/08/08/32ce89_programa_governo_lula_2026.pdf",
  atualizadoEm: "2026-10-26"
};

window.PROMESSAS = [
  // ---------------- TRABALHO ----------------
  {
    id: "fim-6x1", eixo: "Trabalho",
    titulo: "Fim da escala 6x1 e jornada de 40 horas",
    plano: "Atuar no Senado para acabar com a escala 6x1 e reduzir a jornada para 40 horas semanais, sem redução de salário.",
    criterio: "Lei ou emenda constitucional promulgada fixando a jornada máxima em 40 horas semanais sem redução salarial.",
    verificar: "Tramitação no Senado e na Câmara (portais de dados abertos); Diário Oficial da União.",
    status: "aguardando", evidencias: []
  },
  {
    id: "pejotizacao", eixo: "Trabalho",
    titulo: "Conter a pejotização",
    plano: "Combater a contratação de trabalhadores como pessoa jurídica para mascarar vínculo de emprego.",
    criterio: "Lei aprovada ou norma publicada com regras específicas contra a pejotização irregular.",
    verificar: "Portais da Câmara e do Senado; Ministério do Trabalho.",
    status: "aguardando", evidencias: []
  },
  {
    id: "homologacao-sindical", eixo: "Trabalho",
    titulo: "Assistência sindical nas rescisões",
    plano: "Retomar a assistência sindical nas homologações de rescisão de contrato.",
    criterio: "Lei ou norma em vigor exigindo/garantindo a assistência sindical na homologação.",
    verificar: "Diário Oficial da União; portais do Congresso.",
    status: "aguardando", evidencias: []
  },
  {
    id: "aplicativos", eixo: "Trabalho",
    titulo: "Regras para trabalhadores de aplicativos",
    plano: "Regulamentar o trabalho em plataformas digitais: relação de trabalho, remuneração, direitos trabalhistas e previdenciários e transparência dos algoritmos.",
    criterio: "Lei sancionada cobrindo remuneração mínima, previdência e transparência algorítmica.",
    verificar: "Portais da Câmara e do Senado; Diário Oficial da União.",
    status: "aguardando", evidencias: []
  },
  {
    id: "autonomos", eixo: "Trabalho",
    titulo: "Apoio a autônomos e pequenos empreendedores",
    plano: "Ampliar crédito produtivo, qualificação, assistência técnica, simplificação tributária e proteção social para autônomos e pequenos negócios.",
    criterio: "Programa lançado com orçamento, metas e resultados publicados.",
    verificar: "Portal da Transparência; Ministério do Empreendedorismo; BNDES.",
    status: "aguardando", evidencias: []
  },

  // ---------------- ECONOMIA ----------------
  {
    id: "salario-minimo", eixo: "Economia",
    titulo: "Valorização do salário mínimo",
    plano: "Manter a regra de reajuste pela inflação mais a variação do PIB de dois anos antes, com ganho real limitado a 2,5% ao ano.",
    criterio: "Reajuste de cada ano (2027 a 2030) seguindo a regra, com ganho real acima de zero.",
    verificar: "Decreto anual do salário mínimo; INPC (IBGE); PIB (IBGE).",
    status: "aguardando", evidencias: []
  },
  {
    id: "arcabouco", eixo: "Economia",
    titulo: "Manter o arcabouço fiscal",
    plano: "Manter o arcabouço fiscal, controlar o crescimento do gasto primário e melhorar a qualidade do gasto.",
    criterio: "Regra fiscal mantida sem alteração que a enfraqueça e meta de resultado primário cumprida dentro da banda em cada ano.",
    verificar: "Tesouro Nacional (Resultado do Tesouro); Relatórios bimestrais de receitas e despesas; TCU.",
    status: "aguardando", evidencias: []
  },
  {
    id: "cesta-basica", eixo: "Economia",
    titulo: "Isenção de impostos na cesta básica",
    plano: "Manter a isenção de impostos sobre os itens da cesta básica.",
    criterio: "Isenção vigente durante todo o mandato.",
    verificar: "Legislação da reforma tributária; Receita Federal.",
    status: "aguardando", evidencias: []
  },
  {
    id: "neoindustrializacao", eixo: "Economia",
    titulo: "Neoindustrialização",
    plano: "Política industrial com prioridade para inovação, inteligência artificial, minerais críticos e tecnologias estratégicas.",
    criterio: "Programas com orçamento executado e metas de resultado publicadas.",
    verificar: "MDIC; BNDES; Portal da Transparência.",
    status: "aguardando", evidencias: []
  },
  {
    id: "investimento", eixo: "Economia",
    titulo: "Elevar a taxa de investimento",
    plano: "Aumentar a taxa de investimento da economia, com mais investimento público e privado.",
    criterio: "Taxa de investimento (FBCF/PIB) ao fim do mandato maior que a de 2026.",
    verificar: "IBGE — Contas Nacionais Trimestrais (SIDRA).",
    status: "aguardando", evidencias: []
  },
  {
    id: "tributacao-progressiva", eixo: "Economia",
    titulo: "Progressividade tributária",
    plano: "Dar continuidade a políticas que façam quem ganha mais pagar proporcionalmente mais impostos.",
    criterio: "Medidas aprovadas que aumentem a progressividade do sistema tributário.",
    verificar: "Portais do Congresso; Receita Federal.",
    status: "aguardando", evidencias: []
  },
  {
    id: "orcamento-participativo", eixo: "Economia",
    titulo: "Participação social no Orçamento",
    plano: "Ampliar a participação social no ciclo orçamentário e tornar o PPA 2028–2031 mais participativo.",
    criterio: "PPA 2028–2031 enviado ao Congresso com processo de consulta pública documentado.",
    verificar: "Ministério do Planejamento; plataforma Brasil Participativo.",
    status: "aguardando", evidencias: []
  },
  {
    id: "emendas", eixo: "Economia",
    titulo: "Debate sobre emendas parlamentares",
    plano: "Ampliar o debate social sobre como as emendas parlamentares devem funcionar.",
    criterio: "Proposta formal apresentada ou processo público de debate realizado (o plano promete debate, não uma mudança específica).",
    verificar: "Portais do Congresso; Ministério do Planejamento.",
    status: "aguardando", evidencias: []
  },

  // ---------------- SEGURANÇA PÚBLICA ----------------
  {
    id: "ministerio-seguranca", eixo: "Segurança pública",
    titulo: "Ministério da Segurança Pública",
    plano: "Criar o Ministério da Segurança Pública para coordenar o SUSP, condicionado à aprovação da PEC da Segurança Pública.",
    criterio: "PEC promulgada e ministério criado. Se a PEC for rejeitada, registrar como condição não atendida.",
    verificar: "Tramitação da PEC na Câmara e no Senado; Diário Oficial da União.",
    status: "aguardando", evidencias: []
  },
  {
    id: "crime-organizado", eixo: "Segurança pública",
    titulo: "Programa Brasil Contra o Crime Organizado",
    plano: "Fortalecer o programa, com asfixia financeira de facções e milícias e combate ao tráfico de armas, munições e explosivos.",
    criterio: "Orçamento do programa mantido ou ampliado e resultados operacionais publicados.",
    verificar: "Ministério da Justiça; Polícia Federal; Portal da Transparência.",
    status: "aguardando", evidencias: []
  },
  {
    id: "controle-armas", eixo: "Segurança pública",
    titulo: "Controle e rastreabilidade de armas",
    plano: "Manter a política de controle de armas e munições, melhorar a rastreabilidade e reforçar a fiscalização da PF e do Exército.",
    criterio: "Normas de rastreabilidade publicadas e em vigor.",
    verificar: "Diário Oficial da União; Polícia Federal; Exército.",
    status: "aguardando", evidencias: []
  },
  {
    id: "cameras-corporais", eixo: "Segurança pública",
    titulo: "Câmeras corporais",
    plano: "Ampliar incentivos ao uso de câmeras corporais, com padrões nacionais de uso e preservação das imagens.",
    criterio: "Norma nacional publicada e recursos repassados a estados.",
    verificar: "Ministério da Justiça; Fundo Nacional de Segurança Pública.",
    status: "aguardando", evidencias: []
  },
  {
    id: "penitenciarias", eixo: "Segurança pública",
    titulo: "Sistema penitenciário federal",
    plano: "Ampliar a capacidade das penitenciárias federais e criar protocolo nacional para transferência de presos de alta periculosidade.",
    criterio: "Novas vagas federais entregues e protocolo nacional publicado.",
    verificar: "Senappen; Ministério da Justiça.",
    status: "aguardando", evidencias: []
  },

  // ---------------- EDUCAÇÃO ----------------
  {
    id: "alfabetizacao", eixo: "Educação",
    titulo: "80% das crianças alfabetizadas na idade certa",
    plano: "Alcançar 80% das crianças alfabetizadas na idade certa.",
    criterio: "Indicador oficial de alfabetização (INEP) igual ou superior a 80%.",
    verificar: "INEP — Indicador Criança Alfabetizada.",
    status: "aguardando", evidencias: []
  },
  {
    id: "tempo-integral", eixo: "Educação",
    titulo: "Educação em tempo integral",
    plano: "Ampliar a oferta de educação em tempo integral.",
    criterio: "Percentual de matrículas em tempo integral ao fim do mandato maior que o de 2026.",
    verificar: "INEP — Censo Escolar.",
    status: "aguardando", evidencias: []
  },
  {
    id: "internet-escolas", eixo: "Educação",
    titulo: "Internet em todas as escolas",
    plano: "Universalizar o acesso à internet nas escolas, nos parâmetros definidos pelo governo.",
    criterio: "100% das escolas públicas conectadas segundo o parâmetro oficial.",
    verificar: "MEC — Estratégia Nacional de Escolas Conectadas; Censo Escolar.",
    status: "aguardando", evidencias: []
  },
  {
    id: "pe-de-meia", eixo: "Educação",
    titulo: "Manter o Pé-de-Meia",
    plano: "Manter o programa de incentivo financeiro à permanência no ensino médio.",
    criterio: "Pagamentos mantidos em todos os anos do mandato.",
    verificar: "MEC; Portal da Transparência.",
    status: "aguardando", evidencias: []
  },
  {
    id: "institutos-federais", eixo: "Educação",
    titulo: "Expansão dos institutos federais",
    plano: "Continuar a expansão dos institutos federais, priorizando interior, periferias e locais com pouca oferta de cursos técnicos.",
    criterio: "Novos campi inaugurados e em funcionamento (lista oficial do MEC).",
    verificar: "MEC — Rede Federal; Plataforma Nilo Peçanha.",
    status: "aguardando", evidencias: []
  },

  // ---------------- SAÚDE E ASSISTÊNCIA ----------------
  {
    id: "farmacia-popular", eixo: "Saúde e assistência",
    titulo: "Ampliar o Farmácia Popular",
    plano: "Ampliar o Farmácia Popular, mantendo-o gratuito, e incluir exames laboratoriais e de acompanhamento de doenças crônicas.",
    criterio: "Exames incluídos oficialmente no programa e disponíveis à população.",
    verificar: "Ministério da Saúde; Diário Oficial da União.",
    status: "aguardando", evidencias: []
  },
  {
    id: "cancer", eixo: "Saúde e assistência",
    titulo: "Rede de diagnóstico e tratamento de câncer",
    plano: "Ampliar a rede pública de diagnóstico e tratamento do câncer, com novos equipamentos e tratamentos.",
    criterio: "Novos serviços habilitados e equipamentos instalados (dados oficiais).",
    verificar: "Ministério da Saúde; DATASUS.",
    status: "aguardando", evidencias: []
  },
  {
    id: "saude-digital", eixo: "Saúde e assistência",
    titulo: "SUS digital",
    plano: "Marcar consultas e ver resultados de exames pelo celular, consolidar o prontuário único e usar IA na triagem e no diagnóstico.",
    criterio: "Agendamento e resultados disponíveis no app oficial em âmbito nacional.",
    verificar: "Ministério da Saúde — app Meu SUS Digital.",
    status: "aguardando", evidencias: []
  },
  {
    id: "mais-medicos-bucal", eixo: "Saúde e assistência",
    titulo: "Mais Médicos e saúde bucal",
    plano: "Manter o Mais Médicos e apoiar municípios na universalização da saúde bucal.",
    criterio: "Programa mantido e cobertura de saúde bucal ampliada (dados oficiais).",
    verificar: "Ministério da Saúde; e-Gestor AB.",
    status: "aguardando", evidencias: []
  },
  {
    id: "cuidados", eixo: "Saúde e assistência",
    titulo: "Política Nacional de Cuidados",
    plano: "Ampliar a Política Nacional de Cuidados (cuidotecas, lavanderias públicas, cozinhas solidárias, restaurantes populares) e criar programa de capacitação de cuidadores.",
    criterio: "Programa de capacitação de cuidadores lançado e equipamentos ampliados.",
    verificar: "Ministério do Desenvolvimento Social.",
    status: "aguardando", evidencias: []
  },

  // ---------------- MEIO AMBIENTE E AGRICULTURA ----------------
  {
    id: "adaptacao-climatica", eixo: "Meio ambiente e agricultura",
    titulo: "Adaptação climática e segurança hídrica",
    plano: "Investir em bacias hidrográficas, segurança hídrica e prevenção de desastres, tornando a adaptação climática eixo permanente do planejamento.",
    criterio: "Plano Nacional de Adaptação mantido e execução orçamentária da área crescente no mandato.",
    verificar: "Ministério do Meio Ambiente; Ministério da Integração; Portal da Transparência.",
    status: "aguardando", evidencias: []
  },
  {
    id: "agricultura-familiar", eixo: "Meio ambiente e agricultura",
    titulo: "Agricultura familiar e merenda escolar",
    plano: "Manter crédito à agricultura familiar e apoiar a meta de 45% das compras da merenda escolar vindas desse setor.",
    criterio: "Percentual nacional de compras do PNAE da agricultura familiar igual ou superior a 45%.",
    verificar: "FNDE — dados do PNAE; Plano Safra da Agricultura Familiar.",
    status: "aguardando", evidencias: []
  },

  // ---------------- SOBERANIA E POLÍTICA EXTERNA ----------------
  {
    id: "defesa", eixo: "Soberania e política externa",
    titulo: "Defesa nacional e indústria de defesa",
    plano: "Fortalecer as Forças Armadas e a Base Industrial de Defesa, com investimentos em defesa cibernética e proteção de fronteiras e da Amazônia.",
    criterio: "Orçamento de investimento em defesa previsível e executado no mandato.",
    verificar: "Ministério da Defesa; Portal da Transparência.",
    status: "aguardando", evidencias: []
  },
  {
    id: "mercosul-energia", eixo: "Soberania e política externa",
    titulo: "Integração sul-americana",
    plano: "Aprofundar o Mercosul e criar um mercado comum sul-americano de energia.",
    criterio: "Acordo de mercado comum de energia assinado pelos países.",
    verificar: "Itamaraty; Mercosul.",
    status: "aguardando", evidencias: []
  },
  {
    id: "acordos-comerciais", eixo: "Soberania e política externa",
    titulo: "Novos acordos comerciais",
    plano: "Negociar novos acordos comerciais, abrir mercados e aprofundar relações com países africanos.",
    criterio: "Acordos assinados e ratificados no período.",
    verificar: "Itamaraty; MDIC.",
    status: "aguardando", evidencias: []
  },
  {
    id: "transparencia", eixo: "Soberania e política externa",
    titulo: "Integridade e Portal da Transparência",
    plano: "Continuar o Plano de Integridade e Combate à Corrupção e modernizar o Portal da Transparência com dados abertos e IA.",
    criterio: "Nova versão do Portal da Transparência lançada com os recursos prometidos.",
    verificar: "CGU; Portal da Transparência.",
    status: "aguardando", evidencias: []
  }
];
