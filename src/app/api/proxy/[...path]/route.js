import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://easycom-qfbwg.sevalla.app'

export async function GET(request, { params }) {
  try {
    const path = params.path.join('/')
    const url = `${BACKEND_URL}/${path}`

    console.log('Proxy request:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EasyCom-Proxy/1.0)'
      }
    })

    if (!response.ok) {
      console.error('Proxy error:', response.status, response.statusText)

      return new NextResponse('Image not found', { status: 404 })
    }

    const contentType = response.headers.get('content-type')
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('Proxy error:', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
