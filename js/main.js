if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
  try {
      let reg;
      reg = await navigator.serviceWorker.register('/sw.js', { type: "module" });
      console.log('Service worker registrada!', reg);
  } catch (err) {
      console.log('Service worker registro falhou: ', err);
  }
  });
}

let posicaoInicial;//variavel para capturar a posicao
const capturarLocalizacao = document.getElementById('localizacao');
var latitude = document.getElementById('latitude');
var longitude = document.getElementById('longitude');
const map = document.getElementById('mapa');

const sucesso = (posicao) => {//callback de sucesso para captura da posicao
  posicaoInicial = posicao;
  map.src = "http://maps.google.com/maps?q=" + posicaoInicial.coords.latitude + ", " + posicaoInicial.coords.longitude +
  "&z=16&output=embed"; 
  console.log(latitude,longitude)
};

const erro = (error) => {//callback de error (falha para captura de localizacao)
  let errorMessage;
  switch(error.code){
      case 0:
      errorMessage = "Erro desconhecido"
  break;
  case 1:
      errorMessage = "Permissão negada!"
  break;
  case 2:
      errorMessage = "Captura de posição indisponível!"
  break;
  case 3:
      errorMessage = "Tempo de solicitação excedido!"
  break;
  } console.log('Ocorreu um erro: ' + errorMessage);
};

capturarLocalizacao.addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(sucesso, erro);
});



var cepInput = document.getElementById("cep");
var ruaInput = document.getElementById("rua");
var numeroInput = document.getElementById("numero");
var bairroInput = document.getElementById("bairro");
var cidadeInput = document.getElementById("cidade");
var nomeInput = document.getElementById("nome");


function SalvarDados() {
  var nome = nomeInput.value
  var cep = cepInput.value;
  var rua = ruaInput.value;
  var numero = numeroInput.value;
  var bairro = bairroInput.value;
  var cidade = cidadeInput.value;
  var lat =  posicaoInicial.coords.latitude
  var long = posicaoInicial.coords.longitude

  console.log("Dados salvos:", {
    nome:nome,
    latitude:lat,
    longitude:long,
    cep: cep,
    rua: rua,
    numero: numero,
    bairro: bairro,
    cidade: cidade,
  });

  AtualizarMapa(cep, rua, numero, cidade);
}

function AtualizarMapa(cep, rua, numero, cidade) {
  
  map.src = "https://maps.google.com/maps?q=" + rua + "+" + numero + "%2C+" + cidade  + cep + "&t=&z=13&ie=UTF8&iwloc=&output=embed";


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



