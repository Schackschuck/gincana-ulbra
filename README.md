# gincana-ulbra

Site da nossa equipe na gincana escolar. Mostra as provas que a escola passou, separadas por categoria, e quais alunos da equipe fazem cada uma, com o status de cada aluno.

**Site:** https://schackschuck.github.io/gincana-ulbra/

## Para quem só quer ver

Abra o site. Há duas abas:

- **Provas por categoria:** um card por prova, com descrição, prazo, barra de progresso e a lista de alunos com o status de cada um.
- **Por aluno:** uma tabela com cada aluno e as provas dele.

Dá para buscar por nome de prova ou de aluno e filtrar por categoria e por status.

### Status

| Status | Significado |
| --- | --- |
| Pendente | Ainda não começou |
| Em andamento | Está sendo feita |
| Cumprida | Feita, mas ainda não entregue |
| Enviada | Entregue |

A barra de progresso conta como concluídos os alunos com status **Cumprida** ou **Enviada**. O site só mostra o status; a entrega das provas acontece por fora.

## Para o organizador

1. Clique em **Modo organizador**, no topo (ou abra o site com `?admin` no fim do endereço).
2. No painel você pode:
   - mudar o nome da gincana;
   - cadastrar e remover categorias;
   - colar a lista de alunos (um nome por linha) e remover alunos;
   - criar, editar e excluir provas, marcando os alunos que fazem cada uma;
   - trocar o status de cada aluno direto no card da prova.
3. As alterações ficam salvas **só no seu navegador**, como rascunho, até você publicar.
4. Clique em **Publicar**. O site grava o `data.json` no repositório e atualiza para todos em cerca de 1 minuto.

Se preferir não usar o token, o botão **Baixar data.json** baixa o arquivo para você enviar manualmente ao repositório.

### Token para o botão Publicar

O botão Publicar precisa de um token do GitHub. Ele fica guardado só no seu navegador e nunca vai para o repositório.

1. No GitHub, vá em **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Em **Repository access**, escolha **Only select repositories** e marque `gincana-ulbra`.
3. Em **Permissions → Repository permissions → Contents**, escolha **Read and write**.
4. Gere o token e cole no campo **Token de acesso**, dentro de "Publicar para todos", no modo organizador.

Não compartilhe o token com ninguém. Se ele vazar, apague no GitHub e gere outro.

## Como funciona por dentro

É um site estático publicado pelo GitHub Pages (branch `main`, pasta raiz):

- `index.html`: o site inteiro (HTML, CSS e JavaScript num arquivo só);
- `data.json`: os dados, carregados pelo site ao abrir.

Formato do `data.json`:

```json
{
  "titulo": "Gincana Escolar",
  "atualizado": "2026-11-19T12:00:00.000Z",
  "alunos": [{ "id": "a1", "nome": "Nome do aluno" }],
  "categorias": [{ "id": "c1", "nome": "Provas culturais" }],
  "provas": [
    {
      "id": "p1",
      "nome": "Nome da prova",
      "categoriaId": "c1",
      "descricao": "Regras da prova",
      "prazo": "2026-12-01",
      "atribuicoes": [{ "alunoId": "a1", "status": "pendente" }]
    }
  ]
}
```

`status` pode ser `pendente`, `andamento`, `cumprida` ou `enviada`.

### Testar localmente

O site carrega o `data.json` com `fetch`, então abrir o `index.html` direto do disco não funciona. Rode um servidor na pasta do projeto:

```bash
python3 -m http.server 8000
```

e abra http://localhost:8000/.
