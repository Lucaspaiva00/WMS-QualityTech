const BASE_URL = "http://localhost:3000";

// (Opcional) força login para acessar essa tela
const opLogado = JSON.parse(localStorage.getItem("OPERADOR_LOGADO") || "null");
if (!opLogado) {
    // se quiser travar, descomente:
    // window.location.href = "login.html";
}

async function carregarOperadores() {
    try {
        const resp = await fetch(`${BASE_URL}/operadores`);
        const lista = await resp.json();

        const tbody = document.querySelector("#tabelaOperadores tbody");
        tbody.innerHTML = "";

        lista.forEach(o => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
            <td>${o.id}</td>
            <td>${o.nome}</td>
            <td>${o.usuario}</td>
            <td>${o.criadoEm ? new Date(o.criadoEm).toLocaleString("pt-BR") : ""}</td>
          `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
        alert("Erro ao carregar operadores.");
    }
}

document.querySelector("#formOperador").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
        nome: form.nome.value.trim(),
        usuario: form.usuario.value.trim(),
        senha: form.senha.value,
    };

    try {
        const resp = await fetch(`${BASE_URL}/operadores`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const body = await resp.json().catch(() => ({}));

        if (!resp.ok) {
            alert(body.error || "Erro ao cadastrar operador.");
            return;
        }

        alert("Operador cadastrado com sucesso!");
        form.reset();
        carregarOperadores();
    } catch (error) {
        console.error(error);
        alert("Erro ao conectar com o servidor.");
    }
});

carregarOperadores();