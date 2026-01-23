const ExcelJS = require("exceljs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function dateOnly(ymd) {
    return new Date(`${ymd}T00:00:00.000Z`);
}
function addDays(dt, n) {
    const d = new Date(dt);
    d.setUTCDate(d.getUTCDate() + n);
    return d;
}
function fmtISODate(d) {
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

// chave do item (igual seu banco hoje)
function itemKey(x) {
    return `${x.pn_material}|${x.lote}|${x.data_validade}|${x.posicao}|${x.nf_entrada}`;
}

/**
 * ✅ REL 1 — Saldo Atual (padrão planilha)
 */
async function saldoAtual() {
    const mats = await prisma.material.findMany({
        orderBy: [{ pn_material: "asc" }, { lote: "asc" }],
    });

    return mats.map(m => ({
        pn_material: m.pn_material,
        lote: m.lote,
        data_validade: m.data_validade,
        posicao: m.posicao,
        nf_entrada: m.nf_entrada,
        saldo_produto: m.quantidade,
    }));
}

async function saldoAtualXlsx() {
    const rows = await saldoAtual();
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Saldo Atual");

    ws.columns = [
        { header: "PN", key: "pn_material", width: 18 },
        { header: "Lote", key: "lote", width: 16 },
        { header: "Val", key: "data_validade", width: 14 },
        { header: "Posição", key: "posicao", width: 10 },
        { header: "NF", key: "nf_entrada", width: 14 },
        { header: "Saldo do Produto", key: "saldo_produto", width: 16 },
    ];

    rows.forEach(r => ws.addRow(r));
    ws.getRow(1).font = { bold: true };

    return wb.xlsx.writeBuffer();
}

/**
 * ✅ REL 2 — Movimentação por período (padrão planilha)
 * Regra REAL do seu estoque:
 * - Saída baixa estoque no CREATE -> usar saida.createdAt
 */
async function movimentacaoPeriodo(start, end) {
    const startDt = dateOnly(start);
    const endExclusive = addDays(dateOnly(end), 1);

    // 1) saldo inicial no começo do período:
    // saldo inicial = (entradas antes) - (saídas antes)
    const entradasAntes = await prisma.material.findMany({
        where: { createdAt: { lt: startDt } },
    });

    const saidasAntes = await prisma.saida.findMany({
        where: { createdAt: { lt: startDt } },
    });

    const saldoMap = new Map();

    for (const e of entradasAntes) {
        const k = itemKey(e);
        saldoMap.set(k, (saldoMap.get(k) || 0) + (e.quantidade || 0));
    }
    for (const s of saidasAntes) {
        const k = itemKey(s);
        saldoMap.set(k, (saldoMap.get(k) || 0) - (s.quantidade || 0));
    }

    // 2) movimentos no período
    const entradasPeriodo = await prisma.material.findMany({
        where: { createdAt: { gte: startDt, lt: endExclusive } },
    });

    const saidasPeriodo = await prisma.saida.findMany({
        where: { createdAt: { gte: startDt, lt: endExclusive } },
    });

    // agrupa por dia + item
    const movMap = new Map(); // `${day}|${key}` -> obj

    function upsert(day, base, ent, sai) {
        const kItem = itemKey(base);
        const k = `${day}|${kItem}`;

        if (!movMap.has(k)) {
            movMap.set(k, {
                data: day,
                pn_material: base.pn_material,
                lote: base.lote,
                data_validade: base.data_validade,
                posicao: base.posicao,
                nf_entrada: base.nf_entrada,
                qtde_entrada: 0,
                qtde_saida: 0,
                saldo_produto: 0,
            });
        }

        const obj = movMap.get(k);
        obj.qtde_entrada += ent;
        obj.qtde_saida += sai;
    }

    for (const e of entradasPeriodo) {
        const day = fmtISODate(new Date(e.createdAt));
        upsert(day, e, e.quantidade || 0, 0);
    }

    for (const s of saidasPeriodo) {
        const day = fmtISODate(new Date(s.createdAt));
        upsert(day, s, 0, s.quantidade || 0);
    }

    // 3) percorre dias do período em ordem e calcula saldo do dia
    const days = [];
    for (let d = startDt; d < endExclusive; d = addDays(d, 1)) days.push(fmtISODate(d));

    const out = [];

    for (const day of days) {
        const dayMoves = Array.from(movMap.values()).filter(m => m.data === day);
        if (dayMoves.length === 0) continue; // ✅ só dias com movimento (evita relatório gigante)

        dayMoves.sort((a, b) => (a.pn_material || "").localeCompare(b.pn_material || ""));

        for (const m of dayMoves) {
            const kItem = `${m.pn_material}|${m.lote}|${m.data_validade}|${m.posicao}|${m.nf_entrada}`;
            const saldoAnterior = saldoMap.get(kItem) || 0;
            const saldoNovo = saldoAnterior + m.qtde_entrada - m.qtde_saida;
            saldoMap.set(kItem, saldoNovo);

            out.push({ ...m, saldo_produto: saldoNovo });
        }
    }

    return out;
}

async function movimentacaoPeriodoXlsx(start, end) {
    const rows = await movimentacaoPeriodo(start, end);

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Movimentação");

    ws.columns = [
        { header: "Data", key: "data", width: 14 },
        { header: "PN", key: "pn_material", width: 18 },
        { header: "Lote", key: "lote", width: 16 },
        { header: "Val", key: "data_validade", width: 14 },
        { header: "Posição", key: "posicao", width: 10 },
        { header: "NF", key: "nf_entrada", width: 14 },
        { header: "Qtde Entrada", key: "qtde_entrada", width: 14 },
        { header: "Qtde Saída", key: "qtde_saida", width: 12 },
        { header: "Saldo do Produto", key: "saldo_produto", width: 16 },
    ];

    rows.forEach(r => ws.addRow(r));
    ws.getRow(1).font = { bold: true };

    return wb.xlsx.writeBuffer();
}

module.exports = {
    saldoAtual,
    saldoAtualXlsx,
    movimentacaoPeriodo,
    movimentacaoPeriodoXlsx,
};
