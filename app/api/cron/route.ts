import { updateReferrerCredits } from '@/utils/updateReferrerCredits';

export async function GET() {
  try {
    await updateReferrerCredits();
    return new Response('Credits updated successfully', { status: 200 });
  } catch (error) {
    return new Response('Error updating credits', { status: 500 });
  }
} 