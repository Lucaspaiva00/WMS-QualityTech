const caixaForm = document.querySelector("#caixaForms");
const uri = "http://localhost:3000/material";
const entrada = document.querySelector("#entrada");
const selectPosicao = document.querySelector("#posicao");

// Função para carregar posições no select
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

// Carrega posições no formulário principal
carregarPosicoes(selectPosicao);

// Cadastro de novo material
caixaForm.addEventListener('submit', async (e) => {
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
    headers: { 'Content-Type': "application/json" },
    body: JSON.stringify(data)
  });

  if (res.status === 201) {
    carregarMateriais();
    caixaForm.reset();
  } else {
    alert("Erro ao inserir o material");
  }
});

const carregarMateriais = async () => {
  const resp = await fetch(uri);
  const materiais = await resp.json();
  entrada.innerHTML = "";
  materiais.forEach(e => {
    entrada.innerHTML += `
<tr data-id="${e.cod_material}">
  <td data-label="PN MATERIAL">${e.pn_material}</td>
  <td data-label="LOTE">${e.lote}</td>
  <td data-label="DATA DE VALIDADE">${e.data_validade}</td>
  <td data-label="POSIÇÃO">${e.posicao}</td>
  <td data-label="NF ENTRADA">${e.nf_entrada}</td>
  <td data-label="OBSERVAÇÃO">${e.observacao}</td>
  <td data-label="QUANTIDADE">${e.quantidade}</td>
  <td data-label="STATUS">
    <button type="button" class='btn btn-primary btn-sm' onClick='editaroperacao(this)'>Editar</button>
    <button type="button" class='btn btn-danger btn-sm' onClick='saida(${JSON.stringify(e)})'>Saída</button>
  </td>
</tr>
        `;
  });
};

carregarMateriais();

function saida(material) {
  if (confirm("Confirmar a saída do material?")) {
    const quantidadeSaida = prompt("Informe a quantidade de saída:", material.quantidade);
    if (!quantidadeSaida) return;

    const data = {
      cod_material: material.cod_material,
      pn_material: material.pn_material,
      lote: material.lote,
      data_validade: material.data_validade,
      posicao: material.posicao,
      nf_entrada: material.nf_entrada,
      observacao: material.observacao,
      quantidade: Number(quantidadeSaida)
    };

    fetch("http://localhost:3000/saida", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(res => res.status)
      .then(status => {
        if (status == 201) {
          alert("Saída registrada com sucesso!");
          window.location.href = "saida.html"; // vai para a página de saídas
        } else {
          alert("Erro ao registrar saída");
        }
      });
  }
}


function editaroperacao(botao) {
  const linha = botao.closest("tr");
  const cod_material = linha.getAttribute("data-id");
  const modal = $('#modalEditarMaterial');
  const form = document.querySelector("#formEditarMaterial");
  const selectModalPosicao = form.querySelector("select[name='posicao']");

  carregarPosicoes(selectModalPosicao, linha.children[3].innerText);

  form.pn_material.value = linha.children[0].innerText;
  form.lote.value = linha.children[1].innerText;
  form.data_validade.value = linha.children[2].innerText;
  form.nf_entrada.value = linha.children[4].innerText;
  form.observacao.value = linha.children[5].innerText;
  form.quantidade.value = linha.children[6].innerText;

  modal.modal('show');

  form.onsubmit = async (e) => {
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
      modal.modal('hide');
      carregarMateriais(); // Atualiza tabela
    } else {
      alert("Erro ao atualizar o material");
    }
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const tabela = document.querySelector("#tabela-materiais"); // ID da tabela no HTML
  if (!tabela) return; // segurança

  const cabecalhos = tabela.querySelectorAll("th");
  let colunaAtual = -1;
  let direcao = 1; // 1 = crescente, -1 = decrescente

  cabecalhos.forEach((th, index) => {
    th.style.cursor = "pointer"; // indica que é clicável
    th.addEventListener("click", () => {
      const corpo = tabela.querySelector("tbody");
      const linhas = Array.from(corpo.querySelectorAll("tr"));

      // Se clicar na mesma coluna, inverte a direção
      if (colunaAtual === index) {
        direcao *= -1;
      } else {
        direcao = 1;
        colunaAtual = index;
      }

      // Função auxiliar para tentar converter valores
      const getValor = (td) => {
        const texto = td.textContent.trim();
        const numero = parseFloat(texto.replace(",", "."));
        const data = Date.parse(texto);
        if (!isNaN(numero) && texto !== "") return numero;
        if (!isNaN(data)) return data;
        return texto.toLowerCase();
      };

      // Ordena as linhas
      linhas.sort((a, b) => {
        const valorA = getValor(a.children[index]);
        const valorB = getValor(b.children[index]);

        if (typeof valorA === "number" && typeof valorB === "number")
          return (valorA - valorB) * direcao;
        if (typeof valorA === "string" && typeof valorB === "string")
          return valorA.localeCompare(valorB) * direcao;
        return 0;
      });

      // Atualiza tabela
      corpo.innerHTML = "";
      linhas.forEach((linha) => corpo.appendChild(linha));

      // Adiciona indicador visual (↑ ↓)
      cabecalhos.forEach((h) => (h.textContent = h.textContent.replace(/[↑↓]/g, "").trim()));
      th.textContent += direcao === 1 ? " ↑" : " ↓";
    });
  });
});
