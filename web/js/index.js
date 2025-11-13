const base = "http://localhost:3000";

async function carregarIndicadores() {
    try {
        const [materiais, saidas, clientes, minutas] = await Promise.all([
            fetch(`${base}/material`).then(r => r.json()),
            fetch(`${base}/saida`).then(r => r.json()),
            fetch(`${base}/cliente`).then(r => r.json()),
            fetch(`${base}/minuta`).then(r => r.json())
        ]);

        // 🟦 Indicadores principais
        document.getElementById("material").textContent = materiais.length;
        document.getElementById("saida").textContent = saidas.length;
        document.getElementById("clientes").textContent = clientes.length;
        document.getElementById("minutas").textContent = minutas.length;

        // 📅 Preparar datas
        const hoje = new Date();
        const limite = new Date();
        limite.setDate(hoje.getDate() + 30);
        const hojeStr = hoje.toISOString().split("T")[0];

        // 🟥 Materiais próximos do vencimento (30 dias)
        const proximos = materiais.filter(m => {
            if (!m.data_validade) return false;

            let dataVal = converterData(m.data_validade);

            // Ignorar se inválida
            if (!dataVal || isNaN(dataVal.getTime())) return false;

            // Ignorar datas absurdas
            if (dataVal.getFullYear() < 2020) return false;

            // Verifica se vence nos próximos 30 dias
            return dataVal >= hoje && dataVal <= limite;
        }).length;

        console.log("Datas de validade recebidas:", materiais.map(m => m.data_validade)); // 🧩 Debug
        console.log("Materiais a vencer:", proximos);

        document.getElementById("vencimento").textContent = proximos;

        // ⚫ Carregamentos pendentes
        const pendentes = saidas.filter(s => s.status?.toLowerCase() === "pendente").length;
        document.getElementById("pendentes").textContent = pendentes;

        // 🟩 Saídas de hoje
        const saidasHoje = saidas.filter(s => {
            if (!s.data_saida && !s.data_validade) return false;
            const data = converterData(s.data_saida || s.data_validade);
            return data && data.toISOString().split("T")[0] === hojeStr;
        }).length;
        document.getElementById("saidaHoje").textContent = saidasHoje;

        // 🟨 Último operador ativo
        const ultimaSaida = saidas.sort((a, b) =>
            new Date(b.atualizadoEm) - new Date(a.atualizadoEm)
        )[0];
        document.getElementById("operador").textContent =
            ultimaSaida?.usuario || ultimaSaida?.atualizadoPor || "—";

    } catch (error) {
        console.error("Erro ao carregar indicadores:", error);
    }
}

/**
 * Converte diferentes formatos de data em um objeto Date válido.
 * Aceita: "2025-10-31", "2025/10/31", "31/10/2025", "31-10-2025"
 */
function converterData(str) {
    if (!str) return null;

    // Remove espaços e converte separadores
    str = str.trim().replace(/[/]/g, "-");

    // Caso ISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return new Date(`${str}T00:00:00`);
    }

    // Caso dd-mm-yyyy
    if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
        const [dia, mes, ano] = str.split("-");
        return new Date(`${ano}-${mes}-${dia}T00:00:00`);
    }

    // Caso dd/mm/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
        const [dia, mes, ano] = str.split("/");
        return new Date(`${ano}-${mes}-${dia}T00:00:00`);
    }

    // Caso inválido
    return new Date(str);
}

carregarIndicadores();
