const base = "http://localhost:3000";

async function carregarIndicadores() {
    try {
        const [materiais, saidas, clientes, minutas] = await Promise.all([
            fetch(`${base}/material`).then(r => r.json()),
            fetch(`${base}/saida`).then(r => r.json()),
            fetch(`${base}/cliente`).then(r => r.json()),
            fetch(`${base}/minuta`).then(r => r.json())
        ]);

        document.getElementById("material").textContent = materiais.length;
        document.getElementById("saida").textContent = saidas.length;
        document.getElementById("clientes").textContent = clientes.length;
        document.getElementById("minutas").textContent = minutas.length;
    } catch (error) {
        console.error("Erro ao carregar indicadores:", error);
    }
}

carregarIndicadores();