import { updateReferrerCredits } from '@/utils/updateReferrerCredits';

export async function GET() {
  try {
    console.log('Cron job started');
    
    // Call the updateReferrerCredits function
    await updateReferrerCredits();
    
    console.log('Cron job completed successfully');
    return new Response('Credits updated successfully', { status: 200 });
  } catch (error) {
    console.error('Error in cron job:', error);
    return new Response('Error updating credits', { status: 500 });
  }
} 