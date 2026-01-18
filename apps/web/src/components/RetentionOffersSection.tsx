'use client';

import React from 'react';
import { Button, Card, Container, Section } from '@psychology/design-system';
import { track } from '@/lib/tracking';
import { useFeatureFlag } from '@/lib/feature-flags';

type RetentionOfferType = 'package_discount' | 'gift_certificate' | 'social_mission';

interface RetentionOfferDefinition {
  type: RetentionOfferType;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
}

const OFFER_DEFINITIONS: RetentionOfferDefinition[] = [
  {
    type: 'package_discount',
    title: 'Пакет консультаций',
    description:
      'Если хотите устойчивый формат, можно выбрать пакет встреч со спокойной скидкой и понятными условиями.',
    ctaLabel: 'Узнать условия',
    href: '/services?offer=package',
  },
  {
    type: 'gift_certificate',
    title: 'Подарочный сертификат',
    description:
      'Тёплый и бережный подарок для близкого: без давления и без раскрытия личных данных.',
    ctaLabel: 'Посмотреть варианты',
    href: '/services?offer=certificate',
  },
  {
    type: 'social_mission',
    title: 'Поддержать консультацию',
    description:
      'Можно помочь тем, кому сейчас тяжело: поддерживающая “подвешенная” сессия без публичности.',
    ctaLabel: 'Поддержать',
    href: '/services?offer=mission',
  },
];

function isRetentionWindowOpen(): boolean {
  const startAt = process.env.NEXT_PUBLIC_RETENTION_START_AT;
  if (!startAt) return false;
  const startDate = new Date(startAt);
  if (Number.isNaN(startDate.getTime())) return false;
  const minDays = Number(process.env.NEXT_PUBLIC_RETENTION_MIN_DAYS ?? '30');
  if (!Number.isFinite(minDays)) return false;
  const diffMs = Date.now() - startDate.getTime();
  return diffMs >= minDays * 24 * 60 * 60 * 1000;
}

export function RetentionOffersSection({ surface = 'home' }: { surface?: string }) {
  const retentionEnabled = useFeatureFlag('retention_mechanics_enabled');
  const packagesEnabled = useFeatureFlag('retention_packages_enabled');
  const certificateEnabled = useFeatureFlag('retention_gift_certificates_enabled');
  const missionEnabled = useFeatureFlag('retention_social_mission_enabled');
  const windowOpen = React.useMemo(() => isRetentionWindowOpen(), []);

  const offers = React.useMemo(() => {
    if (!retentionEnabled || !windowOpen) return [];
    return OFFER_DEFINITIONS.filter((offer) => {
      if (offer.type === 'package_discount') return packagesEnabled;
      if (offer.type === 'gift_certificate') return certificateEnabled;
      if (offer.type === 'social_mission') return missionEnabled;
      return false;
    });
  }, [retentionEnabled, windowOpen, packagesEnabled, certificateEnabled, missionEnabled]);

  const offersKey = React.useMemo(() => offers.map((offer) => offer.type).join('|'), [offers]);
  const sectionRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!sectionRef.current || offers.length === 0) return;
    let tracked = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!tracked && entries.some((entry) => entry.isIntersecting)) {
          track('retention_offer_viewed', {
            surface,
            offers_count: offers.length,
            offer_types: offers.map((offer) => offer.type),
          });
          tracked = true;
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [offers.length, offersKey, surface]);

  if (offers.length === 0) return null;

  return (
    <Section className="bg-muted/40">
      <Container>
        <div ref={sectionRef}>
          <div className="mb-8 flex flex-col gap-2 text-center">
            <h2 className="text-3xl font-bold text-foreground">Дополнительные варианты поддержки</h2>
            <p className="text-muted-foreground">
              Эти предложения опциональны, без давления и легко отключаются.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {offers.map((offer) => (
              <Card key={offer.type} className="flex h-full flex-col justify-between p-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{offer.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{offer.description}</p>
                </div>
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      track('retention_offer_click', {
                        offer_type: offer.type,
                        cta_id: `retention_${offer.type}`,
                        surface,
                      });
                      window.location.href = offer.href;
                    }}
                  >
                    {offer.ctaLabel}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
