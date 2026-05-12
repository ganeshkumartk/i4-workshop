import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { headers } from 'next/headers';

export async function GET(req: Request) {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  
  const url = process.env.PUBLIC_URL || `${protocol}://${host}`;
  
  try {
    const buffer = await QRCode.toBuffer(url, { 
      width: 400, 
      margin: 2, 
      color: { dark: '#0B0B0B', light: '#FFFFFF' } 
    });
    
    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error) {
    return new NextResponse('Error generating QR code', { status: 500 });
  }
}
