//Seletor DOM
const cargaHoraria = document.querySelector("#carga-horaria")
const batidaDePonto = document.querySelectorAll("#batida-ponto .formatar-input")
const botaoCalc = document.querySelector("#botao-calc")
const horasTRap = document.querySelector("#horas-trab")
const debitoTxt = document.querySelector("#debito")
const creditoTxt = document.querySelector("#credito")
const horasNormais = document.querySelector("#horas-normais")
const adNoturno = document.querySelector("#ad-noturno")
const intervalo = document.querySelector("#intervalo")
const formatarInput = document.querySelectorAll(".formatar-input")
const botaoADDponto = document.querySelector("#botao-dicionar-input-ponto")
const botaoRemovePonto = document.querySelector("#botao-remover-input-ponto")
const divPaiParaADDponto = document.querySelector("#batida-ponto")
const erroCargaHoraria = document.querySelector("#ErroSemcargaHoraria")
const erroPontoVazio = document.querySelector("#ErroPontoVazio")

//Funções
function converterParaMinuto(horario) {
    //separa e transforma a string em numero
    const [horas, minutos] = horario.split(':').map(Number);
    //transforma as horas em minutos
    return (horas * 60) + minutos;
}

let horasEmMinutos = []

// Voltar de minutos para horas
function converterMinutosParaHoras(minutos) {
    const horas = Math.floor(minutos / 60)
    const minutosRestantes = minutos % 60
    return `${String(horas).padStart(2, "0")}:${String(minutosRestantes).padStart(2, "0")}`
}

let totMinutosTrabalhados = 0

function ajustaHoraDepoisMeianoite(saida, entrada) {
    // Se o horário de saída for menor que o de entrada = passou da meia noite
    if (saida < entrada) {
        // Adiciona 24 horas em minutos para corrigir
        saida += 24 * 60;

    }
    return saida;
}

function batidasPonto () {
    // Seleciona todos os inputs dentro da div com o id "batida-ponto" sempre que a função for chamada
    const inputsPonto = Array.from(document.querySelectorAll('#batida-ponto .formatar-input'));
    const erroElemento = document.getElementById('erro-batida-ponto');

    // Verifica se algum input está vazio e exibe erros
    if (verificarInputsVazios(inputsPonto, erroElemento)) {
        return; // Interrompe a execução se houver erros
    }

    horasEmMinutos = []
    inputsPonto.forEach((batidaDePonto, index) => {
        //pega o valor do input
        const valor = batidaDePonto.value
        //utiliza a função para converter as horas em minuto
        const minutos = converterParaMinuto(valor)
        //adiciona objetos ao array
        horasEmMinutos.push({ tipo: `horario${index + 1}`, minutos })
    })
}

function calcTempoTrabalhado(horasEmMinutos) {
    totMinutosTrabalhados = 0

    //verifica seu o numero de pontos é par
    if (horasEmMinutos.length % 2 !== 0) {
        return;
    }

    // Calcula o tempo trabalhado
    for (let i = 0; i < horasEmMinutos.length; i += 2) {
        const entrada = horasEmMinutos[i].minutos
        let saida = horasEmMinutos[i + 1].minutos

        ///////////////
        saida = ajustaHoraDepoisMeianoite(saida, entrada)

        //calcula o periodo trabalhado para o par de horários a cima
        totMinutosTrabalhados += saida - entrada
    }

    //exibe o resultado na tela
    const resultMinutosEmHoras = converterMinutosParaHoras(totMinutosTrabalhados);
    horasTRap.innerText = resultMinutosEmHoras;
    return totMinutosTrabalhados;
}

//Calcula o intervalo
function calcIntervalo(horario) {
    let totMinutosIntervalo = 0

    if (horario.length >= 2) {
        console.log(horario.length)
        for (let i = 1; i < horario.length - 1; i += 2) {
            const entrada = horario[i].minutos
            const saida = horario[i + 1].minutos

            //calcula o periodo trabalhado para o par de horários a cima
            totMinutosIntervalo += saida - entrada
        }
    } else {
        //Define o intervalo como 0 caso não tenha mais de duas batidas.
        totMinutosIntervalo = 0;
    }

    const resultIntervalo = converterMinutosParaHoras(totMinutosIntervalo)
    intervalo.innerText = `${resultIntervalo}`

}


//Calculo de crédito e débito
function calcDebitoCredito(tempoTrabalhado, cargaHorariaMinutos) {
    const tolerancia = 10;
    const diferenca = tempoTrabalhado - cargaHorariaMinutos; // Diferença em minutos

    //Zera as variaveis e o texto mostrado na tela.
    let debito = 0
    debitoTxt.innerText = "00:00"
    let credito = 0
    creditoTxt.innerText = "00:00"

    // Verifica dentro da tolerância se cumpriu a carga horária
    if (Math.abs(diferenca) <= tolerancia) {
        console.log("Cumpriu a carga horária");
    }
    // Se o tempo trabalhado foi menor que a carga horária
    else if (diferenca < -tolerancia) {

        debito = Math.abs(diferenca); // Pegamos o débito como positivo
        debitoTxt.innerText = `${converterMinutosParaHoras(debito)}`
    }
    // Se o tempo trabalhado foi maior que a carga horária
    else if (diferenca > tolerancia) {
        credito = diferenca; // Crédito será o valor positivo da diferença
        creditoTxt.innerText = `${converterMinutosParaHoras(credito)}`
    }
}

//Calcula as horas normais ( horas trabalhadas dentro da carga horária )
function calcHorasTrabNormais(cargaHorariaMinutos) {

    //chama a função para verificar se o input ta vazio.
    if (erroInputVazio(cargaHoraria)) {
        return;
    }
    // Se o total de minutos trabalhados for maior que a carga horária
    if (totMinutosTrabalhados > cargaHorariaMinutos) {
        horasNormais.innerText = `${converterMinutosParaHoras(cargaHorariaMinutos)}` // Exibe a carga horária máxima permitida
    }
    // Se o total de minutos trabalhados for menor ou igual à carga horária
    else {
        horasNormais.innerText = `${converterMinutosParaHoras(totMinutosTrabalhados)}`;
    }
}


function calcAdicionalNoturno(horasEmMinutos) {
    let minutosNoturnos = 0;
    const inicioNoturno = 22 * 60; // 22:00 em minutos
    const fimNoturno = 5 * 60; // 05:00 em minutos

    for (let i = 0; i < horasEmMinutos.length; i += 2) {
        let entrada = horasEmMinutos[i].minutos;
        let saida = horasEmMinutos[i + 1].minutos;

        // Ajusta para o caso de atravessar a meia-noite
        if (saida < entrada) {
            saida += 24 * 60; // Adiciona 24 horas em minutos para corrigir
        }

        // Calcula minutos de trabalho noturno
        for (let minuto = entrada; minuto < saida; minuto++) {
            if (minuto >= inicioNoturno || minuto < fimNoturno) {
                minutosNoturnos++;
            }
        }
    }

    // Converte minutos noturnos para horas e minutos
    const horas = Math.floor(minutosNoturnos / 60); // Parte inteira das horas
    const minutos = minutosNoturnos % 60; // Restante dos minutos

    // Exibe no formato HH:MM
    adNoturno.innerText = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
}

//Verifica se o input de Carga horária está vazio para exibir erro.
function erroInputVazio(cargaHoraria) {
    if (cargaHoraria.value.trim() === "") {
        erroCargaHoraria.style.display = 'block';
        return true;
    }
    else {
        erroCargaHoraria.style.display = 'none';
        return false;
    }
}

// Função para verificar se os inputs estão vazios e exibir erro
function verificarInputsVazios(batidaDePonto, erroElemento) {
    let algumErro = false;
    batidaDePonto.forEach(input => {
        if (input.value.trim() === "") {
            algumErro = true;
        }
    });

    // Atualiza a cor do span de erro
    if (algumErro) {
        erroPontoVazio.style.display = 'block'; // Exibe a mensagem de erro
    } else {
        erroPontoVazio.style.display = 'none'; // Oculta a mensagem de erro
    }

    return algumErro;
}

//Eventos
botaoCalc.addEventListener("click", () => {

    const cargaHorariaMinutos = converterParaMinuto(cargaHoraria.value)

    batidasPonto ()
    calcTempoTrabalhado(horasEmMinutos)
    calcIntervalo(horasEmMinutos)
    calcDebitoCredito(totMinutosTrabalhados, cargaHorariaMinutos)
    calcHorasTrabNormais(cargaHorariaMinutos)
    calcAdicionalNoturno(horasEmMinutos)
})

// Função de formatação que adiciona o evento a um input específico
function formatarHoraInput(input) {
    input.addEventListener('input', (e) => {
        let valor = e.target.value
    
        // Tira tudo que não é número e :
        valor = valor.replace(/[^0-9:]/g, '')

        // Verifica se tem 2 números para colocar o :
        if (valor.length > 2 && valor.indexOf(':') === -1) {
            valor = valor.slice(0, 2) + ':' + valor.slice(2);
        }

        // Limita a quantidade de número após o :
        if (valor.length > 5) {
            valor = valor.slice(0, 5);
        }

        // Limita o primeiro dígito a 0, 1 ou 2
        if (valor.length === 1) {
            valor = valor.replace(/[^0-2]/g, '');
        }

        // Limita o segundo dígito a 0-3, caso o primeiro seja 2
        if (valor.length === 2) {
            const primeiroDigito = valor[0];
            if (primeiroDigito === '2') {
                valor = valor[0] + valor[1].replace(/[^0-3]/g, '');
            }
        }

        // Limita os minutos a 0-5 para o primeiro dígito dos minutos
        if (valor.length === 4) {
            valor = valor.slice(0, 3) + valor[3].replace(/[^0-5]/g, '');
        }

        // Limita a quantidade de caracteres no total a 5 (HH:MM)
        if (valor.length > 5) {
            valor = valor.slice(0, 5);
        }

        e.target.value = valor
    });
}
// Aplica a formatação a todos os inputs existentes
formatarInput.forEach(input => formatarHoraInput(input));

// Adicionar e remover input de ponto
botaoADDponto.addEventListener("click", () => {
    const input1 = document.createElement('input')
    const input2 = document.createElement('input')

    input1.type = 'text';
    input1.classList.add('formatar-input');
    input1.placeholder = '00:00';
    

    input2.type = 'text';
    input2.classList.add('formatar-input');
    input2.placeholder = '00:00';
    

    // Adiciona os inputs dentro da div
    divPaiParaADDponto.appendChild(input1);
    divPaiParaADDponto.appendChild(input2);

    // Adiciona o evento de formatação a cada novo input
    formatarHoraInput(input1);
    formatarHoraInput(input2);
})

botaoRemovePonto.addEventListener("click", () => {
    // Verifica se existem filhos suficientes para remover
    if (divPaiParaADDponto.children.length > 2) {
        // Remove os dois últimos filhos
        divPaiParaADDponto.removeChild(divPaiParaADDponto.lastChild);
        divPaiParaADDponto.removeChild(divPaiParaADDponto.lastChild);
    }
})
