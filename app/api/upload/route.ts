import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Get credentials from env
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Cloudinary credentials missing');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // 1. Prepare parameters for signature
    const timestamp = Math.round((new Date()).getTime() / 1000).toString();

    // 2. Generate Signature
    // String to sign: params sorted alphabetically + api_secret
    // We only use timestamp here for simplicity
    const stringToSign = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    // 3. Prepare FormData for Cloudinary
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('api_key', apiKey);
    uploadData.append('timestamp', timestamp);
    uploadData.append('signature', signature);

    // 4. Send to Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: uploadData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary API Error:', response.status, errorText);
      return NextResponse.json({ error: `Upload failed: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
