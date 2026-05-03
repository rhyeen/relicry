import 'server-only';
import { revalidatePath, revalidateTag } from 'next/cache';
import { LOCAL_CACHE_TAG } from '@/lib/local';

export function revalidateLocalData() {
  revalidateTag(LOCAL_CACHE_TAG, { expire: 0 });
  revalidatePath('/', 'layout');
}
