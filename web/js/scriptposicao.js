const caixaForm = document.querySelector("#caixaForms");
const uri = "http://localhost:3000/posicao";

caixaForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = {
        posicao: caixaForm.posicao.value
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
                alert("Erro ao inserir a posição")
            }
        })
    console.log(data);
})

fetch(uri)
    .then(resp => resp.json())
    .then(resp => {
        resp.forEach(e => {
            posicao.innerHTML += `
            <td>${e.posicao}</td>
            <td>                
            <button type="button" title="button" class='btn btn-primary' id='editaroperacao' onClick='editaroperacao(this)'>Editar</button>
            <button type="button" title="button" class='btn btn-primary' id='deletarposicao' onClick='deletar(${e.cod_posicao})'>Deletar</button></td>
            </td>
            `
        })
    })
function deletar(cod_posicao) { 
    if (confirm("Confirmar a deleção da posição?")) {
        fetch(`http://localhost:3000/posicao/${cod_posicao}`, {
            method: "DELETE"
        })
        .then(res => {
            if (res.status === 200 || res.status === 204) {
                window.location.reload()
            } else {
                alert("Erro ao deletar a posição")
            }
        })  
    }
}



function editaroperacao(td) {
    const linha = td.closest("tr");
    const posicao = linha.children[0].textContent;
    const novoValor = prompt("Digite a nova posição:", posicao);
    if (novoValor !== null && novoValor.trim() !== "") {
        const data = { posicao: Number(novoValor) };
        fetch(`${uri}/${posicao}`, {
            method: "PUT",
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(res => res.status)
            .then(status => {
                if (status == 200) {
                    window.location.reload();
                } else {
                    alert("Erro ao atualizar a posição");
                }
            });
    }
}
