# gincana-ulbra

Site da nossa equipe na gincana escolar. Mostra as provas que a escola passou e quem da equipe faz cada uma.

**Site:** https://schackschuck.github.io/gincana-ulbra/

## Para quem só quer ver

Abra o site. Há duas abas:

- **Provas:** um card por prova, com o nome, a descrição e o prazo (quando houver) e a lista de quem faz a prova.
- **Por aluno:** uma tabela com cada pessoa e as provas dela. Nomes iguais em provas diferentes aparecem numa linha só (maiúsculas, minúsculas e espaços extras não importam).

A busca encontra provas pelo nome da prova, pela descrição ou pelo nome de uma pessoa.

## Para o organizador

1. Clique em **Modo organizador**, no topo (ou abra o site com `?admin` no fim do endereço).
2. No painel você pode:
   - mudar o nome da gincana;
   - criar, editar e excluir provas (nome obrigatório; descrição e prazo opcionais);
   - em cada prova, digitar o nome de qualquer pessoa e apertar Enter (ou "Adicionar"). Dá para colar vários nomes de uma vez, separados por vírgula ou um por linha. O × tira a pessoa da prova;
   - opcionalmente, colar uma lista de alunos (um nome por linha) em **Alunos (sugestões)**. Esses nomes, e os que já foram usados em outras provas, aparecem como sugestão enquanto você digita. Remover um nome das sugestões não tira a pessoa das provas.
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
  "alunos": [{ "id": "a1", "nome": "Nome sugerido" }],
  "provas": [
    {
      "id": "p1",
      "nome": "Nome da prova",
      "descricao": "Regras da prova",
      "prazo": "2026-12-01",
      "pessoas": ["Fulano", "Ciclana"]
    }
  ]
}
```

`alunos` é só a lista de sugestões; quem faz cada prova fica em `pessoas`, como texto. `descricao` e `prazo` podem ficar vazios (`""`).

### Testar localmente

O site carrega o `data.json` com `fetch`, então abrir o `index.html` direto do disco não funciona. Rode um servidor na pasta do projeto:

```bash
python3 -m http.server 8000
```

e abra http://localhost:8000/.
