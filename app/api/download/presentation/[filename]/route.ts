import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = decodeURIComponent(params.filename)
    const filePath = join(process.cwd(), 'public', 'presentations', filename)
    
    // Read the file
    const fileBuffer = await readFile(filePath)
    
    // Set proper headers for PowerPoint files
    const headers = new Headers()
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation')
    headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    headers.set('Content-Length', fileBuffer.length.toString())
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Error downloading file:', error)
    return new NextResponse('File not found', { status: 404 })
  }
}