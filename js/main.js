import ui from "./ui.js"
import api from "./api.js"

const pensamentosSet = new Set();

async function adicionarChaveAoPensamento() {
    try {
        const pensamentos = await api.buscarPensamentos();
        pensamentos.forEach(pensamento => {
            const chavePensamento = 
                `${pensamento.conteudo.trim().toLowerCase()}-${pensamento.autoria.trim().toLowerCase()}`;
        pensamentosSet.add(chavePensamento);
        })
    } catch (error) {
        alert("Erro ao se adicionar uma chave ao pensamento.");
        throw error;
    }
};

function removerEspacosVazios(string) {
    return string.replaceAll(/\s+/g, "");
};

const regexConteudo = /^[\p{L}0-9\s\p{P}]{3,}$/u;
const regexAutoria = /^[\p{L}\s]{2,20}$/u;

function validarConteudo(conteudo) {
    return regexConteudo.test(conteudo);
};

function validarAutoria(autoria) {
    return regexAutoria.test(autoria);
};

document.addEventListener("DOMContentLoaded", () => {
    ui.renderizarPensamentos();
    adicionarChaveAoPensamento();

    const formularioPensamento = document.getElementById("pensamento-form");
    const botaoCancelar = document.getElementById("botao-cancelar");
    const inputBusca = document.getElementById("campo-busca");
    
    formularioPensamento.addEventListener("submit", manipularSubmissaoFormulario);
    botaoCancelar.addEventListener("click", manipularCancelamento);
    inputBusca.addEventListener("input", manipularBusca);
    
})

async function manipularSubmissaoFormulario(event) {
    event.preventDefault();
    
    const id = document.getElementById("pensamento-id").value;
    const conteudo = document.getElementById("pensamento-conteudo").value;
    const autoria = document.getElementById("pensamento-autoria").value;
    const data = document.getElementById("pensamento-data").value;

    const conteudoSemEspacos = removerEspacosVazios(conteudo);
    const autoriaSemEspacos = removerEspacosVazios(autoria);


    if (!validarConteudo(conteudoSemEspacos)) {
        alert("Para o conteúdo é permitida a inclusão somente de letras, números e espaços, com no mínimo 3 caracteres.");
        return;
    };

    if (!validarAutoria(autoriaSemEspacos)) {
        alert("Para a autoria é permitida a inclusão somente de letras e espaços, com no mínimo 2 e no máximo 20 caracteres.");
        return;
    };

    if (!validarData(data)) {
        alert("Não é permitido o cadastro de datas futuras. Selecione outra data.");
        return;
    };

    const chaveNovoPensamento = `${conteudo.trim().toLowerCase()}-${autoria.trim().toLowerCase()}`;

    if (pensamentosSet.has(chaveNovoPensamento)) {
        alert("Pensamento já cadastrado anteriormente.");
        return;
    }

    try {
        if (id) {
            await api.editarPensamento({ id, conteudo, autoria, data });
        } else {
            await api.salvarPensamento({ conteudo, autoria, data });
        }
        ui.renderizarPensamentos();
    }
    catch {
        alert("Erro ao salvar o pensamento.");
    }

}

function manipularCancelamento() {
    ui.limparFormulario();
}

async function manipularBusca() {
    const termoBusca = document.getElementById("campo-busca").value;

    try {
        const pensamentosFiltrados = await api.buscarPensamentosPorTermo(termoBusca);
        ui.renderizarPensamentos(pensamentosFiltrados);
    } catch (error) {
        alert("Erro ao realizar busca.");
        throw error;
    }

}

function validarData(data) {
    const dataAtual = new Date();
    const dataInserida = new Date(data);

    return dataInserida <= dataAtual;

}
