const caixaForm = document.querySelector("#caixaForms");
const uri = "http://localhost:3000/material";
const entrada = document.querySelector("#entrada");
const selectPosicao = document.querySelector("#posicao");

// 🔹 Carregar posições
const carregarPosicoes = async (selectElement, valorSelecionado = "") => {
  selectElement.innerHTML = '<option value="" disabled selected>Selecione a posição</option>';
  const resp = await fetch("http://localhost:3000/posicao");
  const posicoes = await resp.json();
  posicoes.forEach(p => {
    const option = document.createElement("option");
    option.value = p.posicao;
    option.text = p.posicao;
    if (p.posicao === valorSelecionado) option.selected = true;
    selectElement.appendChild(option);
  });
};

// Inicializa posições
carregarPosicoes(selectPosicao);

// 🔹 Cadastro
caixaForm.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    pn_material: caixaForm.pn_material.value,
    lote: caixaForm.lote.value,
    data_validade: caixaForm.data_validade.value,
    posicao: caixaForm.posicao.value,
    nf_entrada: caixaForm.nf_entrada.value,
    observacao: caixaForm.observacao.value,
    quantidade: Number(caixaForm.quantidade.value)
  };

  const res = await fetch(uri, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (res.status === 201) {
    carregarMateriais();
    caixaForm.reset();
  } else {
    alert("Erro ao inserir material!");
  }
});

// 🔹 Listar materiais
const carregarMateriais = async () => {
  const resp = await fetch(uri);
  const materiais = await resp.json();
  entrada.innerHTML = "";
  materiais.forEach(e => {
    entrada.innerHTML += `
      <tr data-id="${e.cod_material}">
        <td>${e.pn_material}</td>
        <td>${e.lote}</td>
        <td>${e.data_validade}</td>
        <td>${e.posicao}</td>
        <td>${e.nf_entrada}</td>
        <td>${e.observacao}</td>
        <td>${e.quantidade}</td>
        <td>
          <button class='btn btn-primary btn-sm' onClick='editaroperacao(this)'>Editar</button>
          <button class='btn btn-danger btn-sm' onClick='saida(${JSON.stringify(e)})'>Saída</button>
        </td>
      </tr>`;
  });
};

carregarMateriais();

// 🔹 Registrar saída
function saida(material) {
  if (confirm("Confirmar a saída do material?")) {
    const quantidadeSaida = prompt("Informe a quantidade de saída:", material.quantidade);
    if (!quantidadeSaida) return;

    const data = { ...material, quantidade: Number(quantidadeSaida) };

    fetch("http://localhost:3000/saida", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(res => {
      if (res.status === 201) {
        alert("Saída registrada com sucesso!");
        window.location.href = "saida.html";
      } else {
        alert("Erro ao registrar saída.");
      }
    });
  }
}

// 🔹 Editar material via modal
async function editaroperacao(botao) {
  const linha = botao.closest("tr");
  const cod_material = linha.getAttribute("data-id");
  const modal = $("#modalEditarMaterial");
  const form = document.querySelector("#formEditarMaterial");
  const selectModalPosicao = form.querySelector("select[name='posicao']");

  await carregarPosicoes(selectModalPosicao, linha.children[3].innerText);

  form.pn_material.value = linha.children[0].innerText;
  form.lote.value = linha.children[1].innerText;
  form.data_validade.value = linha.children[2].innerText;
  form.nf_entrada.value = linha.children[4].innerText;
  form.observacao.value = linha.children[5].innerText;
  form.quantidade.value = linha.children[6].innerText;

  modal.modal("show");

  form.onsubmit = async e => {
    e.preventDefault();
    const atualizado = {
      pn_material: form.pn_material.value,
      lote: form.lote.value,
      data_validade: form.data_validade.value,
      posicao: selectModalPosicao.value,
      nf_entrada: form.nf_entrada.value,
      observacao: form.observacao.value,
      quantidade: Number(form.quantidade.value)
    };

    const res = await fetch(`${uri}/${cod_material}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(atualizado)
    });

    if (res.status === 202) {
      alert("Material atualizado!");
      modal.modal("hide");
      carregarMateriais();
    } else {
      alert("Erro ao atualizar material!");
    }
  };
}

// Adiciona ordenação ao clicar nos cabeçalhos
document.querySelectorAll("#tabela-materiais th").forEach(th => {
  th.addEventListener("click", () => {
    const tabela = th.closest("table");
    const tbody = tabela.querySelector("tbody");
    const index = Array.from(th.parentNode.children).indexOf(th);
    const asc = th.classList.toggle("asc");

    Array.from(tbody.querySelectorAll("tr"))
      .sort((a, b) => {
        const v1 = a.children[index].innerText.trim().toLowerCase();
        const v2 = b.children[index].innerText.trim().toLowerCase();
        return asc ? v1.localeCompare(v2) : v2.localeCompare(v1);
      })
      .forEach(tr => tbody.appendChild(tr));
  });
});

