const baseURL = "http://localhost:3000/minuta";

// Carregar minutas
async function carregarMinutas() {
  const resp = await fetch(baseURL);
  const data = await resp.json();
  const tbody = document.querySelector("#tabelaMinutas tbody");

  tbody.innerHTML = "";
  data.forEach(m => {
    tbody.innerHTML += `
      <tr>
        <td>${m.id}</td>
        <td>${m.cct}</td>
        <td>${m.nCT}</td>
        <td>
          <button class="btn btn-sm btn-success" onclick="gerarXML(${m.id})">
            <i class="fas fa-file-export"></i> Gerar XML
          </button>
          <button class="btn btn-sm btn-danger" onclick="excluirMinuta(${m.id})">
            <i class="fas fa-trash"></i> Excluir
          </button>
        </td>
      </tr>`;
  });
}

// Cadastrar minuta
document.querySelector("#formMinuta").addEventListener("submit", async e => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target).entries());

  await fetch(baseURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData)
  });

  e.target.reset();
  carregarMinutas();
});

// Excluir minuta
async function excluirMinuta(id) {
  if (!confirm("Deseja realmente excluir esta minuta?")) return;
  await fetch(`${baseURL}/${id}`, { method: "DELETE" });
  carregarMinutas();
}

// Gerar XML
async function gerarXML(id) {
  window.location.href = `${baseURL}/gerarxml/${id}`;
}

// Inicialização
carregarMinutas();
