// =========================
// SAIDA.JS AJUSTADO
// =========================

const operador = JSON.parse(localStorage.getItem("operador"));
if (!operador) {
    alert("Você precisa fazer login!");
    window.location.href = "login.html";
}

console.log("Operador logado:", operador.nome);

const uri = "http://localhost:3000/saida";
let __ULTIMAS_SAIDAS__ = [];

// Detecta modo da página
const tabela = document.querySelector("#tabela-saida");
const cardsWrap = document.querySelector("#cards-saida");

document.addEventListener("DOMContentLoaded", () => {
    carregarSaidas().then(() => {
        if (tabela) {
            prepararOrdenacao();
            prepararExportacaoXLSX();
        }
    });
});

// ------------ Carregar saídas ------------
async function carregarSaidas() {
    try {
        const res = await fetch(uri);
        const saidas = await res.json();
        __ULTIMAS_SAIDAS__ = saidas;

        if (tabela) renderTabela(saidas);
        if (cardsWrap) renderCards(saidas);
    } catch (e) {
        console.error(e);
        alert("Erro ao carregar as saídas");
    }
}

// ------------ Render tabela relatório ------------
function renderTabela(saidas) {
    const tbody = tabela.querySelector("tbody");
    tbody.innerHTML = "";
    for (const e of saidas) {
        tbody.innerHTML += `
      <tr data-id="${e.cod_saida}">
        <td>${e.pn_material}</td>
        <td>${e.lote}</td>
        <td>${e.data_validade}</td>
        <td>${e.posicao}</td>
        <td>${e.nf_entrada}</td>
        <td>${e.observacao || ""}</td>
        <td>${e.quantidade}</td>
        <td>${e.status}</td>
      </tr>
    `;
    }
}

// ------------ Render cards (ordem embarque) ------------
function renderCards(saidas) {
    cardsWrap.innerHTML = "";
    if (!saidas.length)
        return (cardsWrap.innerHTML = `<div class="col-12"><div class="alert alert-light border">Nenhum item para embarque.</div></div>`);

    saidas.forEach(e => {
        const badge = e.status === "pendente" ? "badge-warning" : "badge-success";

        cardsWrap.innerHTML += `
      <div class="col-sm-6 col-lg-4 mb-3">
        <div class="card-item p-3 h-100 d-flex">
          <div class="mb-2">
            <h5 class="mb-1">PN: ${e.pn_material}</h5>
            <span class="badge ${badge}">${e.status}</span>
            <div class="small text-muted">Posição: <b>${e.posicao}</b></div>
            <div class="small text-muted">Quantidade: <b>${e.quantidade}</b></div>
            <div class="small text-muted">NF: <b>${e.nf_entrada}</b></div>
            <div class="small text-muted">Validade: <b>${e.data_validade}</b></div>
            <div class="small text-muted">Obs: <b>${e.observacao || ""}</b></div>
          </div>

          <div class="mt-auto">
            <button class="btn btn-primary btn-sm mr-2" onclick="editarSaida(${e.cod_saida})">Editar</button>
            <button class="btn btn-success btn-sm" onclick="darBaixa(${e.cod_saida})">Dar Baixa</button>
          </div>
        </div>
      </div>
    `;
    });
}

// ------------ Dar baixa ------------
function darBaixa(cod_saida) {
    if (!confirm("Confirma a baixa deste material?")) return;

    fetch(`${uri}/baixa/${cod_saida}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operadorId: operador.id }) // <- **NOVO**
    })
        .then(res => {
            if (res.status === 202) location.reload();
            else alert("Erro ao dar baixa");
        })
        .catch(() => alert("Erro de comunicação ao dar baixa."));
}

// ------------ Editar saída ------------
function editarSaida(cod_saida) {
    fetch(`${uri}/${cod_saida}`)
        .then(res => res.json())
        .then(saida => {
            const modal = $("#modalEditarSaida");
            const form = document.querySelector("#formEditarSaida");

            form.pn_material.value = saida.pn_material;
            form.lote.value = saida.lote;
            form.data_validade.value = saida.data_validade;
            form.posicao.value = saida.posicao;
            form.nf_entrada.value = saida.nf_entrada;
            form.observacao.value = saida.observacao;
            form.quantidade.value = saida.quantidade;
            form.status.value = saida.status;

            modal.modal("show");

            form.onsubmit = e => {
                e.preventDefault();
                const atualizado = {
                    pn_material: form.pn_material.value,
                    lote: form.lote.value,
                    data_validade: form.data_validade.value,
                    posicao: form.posicao.value,
                    nf_entrada: form.nf_entrada.value,
                    observacao: form.observacao.value,
                    quantidade: Number(form.quantidade.value),
                    status: form.status.value,
                    operadorId: operador.id // <- **NOVO**
                };

                fetch(`${uri}/${cod_saida}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(atualizado)
                })
                    .then(res => {
                        if (res.status === 202) {
                            alert("Saída atualizada!");
                            modal.modal("hide");
                            location.reload();
                        } else {
                            alert("Erro ao atualizar a saída");
                        }
                    })
                    .catch(() => alert("Erro ao atualizar saída"));
            };
        });
}
