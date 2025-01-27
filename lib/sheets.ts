const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ''

export interface SheetUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  referralCode: string;
  referredBy?: string;
  credits: number;
  createdAt: string;
}

export async function getUser(email: string, password: string) {
  try {
    const res = await fetch(
      `${BASE_URL}/api/sheets?action=getUser&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    )
    const data = await res.json()
    return data.user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function addUser(userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  referralCode?: string;
}) {
  try {
    const res = await fetch(`${BASE_URL}/api/sheets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addUser', ...userData })
    })
    const data = await res.json()
    return data.referralCode
  } catch (error) {
    console.error('Error adding user:', error)
    throw error
  }
}

export async function updateEarnings(userId: string, amount: number) {
  try {
    const res = await fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateEarnings', userId, amount })
    })
    const data = await res.json()
    return data.newEarnings
  } catch (error) {
    console.error('Error updating earnings:', error)
    throw error
  }
}

export async function logOfferCompletion(offer: {
  userId: string;
  offerId: string;
  offerName: string;
  payout: number;
  transactionId: string;
  completedAt: string;
}) {
  try {
    const res = await fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logOffer', ...offer })
    })
    return res.ok
  } catch (error) {
    console.error('Error logging offer:', error)
    throw error
  }
}

// Helper functions (to be implemented)
async function validateReferralCode(code: string) {
  // Implementation for validating referral code
  return true
}

function generateUniqueReferralCode() {
  // Implementation for generating unique referral code
  return Math.random().toString(36).substring(2, 8).toUpperCase()
} 