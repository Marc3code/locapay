document.addEventListener("DOMContentLoaded", async () => {
    await carregarCards();
    await carregarPagamentos();
  });
  
  // Carrega cards com dados fictícios de exemplo (você pode ajustar com dados reais)
  async function carregarCards() {
    try {
      const res = await fetch("https://locapay-production.up.railway.app/inquilinos-com-imovel");
      const inquilinos = await res.json();
  
      const cardsContainer = document.querySelector(".cards");
      cardsContainer.innerHTML = ""; // limpar antes
  
      inquilinos.forEach((inquilino) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
          <h3>${inquilino.nome}</h3>
          <p><strong>Imóvel:</strong> ${inquilino.tipo_imovel}</p>
          <p><strong>Endereço:</strong> ${inquilino.endereco}, ${inquilino.numero}</p>
          <p><strong>Aluguel:</strong> R$ ${inquilino.valor_aluguel.toFixed(2)}</p>
        `;
        cardsContainer.appendChild(card);
      });
    } catch (error) {
      console.error("Erro ao carregar cards:", error);
    }
  }
  
  // Carrega a tabela de pagamentos
  async function carregarPagamentos() {
    try {
      const res = await fetch("https://locapay-production.up.railway.app/todos-pagamentos");
      const pagamentos = await res.json();
  
      const tbody = document.querySelector("tbody");
      tbody.innerHTML = ""; // limpar
  
      for (const pagamento of pagamentos) {
        const linha = document.createElement("tr");
        linha.innerHTML = `
          <td>${pagamento.nome_inquilino}</td>
          <td>${pagamento.inquilino_id}</td>
          <td>${formatarData(pagamento.data_pagamento)}</td>
          <td>${formatarData(pagamento.data_vencimento)}</td>
          <td><button class="ver-perfil" data-id="${pagamento.inquilino_id}">Ver</button></td>
        `;
        tbody.appendChild(linha);
      }
  
      // Adiciona evento para cada botão "Ver"
      document.querySelectorAll(".ver-perfil").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          mostrarPerfil(id);
        });
      });
    } catch (error) {
      console.error("Erro ao carregar pagamentos:", error);
    }
  }
  
  // Mostra perfil do inquilino
  async function mostrarPerfil(inquilino_id) {
    try {
      const inquilinoRes = await fetch(`https://locapay-production.up.railway.app/inquilinos`);
      const inquilinos = await inquilinoRes.json();
      const inquilino = inquilinos.find((i) => i.id == inquilino_id);
  
      if (!inquilino) return;
  
      const perfil = document.getElementById("perfilInquilino");
      document.getElementById("perfilNome").textContent = inquilino.nome;
      document.getElementById("perfilEmail").textContent = inquilino.email || "Não informado";
      document.getElementById("perfilTelefone").textContent = inquilino.telefone;
      document.getElementById("perfilImovel").textContent = inquilino.numero_imovel;
  
      // Busca meses em débito
      const mesesRes = await fetch(`https://locapay-production.up.railway.app/pagamentos/${inquilino_id}/status/pendente`);
      const meses = await mesesRes.json();
  
      const ul = document.getElementById("mesesDebito");
      ul.innerHTML = "";
  
      if (meses.length === 0) {
        ul.innerHTML = "<li>Nenhum débito.</li>";
      } else {
        meses.forEach((pagamento) => {
          ul.innerHTML += `<li>${formatarData(pagamento.data_vencimento)}</li>`;
        });
      }
  
      perfil.style.display = "block";
    } catch (error) {
      console.error("Erro ao mostrar perfil:", error);
    }
  }
  
  // Função para formatar datas
  function formatarData(data) {
    if (!data) return "-";
    const d = new Date(data);
    return d.toLocaleDateString("pt-BR");
  }
  