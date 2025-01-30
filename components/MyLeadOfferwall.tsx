"use client"

import { useUser } from '@/hooks/useUser'

export function MyLeadOfferwall() {
  const { user, loading } = useUser()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please login to access offers</div>

  // Construct the offer wall URL with player_id and status
  const status = "completed"; // Replace with actual logic to determine status
  const offerWallUrl = `https://reward-me.eu/5eed231c-d4cc-11ef-b697-8a5fb7be40ea?player_id=${user.id}&status=${status}`;

  return (
    <div className="w-full h-[800px]">
      <iframe 
        src={offerWallUrl} // Use the constructed URL
        className="w-full h-full border-0"
        allow="payment"
      />
    </div>
  )
} 