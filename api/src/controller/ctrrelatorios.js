const svc = require("../services/relatorios.service");

// ✅ Relatório 1 — Saldo Atual (padrão planilha)
const saldoAtual = async (req, res) => {
    try {
        const rows = await svc.saldoAtual();
        return res.json(rows);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Erro ao gerar saldo atual" });
    }
};

// ✅ Relatório 2 — Movimentação por período (padrão planilha)
const movimentacaoPeriodo = async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) {
            return res.status(400).json({ error: "start e end são obrigatórios (YYYY-MM-DD)" });
        }

        const rows = await svc.movimentacaoPeriodo(start, end);
        return res.json(rows);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Erro ao gerar movimentação" });
    }
};

// ===== XLSX =====

const saldoAtualXlsx = async (req, res) => {
    try {
        const buffer = await svc.saldoAtualXlsx();

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="relatorio-saldo-atual.xlsx"`);
        return res.end(buffer);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Erro ao exportar saldo atual" });
    }
};

const movimentacaoPeriodoXlsx = async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) {
            return res.status(400).json({ error: "start e end são obrigatórios (YYYY-MM-DD)" });
        }

        const buffer = await svc.movimentacaoPeriodoXlsx(start, end);

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="relatorio-movimentacao-${start}-a-${end}.xlsx"`);
        return res.end(buffer);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Erro ao exportar movimentação" });
    }
};

module.exports = {
    saldoAtual,
    movimentacaoPeriodo,
    saldoAtualXlsx,
    movimentacaoPeriodoXlsx,
};
