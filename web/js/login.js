document.getElementById("formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();
    const dados = Object.fromEntries(new FormData(e.target).entries());

    const resp = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });

    const json = await resp.json();

    if (json.operador) {
        localStorage.setItem("operador", JSON.stringify(json.operador));
        window.location.href = "index.html";
    } else {
        alert(json.error);
    }
});