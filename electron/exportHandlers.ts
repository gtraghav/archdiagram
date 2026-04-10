import { writeFile } from 'fs/promises'

interface PdfImageOptions {
  width: number
  height: number
}

/**
 * Creates a PDF containing only the diagram image (no app chrome).
 * The renderer captures the diagram as a PNG data URL, then we embed it
 * into a minimal PDF here in the main process without any extra deps.
 */
export async function exportPDFFromImage(
  dataUrl: string,
  outputPath: string,
  options: PdfImageOptions
): Promise<void> {
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '')
  const imageBytes = Buffer.from(base64, 'base64')

  // Build a minimal valid PDF with the image embedded as an XObject
  // Points = pixels * 72 / dpi. Image was rendered at screen resolution (~96dpi),
  // but we treat the pixel dimensions as points to fill an A3 page.
  const pageWidthPt = options.width
  const pageHeightPt = options.height
  const imageLen = imageBytes.length

  // PDF structure: header, image object, page objects, xref table, trailer
  const objects: string[] = []

  // Object 1: Catalog
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj')

  // Object 2: Pages
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [4 0 R] /Count 1 >>\nendobj`)

  // Object 3: Image XObject
  const imgObj = [
    '3 0 obj',
    `<< /Type /XObject /Subtype /Image`,
    `/Width ${options.width} /Height ${options.height}`,
    `/ColorSpace /DeviceRGB /BitsPerComponent 8`,
    `/Filter /DCTDecode`,
    `/Length ${imageLen}`,
    '>>',
    'stream',
  ].join('\n')

  // Object 4: Page
  objects.push(
    `4 0 obj\n<< /Type /Page /Parent 2 0 R\n/MediaBox [0 0 ${pageWidthPt} ${pageHeightPt}]\n/Contents 5 0 R\n/Resources << /XObject << /Img1 3 0 R >> >> >>\nendobj`
  )

  // Object 5: Content stream (draws the image full-page)
  const contentStream = `q ${pageWidthPt} 0 0 ${pageHeightPt} 0 0 cm /Img1 Do Q`
  objects.push(
    `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj`
  )

  // Build PDF bytes: header + objects 1,2,4,5 as text, then obj 3 with binary image
  const header = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n'

  // Collect offsets for xref
  let offset = header.length
  const offsets: number[] = []

  // We write objects in order: 1,2,3,4,5
  // obj 3 is special (binary), handle separately
  const textObjs = [objects[0], objects[1], objects[3], objects[4]] // obj 1,2,4,5
  const objOrder = [1, 2, 4, 5, 3] // order we'll write them

  const parts: Buffer[] = [Buffer.from(header, 'binary')]

  const offsetMap: Record<number, number> = {}

  // Obj 1
  offsetMap[1] = offset
  const o1 = Buffer.from(objects[0] + '\n', 'binary')
  parts.push(o1); offset += o1.length

  // Obj 2
  offsetMap[2] = offset
  const o2 = Buffer.from(objects[1] + '\n', 'binary')
  parts.push(o2); offset += o2.length

  // Obj 4
  offsetMap[4] = offset
  const o4 = Buffer.from(objects[3] + '\n', 'binary')
  parts.push(o4); offset += o4.length

  // Obj 5
  offsetMap[5] = offset
  const o5 = Buffer.from(objects[4] + '\n', 'binary')
  parts.push(o5); offset += o5.length

  // Obj 3 (binary image) — use JPEG if the PNG is large, otherwise embed raw
  // For simplicity, embed as a raw binary stream with correct length
  offsetMap[3] = offset
  const o3header = Buffer.from(imgObj + '\n', 'binary')
  const streamEnd = Buffer.from('\nendstream\nendobj\n', 'binary')
  parts.push(o3header)
  parts.push(imageBytes)
  parts.push(streamEnd)
  offset += o3header.length + imageBytes.length + streamEnd.length

  // xref table
  const xrefOffset = offset
  const xrefEntries = [
    '0000000000 65535 f \n',
    `${String(offsetMap[1]).padStart(10, '0')} 00000 n \n`,
    `${String(offsetMap[2]).padStart(10, '0')} 00000 n \n`,
    `${String(offsetMap[3]).padStart(10, '0')} 00000 n \n`,
    `${String(offsetMap[4]).padStart(10, '0')} 00000 n \n`,
    `${String(offsetMap[5]).padStart(10, '0')} 00000 n \n`,
  ]
  const xref = `xref\n0 6\n${xrefEntries.join('')}`
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
  parts.push(Buffer.from(xref + trailer, 'binary'))

  await writeFile(outputPath, Buffer.concat(parts))
}
