import en from '@/lib/i18n/en.json';
import zh from '@/lib/i18n/zh.json';

type Messages = { [key: string]: string | Messages };

function flatten(messages: Messages, prefix = ''): Record<string, string> {
  return Object.entries(messages).reduce<Record<string, string>>((out, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') out[path] = value;
    else Object.assign(out, flatten(value, path));
    return out;
  }, {});
}

function placeholders(text: string) {
  return [...text.matchAll(/\{\{\s*(\w+)\s*\}\}|%\{(\w+)\}/g)].map((m) => m[1] ?? m[2]).sort();
}

const english = flatten(en as Messages);
const chinese = flatten(zh as Messages);

describe('translations', () => {
  it('have the same keys in English and Chinese', () => {
    const englishKeys = Object.keys(english).sort();
    const chineseKeys = Object.keys(chinese).sort();
    expect(englishKeys.filter((key) => !(key in chinese))).toEqual([]);
    expect(chineseKeys.filter((key) => !(key in english))).toEqual([]);
  });

  it('have no empty strings', () => {
    const empty = [
      ...Object.entries(english).filter(([, text]) => text.trim() === ''),
      ...Object.entries(chinese).filter(([, text]) => text.trim() === ''),
    ].map(([key]) => key);
    expect(empty).toEqual([]);
  });

  it('use the same placeholders in both languages', () => {
    const mismatched = Object.keys(english).filter(
      (key) =>
        key in chinese &&
        JSON.stringify(placeholders(english[key])) !== JSON.stringify(placeholders(chinese[key]))
    );
    expect(mismatched).toEqual([]);
  });
});
