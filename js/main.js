// main.js

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

let posicaoInicial;

const capturarLocalizacao = document.getElementById('localizacao');
const map = document.getElementById('mapa');
const cepInput = document.getElementById("cep");
const ruaInput = document.getElementById("rua");
const numeroInput = document.getElementById("numero");
const bairroInput = document.getElementById("bairro");
const cidadeInput = document.getElementById("cidade");
const nomeInput = document.getElementById("nome");

const sucesso = (posicao) => {
  posicaoInicial = posicao;
  map.src = "http://maps.google.com/maps?q=" + posicaoInicial.coords.latitude + "," + posicaoInicial.coords.longitude + "&z=16&output=embed";
};

const erro = (error) => {
  let errorMessage;
  switch(error.code){
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

function SalvarDados() {
  var nome = nomeInput.value;
  var cep = cepInput.value;
  var rua = ruaInput.value;
  var numero = numeroInput.value;
  var bairro = bairroInput.value;
  var cidade = cidadeInput.value;

  var dados = {
    nome: nome,
    cep: cep,
    rua: rua,
    numero: numero,
    bairro: bairro,
    cidade: cidade,
    latitude: posicaoInicial ? posicaoInicial.coords.latitude : null,
    longitude: posicaoInicial ? posicaoInicial.coords.longitude : null
  };

  // Armazenar no IndexedDB
  salvarNoIndexedDB(dados);

  console.log("Dados salvos:", dados);

  AtualizarMapa(cep, rua, numero, cidade);

  // Listar os dados após salvar
  ListarDados();
}

function AtualizarMapa(cep, rua, numero, cidade) {
  map.src = "https://maps.google.com/maps?q=" + rua + "+" + numero + "%2C+" + cidade + cep + "&t=&z=13&ie=UTF8&iwloc=&output=embed";

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

function salvarNoIndexedDB(dados) {
  var request = indexedDB.open("MeuBancoDeDados", 1);

  request.onupgradeneeded = function(event) {
    var db = event.target.result;

    // Criação ou atualização do object store
    var objectStore;
    if (event.oldVersion < 1) {
      // Se a versão antiga for menor que 1, precisamos criar o object store
      objectStore = db.createObjectStore("dados", { keyPath: "id", autoIncrement: true });
      objectStore.createIndex("nome", "nome", { unique: false });
      objectStore.createIndex("cep", "cep", { unique: false });
      objectStore.createIndex("latitude", "latitude", { unique: false });
      objectStore.createIndex("longitude", "longitude", { unique: false });
      objectStore.createIndex("rua", "rua", { unique: false });
      objectStore.createIndex("numero", "numero", { unique: false });
      objectStore.createIndex("bairro", "bairro", { unique: false });
      objectStore.createIndex("cidade", "cidade", { unique: false });
    } else {
      // Se já existir, pegamos o object store existente
      objectStore = event.currentTarget.transaction.objectStore("dados");
    }

    // Continuar com o processamento
    objectStore.add(dados);
  };

  request.onsuccess = function(event) {
    var db = event.target.result;
    var transaction = db.transaction(["dados"], "readwrite");
    var objectStore = transaction.objectStore("dados");
    objectStore.add(dados);

    transaction.oncomplete = function() {
      console.log("Dados armazenados no IndexedDB com sucesso!");
    };

    transaction.onerror = function(error) {
      console.error("Erro ao armazenar dados no IndexedDB:", error);
    };
  };

  request.onerror = function(error) {
    console.error("Erro ao abrir o IndexedDB:", error);
  };
}

function ListarDados() {
  var request = indexedDB.open("MeuBancoDeDados", 1);

  request.onsuccess = function(event) {
    var db = event.target.result;
    var transaction = db.transaction(["dados"], "readonly");
    var objectStore = transaction.objectStore("dados");

    // Limpar a lista antes de adicionar os novos elementos
    var listaDadosContainer = document.getElementById('lista-dados');
    listaDadosContainer.innerHTML = '';

    var cursorRequest = objectStore.openCursor();

    cursorRequest.onsuccess = function(event) {
      var cursor = event.target.result;
      if (cursor) {
        // Criar elementos HTML para exibir os dados
        var item = document.createElement('div');
        item.innerHTML = `
          <strong>ID:</strong> ${cursor.key} <br>
          <strong>Nome:</strong> ${cursor.value.nome} <br>
          <strong>CEP:</strong> ${cursor.value.cep} <br>
          <strong>Rua:</strong> ${cursor.value.rua} <br>
          <strong>Número:</strong> ${cursor.value.numero} <br>
          <strong>Bairro:</strong> ${cursor.value.bairro} <br>
          <strong>Cidade:</strong> ${cursor.value.cidade} <br>
          <strong>Latitude:</strong> ${cursor.value.latitude} <br>
          <strong>Longitude:</strong> ${cursor.value.longitude} <br>
          <hr>
        `;
        listaDadosContainer.appendChild(item);

        cursor.continue();
      } else {
        console.log("Listagem de dados concluída.");
      }
    };

    cursorRequest.onerror = function(error) {
      console.error("Erro ao listar dados do IndexedDB:", error);
    };
  };

  request.onerror = function(error) {
    console.error("Erro ao abrir o IndexedDB:", error);
  };
}
