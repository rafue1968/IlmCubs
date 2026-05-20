/**
 * Validate Quran surah and ayah numbers
 * Quran has 114 surahs (chapters)
 * Each surah has varying number of ayahs (verses)
 */

// Number of ayahs per surah
const SURAH_AYAH_COUNTS: Record<number, number> = {
  1: 7, // Al-Fatiha
  2: 286, // Al-Baqarah
  3: 200, // Al-Imran
  4: 176, // An-Nisa
  5: 120, // Al-Maidah
  6: 165, // Al-Anam
  7: 206, // Al-Araf
  8: 75, // Al-Anfal
  9: 129, // At-Taubah
  10: 109, // Yunus
  11: 123, // Hud
  12: 111, // Yusuf
  13: 43, // Ar-Rad
  14: 52, // Ibrahim
  15: 99, // Al-Hijr
  16: 128, // An-Nahl
  17: 111, // Al-Isra
  18: 110, // Al-Kahf
  19: 98, // Maryam
  20: 135, // Taha
  21: 112, // Al-Anbiya
  22: 78, // Al-Hajj
  23: 118, // Al-Muminun
  24: 64, // An-Nur
  25: 77, // Al-Furqan
  26: 227, // Ash-Shuara
  27: 93, // An-Naml
  28: 88, // Al-Qasas
  29: 69, // Al-Ankabut
  30: 60, // Ar-Rum
  31: 34, // Luqman
  32: 30, // As-Sajdah
  33: 73, // Al-Ahzab
  34: 54, // Saba
  35: 45, // Fatir
  36: 83, // Ya-Sin
  37: 182, // As-Saffat
  38: 88, // Sad
  39: 75, // Az-Zumar
  40: 85, // Ghafir
  41: 54, // Fussilat
  42: 53, // Ash-Shura
  43: 89, // Az-Zukhruf
  44: 59, // Ad-Dukhan
  45: 37, // Al-Jathiya
  46: 35, // Al-Ahqaf
  47: 38, // Muhammad
  48: 29, // Al-Fath
  49: 18, // Al-Hujurat
  50: 45, // Qaf
  51: 60, // Ad-Dhariyat
  52: 49, // At-Tur
  53: 62, // An-Najm
  54: 55, // Al-Qamar
  55: 78, // Ar-Rahman
  56: 96, // Al-Waqi'a
  57: 29, // Al-Hadid
  58: 22, // Al-Mujadila
  59: 24, // Al-Hashr
  60: 13, // Al-Mumtahana
  61: 14, // As-Saff
  62: 11, // Al-Jumu'a
  63: 11, // Al-Munafiqun
  64: 18, // At-Taghabun
  65: 12, // At-Talaq
  66: 12, // At-Tahrim
  67: 30, // Al-Mulk
  68: 52, // Al-Qalam
  69: 52, // Al-Haqqah
  70: 44, // Al-Ma'arij
  71: 28, // Nuh
  72: 28, // Al-Jinn
  73: 20, // Al-Muzzammil
  74: 56, // Al-Muddaththir
  75: 40, // Al-Qiyamah
  76: 31, // Al-Insan
  77: 50, // Al-Mursalat
  78: 40, // An-Naba
  79: 46, // An-Nazi'at
  80: 42, // Abasa
  81: 29, // At-Takwir
  82: 19, // Al-Infitar
  83: 36, // Al-Mutaffifin
  84: 45, // Al-Inshiqaq
  85: 22, // Al-Buruj
  86: 17, // At-Tariq
  87: 19, // Al-A'la
  88: 26, // Al-Ghashiyah
  89: 30, // Al-Fajr
  90: 20, // Al-Balad
  91: 15, // Ash-Shams
  92: 21, // Al-Layl
  93: 11, // Ad-Duha
  94: 8, // Ash-Sharh
  95: 8, // At-Tin
  96: 19, // Al-Alaq
  97: 5, // Al-Qadr
  98: 8, // Al-Bayyinah
  99: 8, // Az-Zilzal
  100: 11, // Al-Adiyat
  101: 11, // Al-Qari'ah
  102: 8, // At-Takathur
  103: 3, // Al-Asr
  104: 9, // Al-Humazah
  105: 5, // Al-Fil
  106: 4, // Quraish
  107: 7, // Al-Ma'un
  108: 3, // Al-Kawthar
  109: 6, // Al-Kafirun
  110: 3, // An-Nasr
  111: 5, // Al-Lahab
  112: 4, // Al-Ikhlas
  113: 5, // Al-Falaq
  114: 6, // An-Nas
};

export function isValidSurah(surah: unknown): surah is number {
  const num = Number(surah);
  return Number.isInteger(num) && num >= 1 && num <= 114;
}

export function isValidAyah(surah: number, ayah: unknown): boolean {
  const num = Number(ayah);
  if (!Number.isInteger(num) || num < 1) return false;

  const maxAyahs = SURAH_AYAH_COUNTS[surah];
  return maxAyahs ? num <= maxAyahs : false;
}

export function validateVerseInput(surah: unknown, ayah: unknown) {
  const errors: string[] = [];

  if (!isValidSurah(surah)) {
    errors.push(`Invalid surah: must be between 1 and 114`);
  }

  if (isValidSurah(surah) && !isValidAyah(surah, ayah)) {
    const maxAyahs = SURAH_AYAH_COUNTS[surah];
    errors.push(
      `Invalid ayah for surah ${surah}: must be between 1 and ${maxAyahs}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getSurahName(surah: number): string | null {
  const names: Record<number, string> = {
    1: "Al-Fatiha",
    2: "Al-Baqarah",
    3: "Al-Imran",
    4: "An-Nisa",
    5: "Al-Maidah",
    6: "Al-Anam",
    7: "Al-Araf",
    8: "Al-Anfal",
    9: "At-Taubah",
    10: "Yunus",
    11: "Hud",
    12: "Yusuf",
    13: "Ar-Rad",
    14: "Ibrahim",
    15: "Al-Hijr",
    16: "An-Nahl",
    17: "Al-Isra",
    18: "Al-Kahf",
    19: "Maryam",
    20: "Taha",
    21: "Al-Anbiya",
    22: "Al-Hajj",
    23: "Al-Muminun",
    24: "An-Nur",
    25: "Al-Furqan",
    26: "Ash-Shuara",
    27: "An-Naml",
    28: "Al-Qasas",
    29: "Al-Ankabut",
    30: "Ar-Rum",
    31: "Luqman",
    32: "As-Sajdah",
    33: "Al-Ahzab",
    34: "Saba",
    35: "Fatir",
    36: "Ya-Sin",
    37: "As-Saffat",
    38: "Sad",
    39: "Az-Zumar",
    40: "Ghafir",
    41: "Fussilat",
    42: "Ash-Shura",
    43: "Az-Zukhruf",
    44: "Ad-Dukhan",
    45: "Al-Jathiya",
    46: "Al-Ahqaf",
    47: "Muhammad",
    48: "Al-Fath",
    49: "Al-Hujurat",
    50: "Qaf",
    51: "Ad-Dhariyat",
    52: "At-Tur",
    53: "An-Najm",
    54: "Al-Qamar",
    55: "Ar-Rahman",
    56: "Al-Waqi'a",
    57: "Al-Hadid",
    58: "Al-Mujadila",
    59: "Al-Hashr",
    60: "Al-Mumtahana",
    61: "As-Saff",
    62: "Al-Jumu'a",
    63: "Al-Munafiqun",
    64: "At-Taghabun",
    65: "At-Talaq",
    66: "At-Tahrim",
    67: "Al-Mulk",
    68: "Al-Qalam",
    69: "Al-Haqqah",
    70: "Al-Ma'arij",
    71: "Nuh",
    72: "Al-Jinn",
    73: "Al-Muzzammil",
    74: "Al-Muddaththir",
    75: "Al-Qiyamah",
    76: "Al-Insan",
    77: "Al-Mursalat",
    78: "An-Naba",
    79: "An-Nazi'at",
    80: "Abasa",
    81: "At-Takwir",
    82: "Al-Infitar",
    83: "Al-Mutaffifin",
    84: "Al-Inshiqaq",
    85: "Al-Buruj",
    86: "At-Tariq",
    87: "Al-A'la",
    88: "Al-Ghashiyah",
    89: "Al-Fajr",
    90: "Al-Balad",
    91: "Ash-Shams",
    92: "Al-Layl",
    93: "Ad-Duha",
    94: "Ash-Sharh",
    95: "At-Tin",
    96: "Al-Alaq",
    97: "Al-Qadr",
    98: "Al-Bayyinah",
    99: "Az-Zilzal",
    100: "Al-Adiyat",
    101: "Al-Qari'ah",
    102: "At-Takathur",
    103: "Al-Asr",
    104: "Al-Humazah",
    105: "Al-Fil",
    106: "Quraish",
    107: "Al-Ma'un",
    108: "Al-Kawthar",
    109: "Al-Kafirun",
    110: "An-Nasr",
    111: "Al-Lahab",
    112: "Al-Ikhlas",
    113: "Al-Falaq",
    114: "An-Nas",
  };

  return names[surah] || null;
}
