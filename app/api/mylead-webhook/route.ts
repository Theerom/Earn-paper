import { NextResponse } from 'next/server'
import { updateEarnings, logOfferCompletion } from '@/lib/sheets'

// Verify MyLead webhook signature
function verifyMyLeadSignature(signature: string, payload: string, secret: string) {
  const hmac = crypto.createHmac('sha256', secret)
  const expectedSignature = hmac.update(payload).digest('hex')
  return signature === expectedSignature
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const signature = req.headers.get('x-mylead-signature')
    
    // Verify webhook authenticity
    if (!verifyMyLeadSignature(
      signature!, 
      JSON.stringify(body), 
      process.env.MYLEAD_WEBHOOK_SECRET!
    )) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { 
      user_id,
      offer_id,
      offer_name,
      payout,
      transaction_id 
    } = body

    // Log the offer completion
    await logOfferCompletion({
      userId: user_id,
      offerId: offer_id,
      offerName: offer_name,
      payout: 10, // Fixed $10 per offer
      transactionId: transaction_id,
      completedAt: new Date().toISOString()
    })

    // Update user earnings
    await updateEarnings(user_id, 10)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Offer webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 