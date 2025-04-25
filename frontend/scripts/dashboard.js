document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "https://locapay-production.up.railway.app";
  let todosInquilinos = null;
  let todosPagamentos = null;
  let todosImoveis = null;

  // Fetch inicial dos dados
  async function fetchData() {
    try {
      const [inquilinosRes, pagamentosRes, imoveisRes] = await Promise.all([
        fetch(`${API_BASE_URL}/inquilinos`),
        fetch(`${API_BASE_URL}/todos-pagamentos`),
        fetch(`${API_BASE_URL}/imoveis`),
      ]);

      if (!inquilinosRes.ok) throw new Error("Erro ao buscar inquilinos");
      if (!pagamentosRes.ok) throw new Error("Erro ao buscar pagamentos");

      todosInquilinos = await inquilinosRes.json();
      todosPagamentos = await pagamentosRes.json();
      todosImoveis = await imoveisRes.json();

      atualizarCards();
      atualizarTabela();
      adicionarEventosTabela();
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      alert("Falha ao carregar dados. Atualize a página ou tente mais tarde.");
    }
  }

  // Atualizar cards superiores
  function atualizarCards() {
    const cards = document.querySelector(".cards");

    // Garantir que sejam números válidos
    const totalRecebido = Array.isArray(todosPagamentos)
      ? todosPagamentos
          .filter((p) => p?.status === "pago")
          .reduce((acc, curr) => acc + (Number(curr?.valor) || 0), 0)
      : 0;

    const totalPendentes = Array.isArray(todosPagamentos)
      ? todosPagamentos.filter((p) => p?.status === "atrasado")
      : [];

    // Correção: aplicar toFixed(2) apenas no resultado final
    const totalAtraso = totalPendentes
      .reduce(
        (acc, curr) => acc + (Number(curr?.valor) || 0),
        0 
      )
      .toFixed(2);

    cards.innerHTML = `
      <div class="card">
          <h3>Imóveis</h3>
          <p>${
            [...new Set(todosInquilinos.map((i) => i?.imovel_id))].length
          }</p>
      </div>
      <div class="card">
          <h3>Inquilinos</h3>
          <p>${todosInquilinos.length}</p>
      </div>
      <div class="card">
          <h3>Recebido</h3>
          <p>R$ ${totalRecebido.toFixed(2)}</p>
      </div>
      <div class="card">
          <h3>Em Atraso</h3>
          <p>R$ ${totalAtraso}</p>
      </div>
  `;
  }

  // Atualizar tabela principal
  function atualizarTabela() {
    const tbody = document.querySelector(".pagamentos tbody");

    tbody.innerHTML = todosInquilinos
      .map((inquilino) => {
        const pagamentos = todosPagamentos.filter(
          (p) => p.inquilino_id === inquilino.id
        );
        const ultimoPagamento = pagamentos
          .filter((p) => p.status === "pago")
          .sort(
            (a, b) => new Date(b.data_pagamento) - new Date(a.data_pagamento)
          )[0];

        return `
                <tr data-id="${inquilino.id}">
                    <td>${inquilino.nome}</td>
                    <td>${inquilino.numero_imovel}</td>
                    <td>${
                      ultimoPagamento
                        ? formatarData(ultimoPagamento.data_pagamento)
                        : "Nenhum"
                    }</td>
                    <td>${formatarData(inquilino.data_vencimento)}</td>
                    <td>${
                      pagamentos.filter((p) => p.status === "atrasado").length
                    }</td>
                    <td>${
                      pagamentos.filter((p) => p.status === "pendente").length
                    }</td>
                </tr>
            `;
      })
      .join("");
  }

  // Formatar datas
  function formatarData(dataString) {
    if (!dataString) return "N/A";
    const data = new Date(dataString);
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return data.toLocaleDateString("pt-BR", options);
  }

  // Eventos de clique na tabela
  function adicionarEventosTabela() {
    document.querySelectorAll(".pagamentos tbody tr").forEach((row) => {
      row.addEventListener("click", () => {
        const inquilinoId = parseInt(row.dataset.id);
        const inquilino = todosInquilinos.find((i) => i.id === inquilinoId);
        const pagamentos = todosPagamentos.filter(
          (p) => p.inquilino_id === inquilinoId
        );

        mostrarPerfil(inquilino, pagamentos);
      });
    });
  }

  // Mostrar perfil do inquilino
  function mostrarPerfil(inquilino, pagamentos) {
    const perfilSection = document.getElementById("perfilInquilino");
    const mesesDebito = pagamentos
      .filter((p) => p.status === "pendente")
      .map((p) => formatarData(p.data_vencimento));

    // Preencher dados básicos
    document.getElementById("perfilNome").textContent = inquilino.nome;
    document.getElementById("perfilTelefone").textContent = inquilino.telefone;
    document.getElementById(
      "perfilImovel"
    ).textContent = `${inquilino.tipo_imovel} - ${inquilino.endereco}, ${inquilino.numero}`;

    // Listar meses em débito
    const debitoList = document.getElementById("mesesDebito");
    debitoList.innerHTML = mesesDebito
      .map((data) => `<li>${data}</li>`)
      .join("");

    // Controle do botão de cobrança
    const botaoCobranca = document.getElementById("enviarCobranca");
    if (mesesDebito.length > 0) {
      botaoCobranca.style.display = "inline-block";
      botaoCobranca.onclick = () => enviarCobranca(inquilino.id);
    } else {
      botaoCobranca.style.display = "none";
    }

    perfilSection.style.display = "block";
  }

  // Função para enviar cobrança (placeholder)
  function enviarCobranca(inquilinoId) {
    alert(`Cobrança enviada para o inquilino ID: ${inquilinoId}`);
    // Implementação futura com integração do Stripe
  }

  // Inicialização
  fetchData();
});
