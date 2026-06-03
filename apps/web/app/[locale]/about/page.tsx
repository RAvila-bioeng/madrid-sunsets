import { getTranslations, setRequestLocale } from 'next-intl/server';

type Params = { locale: string };

export default async function AboutPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
      <article className="prose prose-neutral max-w-none">
        <h1 className="font-display text-4xl font-semibold text-foreground mb-8">{t('title')}</h1>
        <p className="font-display text-xl font-normal text-foreground leading-relaxed">
          {t('body')}
        </p>
        <p className="mt-6 text-foreground-muted leading-relaxed">{t('body2')}</p>
      </article>
    </div>
  );
}
