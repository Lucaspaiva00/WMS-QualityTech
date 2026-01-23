const express = require("express");
const router = express.Router();
const rel = require("../controller/ctrrelatorios.js");

// JSON
router.get("/saldo-atual", rel.saldoAtual);
router.get("/movimentacao", rel.movimentacaoPeriodo);

// XLSX (download)
router.get("/saldo-atual.xlsx", rel.saldoAtualXlsx);
router.get("/movimentacao.xlsx", rel.movimentacaoPeriodoXlsx);

module.exports = router;
