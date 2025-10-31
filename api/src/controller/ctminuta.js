const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();

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
    const minutas = await prisma.Minuta.findMany({
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

// Gerar XML
async function gerarXML(req, res) {
  try {
    const { id } = req.params;
    const minuta = await prisma.minuta.findUnique({
      where: { id: Number(id) },
    });
    if (!minuta) return res.status(404).json({ error: "Minuta não encontrada" });

    // XML fiel ao modelo da AverbePorto
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<cteProc xmlns="http://www.portalfiscal.inf.br/cte" versao="3.00">
  <CTe>
    <infCte Id="CTe35251061575248000175949990000004451854322987" versao="3.00">
      <ide>
        <cUF>35</cUF>
        <cCT>${minuta.cct}</cCT>
        <CFOP>1234</CFOP>
        <mod>94</mod>
        <serie>999</serie>
        <nCT>${minuta.nCT}</nCT>
        <dhEmi>${minuta.dhEmi.toISOString()}</dhEmi>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>7</cDV>
        <tpAmb>1</tpAmb>
        <procEmi>0</procEmi>
        <verProc>AverbePorto 1.7.2</verProc>
        <modal>01</modal>
        <tpServ>0</tpServ>
        <cMunIni>${minuta.cMunIni}</cMunIni>
        <UFIni>SP</UFIni>
        <cMunFim>${minuta.cMunFim}</cMunFim>
        <UFFim>PR</UFFim>
      </ide>
      <emit>
        <CNPJ>61575248000175</CNPJ>
        <xNome>GALPEX ARMAZEN LOGISTICA E TRANSPORTES LTDA</xNome>
        <enderEmit>
          <UF>SP</UF>
        </enderEmit>
      </emit>
      <rem>
        <CNPJ>${minuta.remetenteCNPJ}</CNPJ>
        <xNome>GALPEX ARMAZEN LOGISTICA E TRANSPORTES LTDA</xNome>
        <enderReme>
          <cMun>3550308</cMun>
          <UF>SP</UF>
        </enderReme>
      </rem>
      <dest>
        <CNPJ>${minuta.destinatarioCNPJ}</CNPJ>
        <xNome>DESTINATÁRIO TESTE</xNome>
        <enderDest>
          <cMun>${minuta.cMunFim}</cMun>
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
