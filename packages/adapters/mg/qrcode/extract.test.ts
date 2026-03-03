import { expect, test, describe } from "bun:test";
import * as cheerio from "cheerio";
import { extractIssuer, extractItems } from "./extract";

describe("extract", () => {
  describe("extractIssuer", () => {
    test("should extract issuer correctly if CNPJ label is present", () => {
      const html = `
        <table class="table text-center">
          <thead style="background-color: white;">
            <tr>
              <th class="text-center text-uppercase"><H4>
                  <b>MERCADINHO DO BAIRRO LTDA</b>
                </H4></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border-top: 0px;">CNPJ: 12345678000190 -, Inscrição Estadual: 123456789</td>
            </tr>
            <tr>
              <td style="border-top: 0px; display: block; font-style: italic;">RUA A, 123, BAIRRO</td>
            </tr>
          </tbody>
        </table>
      `;
      const $ = cheerio.load(html);
      
      const issuer = extractIssuer($);
      
      expect(issuer.name).toBe("MERCADINHO DO BAIRRO LTDA");
      expect(issuer.cnpj).toBe("12345678000190");
      expect(issuer.ie).toBe("123456789");
      expect(issuer.address).toBe("RUA A, 123, BAIRRO");
    });
    
    test("should return empty if CNPJ label not found", () => {
      const html = `
        <div id="conteudo">
          <div class="txtTopo">
            <strong>MERCADINHO DO BAIRRO LTDA</strong>
          </div>
        </div>
      `;
      const $ = cheerio.load(html);
      
      const issuer = extractIssuer($);
      
      expect(issuer).toEqual({});
    });
  });

  describe("extractItems", () => {
    test("should extract items based on 'Código:' marker", () => {
      const html = `
        <table class="table table-striped">
          <tbody id="myTable">
            <tr>
              <td><h7>MACA</h7>(Código: 1234)</td>
              <td>Qtde total de ítens: 2.0000</td>
              <td>UN: KG</td>
              <td>Valor total R$: R$ 10,50</td>
            </tr>
            <tr>
              <td><h7>BANANA</h7>(Código: 5678)</td>
              <td>Qtde total de ítens: 1.0000</td>
              <td>UN: KG</td>
              <td>Valor total R$: R$ 5,00</td>
            </tr>
          </tbody>
        </table>
      `;
      const $ = cheerio.load(html);
      
      const items = extractItems($);
      
      expect(items.length).toBe(2);
      expect(items[0]?.code).toBe("1234");
      expect(items[0]?.description).toBe("MACA");
      expect(items[0]?.qty).toBe(2.0);
      expect(items[0]?.unit).toBe("KG");
      expect(items[0]?.total).toBe(10.5);

      expect(items[1]?.code).toBe("5678");
      expect(items[1]?.description).toBe("BANANA");
      expect(items[1]?.qty).toBe(1.0);
      expect(items[1]?.unit).toBe("KG");
      expect(items[1]?.total).toBe(5.0);
    });
  });
});
