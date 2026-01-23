// scriptsaida.js

// ===== CONFIG =====
const API_BASE = "http://localhost:3000"; // em produção troque pelo domínio/ip do servidor
const uriSaida = `${API_BASE}/saida`;

// ===== LOGIN =====
const operador = JSON.parse(localStorage.getItem("OPERADOR_LOGADO"));
if (!operador) {
    alert("Você precisa fazer login!");
    window.location.href = "login.html";
}

// ===== STATE =====
let __ULTIMAS_SAIDAS__ = [];
let __EDITANDO_SAIDA_ID__ = null;

// ===== ELEMENTS =====
const tabela = document.querySelector("#tabela-saida");
const btnExportar = document.querySelector("#btn-exportar");

document.addEventListener("DOMContentLoaded", () => {
    carregarSaidas().then(() => {
        prepararOrdenacao();
        prepararExportacaoXLSX();
    });

    // submit modal
    const form = document.getElementById("formEditarSaida");
    if (form) {
        form.addEventListener("submit", salvarEdicaoModal);
    }
});

// ===== LISTAR =====
async function carregarSaidas() {
    try {
        const res = await fetch(uriSaida);
        if (!res.ok) throw new Error("Falha ao buscar /saida");
        const saidas = await res.json();
        __ULTIMAS_SAIDAS__ = Array.isArray(saidas) ? saidas : [];
        renderTabela(__ULTIMAS_SAIDAS__);
    } catch (e) {
        console.error(e);
        alert("Erro ao carregar as saídas");
    }
}

function renderTabela(saidas) {
    const tbody = tabela.querySelector("tbody");
    tbody.innerHTML = "";

    for (const e of saidas) {
        const isBaixado = (e.status || "").toLowerCase() === "baixado";

        tbody.innerHTML += `
        <tr data-id="${e.cod_saida}">
            <td>${e.pn_material ?? ""}</td>
            <td>${e.lote ?? ""}</td>
            <td>${(e.data_validade ?? "").toString().slice(0, 10)}</td>
            <td>${e.posicao ?? ""}</td>
            <td>${e.nf_entrada ?? ""}</td>
            <td>${e.observacao ?? ""}</td>
            <td>${e.quantidade ?? 0}</td>
            <td>${e.status ?? ""}</td>
            <td>
                <div class="acao-wrap">
                    <button class="btn btn-danger btn-sm" onclick="editarSaida(${e.cod_saida})">
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="darBaixa(${e.cod_saida})" ${isBaixado ? "disabled" : ""}>
                        Dar Baixa
                    </button>
                </div>
            </td>
        </tr>`;
    }
}

// ===== BAIXA =====
async function darBaixa(cod_saida) {
    if (!confirm("Confirma a baixa deste material?")) return;

    try {
        const res = await fetch(`${uriSaida}/baixa/${cod_saida}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ operadorId: operador.id }),
        });

        if (res.status === 202 || res.ok) {
            await carregarSaidas();
        } else {
            const b = await res.json().catch(() => ({}));
            alert(b.error || "Erro ao dar baixa");
        }
    } catch (err) {
        console.error(err);
        alert("Erro de comunicação ao dar baixa.");
    }
}

// ===== EDITAR (abre modal) =====
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
        if (!form) return alert("Form do modal não encontrado (#formEditarSaida).");

        form.pn_material.value = e.pn_material ?? "";
        form.lote.value = e.lote ?? "";
        form.data_validade.value = (e.data_validade || "").slice(0, 10);
        form.posicao.value = e.posicao ?? "";
        form.nf_entrada.value = e.nf_entrada ?? "";
        form.quantidade.value = e.quantidade ?? 0;
        form.observacao.value = e.observacao ?? "";
        form.status.value = e.status ?? "pendente";

        $("#modalEditarSaida").modal("show");
    } catch (err) {
        console.error(err);
        alert("Erro ao abrir edição.");
    }
}

async function salvarEdicaoModal(ev) {
    ev.preventDefault();
    if (!__EDITANDO_SAIDA_ID__) return;

    const form = ev.currentTarget;

    const payload = {
        pn_material: form.pn_material.value.trim(),
        lote: form.lote.value.trim(),
        data_validade: form.data_validade.value,
        posicao: form.posicao.value.trim(),
        nf_entrada: form.nf_entrada.value.trim(),
        quantidade: Number(form.quantidade.value),
        observacao: form.observacao.value.trim(),
        status: form.status.value.trim(),
        operadorId: operador.id,
    };

    try {
        const res = await fetch(`${uriSaida}/${__EDITANDO_SAIDA_ID__}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (res.status === 202 || res.ok) {
            $("#modalEditarSaida").modal("hide");
            __EDITANDO_SAIDA_ID__ = null;
            await carregarSaidas();
        } else {
            const b = await res.json().catch(() => ({}));
            alert(b.error || "Erro ao salvar alterações.");
        }
    } catch (err) {
        console.error(err);
        alert("Erro de comunicação ao salvar.");
    }
}

// ===== EXPORT XLSX (SheetJS) =====
function prepararExportacaoXLSX() {
    if (!btnExportar) return;

    btnExportar.addEventListener("click", () => {
        if (!__ULTIMAS_SAIDAS__.length) {
            alert("Não há dados para exportar.");
            return;
        }

        // Cabeçalhos no padrão da tabela
        const data = __ULTIMAS_SAIDAS__.map((e) => ({
            "PN MATERIAL": e.pn_material ?? "",
            "LOTE (FIFO)": e.lote ?? "",
            "DATA DE VALIDADE": (e.data_validade ?? "").toString().slice(0, 10),
            "POSIÇÃO": e.posicao ?? "",
            "NF ENTRADA": e.nf_entrada ?? "",
            "OBSERVAÇÃO": e.observacao ?? "",
            "QUANTIDADE": e.quantidade ?? 0,
            "STATUS": e.status ?? "",
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Relatorio_Embarque");

        const hoje = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `relatorio-embarque-${hoje}.xlsx`);
    });
}

// ===== ORDENAÇÃO (clicar nos TH) =====
function prepararOrdenacao() {
    if (!tabela) return;

    const headers = tabela.querySelectorAll("thead th[data-key]");
    const state = { key: null, dir: "asc" };

    headers.forEach((th) => {
        th.addEventListener("click", () => {
            const key = th.getAttribute("data-key");
            if (!key) return;

            // toggle direção
            if (state.key === key) state.dir = state.dir === "asc" ? "desc" : "asc";
            else {
                state.key = key;
                state.dir = "asc";
            }

            // limpar indicadores
            headers.forEach((h) => (h.querySelector(".th-indicator").textContent = ""));
            th.querySelector(".th-indicator").textContent = state.dir === "asc" ? "▲" : "▼";

            const sorted = [...__ULTIMAS_SAIDAS__].sort((a, b) => {
                const va = (a?.[key] ?? "").toString().toLowerCase();
                const vb = (b?.[key] ?? "").toString().toLowerCase();

                // se for número
                const na = Number(va), nb = Number(vb);
                const ambosNumeros = !Number.isNaN(na) && !Number.isNaN(nb) && va !== "" && vb !== "";
                if (ambosNumeros) return state.dir === "asc" ? na - nb : nb - na;

                if (va < vb) return state.dir === "asc" ? -1 : 1;
                if (va > vb) return state.dir === "asc" ? 1 : -1;
                return 0;
            });

            renderTabela(sorted);
        });
    });
}

// ===== GLOBALS =====
window.editarSaida = editarSaida;
window.darBaixa = darBaixa;
