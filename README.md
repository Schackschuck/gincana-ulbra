# gincana-ulbra

Site da nossa equipe na gincana escolar. Mostra as provas que a escola passou e quem da equipe faz cada uma.

**Site:** https://schackschuck.github.io/gincana-ulbra/

## Para quem só quer ver

Abra o site. Há três abas:

- **Provas:** um card por prova, com o nome, a descrição e o prazo (quando houver), a lista de quem faz a prova e o controle **Enviada** / **Postada no Instagram** (este último só nas provas cujas regras mandam postar). O filtro ao lado da busca mostra só o que falta enviar ou postar.
- **Postagens da gincana:** as postagens do Instagram [@gincanamartinholutero](https://www.instagram.com/gincanamartinholutero/), trazidas automaticamente pelo robô (veja abaixo). As que ainda não viraram prova aparecem como **Nova**, e o site mostra um aviso no topo.
- **Por aluno:** uma tabela com cada pessoa e as provas dela. Nomes iguais em provas diferentes aparecem numa linha só (maiúsculas, minúsculas e espaços extras não importam).

A busca encontra provas pelo nome da prova, pela descrição ou pelo nome de uma pessoa.

## Para o organizador

1. Clique em **Modo organizador**, no topo (ou abra o site com `?admin` no fim do endereço).
2. No painel você pode:
   - mudar o nome da gincana;
   - criar, editar e excluir provas (nome obrigatório; descrição e prazo opcionais);
   - em cada prova, digitar o nome de qualquer pessoa e apertar Enter (ou "Adicionar"). Dá para colar vários nomes de uma vez, separados por vírgula ou um por linha. O × tira a pessoa da prova;
   - marcar em cada prova se ela já foi **enviada** e **postada no Instagram** (direto no card, ou em "Editar", onde também dá para colar o link do nosso post);
   - na aba **Postagens da gincana**, clicar em **Criar prova** numa postagem nova: o nome vem da primeira linha da legenda, a descrição vem da legenda inteira e a prova fica ligada à postagem. Se a postagem não for uma prova, clique em **Não é prova** para ela parar de aparecer como pendente;
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

## Robô do Instagram

Um robô no GitHub Actions (`.github/workflows/instagram.yml` + `scripts/instagram-monitor.mjs`) confere o Instagram da gincana a cada ~10 minutos. Quando aparece postagem nova, ele:

1. grava a postagem em `instagram.json`, e ela aparece na aba **Postagens da gincana** do site;
2. manda um aviso no celular (app **ntfy** e/ou **Telegram**, se configurados).

Ele usa a **API oficial do Instagram** (da Meta). Por isso não lê **stories**, só posts e reels do feed. Ele roda nos servidores do GitHub, de graça, sem precisar de computador ligado.

Enquanto os segredos abaixo não forem configurados, o robô roda e simplesmente não faz nada.

### Configuração (uma vez só)

**1. Conta da equipe no Instagram como conta profissional**

No app do Instagram da equipe: Configurações → *Tipo de conta e ferramentas* → *Mudar para conta profissional* (Criador de conteúdo ou Empresa). É grátis.

**2. Página do Facebook ligada a ela**

Crie uma Página no Facebook (pode ser simples, só com o nome da equipe) e ligue a conta do Instagram a ela: na Página, *Configurações → Contas vinculadas → Instagram*.

**3. App na Meta e token**

1. Entre em https://developers.facebook.com/ com o Facebook que administra a Página e crie um app (*Criar app* → tipo **Empresa** / "Outro"). Ele pode ficar em modo de desenvolvimento; não precisa enviar para análise.
2. Abra o **Explorador da API do Graph** (*Ferramentas → Graph API Explorer*), escolha o seu app e, em *Permissões*, adicione: `instagram_basic`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement` e `business_management`. Clique em **Generate Access Token** e autorize a Página e a conta do Instagram.
3. Esse token dura só ~1 hora. Para um que dura ~60 dias, abra o **Depurador de token de acesso** (*Ferramentas → Access Token Debugger*), cole o token e clique em **Estender token de acesso**. Use o token novo.
4. Descubra o ID da conta do Instagram da equipe: no Explorador, faça a consulta `me/accounts?fields=name,instagram_business_account` e copie o número em `instagram_business_account.id`.

**4. Segredos no GitHub**

No repositório: *Settings → Secrets and variables → Actions → New repository secret*. Crie:

| Nome | Valor |
| --- | --- |
| `IG_TOKEN` | o token de ~60 dias do passo 3 |
| `IG_USER_ID` | o ID do passo 3.4 |
| `NTFY_TOPIC` | um nome difícil de adivinhar, ex.: `gincana-ulbra-` seguido de letras e números aleatórios |

O token nunca vai para o código nem para o site; fica só nos segredos do GitHub.

**5. Avisos no celular (ntfy)**

Cada pessoa da equipe instala o app **ntfy** (Android/iPhone, grátis, sem cadastro), toca em **+** e assina o tópico com o mesmo nome colocado em `NTFY_TOPIC`. Pronto: chega uma notificação a cada postagem nova da gincana.

*Opcional, Telegram:* crie um bot com o @BotFather, adicione-o ao grupo da equipe e crie também os segredos `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID`.

**6. Testar**

Em *Actions → Monitorar Instagram da gincana → Run workflow*. Na primeira vez, o robô registra as postagens que já existem e manda um aviso "Robô da gincana ativado". Depois disso, só avisa as postagens novas.

### Se parar de funcionar

- Quando o robô falha, o GitHub manda um e-mail para o dono do repositório. O motivo aparece no log da execução em *Actions*.
- **Token expirado** (dura ~60 dias): repita os passos 3.2 e 3.3 e atualize o segredo `IG_TOKEN`.
- **"cannot be found" / business_discovery:** a API só enxerga contas profissionais. Se @gincanamartinholutero for uma conta pessoal, o robô não consegue ler as postagens dela.
- O GitHub pausa agendamentos em repositórios sem nenhuma atividade por 60 dias. Se isso acontecer, é só reativar em *Actions*.

## Como funciona por dentro

É um site estático publicado pelo GitHub Pages (branch `main`, pasta raiz):

- `index.html`: o site inteiro (HTML, CSS e JavaScript num arquivo só);
- `data.json`: os dados das provas, editados pelo modo organizador;
- `instagram.json`: as postagens da gincana, escritas só pelo robô (o modo organizador nunca mexe nele, então os dois não brigam).

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
      "hora": "21:00",
      "pessoas": ["Fulano", "Ciclana"],
      "itens": [{ "texto": "Quiz – 3 pessoas", "feito": false }],
      "enviada": false,
      "postar": true,
      "postada": false,
      "anulada": false,
      "nossoPost": "https://www.instagram.com/p/...",
      "postGincana": "https://www.instagram.com/p/...",
      "colocacao": 2,
      "pontos": 1200
    }
  ],
  "ignorados": ["id de postagem da gincana marcada como 'não é prova'"]
}
```

`hora` é o horário de entrega (opcional). `itens` são as tarefas da prova, uma lista de apoio para marcar. A prova conta como **feita** quando está enviada e postada (se precisar postar), mesmo com itens abertos. A lista mostra primeiro as provas que faltam, pelo prazo/horário mais cedo, e as feitas por último. `colocacao` (1 a 6, 0 = sem colocação) e `pontos` são a nossa pontuação na prova; ao escolher a colocação, o site sugere os pontos lendo "Prova cumprida X pontos" e a tabela "Nº Lugar" das regras, e o topo da aba mostra o total. `pontosItem` (opcional) é para prova que pontua por item, como uma lista de objetos: os pontos viram itens marcados × `pontosItem`, sem colocação. A colocação só aparece nas provas cujas regras têm a tabela "Nº Lugar". `anulada` marca uma prova cancelada pela gincana: ela vai para o fim da lista e não entra nas contagens nem na pontuação. `postar` diz se as regras da prova mandam postar no Instagram; só nesse caso o site mostra o controle **Postada no Instagram** (se faltar, o site deduz pela descrição, procurando "postar"/"publicar"). `alunos` é só a lista de sugestões; quem faz cada prova fica em `pessoas`, como texto. `descricao`, `prazo`, `nossoPost` e `postGincana` podem ficar vazios (`""`). A prova fica ligada a uma postagem da gincana quando `postGincana` tem o link dela.

### Testar localmente

O site carrega o `data.json` com `fetch`, então abrir o `index.html` direto do disco não funciona. Rode um servidor na pasta do projeto:

```bash
python3 -m http.server 8000
```

e abra http://localhost:8000/.
