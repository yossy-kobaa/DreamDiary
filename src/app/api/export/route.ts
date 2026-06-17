import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const logs = await prisma.dailyLog.findMany({
      orderBy: {
        date: 'asc',
      },
    })

    if (logs.length === 0) {
      return new NextResponse('No data available', { status: 404 })
    }

    const headers = ['date', 'abstinence', 'sleep', 'reflection']
    const csvRows = logs.map(log => {
      // Format date to YYYY-MM-DD
      const dateStr = log.date.toISOString().split('T')[0]
      const row = [
        dateStr,
        log.abstinence.toString(),
        log.sleep.toString(),
        `"${log.reflection.replace(/"/g, '""')}"` // Escape quotes and wrap in quotes for CSV
      ]
      return row.join(',')
    })

    const csvData = [headers.join(','), ...csvRows].join('\n')

    return new NextResponse('\uFEFF' + csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="diary_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    return new NextResponse('Failed to generate CSV', { status: 500 })
  }
}
