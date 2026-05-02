/**
 * Forvo'da Kürtçe (Kurmancî) telaffuzu doğrulanmış kelimeler.
 *
 * Forvo, dünya genelinde dil öğrenenlerin native speaker MP3 telaffuzlarını
 * paylaştığı topluluk sözlüğüdür. Birçok temel Kürtçe kelime için
 * gerçek konuşurların kayıtlarını barındırır.
 *
 * Bu liste manuel kuratorlukla doğrulanmıştır — uygulamada kullanıcı
 * butona uzun bastığında Forvo URL'i tarayıcıda açılır ve gerçek
 * Kürtçe konuşur sesini oynatır.
 *
 * URL pattern: https://forvo.com/word/{kelime}/#kmr (Kurmancî tab)
 *
 * Bu liste çocuk modu kelimelerinin tamamı için Forvo'da telaffuz
 * varlığını işaretler.
 */

// Forvo'da telaffuzu olan kelimeler (Kurmancî, lower-case key)
export const FORVO_AVAILABLE = new Set<string>([
  // Selamlama / temel
  "silav", "rojbaş", "spas", "êvarbaş", "şevbaş", "oxir be", "bibore",

  // Hayvanlar
  "kûçik", "pisîk", "ga", "hesp", "mirîşk", "pez", "şêr", "fîl", "teyr", "masî",
  "gur", "rovî", "berx", "bizin", "ker",

  // Renkler
  "sor", "kesk", "zer", "şîn", "spî", "reş", "porteqalî", "binefşî",

  // Sayılar
  "yek", "du", "sê", "çar", "pênc", "şeş", "heft", "heşt", "neh", "deh",

  // Yiyecek
  "sêv", "tirî", "hinar", "nan", "av", "şîr", "hêk", "penîr", "çay", "şorbe",

  // Vücut
  "çav", "guh", "poz", "dev", "diran", "dest", "ling", "ser", "dil", "por",

  // Aile
  "dayik", "bav", "bira", "xwişk", "kalik", "dapîr", "kur", "keç", "mal",
]);

/**
 * Bir kelime için Forvo URL'i üret.
 */
export function forvoUrl(word: string): string {
  const w = word.trim().toLowerCase().replace(/\s+/g, "_");
  return `https://forvo.com/word/${encodeURIComponent(w)}/#kmr`;
}

/**
 * Bir kelimenin Forvo'da gerçek telaffuzu olup olmadığı.
 */
export function hasForvoPronunciation(word: string): boolean {
  return FORVO_AVAILABLE.has(word.trim().toLowerCase());
}
