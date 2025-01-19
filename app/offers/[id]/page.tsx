import { Button } from "@/components/ui/button"

export default function OfferDetails({ params }: { params: { id: string } }) {
  // In a real app, you'd fetch the offer details based on the ID
  const offer = {
    title: "Complete Survey",
    description: "Answer a short survey about your shopping habits and earn credits!",
    credits: 100,
    instructions: "Click the 'Start Now' button to be redirected to the survey. Complete all questions to receive your credits.",
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">{offer.title}</h2>
        <p className="text-gray-600 mb-4">{offer.description}</p>
        <div className="bg-green-100 rounded-lg p-4 mb-6">
          <p className="text-lg font-semibold">Earn {offer.credits} credits</p>
        </div>
        <h3 className="text-xl font-bold mb-2">How to complete:</h3>
        <p className="mb-6">{offer.instructions}</p>
        <Button className="w-full">Start Now</Button>
      </div>
    </div>
  )
}

