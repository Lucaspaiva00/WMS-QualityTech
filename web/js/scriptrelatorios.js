const API = "http://localhost:3000";

// ===== helpers =====
function setLoading(tbodyId, cols, msg = "Carregando...") {
    document.getElementById(tbodyId).innerHTML = `<tr><td colspan="${cols}" class="text-muted">${msg}</td></tr>`;
}

function setEmpty(tbodyId, cols, msg = "Sem dados") {
    document.getElementById(tbodyId).innerHTML = `<tr><td colspan="${cols}" class="text-muted">${msg}</td></tr>`;
}

// ===== RELATÓRIO 1 - SALDO ATUAL =====
async function gerarSaldo() {
    setLoading("tbSaldo", 6);

    try {
        const res = await fetch(`${API}/relatorios/saldo-atual`);
        const rows = await res.json();

        const tb = document.getElementById("tbSaldo");
        tb.innerHTML = "";

        if (!Array.isArray(rows) || rows.length === 0) {
            return setEmpty("tbSaldo", 6, "Sem dados de saldo atual.");
        }

        rows.forEach(r => {
            tb.innerHTML += `
        <tr>
          <td>${r.pn_material ?? ""}</td>
          <td>${r.lote ?? ""}</td>
          <td>${r.data_validade ?? ""}</td>
          <td>${r.posicao ?? ""}</td>
          <td>${r.nf_entrada ?? ""}</td>
          <td>${r.saldo_produto ?? 0}</td>
        </tr>
      `;
        });
    } catch (e) {
        console.error(e);
        setEmpty("tbSaldo", 6, "Erro ao carregar saldo atual.");
    }
}

function exportarSaldo() {
    window.open(`${API}/relatorios/saldo-atual.xlsx`, "_blank");
}

// ===== RELATÓRIO 2 - MOVIMENTAÇÃO POR PERÍODO =====
async function gerarMov() {
    const start = document.getElementById("dtStart").value;
    const end = document.getElementById("dtEnd").value;

    if (!start || !end) {
        return alert("Informe Data Inicial e Data Final.");
    }

    if (start > end) {
        return alert("Data Inicial não pode ser maior que a Data Final.");
    }

    setLoading("tbMov", 9);

    try {
        const res = await fetch(`${API}/relatorios/movimentacao?start=${start}&end=${end}`);
        const data = await res.json();

        if (data && data.error) {
            return setEmpty("tbMov", 9, data.error);
        }

        const rows = data;
        const tb = document.getElementById("tbMov");
        tb.innerHTML = "";

        if (!Array.isArray(rows) || rows.length === 0) {
            return setEmpty("tbMov", 9, "Sem movimentação no período.");
        }

        rows.forEach(r => {
            tb.innerHTML += `
        <tr>
          <td>${r.data ?? ""}</td>
          <td>${r.pn_material ?? ""}</td>
          <td>${r.lote ?? ""}</td>
          <td>${r.data_validade ?? ""}</td>
          <td>${r.posicao ?? ""}</td>
          <td>${r.nf_entrada ?? ""}</td>
          <td>${r.qtde_entrada ?? 0}</td>
          <td>${r.qtde_saida ?? 0}</td>
          <td>${r.saldo_produto ?? 0}</td>
        </tr>
      `;
        });
    } catch (e) {
        console.error(e);
        setEmpty("tbMov", 9, "Erro ao carregar movimentação.");
    }
}

function exportarMov() {
    const start = document.getElementById("dtStart").value;
    const end = document.getElementById("dtEnd").value;

    if (!start || !end) {
        return alert("Informe Data Inicial e Data Final.");
    }
    if (start > end) {
        return alert("Data Inicial não pode ser maior que a Data Final.");
    }

    window.open(`${API}/relatorios/movimentacao.xlsx?start=${start}&end=${end}`, "_blank");
}

// deixa funções no escopo global (pra onclick no HTML)
window.gerarSaldo = gerarSaldo;
window.exportarSaldo = exportarSaldo;
window.gerarMov = gerarMov;
window.exportarMov = exportarMov;
