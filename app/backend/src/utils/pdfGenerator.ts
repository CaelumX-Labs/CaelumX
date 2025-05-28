import PDFDocument from 'pdfkit';

export function generateCertificate(retirement: any): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    doc.text(`Retirement Certificate`);
    doc.text(`NFT ID: ${retirement.nftId}`);
    doc.text(`TX: ${retirement.txSignature}`);
    doc.text(`Retired At: ${retirement.retiredAt}`);
    doc.end();
  });
}