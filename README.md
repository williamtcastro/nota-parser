[English](README.md) | [Português](README.pt-BR.md)

# NFC-e QRCode Portal Scraper

> ✨ **Note:** This project was heavily "vibe-coded" (developed using AI/LLM assistants) to explore rapid prototyping and robust heuristics generation.

An open-source, highly-resilient HTML scraping agent for extracting structural NFC-e (Nota Fiscal de Consumidor Eletrônica) data directly from state portal receipts via QRCode URLs.

This project is built from the ground up using **Bun**, **Elysia** (for lightweight web routing), **Zod** (for bulletproof JSON schema validation), and **Cheerio** (for structural DOM parsing).

---

## 🎯 The Vision & Intention

In Brazil, every state (UF) has its own slightly different portal for rendering NFC-e receipts from QRCodes. Unfortunately, these portals rarely provide official, open JSON APIs for consumers to download their own receipt data programmatically. 

The goal of this project is to build a **unified, open-source, multi-state API** that allows developers to pass *any* state's NFC-e QRCode URL and receive a standardized, cleanly formatted JSON object back.

By relying on **HTML structural heuristics** (e.g., DOM placement, column counts, table indexes) rather than fragile literal text matching (which breaks whenever a state decides to change the label "Total a Pagar" to "Total"), this tool aims to be as resilient as possible against unannounced visual updates from SEFAZ portals.

---

## 🤝 We Need Your Contributions! (Add Your State)

Currently, this repository features a highly refined, tested adapter for the state of **Minas Gerais (MG)**. 

However, the architecture is **explicitly modular** and designed to accept adapters for every state in Brazil. **We highly encourage open-source contributions!** 

If you live in SP, RJ, RS, PR, or any other state, you can help the community by building an adapter for your local SEFAZ portal:
1. Clone the repository.
2. Create a new folder for your state under `packages/adapters/YOUR_STATE/qrcode/`.
3. Implement the standard `PortalAdapter` interface.
4. Submit a Pull Request!

Check out our [Development Guidelines](docs/development.md) and [Architecture Overview](docs/architecture.md) to get started on your state's parser in under 10 minutes.

---

## 🚀 Features

- **Structural DOM Parsing**: Uses positional DOM heuristics instead of fragile text matching to extract data safely.
- **Strict Validation**: Utilizes Zod to ensure the extracted schema is 100% compliant before being returned.
- **Fast Web API**: Built with Elysia for a lightweight and extremely fast web server.
- **Standalone Agent**: Can be run as a CLI tool or compiled as a standalone binary for portability.

---

## 🛠 Prerequisites

Make sure you have [Bun](https://bun.sh/) installed.

```bash
curl -fsSL https://bun.sh/install | bash
```

---

## 📦 Installation

Clone the repository and install the dependencies:

```bash
bun install
```

---

## 🚦 Running the Application

### 1. Web API

You can start the Elysia Web API in development mode (with hot-reload) or in production mode.

**Development Mode:**
```bash
bun run dev
```

**Production Mode:**
```bash
bun start
```

**Build Standalone Executable:**
```bash
bun run build
./build/api
```

### 2. Standalone CLI Agent

To run the parser purely from the CLI against a URL without spinning up the HTTP server:

```bash
bun run agent "https://portalsped.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=YOUR_QRCODE_PARAMS"
```

---

## 📡 API Endpoints

### `GET /`
Health check endpoint to ensure the API is running.

### `GET /swagger`
Interactive OpenAPI 3.0 documentation page.

### `POST /api/v1/parse`
Parses an NFC-e QRCode portal page and returns structured JSON data.

**Request Body:**
```json
{
  "url": "https://portalsped.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=..."
}
```

**Success Response (200 OK):**
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

## 🧪 Testing

This project uses Bun's built-in test runner. Tests are written for schemas, normalization utilities, and raw HTML structural extractors using anonymized DOM fixtures.

```bash
bun test
```

---

## 📚 Documentation

For more detailed information on how to extend the agent or understand its internals, refer to the documentation:

- [Architecture Overview](docs/architecture.md)
- [Development Guidelines](docs/development.md)
