import { NextResponse } from 'next/server'
import { updateEarnings, logOfferCompletion } from '@/lib/sheets'

export async function GET(req: Request) {
  try {
    // Get parameters from URL
    const url = new URL(req.url)
    const playerId = url.searchParams.get('player_id')
    const status = url.searchParams.get('status')

    if (!playerId || !status) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Log the offer completion with the necessary parameters
    await logOfferCompletion({
      userId: playerId,
      offerId: 'unknown',
      offerName: 'unknown',
      payout: 10,
      transactionId: 'unknown',
      completedAt: new Date().toISOString(),
      status,
    })

    // Update user earnings based on the playerId
    const payout = status === "completed" ? 10 : 0; // Example logic for payout based on status
    await updateEarnings(playerId, payout)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Offer postback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 