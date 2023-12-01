if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      let reg;
      reg = await navigator.serviceWorker.register('./sw.js', { type: 'module' });
      console.log('Service worker registrada!', reg);
    } catch (err) {
      console.log(' Service worker registro falhou:', err);
    }
  });
}


var cepInput = document.getElementById("cep");
var ruaInput = document.getElementById("rua");
var numeroInput = document.getElementById("numero");
var bairroInput = document.getElementById("bairro");
var cidadeInput = document.getElementById("cidade");
var estadoInput = document.getElementById("estado");

var map = document.getElementById('mapa');

document.getElementById("salvarBtn").addEventListener("click", function() {
  SalvarDados();
});

function SalvarDados() {

  var cep = cepInput.value;
  var rua = ruaInput.value;
  var numero = numeroInput.value;
  var bairro = bairroInput.value;
  var cidade = cidadeInput.value;
  var estado = estadoInput.value;

  console.log("Dados salvos:", {
    cep: cep,
    rua: rua,
    numero: numero,
    bairro: bairro,
    cidade: cidade,
    estado: estado
  });


  AtualizarMapa(cep, rua, numero, cidade, estado);
}

function AtualizarMapa(cep, rua, numero, cidade, estado) {
  
  map.src = "https://maps.google.com/maps?q=" + rua + "+" + numero + "%2C+" + cidade + "+" + estado + "+" + cep + "&t=&z=13&ie=UTF8&iwloc=&output=embed";


  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'saveData',
      data: {
        cep: cep,
        rua: rua,
        numero: numero,
        bairro: bairro,
        cidade: cidade,
        estado: estado
      }
    });
  }
}

const erro = (error) => {
  let errorMessage;
  switch (error.code) {
    case 0:
      errorMessage = "Erro desconhecido";
      break;
    case 1:
      errorMessage = "Permissão negada!";
      break;
    case 2:
      errorMessage = "Captura de posição indisponível!";
      break;
    case 3:
      errorMessage = "Tempo de solicitação excedido!";
      break;
  }
  console.log('Ocorreu um erro: ' + errorMessage);
};

capturarLocalizacao.addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(sucesso, erro);
});
