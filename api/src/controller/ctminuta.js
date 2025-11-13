// src/controller/ctminuta.js
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

// ========================
//  CONFIG FIXA GALPEX / CT-e
// ========================
const CTE_CONFIG = {
  cUF: "35",                 // SP
  cnpjEmit: "61575248000175",// CNPJ GALPEX
  mod: "94",
  serie: "999",
  tpEmis: "1",
  tpAmb: "1",                // 1 = produção (seguindo XML exemplo)
  procEmi: "0",
  verProc: "AverbePorto 1.7.2",
  modal: "01",
  tpServ: "0",               // normal
  UFIni: "SP",
  UFFim: "PR",
  xNomeEmit: "GALPEX ARMAZEN LOGISTICA E TRANSPORTES LTDA",
};

// ========================
//  HELPERS
// ========================

// Formata data no padrão CT-e: 2025-10-21T11:58:30-03:00
function formatarDhEmi(date) {
  const d = new Date(date);

  const pad = (n) => String(n).padStart(2, "0");
  const ano = d.getFullYear();
  const mes = pad(d.getMonth() + 1);
  const dia = pad(d.getDate());
  const hora = pad(d.getHours());
  const min = pad(d.getMinutes());
  const seg = pad(d.getSeconds());

  // fixo -03:00 (exemplo deles)
  return `${ano}-${mes}-${dia}T${hora}:${min}:${seg}-03:00`;
}

// Calcula DV (dígito verificador) da chave do CT-e (módulo 11)
function calcularDV(chaveSemDV) {
  let multiplicador = 2;
  let soma = 0;

  for (let i = chaveSemDV.length - 1; i >= 0; i--) {
    soma += parseInt(chaveSemDV[i], 10) * multiplicador;
    multiplicador = multiplicador === 9 ? 2 : multiplicador + 1;
  }

  const resto = soma % 11;
  let dv = 11 - resto;

  if (dv === 0 || dv === 1 || dv > 9) dv = 0;

  return String(dv);
}

// Gera chave de acesso do CT-e (44 dígitos)
function gerarChaveCTe(minuta) {
  const { cUF, cnpjEmit, mod, serie, tpEmis } = CTE_CONFIG;

  const data = new Date(minuta.dhEmi);
  const ano = String(data.getFullYear()).slice(-2); // ex: 25
  const mes = String(data.getMonth() + 1).padStart(2, "0"); // ex: 10
  const AAMM = `${ano}${mes}`; // 2510

  const nCT = String(minuta.nCT).padStart(9, "0");
  const cCT = String(minuta.cct).padStart(8, "0");

  const chaveSemDV = cUF + AAMM + cnpjEmit + mod + serie + nCT + tpEmis + cCT;
  const dv = calcularDV(chaveSemDV);
  const chave = chaveSemDV + dv; // 44 dígitos

  return { chave, dv };
}

// ========================
//  CONTROLLERS
// ========================

// Criar minuta
async function criarMinuta(req, res) {
  try {
    const {
      cct,
      nCT,
      dhEmi,
      cMunIni,
      cMunFim,
      remetenteCNPJ,
      destinatarioCNPJ,
      valorPrestacao,
      valorCarga,
    } = req.body;

    const novaMinuta = await prisma.minuta.create({
      data: {
        cct,
        nCT,
        dhEmi: new Date(dhEmi),
        cMunIni,
        cMunFim,
        remetenteCNPJ,
        destinatarioCNPJ,
        valorPrestacao: parseFloat(valorPrestacao),
        valorCarga: parseFloat(valorCarga),
      },
    });

    res.json(novaMinuta);
  } catch (error) {
    console.error("Erro ao criar minuta:", error);
    res.status(500).json({ error: "Erro ao criar minuta" });
  }
}

// Listar minutas
async function listarMinutas(req, res) {
  try {
    const minutas = await prisma.minuta.findMany({
      orderBy: { id: "desc" },
    });
    res.json(minutas);
  } catch (error) {
    console.error("Erro ao listar minutas:", error);
    res.status(500).json({ error: "Erro ao listar minutas" });
  }
}

// Excluir minuta
async function excluirMinuta(req, res) {
  try {
    const { id } = req.params;
    await prisma.minuta.delete({ where: { id: Number(id) } });
    res.json({ message: "Minuta excluída com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir minuta:", error);
    res.status(500).json({ error: "Erro ao excluir minuta" });
  }
}

// Gerar XML CT-e simplificado para AverbePorto
async function gerarXML(req, res) {
  try {
    const { id } = req.params;
    const minuta = await prisma.minuta.findUnique({
      where: { id: Number(id) },
    });

    if (!minuta) {
      return res.status(404).json({ error: "Minuta não encontrada" });
    }

    // Gera chave + DV
    const { chave, dv } = gerarChaveCTe(minuta);
    const dhEmiFormatado = formatarDhEmi(minuta.dhEmi);

    // IMPORTANTE: cMunIni e cMunFim devem ser CÓDIGOS IBGE
    const cMunIni = minuta.cMunIni;
    const cMunFim = minuta.cMunFim;

    // CNPJs com 14 dígitos (vindo do form)
    const remetenteCNPJ = String(minuta.remetenteCNPJ).padStart(14, "0");
    const destinatarioCNPJ = String(minuta.destinatarioCNPJ).padStart(14, "0");

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<cteProc xmlns="http://www.portalfiscal.inf.br/cte" versao="3.00">
  <CTe>
    <infCte Id="CTe${chave}" versao="3.00">
      <ide>
        <cUF>${CTE_CONFIG.cUF}</cUF>
        <cCT>${String(minuta.cct).padStart(8, "0")}</cCT>
        <CFOP>1234</CFOP>
        <mod>${CTE_CONFIG.mod}</mod>
        <serie>${CTE_CONFIG.serie}</serie>
        <nCT>${minuta.nCT}</nCT>
        <dhEmi>${dhEmiFormatado}</dhEmi>
        <tpImp>1</tpImp>
        <tpEmis>${CTE_CONFIG.tpEmis}</tpEmis>
        <cDV>${dv}</cDV>
        <tpAmb>${CTE_CONFIG.tpAmb}</tpAmb>
        <procEmi>${CTE_CONFIG.procEmi}</procEmi>
        <verProc>${CTE_CONFIG.verProc}</verProc>
        <modal>${CTE_CONFIG.modal}</modal>
        <tpServ>${CTE_CONFIG.tpServ}</tpServ>
        <cMunIni>${cMunIni}</cMunIni>
        <UFIni>${CTE_CONFIG.UFIni}</UFIni>
        <cMunFim>${cMunFim}</cMunFim>
        <UFFim>${CTE_CONFIG.UFFim}</UFFim>
      </ide>
      <emit>
        <CNPJ>${CTE_CONFIG.cnpjEmit}</CNPJ>
        <xNome>${CTE_CONFIG.xNomeEmit}</xNome>
        <enderEmit>
          <UF>${CTE_CONFIG.UFIni}</UF>
        </enderEmit>
      </emit>
      <rem>
        <CNPJ>${remetenteCNPJ}</CNPJ>
        <xNome>${CTE_CONFIG.xNomeEmit}</xNome>
        <enderReme>
          <cMun>${cMunIni}</cMun>
          <UF>${CTE_CONFIG.UFIni}</UF>
        </enderReme>
      </rem>
      <dest>
        <CNPJ>${destinatarioCNPJ}</CNPJ>
        <xNome>DESTINATÁRIO TESTE</xNome>
        <enderDest>
          <cMun>${cMunFim}</cMun>
        </enderDest>
      </dest>
      <vPrest>
        <vTPrest>${minuta.valorPrestacao.toFixed(2)}</vTPrest>
      </vPrest>
      <infCTeNorm>
        <infCarga>
          <vCarga>${minuta.valorCarga.toFixed(2)}</vCarga>
        </infCarga>
        <chave>0</chave>
      </infCTeNorm>
    </infCte>
    <xObs>Este é um XML fictício gerado com os dados do usuário, apenas para homologação com o sistema AverbePorto.</xObs>
  </CTe>
</cteProc>`;

    // Garante que a pasta uploads exista
    const dirPath = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

    const filePath = path.join(dirPath, `minuta_${minuta.id}.xml`);
    fs.writeFileSync(filePath, xmlContent, "utf-8");

    res.download(filePath);
  } catch (error) {
    console.error("Erro ao gerar XML:", error);
    res.status(500).json({ error: "Erro ao gerar XML" });
  }
}

module.exports = {
  criarMinuta,
  listarMinutas,
  excluirMinuta,
  gerarXML,
};
