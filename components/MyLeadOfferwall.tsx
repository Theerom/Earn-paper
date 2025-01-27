"use client"

import { useUser } from '@/hooks/useUser'

export function MyLeadOfferwall() {
  const { user } = useUser()
  
  return (
    <div className="w-full h-[800px]">
      <iframe 
        src="https://reward-me.eu/5eed231c-d4cc-11ef-b697-8a5fb7be40ea"
        className="w-full h-full border-0"
        allow="payment"
      />
    </div>
  )
} 