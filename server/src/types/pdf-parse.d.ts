// pdf-parse's package entry runs debug code when loaded under ESM, so the
// lib subpath is imported directly. The package ships no types for it.
declare module 'pdf-parse/lib/pdf-parse.js' {
  interface PdfParseResult {
    text: string;
    numpages: number;
    info: unknown;
  }
  function pdfParse(buffer: Buffer): Promise<PdfParseResult>;
  export = pdfParse;
}
