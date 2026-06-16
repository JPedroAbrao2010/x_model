from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
import ollama
import json
import os
from datetime import datetime
from fastapi.responses import FileResponse
from fastapi import UploadFile, File
from fastapi.staticfiles import StaticFiles

DOCUMENTO = ""

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Pergunta(BaseModel):
    texto: str

# Nova função para salvar as conversas
def salvar_conversa(usuario, chatbot):

    arquivo = "conversas.json"

    registro = {
        "hora": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
        "usuario": usuario,
        "chatbot": chatbot
    }

    if os.path.exists(arquivo):

        with open(arquivo, "r", encoding="utf-8") as f:
            try:
                historico = json.load(f)
            except:
                historico = []

    else:
        historico = []

    historico.append(registro)

    with open(arquivo, "w", encoding="utf-8") as f:
        json.dump(
            historico,
            f,
            ensure_ascii=False,
            indent=4
        )

@app.get("/")
def home():
    return FileResponse("index.html")

@app.post("/upload")
async def upload_arquivo(
    arquivo: UploadFile = File(...)
):
    global DOCUMENTO

    conteudo = await arquivo.read()

    print("Nome do arquivo:", arquivo.filename)
    print("Bytes recebidos:", len(conteudo))
    print("Conteúdo total:", conteudo[:100])

    DOCUMENTO = conteudo.decode("utf-8")

    print("Texto:", DOCUMENTO)

    return {
        "mensagem": f"Arquivo {arquivo.filename} carregado com sucesso!"
    }

@app.post("/chat")
def chat(pergunta: Pergunta):

    global DOCUMENTO

    print("Tamanho do documento:", len(DOCUMENTO))
    print(DOCUMENTO[:500])

    resposta = ollama.chat(
        model='llama3.2:3b',
        keep_alive='10m',
        messages=[
            {
                'role': 'system',
                'content': f"""
You are a helpful AI assistant, your name is X-model.

Always respond in US English, regardless of the language used by the user.

Be friendly, concise, and clear.

Use the following document as context:

{DOCUMENTO}

When answering questions, use information from the document whenever relevant.

Rules:
- Always use English.
- Keep answers direct and explanatory.
- Never switch to another language.
"""
            },
            {
                'role': 'user',
                'content': pergunta.texto
            }
        ]
    )

    # Salva a conversa no arquivo JSON
    salvar_conversa(
        pergunta.texto,
        resposta['message']['content']
    )

    return {
        "resposta": resposta['message']['content']
    }
