import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dateStr = searchParams.get('date')

  if (!dateStr) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 })
  }

  try {
    const date = new Date(`${dateStr}T00:00:00.000Z`)
    const log = await prisma.dailyLog.findUnique({
      where: { date },
    })
    return NextResponse.json(log)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch log' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date: dateStr, abstinence, sleep, reflection } = body

    if (!dateStr || abstinence === undefined || sleep === undefined || !reflection) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const date = new Date(`${dateStr}T00:00:00.000Z`)

    const log = await prisma.dailyLog.upsert({
      where: { date },
      update: {
        abstinence: Number(abstinence),
        sleep: Number(sleep),
        reflection: String(reflection),
      },
      create: {
        date,
        abstinence: Number(abstinence),
        sleep: Number(sleep),
        reflection: String(reflection),
      },
    })

    return NextResponse.json({ status: 'success', data: log })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save log', details: String(error) }, { status: 500 })
  }
}
