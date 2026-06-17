import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dateStr = searchParams.get('date')

  if (!dateStr) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 })
  }

  try {
    const targetDate = new Date(`${dateStr}T00:00:00.000Z`)
    
    // Calculate week ago date
    const weekAgoDate = new Date(targetDate)
    weekAgoDate.setDate(weekAgoDate.getDate() - 7)

    // Calculate previous date
    const prevDate = new Date(targetDate)
    prevDate.setDate(prevDate.getDate() - 1)

    // Fetch records older than target date (for abstinence calculation)
    // Order by date descending to get the latest easily
    const latestRecord = await prisma.dailyLog.findFirst({
      where: {
        date: {
          lt: targetDate,
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    let abstinenceDefault = null
    if (latestRecord) {
      abstinenceDefault = latestRecord.abstinence + 1
    }

    // Fetch records between weekAgoDate and targetDate (excluding targetDate) for sleep avg
    const sleepRecords = await prisma.dailyLog.findMany({
      where: {
        date: {
          gte: weekAgoDate,
          lt: targetDate,
        },
      },
      select: {
        sleep: true,
      },
    })

    let sleepAvg = null
    if (sleepRecords.length > 0) {
      const sum = sleepRecords.reduce((acc: number, curr: any) => acc + curr.sleep, 0)
      sleepAvg = Math.round((sum / sleepRecords.length) * 10) / 10
    }

    return NextResponse.json({
      abstinence: abstinenceDefault,
      sleepAvg: sleepAvg,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recent data' }, { status: 500 })
  }
}
