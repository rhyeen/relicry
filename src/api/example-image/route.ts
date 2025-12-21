import { initAdmin } from '@/lib/firebaseAdmin';
import { getLogoFromStorage } from '@/server/services/example.service';

export async function GET(request: Request) {
  await initAdmin();

  const imageUrl = await getLogoFromStorage();

  const response = await fetch(imageUrl);

  return new Response(response.body, { headers: response.headers });
}
