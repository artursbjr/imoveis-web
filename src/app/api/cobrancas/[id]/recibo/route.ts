import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

const tipoLabel: Record<string, string> = {
  LUZ: "Luz",
  AGUA: "Água",
  GAS: "Gás",
  CONDOMINIO: "Condomínio",
  INTERNET: "Internet",
  SEGURO: "Seguro",
  IPTU: "IPTU",
  OUTRO: "Outro",
};

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function formatMonth(d: Date) {
  return new Date(d).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
}

export async function GET(_req: NextRequest, { params }: Params) {
  const cobranca = await prisma.cobranca.findUnique({
    where: { id: params.id },
    include: {
      contrato: { include: { imovel: true, inquilino: true } },
      contasConsumo: { orderBy: { tipo: "asc" } },
    },
  });

  if (!cobranca) {
    return NextResponse.json({ error: "Cobrança não encontrada" }, { status: 404 });
  }

  const { contrato, contasConsumo } = cobranca;
  const { imovel, inquilino } = contrato;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const marginX = 50;
  let y = 780;

  const ink = rgb(0.1, 0.12, 0.09);
  const gray = rgb(0.35, 0.35, 0.33);
  const line = rgb(0.85, 0.84, 0.8);

  function draw(text: string, opts: { size?: number; bold?: boolean; color?: any; x?: number } = {}) {
    page.drawText(text, {
      x: opts.x ?? marginX,
      y,
      size: opts.size ?? 11,
      font: opts.bold ? fontBold : font,
      color: opts.color ?? ink,
    });
  }

  function gap(n = 18) {
    y -= n;
  }

  function hr() {
    page.drawLine({
      start: { x: marginX, y },
      end: { x: 545, y },
      thickness: 1,
      color: line,
    });
    gap(20);
  }

  function linha(label: string, valor: string, bold = false) {
    draw(label, { size: 11, bold });
    draw(valor, { size: 11, bold, x: 420 });
    gap(20);
  }

  draw("RECIBO DE ALUGUEL", { size: 20, bold: true });
  gap(28);
  draw(`Referência: ${formatMonth(cobranca.referenciaMes)}`, { size: 11, color: gray });
  gap(24);
  hr();

  draw("LOCADOR (PROPRIETÁRIO)", { size: 9, bold: true, color: gray });
  gap(16);
  draw("Proprietário do imóvel", { size: 12 });
  gap(26);

  draw("LOCATÁRIO", { size: 9, bold: true, color: gray });
  gap(16);
  draw(inquilino.nome, { size: 12 });
  gap(16);
  draw(`CPF/CNPJ: ${inquilino.cpfCnpj}`, { size: 10, color: gray });
  gap(24);
  hr();

  draw("IMÓVEL LOCADO", { size: 9, bold: true, color: gray });
  gap(16);
  const endereco = `${imovel.endereco}${imovel.numero ? ", " + imovel.numero : ""}${imovel.complemento ? " - " + imovel.complemento : ""}`;
  draw(endereco, { size: 12 });
  gap(16);
  draw(`${imovel.bairro ? imovel.bairro + " - " : ""}${imovel.cidade}/${imovel.estado}${imovel.cep ? " - CEP " + imovel.cep : ""}`, {
    size: 10,
    color: gray,
  });
  gap(24);
  hr();

  draw("DETALHAMENTO DOS VALORES", { size: 9, bold: true, color: gray });
  gap(20);

  linha("Aluguel", formatBRL(cobranca.valorAluguel));
  if (cobranca.valorCondominio) linha("Condomínio", formatBRL(cobranca.valorCondominio));

  if (contasConsumo.length > 0) {
    for (const conta of contasConsumo) {
      linha(`Conta de ${tipoLabel[conta.tipo] || conta.tipo}`, formatBRL(conta.valor));
    }
  }

  if (cobranca.valorEncargos) linha("Encargos / multa / juros", formatBRL(cobranca.valorEncargos));
  if (cobranca.valorDesconto) linha("Desconto", `- ${formatBRL(cobranca.valorDesconto)}`);

  gap(4);
  hr();

  linha("VALOR TOTAL", formatBRL(cobranca.valorTotal), true);
  gap(6);
  hr();

  draw("PAGAMENTO", { size: 9, bold: true, color: gray });
  gap(16);
  linha("Vencimento", formatDate(cobranca.dataVencimento));
  linha("Status", cobranca.status === "PAGO" ? "PAGO" : cobranca.status === "ATRASADO" ? "ATRASADO" : "PENDENTE");
  if (cobranca.dataPagamento) linha("Data do pagamento", formatDate(cobranca.dataPagamento));
  if (cobranca.formaPagamento) linha("Forma de pagamento", cobranca.formaPagamento);

  if (cobranca.observacoes) {
    gap(4);
    hr();
    draw("OBSERVAÇÕES", { size: 9, bold: true, color: gray });
    gap(16);
    draw(cobranca.observacoes, { size: 10, color: gray });
    gap(24);
  }

  gap(40);
  page.drawLine({ start: { x: marginX, y }, end: { x: 300, y }, thickness: 1, color: ink });
  gap(14);
  draw("Assinatura do locador/administrador", { size: 9, color: gray });

  gap(30);
  draw(`Documento gerado em ${new Date().toLocaleDateString("pt-BR")}`, { size: 8, color: gray });

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="recibo-${formatMonth(cobranca.referenciaMes).replace(" ", "-")}-${inquilino.nome.replace(/\s+/g, "-")}.pdf"`,
    },
  });
}
