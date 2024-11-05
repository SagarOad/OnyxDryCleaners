import { NextResponse } from 'next/server';

export async function GET() {
  const res = {
    products: [
      { id: 1, title: "iPhone 9", description: "An apple mobile phone" },
      { id: 2, title: "Samsung 9", description: "A Samsung mobile phone" }
    ]
  };
  return NextResponse.json(res);
}
