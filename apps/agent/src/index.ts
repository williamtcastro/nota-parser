import { MgQrcodePortalAdapter } from '@/packages/adapters/mg/qrcode/index.ts';

async function main() {
  const url = process.argv[2];
  
  if (!url) {
    console.error("Usage: bun run apps/agent/src/index.ts <qrcode_url>");
    process.exit(1);
  }

  console.log(`Analyzing MG NFC-e QRCode URL: ${url}`);

  const adapter = new MgQrcodePortalAdapter();
  
  try {
    const html = await adapter.fetch(url);
    console.log(`Fetched HTML length: ${html.length} bytes`);
    
    const result = adapter.parse(html);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error processing QRCode:", error);
    process.exit(1);
  }
}

main();
