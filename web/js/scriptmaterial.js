// scriptmaterial.js

// Verifica login
const operador = JSON.parse(localStorage.getItem("OPERADOR_LOGADO"));
if (!operador) {
  alert("Você precisa fazer login!");
  window.location.href = "login.html";
}

console.log("Operador logado:", operador.nome);

const caixaForm = document.querySelector("#caixaForms");
const uriMaterial = "http://localhost:3000/material";
const uriSaida = "http://localhost:3000/saida";
const entrada = document.querySelector("#entrada");
const selectPosicao = document.querySelector("#posicao");

// --------- Carregar posições ----------
const carregarPosicoes = async (selectElement, valorSelecionado = "") => {
  selectElement.innerHTML =
    '<option value="" disabled selected>Selecione a posição</option>';
  const resp = await fetch("http://localhost:3000/posicao");
  const posicoes = await resp.json();
  posicoes.forEach((p) => {
    const option = document.createElement("option");
    option.value = p.posicao;
    option.text = p.posicao;
    if (p.posicao === valorSelecionado) option.selected = true;
    selectElement.appendChild(option);
  });
};

carregarPosicoes(selectPosicao);

// --------- Cadastro de material ----------
caixaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    pn_material: caixaForm.pn_material.value,
    lote: caixaForm.lote.value,
    data_validade: caixaForm.data_validade.value,
    posicao: caixaForm.posicao.value,
    nf_entrada: caixaForm.nf_entrada.value,
    observacao: caixaForm.observacao.value,
    quantidade: Number(caixaForm.quantidade.value),
    operadorId: operador.id,
  };

  const res = await fetch(uriMaterial, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (res.status === 201) {
    await carregarMateriais();
    caixaForm.reset();
  } else {
    alert("Erro ao inserir material!");
  }
});

// --------- Listar materiais ----------
const carregarMateriais = async () => {
  const resp = await fetch(uriMaterial);
  const materiais = await resp.json();
  entrada.innerHTML = "";
  materiais.forEach((e) => {
    entrada.innerHTML += `
      <tr data-id="${e.cod_material}">
        <td>${e.pn_material}</td>
        <td>${e.lote}</td>
        <td>${e.data_validade}</td>
        <td>${e.posicao}</td>
        <td>${e.nf_entrada}</td>
        <td>${e.observacao || ""}</td>
        <td>${e.quantidade}</td>
        <td>
          <button class='btn btn-primary btn-sm' onClick='editaroperacao(this)'>Editar</button>
          <button class='btn btn-danger btn-sm' onClick='saida(${JSON.stringify(
      e
    )})'>Saída</button>
        </td>
      </tr>`;
  });
};

carregarMateriais();

// --------- Registrar saída a partir do material ----------
function saida(material) {
  if (!confirm("Confirmar a saída do material?")) return;

  const quantidadeSaida = prompt(
    "Informe a quantidade de saída:",
    material.quantidade
  );
  if (!quantidadeSaida) return;

  const data = {
    ...material,
    quantidade: Number(quantidadeSaida),
    operadorId: operador.id,
  };

  fetch(uriSaida, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => {
    if (res.status === 201) {
      alert("Saída registrada com sucesso!");
      window.location.href = "ordemembarque.html";
    } else {
      res.json().then((b) => alert(b.error || "Erro ao registrar saída."));
    }
  });
}

// --------- Editar material via modal ----------
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

  form.onsubmit = async (e) => {
    e.preventDefault();
    const atualizado = {
      pn_material: form.pn_material.value,
      lote: form.lote.value,
      data_validade: form.data_validade.value,
      posicao: selectModalPosicao.value,
      nf_entrada: form.nf_entrada.value,
      observacao: form.observacao.value,
      quantidade: Number(form.quantidade.value),
    };

    const res = await fetch(`${uriMaterial}/${cod_material}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(atualizado),
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
