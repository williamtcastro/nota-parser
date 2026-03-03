import { type CheerioAPI } from 'cheerio';
import { type Issuer, type Item, type Totals, type Payment, type Metadata } from '@/packages/core/types.ts';
import { cleanText, parseCurrency, parseQuantity } from '@/packages/core/normalize.ts';

export function extractIssuer($: CheerioAPI): Issuer {
  const issuer: Issuer = {};
  
  // The first table in the document is the header table
  const headerTable = $('table').first();
  
  // Issuer name is always the first uppercase bolded tag in the thead
  const nameElement = headerTable.find('thead th.text-uppercase b').first();
  if (nameElement.length) {
    issuer.name = cleanText(nameElement.text());
  }

  // The first body row contains the CNPJ and IE. Extract via regex over its text to avoid label dependency
  const infoTd = headerTable.find('tbody tr').first().find('td');
  if (infoTd.length) {
    const text = infoTd.text();
    // Use pure numeric patterns rather than looking for "CNPJ:" prefix if possible
    const cnpjMatch = text.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14}/);
    if (cnpjMatch) issuer.cnpj = cleanText(cnpjMatch[0])?.replace(/[^\d]/g, '');

    // The IE is usually the last numeric sequence after a hyphen or just hanging at the end
    const ieMatch = text.match(/[\d]{9,15}$/);
    if (ieMatch) {
       issuer.ie = cleanText(ieMatch[0])?.replace(/[^\d]/g, '');
    } else {
       // Fallback to text match if structural regex fails
       const textIeMatch = text.match(/Estadual:\s*([\d\.\-\/]+)/);
       if (textIeMatch) issuer.ie = cleanText(textIeMatch[1])?.replace(/[^\d]/g, '');
    }
    
    // Address is the second body row
    const addressTr = headerTable.find('tbody tr').eq(1);
    if (addressTr.length) {
       issuer.address = cleanText(addressTr.text());
    }
  }

  return issuer;
}

export function extractItems($: CheerioAPI): Item[] {
  const items: Item[] = [];
  
  // Table with ID myTable contains all items
  $('#myTable tr').each((_, tr) => {
    const item: Item = {};
    const tds = $(tr).find('td');
    
    // We expect exactly 4 columns per item row
    if (tds.length < 4) return;

    // 1st Column: Description (inside h7) and Code (in parenthesis)
    const descTd = $(tds[0]);
    const descText = descTd.find('h7').text();
    if (descText) item.description = cleanText(descText);

    // Extract code by finding the last numeric block in parentheses
    const codeMatch = descTd.text().match(/\(\D*(\d+)\D*\)$/);
    if (codeMatch) item.code = codeMatch[1];

    // 2nd Column: Qty (Extract first floating number)
    const qtyText = $(tds[1]).text();
    const qtyMatch = qtyText.match(/[\d\.,]+/);
    if (qtyMatch) item.qty = parseQuantity(qtyMatch[0]);

    // 3rd Column: Unit (Extract first string of letters after a colon or at the end)
    const unitText = $(tds[2]).text();
    const unitMatch = unitText.match(/:\s*([A-Za-z]+)/i) || unitText.match(/([A-Za-z]+)$/i);
    if (unitMatch) item.unit = unitMatch[1];

    // 4th Column: Total (Extract last floating number)
    const totalText = $(tds[3]).text();
    const totalMatch = totalText.match(/[\d\.,]+$/);
    if (totalMatch) item.total = parseCurrency(totalMatch[0]);

    if (item.code || item.description) {
      items.push(item);
    }
  });

  return items;
}

export function extractTotals($: CheerioAPI): Totals {
  const totals: Totals = {};
  
  // After the items table, there are two structurally identical `.row` divs
  // The first .row is Item Count
  // The second .row is Grand Total
  const totalsRows = $('#myTable').closest('table').nextAll('.row');
  
  const qtyRow = totalsRows.eq(0);
  if (qtyRow.length) {
    const valText = qtyRow.find('.col-lg-2 strong').text();
    totals.itemCount = parseQuantity(valText);
  }

  const totalRow = totalsRows.eq(1);
  if (totalRow.length) {
    const valText = totalRow.find('.col-lg-2 strong').text();
    totals.grandTotal = parseCurrency(valText);
  }

  return totals;
}

export function extractPayments($: CheerioAPI): Payment[] {
  const payments: Payment[] = [];
  
  // The table is structurally malformed so we find the specific "Forma de Pagamento" labels 
  // and traverse up to their parent .row divs to extract the paired data.
  // The DOM structure alternates .row for Amount, then .row for Method.
  const paymentLabels = $('strong').filter((_, el) => $(el).text().includes('Forma de Pagamento'));
  if (!paymentLabels.length) return payments;

  paymentLabels.each((_, el) => {
    // el is the <strong> element. Its parent structure is:
    // <div class="row"> ... <strong>Forma de Pagamento</strong> ... </div>
    const methodRow = $(el).closest('.row');
    
    // The amount row is the .row immediately preceding the method row
    const amountRow = methodRow.prev('.row');

    if (amountRow.length && methodRow.length) {
      const amountText = cleanText(amountRow.find('.col-lg-2').text());
      const methodText = cleanText(methodRow.find('.col-lg-4').text());
      
      if (methodText) {
        const parts = methodText.split('-');
        payments.push({
          methodCode: parts[0]?.trim(),
          methodLabel: parts[1]?.trim() || methodText,
          amount: parseCurrency(amountText)
        });
      }
    }
  });
  
  return payments;
}

export function extractMetadata($: CheerioAPI): Metadata {
  const meta: Metadata = {};

  // Chave de acesso (always first table inside collapseTwo)
  const chaveTd = $('#collapseTwo table tbody tr td').first();
  if (chaveTd.length) {
     meta.accessKey = cleanText(chaveTd.text())?.replace(/[^\d]/g, '');
  }

  // Information tables are inside collapse4.
  const collapse4Tables = $('#collapse4 table');
  
  // Find the table that actually has 4 columns for Model, Series, Number, Date
  const tablesWith4Cols = collapse4Tables.filter((_, el) => $(el).find('thead th').length === 4);
  // There are two tables with 4 cols in collapse4. 
  // [0] = Emitente (Nome, CNPJ, IE, UF)
  // [1] = Model (Modelo, Serie, Numero, Data)
  const metaTable = tablesWith4Cols.eq(1);
  if (metaTable.length) {
     const tds = metaTable.find('tbody tr td');
     meta.model = cleanText($(tds[0]).text());
     meta.series = cleanText($(tds[1]).text());
     meta.number = cleanText($(tds[2]).text());
     meta.issuedAt = cleanText($(tds[3]).text());
  }

  // The fifth table in collapse4 has exactly 1 column: Protocol
  const protTable = collapse4Tables.filter((_, el) => $(el).find('thead th').length === 1).last();
  if (protTable.length) {
     meta.protocol = cleanText(protTable.find('tbody tr td').first().text());
  }

  // Version is the last label on the page before the closing HTML tags
  const versionContainer = $('.pull-right').last();
  if (versionContainer.length) {
     // Remove inner label text and keep outer text
     const versionText = cleanText(versionContainer.contents().filter(function() {
        return this.nodeType === 3; // Node.TEXT_NODE
     }).text());
     meta.portalVersion = versionText;
  }

  return meta;
}
