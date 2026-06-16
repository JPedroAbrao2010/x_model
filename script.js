/* sinalizar ao navegador que a comunicação funcionou */
console.log("script in action");

/* declarando variáveis */
const chat = document.getElementById("chat-messages");
const input = document.getElementById("msg");

/* ⚡ CORREÇÃO AQUI: Evento único para o Enter usando keydown */
input.addEventListener("keydown", function (event) {
  // Se pressionou Enter SEM segurar o Shift
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault(); // Impede totalmente o espaço/salto de linha
    enviar(); // Chama a sua função de enviar
  }
});

/* função de adicionar mensagens no chat */
function adicionarMensagem(texto, tipo) {
  const msg = document.createElement("div");

  msg.classList.add("mensagem");

  msg.classList.add(tipo);

  msg.innerText = texto;

  chat.appendChild(msg);

  chat.scrollTop = chat.scrollHeight;
}

/* função de enviar mensagem para bot */
async function enviar() {
  const texto = input.value;

  if (texto.trim() === "") {
    return;
  }

  salvar();

  /* mensagens do usuário */
  adicionarMensagem(texto, "usuario");

  input.value = "";

  /* mensagem temporária: loading... */
  const pensando = document.createElement("div");

  pensando.classList.add("mensagem");

  pensando.classList.add("bot");

  pensando.innerText = "🌐 loading...";

  chat.appendChild(pensando);

  try {
    const res = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        texto: texto,
      }),
    });

    const data = await res.json();

    pensando.innerText = data.resposta;
  } catch (erro) {
    pensando.innerText = "Erro ao conectar.";

    console.log(erro);
  }
}

/* função trocar tema, entre claro e escuro */
function trocarTema() {
  document.body.classList.toggle("light");
}

/* função de guardar os prompts no arquivo.json */
const armazenamento = document.getElementById("msg");
const historico = [];

function salvar() {
  console.log("Salvando...");
  const mensagens = armazenamento.value;

  historico.push({
    autor: "usuario",
    mensagens: mensagens,
    data: new Date().toDateString(),
  });

  console.log(historico);
}

function criarArquivoJSON() {
  // Converte o array para texto JSON
  const conteudo = JSON.stringify(historico, null, 2);

  // Cria um arquivo em memória
  const blob = new Blob([conteudo], {
    type: "application/json",
  });

  // Cria um link temporário
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "historico_chat.json";

  // Faz o download
  link.click();

  // Libera a memória
  URL.revokeObjectURL(url);
}

/* função dos botões extras escondidos */
function toggleMenu() {
  const menu = document.getElementById("menu-extra");

  if (menu.style.display == "block") {
    menu.style.display = "none";
  } else {
    menu.style.display = "block";
  }
}

/* função do menu de funções extras */
function toggleMenuconfig() {
  const menu = document.getElementById("menu-configuracao");

  if (menu.style.display == "block") {
    menu.style.display = "none";
  } else {
    menu.style.display = "block";
  }
}

/* função editar mensagem */
function editarMensagem(elemento) {
  let textoAtual = elemento.innerText;

  let novoTexto = prompt("Edit message:", textoAtual);

  if (novoTexto == null) {
    return;
  }

  elemento.innerText = novoTexto;

  enviarMensagemEditada(novoTexto);
}

/* função de enviar nova mensagem editada */
async function enviarMensagemEditada(texto) {
  const resposta = await fetch("http://127.0.0.1:8000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      texto: texto,
    }),
  });

  const dados = await resposta.json();

  adicionarMensagem(dados.resposta, "bot");
}

/* função de enviar arquivo de texto */
async function enviarArquivo() {
  const arquivo = document.getElementById("arquivo").files[0];

  if (!arquivo) {
    alert("Select a file");
    return;
  }

  const formData = new FormData();
  formData.append("arquivo", arquivo);

  const resposta = await fetch("http://127.0.0.1:8000/upload", {
    method: "POST",
    body: formData,
  });

  const dados = await resposta.json();

  console.log(dados);
  alert(dados.mensagem);
}

/* função de alertar o usuário sobre o que analisar sobre o arquivo */

const botaoclicado = document.getElementById("btn-upload");

botaoclicado.addEventListener("click", () => {
  if (sessionStorage.getItem("btn-upload") !== "sim") {
    alert("fazendo upload");
    sessionStorage.setItem("btn-upload", "sim");
  } else {
    console.log("O alerta já foi exibido nesta sessão. Nada acontece.");
  }
});


// Função auxiliar para impedir a rolagem
function bloquearScroll(event) {
    event.preventDefault();
}

// Controla o menu de configurações (⚙️)
function toggleMenuconfig() {
    const menu = document.getElementById('menu-configuracao');
    menu.classList.toggle('ativo'); // Supondo que você usa uma classe para mostrar/esconder

    atualizarBloqueioScroll();
}

// Controla o menu extra (+)
function toggleMenu() {
    const menu = document.getElementById('menu-extra');
    menu.classList.toggle('ativo'); // Supondo que você usa uma classe para mostrar/esconder

    atualizarBloqueioScroll();
}


