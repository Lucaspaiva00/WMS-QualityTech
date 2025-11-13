// URL específica para login
const LOGIN_URL = "http://localhost:3000/login";

const jaLogado = localStorage.getItem("OPERADOR_LOGADO");
if (jaLogado) {
    window.location.href = "index.html";
}

document
    .querySelector("#formLogin")
    .addEventListener("submit", async (e) => {
        e.preventDefault();
        const usuario = document.querySelector("#usuario").value.trim();
        const senha = document.querySelector("#senha").value;

        try {
            const resp = await fetch(LOGIN_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario, senha }),
            });

            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                alert(err.error || "Usuário ou senha inválidos.");
                return;
            }

            const operador = await resp.json();

            // SALVA SEMPRE AQUI
            localStorage.setItem("OPERADOR_LOGADO", JSON.stringify(operador));

            window.location.href = "index.html";
        } catch (error) {
            console.error(error);
            alert("Erro ao conectar com o servidor.");
        }
    });
