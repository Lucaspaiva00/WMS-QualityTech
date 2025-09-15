const caixaForm = document.querySelector("#caixaForms");
const uri = "http://localhost:3000/material";

caixaForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = {
        pn_material: caixaForm.pn_material.value,
        lote: caixaForm.lote.value,
        data_validade: caixaForm.data_validade.value,
        posicao: caixaForm.posicao.value,
        quantidade: Number(caixaForm.quantidade.value)
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
        let material = 0
        resp.forEach(e => {
            entrada.innerHTML += `
            <td>${e.pn_material}</td>
            <td>${e.lote}</td>
            <td>${e.data_validade}</td>
            <td>${e.posicao}</td>
            <td>${e.quantidade}</td>
            <td>                
            <button type="button" title="button" class='btn btn-primary' id='editaroperacao' onClick='editaroperacao(this)'>Editar</button>
            <button type="button" title="button" class='btn btn-primary' id='saidamaterial' onClick='saida(${JSON.stringify(e)})'>Saída</button></td>
            </td>
            `

        })
    })

function saida(material) {
    if (confirm("Confirmar a saída do material?")) {
        let saidaList = JSON.parse(localStorage.getItem("saida")) || [];
        saidaList.push(material);
        localStorage.setItem("saida", JSON.stringify(saidaList));
        event.target.closest("tr").remove();
    }
}

// SELECT PARA PUXAR A POSIÇÃO
fetch("http://localhost:3000/posicao")
    .then(resp => resp.json())
    .then(resp => {
        resp.forEach(e => {
            posicao.innerHTML += `
            <option value="${e.posicao}">${e.posicao}</option>
            `
        })
    })