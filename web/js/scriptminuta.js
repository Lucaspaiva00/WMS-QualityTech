const baseURL = "http://localhost:3000/minuta";

/* ============================
   🔍 Carregar Minutas
============================ */
async function carregarMinutas() {
  try {
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
        </tr>
      `;
    });

  } catch (err) {
    console.error("Erro ao carregar minutas:", err);
    alert("Erro ao carregar minutas. Verifique o backend.");
  }
}

/* ============================
   📝 Cadastrar Minuta
============================ */
document.querySelector("#formMinuta").addEventListener("submit", async e => {
  e.preventDefault();

  const formEntries = new FormData(e.target).entries();
  const formData = Object.fromEntries(formEntries);

  // --------------------------
  // VALIDAÇÕES IMPORTANTE
  // --------------------------

  if (formData.cct.length !== 8) {
    alert("O CCT deve ter exatamente 8 dígitos!");
    return;
  }

  if (!validarCNPJ(formData.remetenteCNPJ)) {
    alert("CNPJ do remetente inválido!");
    return;
  }

  if (!validarCNPJ(formData.destinatarioCNPJ)) {
    alert("CNPJ do destinatário inválido!");
    return;
  }

  // Converte data do HTML para ISO (corrige timezone)
  formData.dhEmi = new Date(formData.dhEmi).toISOString();

  // Converte números
  formData.valorPrestacao = parseFloat(formData.valorPrestacao);
  formData.valorCarga = parseFloat(formData.valorCarga);

  try {
    const resp = await fetch(baseURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (!resp.ok) {
      const erro = await resp.json();
      alert("Erro ao salvar minuta: " + (erro.error || "Erro desconhecido"));
      return;
    }

    alert("Minuta cadastrada com sucesso!");

    e.target.reset();
    carregarMinutas();

  } catch (err) {
    console.error("Erro ao cadastrar minuta:", err);
    alert("Falha ao cadastrar minuta. Verifique o servidor.");
  }
});

/* ============================
   ❌ Excluir Minuta
============================ */
async function excluirMinuta(id) {
  if (!confirm("Deseja realmente excluir esta minuta?")) return;

  try {
    await fetch(`${baseURL}/${id}`, { method: "DELETE" });
    carregarMinutas();
  } catch (err) {
    console.error("Erro ao excluir minuta:", err);
    alert("Erro ao excluir minuta.");
  }
}

/* ============================
   📄 Gerar XML
============================ */
function gerarXML(id) {
  window.location.href = `${baseURL}/gerarxml/${id}`;
}

/* ============================
   🔢 Validação de CNPJ
============================ */
function validarCNPJ(cnpj) {
  cnpj = cnpj.replace(/\D/g, "");

  if (cnpj.length !== 14) return false;

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

  if (resultado != digitos.charAt(0)) return false;

  tamanho++;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado == digitos.charAt(1);
}

/* Inicializa tabela */
carregarMinutas();
