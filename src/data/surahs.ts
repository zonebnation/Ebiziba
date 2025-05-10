export interface Surah {
  id: number;
  surahName: string;
  surahNameArabic: string;
  surahNameArabicLong: string;
  surahNameTranslation: string;
  revelationPlace: 'Mecca' | 'Madina';
  totalAyah: number;
  startPage?: number;
}

export const surahs: Surah[] = [
  {
    "id": 1,
    "surahName": "Al-Faatiha",
    "surahNameArabic": "الفاتحة",
    "surahNameArabicLong": "سُورَةُ ٱلْفَاتِحَةِ",
    "surahNameTranslation": "The Opening",
    "revelationPlace": "Mecca",
    "totalAyah": 7,
    "startPage": 1
  },
  {
    "id": 2,
    "surahName": "Al-Baqara",
    "surahNameArabic": "البقرة",
    "surahNameArabicLong": "سورة البقرة",
    "surahNameTranslation": "The Cow",
    "revelationPlace": "Madina",
    "totalAyah": 286,
    "startPage": 2
  },
  {
    "id": 3,
    "surahName": "Aal-i-Imraan",
    "surahNameArabic": "آل عمران",
    "surahNameArabicLong": "سورة آل عمران",
    "surahNameTranslation": "The Family of Imraan",
    "revelationPlace": "Madina",
    "totalAyah": 200,
    "startPage": 50
  },
  {
    "id": 4,
    "surahName": "An-Nisaa",
    "surahNameArabic": "النساء",
    "surahNameArabicLong": "سورة النساء",
    "surahNameTranslation": "The Women",
    "revelationPlace": "Madina",
    "totalAyah": 176,
    "startPage": 77
  },
  {
    "id": 5,
    "surahName": "Al-Maaida",
    "surahNameArabic": "المائدة",
    "surahNameArabicLong": "سورة المائدة",
    "surahNameTranslation": "The Table",
    "revelationPlace": "Madina",
    "totalAyah": 120,
    "startPage": 106
  },
  {
    "id": 6,
    "surahName": "Al-An'aam",
    "surahNameArabic": "الأنعام",
    "surahNameArabicLong": "سورة الأنعام",
    "surahNameTranslation": "The Cattle",
    "revelationPlace": "Mecca",
    "totalAyah": 165,
    "startPage": 128
  },
  {
    "id": 7,
    "surahName": "Al-A'raaf",
    "surahNameArabic": "الأعراف",
    "surahNameArabicLong": "سورة الأعراف",
    "surahNameTranslation": "The Heights",
    "revelationPlace": "Mecca",
    "totalAyah": 206,
    "startPage": 151
  },
  {
    "id": 8,
    "surahName": "Al-Anfaal",
    "surahNameArabic": "الأنفال",
    "surahNameArabicLong": "سورة الأنفال",
    "surahNameTranslation": "The Spoils of War",
    "revelationPlace": "Madina",
    "totalAyah": 75,
    "startPage": 177
  },
  {
    "id": 9,
    "surahName": "At-Tawba",
    "surahNameArabic": "التوبة",
    "surahNameArabicLong": "سورة التوبة",
    "surahNameTranslation": "The Repentance",
    "revelationPlace": "Madina",
    "totalAyah": 129,
    "startPage": 187
  },
  {
    "id": 10,
    "surahName": "Yunus",
    "surahNameArabic": "يونس",
    "surahNameArabicLong": "سورة يونس",
    "surahNameTranslation": "Jonas",
    "revelationPlace": "Mecca",
    "totalAyah": 109,
    "startPage": 208
  },
  {
    "id": 11,
    "surahName": "Hud",
    "surahNameArabic": "هود",
    "surahNameArabicLong": "سورة هود",
    "surahNameTranslation": "Hud",
    "revelationPlace": "Mecca",
    "totalAyah": 123,
    "startPage": 221
  },
  {
    "id": 12,
    "surahName": "Yusuf",
    "surahNameArabic": "يوسف",
    "surahNameArabicLong": "سورة يوسف",
    "surahNameTranslation": "Joseph",
    "revelationPlace": "Mecca",
    "totalAyah": 111,
    "startPage": 235
  },
  {
    "id": 13,
    "surahName": "Ar-Ra'd",
    "surahNameArabic": "الرعد",
    "surahNameArabicLong": "سورة الرعد",
    "surahNameTranslation": "The Thunder",
    "revelationPlace": "Madina",
    "totalAyah": 43,
    "startPage": 249
  },
  {
    "id": 14,
    "surahName": "Ibrahim",
    "surahNameArabic": "ابراهيم",
    "surahNameArabicLong": "سورة ابراهيم",
    "surahNameTranslation": "Abraham",
    "revelationPlace": "Mecca",
    "totalAyah": 52,
    "startPage": 255
  },
  {
    "id": 15,
    "surahName": "Al-Hijr",
    "surahNameArabic": "الحجر",
    "surahNameArabicLong": "سورة الحجر",
    "surahNameTranslation": "The Rock",
    "revelationPlace": "Mecca",
    "totalAyah": 99,
    "startPage": 262
  },
  {
    "id": 16,
    "surahName": "An-Nahl",
    "surahNameArabic": "النحل",
    "surahNameArabicLong": "سورة النحل",
    "surahNameTranslation": "The Bee",
    "revelationPlace": "Mecca",
    "totalAyah": 128,
    "startPage": 267
  },
  {
    "id": 17,
    "surahName": "Al-Israa",
    "surahNameArabic": "الإسراء",
    "surahNameArabicLong": "سورة الإسراء",
    "surahNameTranslation": "The Night Journey",
    "revelationPlace": "Mecca",
    "totalAyah": 111,
    "startPage": 282
  },
  {
    "id": 18,
    "surahName": "Al-Kahf",
    "surahNameArabic": "الكهف",
    "surahNameArabicLong": "سورة الكهف",
    "surahNameTranslation": "The Cave",
    "revelationPlace": "Mecca",
    "totalAyah": 110,
    "startPage": 293
  },
  {
    "id": 19,
    "surahName": "Maryam",
    "surahNameArabic": "مريم",
    "surahNameArabicLong": "سورة مريم",
    "surahNameTranslation": "Mary",
    "revelationPlace": "Mecca",
    "totalAyah": 98,
    "startPage": 305
  },
  {
    "id": 20,
    "surahName": "Taa-Haa",
    "surahNameArabic": "طه",
    "surahNameArabicLong": "سورة طه",
    "surahNameTranslation": "Taa-Haa",
    "revelationPlace": "Mecca",
    "totalAyah": 135,
    "startPage": 312
  },
  {
    "id": 21,
    "surahName": "Al-Anbiyaa",
    "surahNameArabic": "الأنبياء",
    "surahNameArabicLong": "سورة الأنبياء",
    "surahNameTranslation": "The Prophets",
    "revelationPlace": "Mecca",
    "totalAyah": 112,
    "startPage": 322
  },
  {
    "id": 22,
    "surahName": "Al-Hajj",
    "surahNameArabic": "الحج",
    "surahNameArabicLong": "سورة الحج",
    "surahNameTranslation": "The Pilgrimage",
    "revelationPlace": "Madina",
    "totalAyah": 78,
    "startPage": 332
  },
  {
    "id": 23,
    "surahName": "Al-Muminoon",
    "surahNameArabic": "المؤمنون",
    "surahNameArabicLong": "سورة المؤمنون",
    "surahNameTranslation": "The Believers",
    "revelationPlace": "Mecca",
    "totalAyah": 118,
    "startPage": 342
  },
  {
    "id": 24,
    "surahName": "An-Noor",
    "surahNameArabic": "النور",
    "surahNameArabicLong": "سورة النور",
    "surahNameTranslation": "The Light",
    "revelationPlace": "Madina",
    "totalAyah": 64,
    "startPage": 350
  },
  {
    "id": 25,
    "surahName": "Al-Furqaan",
    "surahNameArabic": "الفرقان",
    "surahNameArabicLong": "سورة الفرقان",
    "surahNameTranslation": "The Criterion",
    "revelationPlace": "Mecca",
    "totalAyah": 77,
    "startPage": 359
  },
  {
    "id": 26,
    "surahName": "Ash-Shu'araa",
    "surahNameArabic": "الشعراء",
    "surahNameArabicLong": "سورة الشعراء",
    "surahNameTranslation": "The Poets",
    "revelationPlace": "Mecca",
    "totalAyah": 227,
    "startPage": 367
  },
  {
    "id": 27,
    "surahName": "An-Naml",
    "surahNameArabic": "النمل",
    "surahNameArabicLong": "سورة النمل",
    "surahNameTranslation": "The Ant",
    "revelationPlace": "Mecca",
    "totalAyah": 93,
    "startPage": 377
  },
  {
    "id": 28,
    "surahName": "Al-Qasas",
    "surahNameArabic": "القصص",
    "surahNameArabicLong": "سورة القصص",
    "surahNameTranslation": "The Stories",
    "revelationPlace": "Mecca",
    "totalAyah": 88,
    "startPage": 385
  },
  {
    "id": 29,
    "surahName": "Al-Ankaboot",
    "surahNameArabic": "العنكبوت",
    "surahNameArabicLong": "سورة العنكبوت",
    "surahNameTranslation": "The Spider",
    "revelationPlace": "Mecca",
    "totalAyah": 69,
    "startPage": 396
  },
  {
    "id": 30,
    "surahName": "Ar-Room",
    "surahNameArabic": "الروم",
    "surahNameArabicLong": "سورة الروم",
    "surahNameTranslation": "The Romans",
    "revelationPlace": "Mecca",
    "totalAyah": 60,
    "startPage": 404
  },
  {
    "id": 31,
    "surahName": "Luqman",
    "surahNameArabic": "لقمان",
    "surahNameArabicLong": "سورة لقمان",
    "surahNameTranslation": "Luqman",
    "revelationPlace": "Mecca",
    "totalAyah": 34,
    "startPage": 411
  },
  {
    "id": 32,
    "surahName": "As-Sajda",
    "surahNameArabic": "السجدة",
    "surahNameArabicLong": "سورة السجدة",
    "surahNameTranslation": "The Prostration",
    "revelationPlace": "Mecca",
    "totalAyah": 30,
    "startPage": 415
  },
  {
    "id": 33,
    "surahName": "Al-Ahzaab",
    "surahNameArabic": "الأحزاب",
    "surahNameArabicLong": "سورة الأحزاب",
    "surahNameTranslation": "The Clans",
    "revelationPlace": "Madina",
    "totalAyah": 73,
    "startPage": 418
  },
  {
    "id": 34,
    "surahName": "Saba",
    "surahNameArabic": "سبإ",
    "surahNameArabicLong": "سورة سَبَأ",
    "surahNameTranslation": "Sheba",
    "revelationPlace": "Mecca",
    "totalAyah": 54,
    "startPage": 428
  },
  {
    "id": 35,
    "surahName": "Faatir",
    "surahNameArabic": "فاطر",
    "surahNameArabicLong": "سورة فاطر",
    "surahNameTranslation": "The Originator",
    "revelationPlace": "Mecca",
    "totalAyah": 45,
    "startPage": 434
  },
  {
    "id": 36,
    "surahName": "Yaseen",
    "surahNameArabic": "يس",
    "surahNameArabicLong": "سورة يس",
    "surahNameTranslation": "Yaseen",
    "revelationPlace": "Mecca",
    "totalAyah": 83,
    "startPage": 440
  },
  {
    "id": 37,
    "surahName": "As-Saaffaat",
    "surahNameArabic": "الصافات",
    "surahNameArabicLong": "سورة الصافات",
    "surahNameTranslation": "Those drawn up in Ranks",
    "revelationPlace": "Mecca",
    "totalAyah": 182,
    "startPage": 446
  },
  {
    "id": 38,
    "surahName": "Saad",
    "surahNameArabic": "ص",
    "surahNameArabicLong": "سورة ص",
    "surahNameTranslation": "The letter Saad",
    "revelationPlace": "Mecca",
    "totalAyah": 88,
    "startPage": 453
  },
  {
    "id": 39,
    "surahName": "Az-Zumar",
    "surahNameArabic": "الزمر",
    "surahNameArabicLong": "سورة الزمر",
    "surahNameTranslation": "The Groups",
    "revelationPlace": "Mecca",
    "totalAyah": 75,
    "startPage": 458
  },
  {
    "id": 40,
    "surahName": "Ghafir",
    "surahNameArabic": "غافر",
    "surahNameArabicLong": "سورة غافر",
    "surahNameTranslation": "The Forgiver",
    "revelationPlace": "Mecca",
    "totalAyah": 85,
    "startPage": 467
  },
  {
    "id": 41,
    "surahName": "Fussilat",
    "surahNameArabic": "فصلت",
    "surahNameArabicLong": "سورة فصلت",
    "surahNameTranslation": "Explained in detail",
    "revelationPlace": "Mecca",
    "totalAyah": 54,
    "startPage": 477
  },
  {
    "id": 42,
    "surahName": "Ash-Shura",
    "surahNameArabic": "الشورى",
    "surahNameArabicLong": "سورة الشورى",
    "surahNameTranslation": "Consultation",
    "revelationPlace": "Mecca",
    "totalAyah": 53,
    "startPage": 483
  },
  {
    "id": 43,
    "surahName": "Az-Zukhruf",
    "surahNameArabic": "الزخرف",
    "surahNameArabicLong": "سورة الزخرف",
    "surahNameTranslation": "Ornaments of gold",
    "revelationPlace": "Mecca",
    "totalAyah": 89,
    "startPage": 489
  },
  {
    "id": 44,
    "surahName": "Ad-Dukhaan",
    "surahNameArabic": "الدخان",
    "surahNameArabicLong": "سورة الدخان",
    "surahNameTranslation": "The Smoke",
    "revelationPlace": "Mecca",
    "totalAyah": 59,
    "startPage": 496
  },
  {
    "id": 45,
    "surahName": "Al-Jaathiya",
    "surahNameArabic": "الجاثية",
    "surahNameArabicLong": "سورة الجاثية",
    "surahNameTranslation": "Crouching",
    "revelationPlace": "Mecca",
    "totalAyah": 37,
    "startPage": 499
  },
  {
    "id": 46,
    "surahName": "Al-Ahqaf",
    "surahNameArabic": "الأحقاف",
    "surahNameArabicLong": "سورة الأحقاف",
    "surahNameTranslation": "The Dunes",
    "revelationPlace": "Mecca",
    "totalAyah": 35,
    "startPage": 502
  },
  {
    "id": 47,
    "surahName": "Muhammad",
    "surahNameArabic": "محمد",
    "surahNameArabicLong": "سورة محمد",
    "surahNameTranslation": "Muhammad",
    "revelationPlace": "Madina",
    "totalAyah": 38,
    "startPage": 507
  },
  {
    "id": 48,
    "surahName": "Al-Fath",
    "surahNameArabic": "الفتح",
    "surahNameArabicLong": "سورة الفتح",
    "surahNameTranslation": "The Victory",
    "revelationPlace": "Madina",
    "totalAyah": 29,
    "startPage": 511
  },
  {
    "id": 49,
    "surahName": "Al-Hujuraat",
    "surahNameArabic": "الحجرات",
    "surahNameArabicLong": "سورة الحجرات",
    "surahNameTranslation": "The Inner Apartments",
    "revelationPlace": "Madina",
    "totalAyah": 18,
    "startPage": 515
  },
  {
    "id": 50,
    "surahName": "Qaaf",
    "surahNameArabic": "ق",
    "surahNameArabicLong": "سورة ق",
    "surahNameTranslation": "The letter Qaaf",
    "revelationPlace": "Mecca",
    "totalAyah": 45,
    "startPage": 518
  },
  {
    "id": 51,
    "surahName": "Adh-Dhaariyat",
    "surahNameArabic": "الذاريات",
    "surahNameArabicLong": "سورة الذاريات",
    "surahNameTranslation": "The Winnowing Winds",
    "revelationPlace": "Mecca",
    "totalAyah": 60,
    "startPage": 520
  },
  {
    "id": 52,
    "surahName": "At-Tur",
    "surahNameArabic": "الطور",
    "surahNameArabicLong": "سورة الطور",
    "surahNameTranslation": "The Mount",
    "revelationPlace": "Mecca",
    "totalAyah": 49,
    "startPage": 523
  },
  {
    "id": 53,
    "surahName": "An-Najm",
    "surahNameArabic": "النجم",
    "surahNameArabicLong": "سورة النجم",
    "surahNameTranslation": "The Star",
    "revelationPlace": "Mecca",
    "totalAyah": 62,
    "startPage": 526
  },
  {
    "id": 54,
    "surahName": "Al-Qamar",
    "surahNameArabic": "القمر",
    "surahNameArabicLong": "سورة القمر",
    "surahNameTranslation": "The Moon",
    "revelationPlace": "Mecca",
    "totalAyah": 55,
    "startPage": 528
  },
  {
    "id": 55,
    "surahName": "Ar-Rahmaan",
    "surahNameArabic": "الرحمن",
    "surahNameArabicLong": "سورة الرحمن",
    "surahNameTranslation": "The Beneficent",
    "revelationPlace": "Madina",
    "totalAyah": 78,
    "startPage": 531
  },
  {
    "id": 56,
    "surahName": "Al-Waaqia",
    "surahNameArabic": "الواقعة",
    "surahNameArabicLong": "سورة الواقعة",
    "surahNameTranslation": "The Inevitable",
    "revelationPlace": "Mecca",
    "totalAyah": 96,
    "startPage": 534
  },
  {
    "id": 57,
    "surahName": "Al-Hadid",
    "surahNameArabic": "الحديد",
    "surahNameArabicLong": "سورة الحديد",
    "surahNameTranslation": "The Iron",
    "revelationPlace": "Madina",
    "totalAyah": 29,
    "startPage": 537
  },
  {
    "id": 58,
    "surahName": "Al-Mujaadila",
    "surahNameArabic": "المجادلة",
    "surahNameArabicLong": "سورة المجادلة",
    "surahNameTranslation": "The Pleading Woman",
    "revelationPlace": "Madina",
    "totalAyah": 22,
    "startPage": 542
  },
  {
    "id": 59,
    "surahName": "Al-Hashr",
    "surahNameArabic": "الحشر",
    "surahNameArabicLong": "سورة الحشر",
    "surahNameTranslation": "The Exile",
    "revelationPlace": "Madina",
    "totalAyah": 24,
    "startPage": 545
  },
  {
    "id": 60,
    "surahName": "Al-Mumtahana",
    "surahNameArabic": "الممتحنة",
    "surahNameArabicLong": "سورة الممتحنة",
    "surahNameTranslation": "She that is to be examined",
    "revelationPlace": "Madina",
    "totalAyah": 13,
    "startPage": 549
  },
  {
    "id": 61,
    "surahName": "As-Saff",
    "surahNameArabic": "الصف",
    "surahNameArabicLong": "سورة الصف",
    "surahNameTranslation": "The Ranks",
    "revelationPlace": "Madina",
    "totalAyah": 14,
    "startPage": 551
  },
  {
    "id": 62,
    "surahName": "Al-Jumu'a",
    "surahNameArabic": "الجمعة",
    "surahNameArabicLong": "سورة الجمعة",
    "surahNameTranslation": "Friday",
    "revelationPlace": "Madina",
    "totalAyah": 11,
    "startPage": 553
  },
  {
    "id": 63,
    "surahName": "Al-Munaafiqoon",
    "surahNameArabic": "المنافقون",
    "surahNameArabicLong": "سورة المنافقون",
    "surahNameTranslation": "The Hypocrites",
    "revelationPlace": "Madina",
    "totalAyah": 11,
    "startPage": 554
  },
  {
    "id": 64,
    "surahName": "At-Taghaabun",
    "surahNameArabic": "التغابن",
    "surahNameArabicLong": "سورة التغابن",
    "surahNameTranslation": "Mutual Disillusion",
    "revelationPlace": "Madina",
    "totalAyah": 18,
    "startPage": 556
  },
  {
    "id": 65,
    "surahName": "At-Talaaq",
    "surahNameArabic": "الطلاق",
    "surahNameArabicLong": "سورة الطلاق",
    "surahNameTranslation": "Divorce",
    "revelationPlace": "Madina",
    "totalAyah": 12,
    "startPage": 558
  },
  {
    "id": 66,
    "surahName": "At-Tahrim",
    "surahNameArabic": "التحريم",
    "surahNameArabicLong": "سورة التحريم",
    "surahNameTranslation": "The Prohibition",
    "revelationPlace": "Madina",
    "totalAyah": 12,
    "startPage": 560
  },
  {
    "id": 67,
    "surahName": "Al-Mulk",
    "surahNameArabic": "الملك",
    "surahNameArabicLong": "سورة الملك",
    "surahNameTranslation": "The Sovereignty",
    "revelationPlace": "Mecca",
    "totalAyah": 30,
    "startPage": 562
  },
  {
    "id": 68,
    "surahName": "Al-Qalam",
    "surahNameArabic": "القلم",
    "surahNameArabicLong": "سورة القلم",
    "surahNameTranslation": "The Pen",
    "revelationPlace": "Mecca",
    "totalAyah": 52,
    "startPage": 564
  },
  {
    "id": 69,
    "surahName": "Al-Haaqqa",
    "surahNameArabic": "الحاقة",
    "surahNameArabicLong": "سورة الحاقة",
    "surahNameTranslation": "The Reality",
    "revelationPlace": "Mecca",
    "totalAyah": 52,
    "startPage": 566
  },
  {
    "id": 70,
    "surahName": "Al-Ma'aarij",
    "surahNameArabic": "المعارج",
    "surahNameArabicLong": "سورة المعارج",
    "surahNameTranslation": "The Ascending Stairways",
    "revelationPlace": "Mecca",
    "totalAyah": 44,
    "startPage": 568
  },
  {
    "id": 71,
    "surahName": "Nooh",
    "surahNameArabic": "نوح",
    "surahNameArabicLong": "سورة نوح",
    "surahNameTranslation": "Noah",
    "revelationPlace": "Mecca",
    "totalAyah": 28,
    "startPage": 570
  },
  {
    "id": 72,
    "surahName": "Al-Jinn",
    "surahNameArabic": "الجن",
    "surahNameArabicLong": "سورة الجن",
    "surahNameTranslation": "The Jinn",
    "revelationPlace": "Mecca",
    "totalAyah": 28,
    "startPage": 572
  },
  {
    "id": 73,
    "surahName": "Al-Muzzammil",
    "surahNameArabic": "المزمل",
    "surahNameArabicLong": "سورة المزمل",
    "surahNameTranslation": "The Enshrouded One",
    "revelationPlace": "Mecca",
    "totalAyah": 20,
    "startPage": 574
  },
  {
    "id": 74,
    "surahName": "Al-Muddaththir",
    "surahNameArabic": "المدثر",
    "surahNameArabicLong": "سورة المدثر",
    "surahNameTranslation": "The Cloaked One",
    "revelationPlace": "Mecca",
    "totalAyah": 56,
    "startPage": 575
  },
  {
    "id": 75,
    "surahName": "Al-Qiyaama",
    "surahNameArabic": "القيامة",
    "surahNameArabicLong": "سورة القيامة",
    "surahNameTranslation": "The Resurrection",
    "revelationPlace": "Mecca",
    "totalAyah": 40,
    "startPage": 577
  },
  {
    "id": 76,
    "surahName": "Al-Insaan",
    "surahNameArabic": "الانسان",
    "surahNameArabicLong": "سورة الانسان",
    "surahNameTranslation": "Man",
    "revelationPlace": "Madina",
    "totalAyah": 31,
    "startPage": 578
  },
  {
    "id": 77,
    "surahName": "Al-Mursalaat",
    "surahNameArabic": "المرسلات",
    "surahNameArabicLong": "سورة المرسلات",
    "surahNameTranslation": "The Emissaries",
    "revelationPlace": "Mecca",
    "totalAyah": 50,
    "startPage": 580
  },
  {
    "id": 78,
    "surahName": "An-Naba",
    "surahNameArabic": "النبإ",
    "surahNameArabicLong": "سورة النبأ",
    "surahNameTranslation": "The Announcement",
    "revelationPlace": "Mecca",
    "totalAyah": 40,
    "startPage": 582
  },
  {
    "id": 79,
    "surahName": "An-Naazi'aat",
    "surahNameArabic": "النازعات",
    "surahNameArabicLong": "سورة النازعات",
    "surahNameTranslation": "Those who drag forth",
    "revelationPlace": "Mecca",
    "totalAyah": 46,
    "startPage": 583
  },
  {
    "id": 80,
    "surahName": "Abasa",
    "surahNameArabic": "عبس",
    "surahNameArabicLong": "سورة عبس",
    "surahNameTranslation": "He frowned",
    "revelationPlace": "Mecca",
    "totalAyah": 42,
    "startPage": 585
  },
  {
    "id": 81,
    "surahName": "At-Takwir",
    "surahNameArabic": "التكوير",
    "surahNameArabicLong": "سورة التكوير",
    "surahNameTranslation": "The Overthrowing",
    "revelationPlace": "Mecca",
    "totalAyah": 29,
    "startPage": 586
  },
  {
    "id": 82,
    "surahName": "Al-Infitaar",
    "surahNameArabic": "الإنفطار",
    "surahNameArabicLong": "سورة الإنفطار",
    "surahNameTranslation": "The Cleaving",
    "revelationPlace": "Mecca",
    "totalAyah": 19,
    "startPage": 587
  },
  {
    "id": 83,
    "surahName": "Al-Mutaffifin",
    "surahNameArabic": "المطففين",
    "surahNameArabicLong": "سورة المطففين",
    "surahNameTranslation": "Defrauding",
    "revelationPlace": "Mecca",
    "totalAyah": 36,
    "startPage": 587
  },
  {
    "id": 84,
    "surahName": "Al-Inshiqaaq",
    "surahNameArabic": "الإنشقاق",
    "surahNameArabicLong": "سورة الإنشقاق",
    "surahNameTranslation": "The Splitting Open",
    "revelationPlace": "Mecca",
    "totalAyah": 25,
    "startPage": 589
  },
  {
    "id": 85,
    "surahName": "Al-Burooj",
    "surahNameArabic": "البروج",
    "surahNameArabicLong": "سورة البروج",
    "surahNameTranslation": "The Constellations",
    "revelationPlace": "Mecca",
    "totalAyah": 22,
    "startPage": 590
  },
  {
    "id": 86,
    "surahName": "At-Taariq",
    "surahNameArabic": "الطارق",
    "surahNameArabicLong": "سورة الطارق",
    "surahNameTranslation": "The Morning Star",
    "revelationPlace": "Mecca",
    "totalAyah": 17,
    "startPage": 591
  },
  {
    "id": 87,
    "surahName": "Al-A'laa",
    "surahNameArabic": "الأعلى",
    "surahNameArabicLong": "سورة الأعلى",
    "surahNameTranslation": "The Most High",
    "revelationPlace": "Mecca",
    "totalAyah": 19,
    "startPage": 591
  },
  {
    "id": 88,
    "surahName": "Al-Ghaashiya",
    "surahNameArabic": "الغاشية",
    "surahNameArabicLong": "سورة الغاشية",
    "surahNameTranslation": "The Overwhelming",
    "revelationPlace": "Mecca",
    "totalAyah": 26,
    "startPage": 592
  },
  {
    "id": 89,
    "surahName": "Al-Fajr",
    "surahNameArabic": "الفجر",
    "surahNameArabicLong": "سورة الفجر",
    "surahNameTranslation": "The Dawn",
    "revelationPlace": "Mecca",
    "totalAyah": 30,
    "startPage": 593
  },
  {
    "id": 90,
    "surahName": "Al-Balad",
    "surahNameArabic": "البلد",
    "surahNameArabicLong": "سورة البلد",
    "surahNameTranslation": "The City",
    "revelationPlace": "Mecca",
    "totalAyah": 20,
    "startPage": 594
  },
  {
    "id": 91,
    "surahName": "Ash-Shams",
    "surahNameArabic": "الشمس",
    "surahNameArabicLong": "سورة الشمس",
    "surahNameTranslation": "The Sun",
    "revelationPlace": "Mecca",
    "totalAyah": 15,
    "startPage": 595
  },
  {
    "id": 92,
    "surahName": "Al-Lail",
    "surahNameArabic": "الليل",
    "surahNameArabicLong": "سورة الليل",
    "surahNameTranslation": "The Night",
    "revelationPlace": "Mecca",
    "totalAyah": 21,
    "startPage": 595
  },
  {
    "id": 93,
    "surahName": "Ad-Dhuhaa",
    "surahNameArabic": "الضحى",
    "surahNameArabicLong": "سورة الضحى",
    "surahNameTranslation": "The Morning Hours",
    "revelationPlace": "Mecca",
    "totalAyah": 11,
    "startPage": 596
  },
  {
    "id": 94,
    "surahName": "Ash-Sharh",
    "surahNameArabic": "الشرح",
    "surahNameArabicLong": "سورة الشرح",
    "surahNameTranslation": "The Consolation",
    "revelationPlace": "Mecca",
    "totalAyah": 8,
    "startPage": 596
  },
  {
    "id": 95,
    "surahName": "At-Tin",
    "surahNameArabic": "التين",
    "surahNameArabicLong": "سورة التين",
    "surahNameTranslation": "The Fig",
    "revelationPlace": "Mecca",
    "totalAyah": 8,
    "startPage": 597
  },
  {
    "id": 96,
    "surahName": "Al-Alaq",
    "surahNameArabic": "العلق",
    "surahNameArabicLong": "سورة العلق",
    "surahNameTranslation": "The Clot",
    "revelationPlace": "Mecca",
    "totalAyah": 19,
    "startPage": 597
  },
  {
    "id": 97,
    "surahName": "Al-Qadr",
    "surahNameArabic": "القدر",
    "surahNameArabicLong": "سورة القدر",
    "surahNameTranslation": "The Power, Fate",
    "revelationPlace": "Mecca",
    "totalAyah": 5,
    "startPage": 598
  },
  {
    "id": 98,
    "surahName": "Al-Bayyina",
    "surahNameArabic": "البينة",
    "surahNameArabicLong": "سورة البينة",
    "surahNameTranslation": "The Evidence",
    "revelationPlace": "Madina",
    "totalAyah": 8,
    "startPage": 598
  },
  {
    "id": 99,
    "surahName": "Az-Zalzala",
    "surahNameArabic": "الزلزلة",
    "surahNameArabicLong": "سورة الزلزلة",
    "surahNameTranslation": "The Earthquake",
    "revelationPlace": "Madina",
    "totalAyah": 8,
    "startPage": 599
  },
  {
    "id": 100,
    "surahName": "Al-Aadiyaat",
    "surahNameArabic": "العاديات",
    "surahNameArabicLong": "سورة العاديات",
    "surahNameTranslation": "The Chargers",
    "revelationPlace": "Mecca",
    "totalAyah": 11,
    "startPage": 599
  },
  {
    "id": 101,
    "surahName": "Al-Qaari'a",
    "surahNameArabic": "القارعة",
    "surahNameArabicLong": "سورة القارعة",
    "surahNameTranslation": "The Calamity",
    "revelationPlace": "Mecca",
    "totalAyah": 11,
    "startPage": 600
  },
  {
    "id": 102,
    "surahName": "At-Takaathur",
    "surahNameArabic": "التكاثر",
    "surahNameArabicLong": "سورة التكاثر",
    "surahNameTranslation": "Competition",
    "revelationPlace": "Mecca",
    "totalAyah": 8,
    "startPage": 600
  },
  {
    "id": 103,
    "surahName": "Al-Asr",
    "surahNameArabic": "العصر",
    "surahNameArabicLong": "سورة العصر",
    "surahNameTranslation": "The Declining Day, Epoch",
    "revelationPlace": "Mecca",
    "totalAyah": 3,
    "startPage": 601
  },
  {
    "id": 104,
    "surahName": "Al-Humaza",
    "surahNameArabic": "الهمزة",
    "surahNameArabicLong": "سورة الهمزة",
    "surahNameTranslation": "The Traducer",
    "revelationPlace": "Mecca",
    "totalAyah": 9,
    "startPage": 601
  },
  {
    "id": 105,
    "surahName": "Al-Fil",
    "surahNameArabic": "الفيل",
    "surahNameArabicLong": "سورة الفيل",
    "surahNameTranslation": "The Elephant",
    "revelationPlace": "Mecca",
    "totalAyah": 5,
    "startPage": 601
  },
  {
    "id": 106,
    "surahName": "Quraish",
    "surahNameArabic": "قريش",
    "surahNameArabicLong": "سورة قريش",
    "surahNameTranslation": "Quraysh",
    "revelationPlace": "Mecca",
    "totalAyah": 4,
    "startPage": 602
  },
  {
    "id": 107,
    "surahName": "Al-Maa'un",
    "surahNameArabic": "الماعون",
    "surahNameArabicLong": "سورة الماعون",
    "surahNameTranslation": "Almsgiving",
    "revelationPlace": "Mecca",
    "totalAyah": 7,
    "startPage": 602
  },
  {
    "id": 108,
    "surahName": "Al-Kawthar",
    "surahNameArabic": "الكوثر",
    "surahNameArabicLong": "سورة الكوثر",
    "surahNameTranslation": "Abundance",
    "revelationPlace": "Mecca",
    "totalAyah": 3,
    "startPage": 602
  },
  {
    "id": 109,
    "surahName": "Al-Kaafiroon",
    "surahNameArabic": "الكافرون",
    "surahNameArabicLong": "سورة الكافرون",
    "surahNameTranslation": "The Disbelievers",
    "revelationPlace": "Mecca",
    "totalAyah": 6,
    "startPage": 603
  },
  {
    "id": 110,
    "surahName": "An-Nasr",
    "surahNameArabic": "النصر",
    "surahNameArabicLong": "سورة النصر",
    "surahNameTranslation": "Divine Support",
    "revelationPlace": "Madina",
    "totalAyah": 3,
    "startPage": 603
  },
  {
    "id": 111,
    "surahName": "Al-Masad",
    "surahNameArabic": "المسد",
    "surahNameArabicLong": "سورة المسد",
    "surahNameTranslation": "The Palm Fibre",
    "revelationPlace": "Mecca",
    "totalAyah": 5,
    "startPage": 603
  },
  {
    "id": 112,
    "surahName": "Al-Ikhlaas",
    "surahNameArabic": "الإخلاص",
    "surahNameArabicLong": "سورة الإخلاص",
    "surahNameTranslation": "Sincerity",
    "revelationPlace": "Mecca",
    "totalAyah": 4,
    "startPage": 604
  },
  {
    "id": 113,
    "surahName": "Al-Falaq",
    "surahNameArabic": "الفلق",
    "surahNameArabicLong": "سورة الفلق",
    "surahNameTranslation": "The Dawn",
    "revelationPlace": "Mecca",
    "totalAyah": 5,
    "startPage": 604
  },
  {
    "id": 114,
    "surahName": "An-Naas",
    "surahNameArabic": "الناس",
    "surahNameArabicLong": "سورة الناس",
    "surahNameTranslation": "Mankind",
    "revelationPlace": "Mecca",
    "totalAyah": 6,
    "startPage": 604
  }
];
