import { NextRequest, NextResponse } from 'next/server';

async function handle(
  req: NextRequest,
) {
  let res = { status: -1, info: '失败' }
  try {
    res = await (await fetch(`http://mpapi.kekuming.xin/mpsdk/createQrcode${ req.nextUrl.search }`, {
      headers: {},
      body: null,
      method: 'POST'
    })).json();
  } catch (e) {
    console.log('获取qrcode失败');
  }
  return NextResponse.json(res);
}

export const GET = handle;
export const POST = handle;

