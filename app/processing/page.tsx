"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ProcessingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProcessingContent />
    </Suspense>
  )
}

function ProcessingContent() {
  const searchParams = useSearchParams()
  const amount = searchParams.get('amount')
  const method = searchParams.get('method')

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Processing Withdrawal</h1>
      <p>Amount: {amount}</p>
      <p>Method: {method}</p>
    </div>
  )
} 