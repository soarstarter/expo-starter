export const LEGAL_VERSION = '2026-04-30';

export const LEGAL_URLS = {
  terms: process.env.EXPO_PUBLIC_TERMS_URL ?? '',
  privacy: process.env.EXPO_PUBLIC_PRIVACY_URL ?? '',
  eula: process.env.EXPO_PUBLIC_EULA_URL ?? '',
};

export type LegalDocId = 'terms' | 'privacy' | 'eula';

export type LegalDoc = {
  id: LegalDocId;
  titleKey: string;
  introKey: string;
  sectionKeys: { titleKey: string; bodyKey: string }[];
};

export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = {
  terms: {
    id: 'terms',
    titleKey: 'legal.terms.title',
    introKey: 'legal.terms.intro',
    sectionKeys: [
      { titleKey: 'legal.terms.s1Title', bodyKey: 'legal.terms.s1Body' },
      { titleKey: 'legal.terms.s2Title', bodyKey: 'legal.terms.s2Body' },
      { titleKey: 'legal.terms.s3Title', bodyKey: 'legal.terms.s3Body' },
      { titleKey: 'legal.terms.s4Title', bodyKey: 'legal.terms.s4Body' },
      { titleKey: 'legal.terms.s5Title', bodyKey: 'legal.terms.s5Body' },
    ],
  },
  privacy: {
    id: 'privacy',
    titleKey: 'legal.privacy.title',
    introKey: 'legal.privacy.intro',
    sectionKeys: [
      { titleKey: 'legal.privacy.s1Title', bodyKey: 'legal.privacy.s1Body' },
      { titleKey: 'legal.privacy.s2Title', bodyKey: 'legal.privacy.s2Body' },
      { titleKey: 'legal.privacy.s3Title', bodyKey: 'legal.privacy.s3Body' },
      { titleKey: 'legal.privacy.s4Title', bodyKey: 'legal.privacy.s4Body' },
      { titleKey: 'legal.privacy.s5Title', bodyKey: 'legal.privacy.s5Body' },
    ],
  },
  eula: {
    id: 'eula',
    titleKey: 'legal.eula.title',
    introKey: 'legal.eula.intro',
    sectionKeys: [
      { titleKey: 'legal.eula.s1Title', bodyKey: 'legal.eula.s1Body' },
      { titleKey: 'legal.eula.s2Title', bodyKey: 'legal.eula.s2Body' },
      { titleKey: 'legal.eula.s3Title', bodyKey: 'legal.eula.s3Body' },
      { titleKey: 'legal.eula.s4Title', bodyKey: 'legal.eula.s4Body' },
    ],
  },
};
