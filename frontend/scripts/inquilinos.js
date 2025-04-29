
 const API_BASE_URL = "http://localhost:3001"

//abrir formulário de cadastro do inquilino
function showFormInquilino() {
    const section = document.getElementById("FormInquilino");
    section.style.display = "block";
  }
  
  //fechar formulario de cadastro do inquilino
  function hideFormInquilino() {
    const section = document.getElementById("FormInquilino");;
    section.style.display = "none";
  }

  function addInquilino() {
    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const cpfCnpj = document.getElementById("cpfCnpj").value;
  
    fetch("API_BASE_URL/inquilinos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
        telefone,
        cpfCnpj,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Inquilino adicionado:", data);
        hideFormInquilino();
        alert("Inquilino adicionado com sucesso!");
        location.reload(); // Recarrega a página para mostrar o novo inquilino
      })
      .catch((error) => {
        console.error("Erro ao adicionar inquilino:", error);
        alert("Erro ao adicionar inquilino. Tente novamente.");
      });
  }