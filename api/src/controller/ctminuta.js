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
// Gerar XML
async function gerarXML(req, res) {
  try {
    const { id } = req.params;
    const minuta = await prisma.minuta.findUnique({
      where: { id: Number(id) },
    });
    if (!minuta) return res.status(404).json({ error: "Minuta não encontrada" });

    // Dados fixos obrigatórios
    const cUF = "35"; // São Paulo
    const CNPJ = "61575248000175";
    const mod = "57"; // Modelo do CTe
    const serie = "999";
    const tpEmis = "1";

    // Gerar cCT (código numérico aleatório)
    const cCT = String(Math.floor(10000000 + Math.random() * 89999999));

    // Gerar chave de acesso base (sem o dígito verificador ainda)
    const chaveBase = `${cUF}${minuta.dhEmi.getFullYear().toString().slice(2)}${String(minuta.dhEmi.getMonth() + 1).padStart(2, "0")}${CNPJ}${mod}${serie}${minuta.nCT.padStart(9, "0")}${tpEmis}${cCT}`;

    // Calcular dígito verificador (módulo 11)
    const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
    let soma = 0;
    let pesoIndex = 0;
    for (let i = chaveBase.length - 1; i >= 0; i--) {
      soma += parseInt(chaveBase[i]) * pesos[pesoIndex];
      pesoIndex = (pesoIndex + 1) % pesos.length;
    }
    const resto = soma % 11;
    const cDV = resto === 0 || resto === 1 ? 0 : 11 - resto;

    // Monta ID completo
    const chaveFinal = `${chaveBase}${cDV}`;
    const Id = `CTe${chaveFinal}`;

    // XML fiel ao modelo da AverbePorto
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<cteProc xmlns="http://www.portalfiscal.inf.br/cte" versao="3.00">
  <CTe>
    <infCte Id="${Id}" versao="3.00">
      <ide>
        <cUF>${cUF}</cUF>
        <cCT>${cCT}</cCT>
        <CFOP>1234</CFOP>
        <mod>${mod}</mod>
        <serie>${serie}</serie>
        <nCT>${minuta.nCT}</nCT>
        <dhEmi>${minuta.dhEmi.toISOString()}</dhEmi>
        <tpImp>1</tpImp>
        <tpEmis>${tpEmis}</tpEmis>
        <cDV>${cDV}</cDV>
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
        <CNPJ>${CNPJ}</CNPJ>
        <xNome>GALPEX ARMAZEN LOGISTICA E TRANSPORTES LTDA</xNome>
        <enderEmit>
          <UF>SP</UF>
        </enderEmit>
      </emit>
      <rem>
        <CNPJ>${minuta.remetenteCNPJ}</CNPJ>
        <xNome>GALPEX ARMAZEN LOGISTICA E TRANSPORTES LTDA</xNome>
        <enderReme>
          <cMun>${minuta.cMunIni}</cMun>
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
      </infCTeNorm>
    </infCte>
    <xObs>Este é um XML fictício gerado para homologação com o sistema AverbePorto.</xObs>
  </CTe>
</cteProc>`;

    // Salvar e enviar
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
