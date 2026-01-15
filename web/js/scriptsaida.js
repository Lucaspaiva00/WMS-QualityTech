// scriptsaida.js

const operador = JSON.parse(localStorage.getItem("OPERADOR_LOGADO"));
if (!operador) {
    alert("Você precisa fazer login!");
    window.location.href = "login.html";
}

console.log("Operador logado:", operador.nome);

const uriSaida = "http://localhost:3000/saida";
let __ULTIMAS_SAIDAS__ = [];

const tabela = document.querySelector("#tabela-saida");
const cardsWrap = document.querySelector("#cards-saida");

document.addEventListener("DOMContentLoaded", () => {
    carregarSaidas().then(() => {
        if (tabela) {
            prepararOrdenacao && prepararOrdenacao();
            prepararExportacaoXLSX && prepararExportacaoXLSX();
        }
    });
});

async function carregarSaidas() {
    try {
        const res = await fetch(uriSaida);
        const saidas = await res.json();
        __ULTIMAS_SAIDAS__ = saidas;

        if (tabela) renderTabela(saidas);
        if (cardsWrap) renderCards(saidas);
    } catch (e) {
        console.error(e);
        alert("Erro ao carregar as saídas");
    }
}

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
      </tr>`;
    }
}

// ---- Ordem de Embarque (cards) + NOME DO OPERADOR ----
function renderCards(saidas) {
    cardsWrap.innerHTML = "";
    if (!saidas.length) {
        cardsWrap.innerHTML = `
      <div class="col-12">
        <div class="alert alert-light border">Nenhum item para embarque.</div>
      </div>`;
        return;
    }

    saidas.forEach((e) => {
        const badge = e.status === "pendente" ? "badge-warning" : "badge-success";
        const nomeOperador = e.operador ? e.operador.nome : "—";

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
            <div class="small text-muted">Operador: <b>${nomeOperador}</b></div>
          </div>

          <div class="mt-auto">
            <button class="btn btn-primary btn-sm mr-2" onclick="editarSaida(${e.cod_saida})">Editar</button>
            <button class="btn btn-success btn-sm" onclick="darBaixa(${e.cod_saida})">Dar Baixa</button>
          </div>
        </div>
      </div>`;
    });
}

// ---- Dar baixa ----
function darBaixa(cod_saida) {
    if (!confirm("Confirma a baixa deste material?")) return;

    fetch(`${uriSaida}/baixa/${cod_saida}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operadorId: operador.id }),
    })
        .then((res) => {
            if (res.status === 202) location.reload();
            else res.json().then((b) => alert(b.error || "Erro ao dar baixa"));
        })
        .catch(() => alert("Erro de comunicação ao dar baixa."));
}

// ---- Editar saída (se já tiver modal, mantém a lógica antiga) ----
// ===== EDITAR SAÍDA (MODAL) =====
let __EDITANDO_SAIDA_ID__ = null;

async function editarSaida(cod_saida) {
    try {
        __EDITANDO_SAIDA_ID__ = cod_saida;

        const res = await fetch(`${uriSaida}/${cod_saida}`);
        if (!res.ok) {
            const b = await res.json().catch(() => ({}));
            alert(b.error || "Erro ao buscar saída para editar.");
            return;
        }

        const e = await res.json();

        const form = document.getElementById("formEditarSaida");
        if (!form) {
            alert("Form do modal não encontrado (#formEditarSaida).");
            return;
        }

        form.pn_material.value = e.pn_material ?? "";
        form.lote.value = e.lote ?? "";
        form.data_validade.value = (e.data_validade || "").slice(0, 10); // yyyy-mm-dd
        form.posicao.value = e.posicao ?? "";
        form.nf_entrada.value = e.nf_entrada ?? "";
        form.quantidade.value = e.quantidade ?? 0;
        form.observacao.value = e.observacao ?? "";
        form.status.value = e.status ?? "pendente";

        // abre modal (Bootstrap 4)
        $("#modalEditarSaida").modal("show");
    } catch (err) {
        console.error(err);
        alert("Erro ao abrir edição.");
    }
}

// submit do modal
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formEditarSaida");
    if (!form) return;

    form.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        if (!__EDITANDO_SAIDA_ID__) return;

        const payload = {
            pn_material: form.pn_material.value.trim(),
            lote: form.lote.value.trim(),
            data_validade: form.data_validade.value, // "yyyy-mm-dd"
            posicao: form.posicao.value.trim(),
            nf_entrada: form.nf_entrada.value.trim(),
            quantidade: Number(form.quantidade.value),
            observacao: form.observacao.value.trim(),
            status: form.status.value.trim(),
            operadorId: operador.id, // mantém registro do operador que editou
        };

        try {
            const res = await fetch(`${uriSaida}/${__EDITANDO_SAIDA_ID__}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.status === 202 || res.ok) {
                $("#modalEditarSaida").modal("hide");
                await carregarSaidas(); // atualiza cards sem reload
                __EDITANDO_SAIDA_ID__ = null;
            } else {
                const b = await res.json().catch(() => ({}));
                alert(b.error || "Erro ao salvar alterações.");
            }
        } catch (err) {
            console.error(err);
            alert("Erro de comunicação ao salvar.");
        }
    });
});

// garante que as funções existam no escopo global quando usadas no onclick
window.editarSaida = editarSaida;
window.darBaixa = darBaixa;
