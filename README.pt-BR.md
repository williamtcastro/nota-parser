[English](README.md) | [Português](README.pt-BR.md)

# NFC-e QRCode Portal Scraper

> ✨ **Nota:** Este projeto foi fortemente "vibe-coded" (desenvolvido utilizando assistentes de IA/LLM) para explorar a prototipagem rápida e a geração de heurísticas robustas.

Um agente de extração (scraper) HTML de código aberto e altamente resiliente para extrair dados estruturados de NFC-e (Nota Fiscal de Consumidor Eletrônica) diretamente dos portais estaduais através de URLs de QRCode.

Este projeto foi construído do zero utilizando **Bun**, **Elysia** (para roteamento web super rápido), **Zod** (para validação à prova de balas de schemas JSON) e **Cheerio** (para extração estrutural do DOM).

---

## 🎯 Visão e Propósito

No Brasil, cada estado (UF) possui seu próprio portal levemente diferente para renderizar recibos NFC-e a partir de QRCodes. Infelizmente, esses portais raramente oferecem APIs JSON oficiais e abertas para que os consumidores possam baixar os dados dos seus próprios recibos de forma programática.

O objetivo deste projeto é construir uma **API unificada, de código aberto e multi-estado** que permita aos desenvolvedores passarem *qualquer* URL de QRCode NFC-e de qualquer estado e receberem de volta um objeto JSON padronizado e formatado de maneira limpa.

Ao depender de **heurísticas estruturais do HTML** (por exemplo, localização no DOM, contagem de colunas, índices de tabelas) ao invés de correspondências literais de texto (que quebram toda vez que um estado decide mudar o texto "Total a Pagar" para "Total"), esta ferramenta visa ser o mais resiliente possível contra atualizações visuais não anunciadas nos portais da SEFAZ.

---

## 🤝 Precisamos das Suas Contribuições! (Adicione o Seu Estado)

Atualmente, este repositório possui um adaptador altamente refinado e testado para o estado de **Minas Gerais (MG)**.

No entanto, a arquitetura é **explicitamente modular** e projetada para aceitar adaptadores para todos os estados do Brasil. **Encorajamos fortemente as contribuições open-source!**

Se você mora em SP, RJ, RS, PR ou qualquer outro estado, você pode ajudar a comunidade construindo um adaptador para o portal SEFAZ local:
1. Faça o clone do repositório.
2. Crie uma nova pasta para o seu estado em `packages/adapters/SEU_ESTADO/qrcode/`.
3. Implemente a interface padrão `PortalAdapter`.
4. Envie um Pull Request!

Confira nossas [Diretrizes de Desenvolvimento](docs/development.md) e a [Visão Geral da Arquitetura](docs/architecture.md) para começar o parser do seu estado em menos de 10 minutos.

---

## 🚀 Funcionalidades

- **Extração Estrutural de DOM**: Utiliza heurísticas posicionais de DOM em vez de correspondências frágeis de texto para extrair dados com segurança.
- **Validação Estrita**: Utiliza Zod para garantir que o esquema extraído seja 100% aderente antes de ser retornado.
- **Web API Rápida**: Construída com Elysia para um servidor web extremamente rápido e leve.
- **Agente Standalone**: Pode ser executado como uma ferramenta CLI (linha de comando) ou compilado como um binário independente para portabilidade.

---

## 🛠 Pré-requisitos

Certifique-se de ter o [Bun](https://bun.sh/) instalado.

```bash
curl -fsSL https://bun.sh/install | bash
```

---

## 📦 Instalação

Clone o repositório e instale as dependências:

```bash
bun install
```

---

## 🚦 Executando a Aplicação

### 1. Web API

Você pode iniciar a Web API do Elysia no modo de desenvolvimento (com hot-reload) ou em produção.

**Modo de Desenvolvimento:**
```bash
bun run dev
```

**Modo de Produção:**
```bash
bun start
```

**Construir Executável Standalone:**
```bash
bun run build
./build/api
```

### 3. Docker

Você pode executar a aplicação facilmente usando Docker e Docker Compose. Isso construirá uma imagem mínima contendo o binário compilado pelo Bun.

```bash
docker-compose up -d --build
```

A API estará disponível em `http://localhost:3000`.

---

## 📡 Endpoints da API

### `GET /`
Endpoint de health check para garantir que a API está rodando.

### `GET /swagger`
Página interativa de documentação OpenAPI 3.0.

### `POST /api/v1/parse`
Faz o parser de uma página do portal NFC-e QRCode e retorna dados em JSON estruturado.

**Body da Requisição:**
```json
{
  "url": "https://portalsped.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=..."
}
```

### `POST /api/v1/parse/batch`
Faz o parser de até 50 URLs do portal NFC-e QRCode de forma simultânea (concorrente). Retorna uma mistura de resultados processados com sucesso e objetos de erro individuais, de modo que a falha de uma URL não quebre o lote inteiro.

**Body da Requisição:**
```json
{
  "urls": [
    "https://portalsped.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=...",
    "https://portalsped.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=..."
  ]
}
```

**Resposta de Sucesso (200 OK):**
```json
{
  "source": "mg_portal_qrcode_html",
  "uf": "MG",
  "issuer": {
    "name": "MERCADINHO DO BAIRRO LTDA",
    "cnpj": "12345678000190",
    "ie": "123456789"
  },
  "items": [
    {
      "description": "LAVA ROUPA PO",
      "code": "210783",
      "qty": 1,
      "unit": "UN",
      "total": 75.9
    }
  ],
  "totals": {
    "itemCount": 1,
    "grandTotal": 75.90
  },
  "payments": [
    {
      "methodCode": "01",
      "methodLabel": "Dinheiro",
      "amount": 75.90
    }
  ],
  "meta": {
    "accessKey": "31250704737552004206651100001102961023432483"
  }
}
```

---

## 🧪 Testes

Este projeto utiliza o test runner embutido no Bun. Existem testes para os schemas, utilitários de normalização e também de extração estrutural usando fixtures de DOM em HTML anonimizados.

```bash
bun test
```

---

## 📚 Documentação

Para informações mais detalhadas sobre como expandir o agente ou entender o seu funcionamento interno, confira a documentação:

- [Visão Geral da Arquitetura](docs/architecture.md)
- [Diretrizes de Desenvolvimento](docs/development.md)