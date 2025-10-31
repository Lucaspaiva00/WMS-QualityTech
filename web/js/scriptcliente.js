const caixaForm = document.querySelector("#caixaForms");
const uri = "http://localhost:3000/cliente";
const clienteTbody = document.querySelector("#cliente");

// ===== CADASTRAR CLIENTE =====
caixaForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
        nome_cliente: caixaForm.nome_cliente.value,
        cnpj: caixaForm.cnpj.value,
        endereco: caixaForm.endereco.value,
        telefone: caixaForm.telefone.value
    };

    try {
        const res = await fetch(uri, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (res.status === 201) {
            caixaForm.reset();
            carregarClientes();
        } else {
            alert("Erro ao cadastrar cliente");
        }
    } catch (error) {
        console.error(error);
        alert("Erro ao conectar com o servidor");
    }
});

// ===== CARREGAR CLIENTES =====
const carregarClientes = async () => {
    clienteTbody.innerHTML = "";
    try {
        const resp = await fetch(uri);
        const clientes = await resp.json();

        clientes.forEach((e) => {
            clienteTbody.innerHTML += `
        <tr data-id="${e.cod_cliente}">
          <td>${e.nome_cliente}</td>
          <td>${e.cnpj}</td>
          <td>${e.endereco}</td>
          <td>${e.telefone}</td>
          <td>
            <button class='btn btn-primary btn-sm' onClick='editaroperacao(this)'>Editar</button>
          </td>
        </tr>`;
        });
    } catch (error) {
        console.error(error);
    }
};

// ===== CHAMAR AO CARREGAR =====
carregarClientes();

// ===== EDITAR CLIENTE =====
function editaroperacao(botao) {
    const linha = botao.closest("tr");
    const cod_cliente = linha.getAttribute("data-id");
    const modal = $("#modalEditarCliente");
    const form = document.querySelector("#formEditarCliente");

    form.nome_cliente.value = linha.children[0].innerText;
    form.cnpj.value = linha.children[1].innerText;
    form.endereco.value = linha.children[2].innerText;
    form.telefone.value = linha.children[3].innerText;

    modal.modal("show");

    form.onsubmit = async (e) => {
        e.preventDefault();
        const atualizado = {
            nome_cliente: form.nome_cliente.value,
            cnpj: form.cnpj.value,
            endereco: form.endereco.value,
            telefone: form.telefone.value
        };

        try {
            const res = await fetch(`${uri}/${cod_cliente}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(atualizado)
            });

            if (res.status === 202) {
                alert("Cliente atualizado com sucesso!");
                modal.modal("hide");
                carregarClientes();
            } else {
                alert("Erro ao atualizar cliente");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao conectar com o servidor");
        }
    };
}
