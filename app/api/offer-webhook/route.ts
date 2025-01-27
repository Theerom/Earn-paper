export async function POST(req: Request) {
  const { userId, offerId } = await req.json();
  
  try {
    await updateEarnings(userId, 10); // $10 per offer
    return new Response('Success', { status: 200 });
  } catch (error) {
    return new Response('Error processing offer', { status: 500 });
  }
} 