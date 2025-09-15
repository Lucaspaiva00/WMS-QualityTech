const caixaForm = document.querySelector("#caixaForms");
const uri = "http://localhost:3000/cliente";

caixaForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = {
        nome_cliente: caixaForm.nome_cliente.value,
        cnpj: caixaForm.cnpj.value,
        endereco: caixaForm.endereco.value,
        telefone: caixaForm.telefone.value
    }

    fetch(`${uri}`, {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(data)

    })
        .then(res => res.status)
        .then(status => {
            if (status == 201) {
                window.location.reload()
            } else {
                alert("Erro ao inserir o material")
            }

        })
    console.log(data);

})

fetch(uri)
    .then(resp => resp.json())
    .then(resp => {
        resp.forEach(e => {
            cliente.innerHTML += `
            <td>${e.nome_cliente}</td>
            <td>${e.cnpj}</td>
            <td>${e.endereco}</td>
            <td>${e.telefone}</td>
            <td>                
            <button type="button" title="button" class='btn btn-primary' id='editaroperacao' onClick='editaroperacao(this)'>Editar</button>
            </td>
            `

        })
    })


