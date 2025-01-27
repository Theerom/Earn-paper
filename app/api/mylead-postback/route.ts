import { NextResponse } from 'next/server'
import { updateEarnings, logOfferCompletion } from '@/lib/sheets'

export async function GET(req: Request) {
  try {
    // Get parameters from URL
    const url = new URL(req.url)
    const userId = url.searchParams.get('user_id')
    const transactionId = url.searchParams.get('transaction_id')
    const offerId = url.searchParams.get('offer_id')
    const offerName = url.searchParams.get('offer_name')

    if (!userId || !transactionId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Log the offer completion
    await logOfferCompletion({
      userId,
      offerId: offerId || 'unknown',
      offerName: offerName || 'unknown',
      payout: 10, // Fixed $10 per offer
      transactionId,
      completedAt: new Date().toISOString()
    })

    // Update user earnings
    await updateEarnings(userId, 10)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Offer postback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 