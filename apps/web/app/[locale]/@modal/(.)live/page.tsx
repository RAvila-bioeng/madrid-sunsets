import { setRequestLocale } from 'next-intl/server';

import { LivePreview } from '@/components/LivePreview';
import { requireCurrentUser } from '@/lib/auth';
import { getLatestPhoto } from '@/lib/queries';

export const dynamic = 'force-dynamic';

type Params = { locale: string };

export default async function LiveModalPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireCurrentUser(locale);
  const photo = await getLatestPhoto();

  return <LivePreview photo={photo} asModal={true} />;
}
