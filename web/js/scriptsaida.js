const uri = "http://localhost:3000/saida";
let __ULTIMAS_SAIDAS__ = []; // cache para ordenação e export

// Detecta modo da página
const tabela = document.querySelector("#tabela-saida");     // Relatório
const cardsWrap = document.querySelector("#cards-saida");   // Ordem de Embarque

document.addEventListener("DOMContentLoaded", () => {
    carregarSaidas().then(() => {
        if (tabela) {
            prepararOrdenacao();          // clique nos TH
            prepararExportacaoXLSX();     // botão exportar
        }
    });
});

// ------------ Carregar dados ------------
async function carregarSaidas() {
    try {
        const res = await fetch(uri);
        const saidas = await res.json();
        __ULTIMAS_SAIDAS__ = saidas;

        if (tabela) renderTabela(saidas);     // relatório
        if (cardsWrap) renderCards(saidas);   // ordem
    } catch (e) {
        console.error(e);
        alert("Erro ao carregar as saídas");
    }
}

// ------------ Relatório: render tabela (SEM botões) ------------
function renderTabela(saidas) {
    const tbody = tabela.querySelector("tbody");
    tbody.innerHTML = "";
    for (const e of saidas) {
        const tr = document.createElement("tr");
        tr.setAttribute("data-id", e.cod_saida);
        tr.innerHTML = `
      <td data-label="PN MATERIAL">${e.pn_material}</td>
      <td data-label="LOTE (FIFO)">${e.lote}</td>
      <td data-label="DATA DE VALIDADE">${e.data_validade}</td>
      <td data-label="POSIÇÃO">${e.posicao}</td>
      <td data-label="NF ENTRADA">${e.nf_entrada}</td>
      <td data-label="OBSERVAÇÃO">${e.observacao || ""}</td>
      <td data-label="QUANTIDADE">${e.quantidade}</td>
      <td data-label="STATUS">${e.status}</td>
      <td style="display:none"></td>
    `;
        tbody.appendChild(tr);
    }
}

// ------------ Ordem de Embarque: render cards (COM botões) ------------
function renderCards(saidas) {
    cardsWrap.innerHTML = "";
    if (!Array.isArray(saidas) || !saidas.length) {
        cardsWrap.innerHTML = `<div class="col-12"><div class="alert alert-light border">Nenhum item para embarque.</div></div>`;
        return;
    }

    saidas.forEach(e => {
        const col = document.createElement("div");
        col.className = "col-sm-6 col-lg-4 mb-3";
        const badge = e.status?.toLowerCase() === "pendente" ? "badge-warning" : "badge-success";
        col.innerHTML = `
      <div class="card-item p-3 h-100 d-flex">
        <div class="mb-2">
          <div class="d-flex align-items-center justify-content-between">
            <h5 class="mb-1 text-dark">PN: ${e.pn_material}</h5>
            <span class="badge ${badge} badge-status text-uppercase">${e.status || "—"}</span>
          </div>
          <div class="text-muted small">Lote (FIFO): <b>${e.lote}</b></div>
          <div class="text-muted small">Posição: <b>${e.posicao}</b></div>
          <div class="text-muted small">Validade: <b>${e.data_validade}</b></div>
          <div class="text-muted small">NF: <b>${e.nf_entrada}</b></div>
          <div class="text-muted small">Qtd: <b>${e.quantidade}</b></div>
          ${e.observacao ? `<div class="text-muted small">Obs: <b>${e.observacao}</b></div>` : ""}
        </div>
        <div class="mt-auto d-flex gap-2">
          <button class="btn btn-primary btn-sm mr-2" onclick="editarSaida(${e.cod_saida})">Editar</button>
          <button class="btn btn-success btn-sm" onclick="darBaixa(${e.cod_saida})">Dar Baixa</button>
        </div>
      </div>
    `;
        cardsWrap.appendChild(col);
    });
}

// ------------ Export XLSX (Relatório) ------------
function prepararExportacaoXLSX() {
    const btn = document.querySelector("#btn-exportar");
    if (!btn) return;
    btn.addEventListener("click", () => {
        if (!window.XLSX) {
            alert("Biblioteca XLSX não carregada.");
            return;
        }
        // Mapeia apenas campos de relatório
        const data = __ULTIMAS_SAIDAS__.map(e => ({
            "PN MATERIAL": e.pn_material,
            "LOTE (FIFO)": e.lote,
            "DATA DE VALIDADE": e.data_validade,
            "POSIÇÃO": e.posicao,
            "NF ENTRADA": e.nf_entrada,
            "OBSERVAÇÃO": e.observacao || "",
            "QUANTIDADE": e.quantidade,
            "STATUS": e.status
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Relatório");
        XLSX.writeFile(wb, "relatorio-embarque.xlsx");
    });
}

// ------------ Ordenação por clique (Relatório) ------------
function prepararOrdenacao() {
    const thead = tabela.querySelector("thead");
    const tbody = tabela.querySelector("tbody");
    const ths = thead.querySelectorAll("th");
    let state = { col: -1, dir: 1 }; // 1 = asc, -1 = desc

    ths.forEach((th, index) => {
        const key = th.getAttribute("data-key");
        if (!key) return; // ignora "AÇÕES"
        th.addEventListener("click", () => {
            // alterna direção
            state.dir = state.col === index ? -state.dir : 1;
            state.col = index;

            // limpa indicadores
            ths.forEach(h => (h.querySelector(".th-indicator").textContent = ""));
            th.querySelector(".th-indicator").textContent = state.dir === 1 ? "↑" : "↓";

            // ordena com base no cache
            const sorted = [...__ULTIMAS_SAIDAS__].sort((a, b) => compareValues(a[key], b[key]) * state.dir);
            renderTabela(sorted);
        });
    });
}

function compareValues(a, b) {
    // tenta número
    const na = parseFloat(a); const nb = parseFloat(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;

    // tenta data
    const da = Date.parse(a); const db = Date.parse(b);
    if (!isNaN(da) && !isNaN(db)) return da - db;

    // string
    return String(a ?? "").localeCompare(String(b ?? ""), "pt-BR", { sensitivity: "base" });
}

// ------------ Ações (somente em Ordem de Embarque) ------------
function darBaixa(cod_saida) {
    if (!confirm("Confirma a baixa deste material?")) return;
    fetch(`${uri}/baixa/${cod_saida}`, { method: "PUT" })
        .then(res => res.status)
        .then(status => {
            if (status === 202) location.reload();
            else alert("Erro ao dar baixa.");
        })
        .catch(() => alert("Erro de comunicação ao dar baixa."));
}

function editarSaida(cod_saida) {
    fetch(`${uri}/${cod_saida}`)
        .then(res => res.ok ? res.json() : Promise.reject("Saída não encontrada"))
        .then(saida => {
            const modal = $("#modalEditarSaida");
            const form = document.querySelector("#formEditarSaida");
            if (!form) return;

            form.pn_material.value = saídaSafe(saida.pn_material);
            form.lote.value = saídaSafe(saida.lote);
            form.data_validade.value = saídaSafe(saida.data_validade);
            form.posicao.value = saídaSafe(saida.posicao);
            form.nf_entrada.value = saídaSafe(saida.nf_entrada);
            form.observacao.value = saídaSafe(saida.observacao);
            form.quantidade.value = saida.quantidade ?? 0;
            form.status.value = saídaSafe(saida.status);

            modal.modal("show");

            form.onsubmit = (e) => {
                e.preventDefault();
                const atualizado = {
                    pn_material: form.pn_material.value,
                    lote: form.lote.value,
                    data_validade: form.data_validade.value,
                    posicao: form.posicao.value,
                    nf_entrada: form.nf_entrada.value,
                    observacao: form.observacao.value,
                    quantidade: Number(form.quantidade.value),
                    status: form.status.value
                };

                fetch(`${uri}/${cod_saida}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(atualizado)
                })
                    .then(res => res.status)
                    .then(status => {
                        if (status === 202) {
                            alert("Saída atualizada!");
                            modal.modal("hide");
                            location.reload();
                        } else {
                            alert("Erro ao atualizar a saída");
                        }
                    })
                    .catch(() => alert("Erro de comunicação ao atualizar saída."));
            };
        })
        .catch(err => {
            console.error(err);
            alert("Erro ao carregar dados da saída.");
        });
}

const saídaSafe = v => (v == null ? "" : v);
