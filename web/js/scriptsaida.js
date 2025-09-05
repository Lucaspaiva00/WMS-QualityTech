const uri = "http://localhost:3000/material";


window.addEventListener("DOMContentLoaded", () => {
    const tabelaSaida = document.querySelector("#tabela-saida tbody");

    let saidaList = JSON.parse(localStorage.getItem("saida")) || [];

    saidaList.forEach(e => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${e.pn_material}</td>
            <td>${e.lote}</td>
            <td>${e.data_validade}</td>
            <td>${e.posicao}</td>
            <td>${e.quantidade}</td>
             <td>                
            <button type="button" title="button" class='btn btn-primary' id='editaroperacao' onClick='editaroperacao(this)'>Editar</button>
            <button type="button" title="button" class='btn btn-primary' id='saidamaterial' onClick='baixa()'>Dar baixa</button></td>
            </td>
        `;
        tabelaSaida.appendChild(tr);
    });
});

function baixa(baixa) {
    if (confirm("Confirmar a baixa do material?")) {
        
    }
}