import { useState, useEffect } from "react";
import { Volume2, ChevronLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { speak } from "../utils/speak";
import { useQaidaProgress } from "../hooks/useQaidaProgress";

// ── Complete Linear Qaida Curriculum ─────────────────────────
const QAIDA_LESSONS = [
  {
    id: 1,
    title: "Lesson 1: Alphabet",
    subtitle: "حُرُوف الهِجَائِيَّة",
    desc: "Learn the isolated Arabic letters.",
    words: [
      { text: "ا", phonetic: "alif" },
      { text: "ب", phonetic: "baa" },
      { text: "ت", phonetic: "taa" },
      { text: "ث", phonetic: "thaa" },
      { text: "ج", phonetic: "jeem" },
      { text: "ح", phonetic: "haa" },
      { text: "خ", phonetic: "khaa" },
      { text: "د", phonetic: "daal" },
      { text: "ذ", phonetic: "dhaal" },
      { text: "ر", phonetic: "raa" },
      { text: "ز", phonetic: "zaa" },
      { text: "س", phonetic: "seen" },
      { text: "ش", phonetic: "sheen" },
      { text: "ص", phonetic: "saad" },
      { text: "ض", phonetic: "daad" },
      { text: "ط", phonetic: "taa" },
      { text: "ظ", phonetic: "zhaa" },
      { text: "ع", phonetic: "ayn" },
      { text: "غ", phonetic: "ghayn" },
      { text: "ف", phonetic: "faa" },
      { text: "ق", phonetic: "qaaf" },
      { text: "ك", phonetic: "kaaf" },
      { text: "ل", phonetic: "laam" },
      { text: "م", phonetic: "meem" },
      { text: "ن", phonetic: "noon" },
      { text: "و", phonetic: "waaw" },
      { text: "ه", phonetic: "haa" },
      { text: "لا", phonetic: "laam alif" },
      { text: "ء", phonetic: "hamza" },
      { text: "ي", phonetic: "yaa" }
    ]
  },
  {
    id: 2,
    title: "Lesson 2: Fatha",
    subtitle: "حَرَكَة الفَتْحَة",
    desc: "Letters with the Fatha (short 'a') mark.",
    words: [
      { text: "اَ", phonetic: "a" },
      { text: "بَ", phonetic: "ba" },
      { text: "تَ", phonetic: "ta" },
      { text: "ثَ", phonetic: "tha" },
      { text: "جَ", phonetic: "ja" },
      { text: "حَ", phonetic: "ha" },
      { text: "خَ", phonetic: "kha" },
      { text: "دَ", phonetic: "da" },
      { text: "ذَ", phonetic: "dha" },
      { text: "رَ", phonetic: "ra" },
      { text: "زَ", phonetic: "za" },
      { text: "سَ", phonetic: "sa" },
      { text: "شَ", phonetic: "sha" },
      { text: "صَ", phonetic: "sa" },
      { text: "ضَ", phonetic: "da" },
      { text: "طَ", phonetic: "ta" },
      { text: "ظَ", phonetic: "za" },
      { text: "عَ", phonetic: "a" },
      { text: "غَ", phonetic: "gha" },
      { text: "فَ", phonetic: "fa" },
      { text: "قَ", phonetic: "qa" },
      { text: "كَ", phonetic: "ka" },
      { text: "لَ", phonetic: "la" },
      { text: "مَ", phonetic: "ma" },
      { text: "نَ", phonetic: "na" },
      { text: "وَ", phonetic: "wa" },
      { text: "هَ", phonetic: "ha" },
      { text: "لاَ", phonetic: "laa" },
      { text: "ءَ", phonetic: "a" },
      { text: "يَ", phonetic: "ya" }
    ]
  },
  {
    id: 3,
    title: "Lesson 3: Kasra",
    subtitle: "حَرَكَة الكَسْرَة",
    desc: "Letters with the Kasra (short 'i') mark.",
    words: [
      { text: "اِ", phonetic: "i" },
      { text: "بِ", phonetic: "bi" },
      { text: "تِ", phonetic: "ti" },
      { text: "ثِ", phonetic: "thi" },
      { text: "جِ", phonetic: "ji" },
      { text: "حِ", phonetic: "hi" },
      { text: "خِ", phonetic: "khi" },
      { text: "دِ", phonetic: "di" },
      { text: "ذِ", phonetic: "dhi" },
      { text: "رِ", phonetic: "ri" },
      { text: "زِ", phonetic: "zi" },
      { text: "سِ", phonetic: "si" },
      { text: "شِ", phonetic: "shi" },
      { text: "صِ", phonetic: "si" },
      { text: "ضِ", phonetic: "di" },
      { text: "طِ", phonetic: "ti" },
      { text: "ظِ", phonetic: "zi" },
      { text: "عِ", phonetic: "i" },
      { text: "غِ", phonetic: "ghi" },
      { text: "فِ", phonetic: "fi" },
      { text: "قِ", phonetic: "qi" },
      { text: "كِ", phonetic: "ki" },
      { text: "لِ", phonetic: "li" },
      { text: "مِ", phonetic: "mi" },
      { text: "نِ", phonetic: "ni" },
      { text: "وِ", phonetic: "wi" },
      { text: "هِ", phonetic: "hi" },
      { text: "لاِ", phonetic: "li" },
      { text: "ءِ", phonetic: "i" },
      { text: "يِ", phonetic: "yi" }
    ]
  },
  {
    id: 4,
    title: "Lesson 4: Damma",
    subtitle: "حَرَكَة الضَّمَّة",
    desc: "Letters with the Damma (short 'u') mark.",
    words: [
      { text: "اُ", phonetic: "u" },
      { text: "بُ", phonetic: "bu" },
      { text: "تُ", phonetic: "tu" },
      { text: "ثُ", phonetic: "thu" },
      { text: "جُ", phonetic: "ju" },
      { text: "حُ", phonetic: "hu" },
      { text: "خُ", phonetic: "khu" },
      { text: "دُ", phonetic: "du" },
      { text: "ذُ", phonetic: "dhu" },
      { text: "رُ", phonetic: "ru" },
      { text: "زُ", phonetic: "zu" },
      { text: "سُ", phonetic: "su" },
      { text: "شُ", phonetic: "shu" },
      { text: "صُ", phonetic: "su" },
      { text: "ضُ", phonetic: "du" },
      { text: "طُ", phonetic: "tu" },
      { text: "ظُ", phonetic: "zu" },
      { text: "عُ", phonetic: "u" },
      { text: "غُ", phonetic: "ghu" },
      { text: "فُ", phonetic: "fu" },
      { text: "قُ", phonetic: "qu" },
      { text: "كُ", phonetic: "ku" },
      { text: "لُ", phonetic: "lu" },
      { text: "مُ", phonetic: "mu" },
      { text: "نُ", phonetic: "nu" },
      { text: "وُ", phonetic: "wu" },
      { text: "هُ", phonetic: "hu" },
      { text: "لاُ", phonetic: "lu" },
      { text: "ءُ", phonetic: "u" },
      { text: "يُ", phonetic: "yu" }
    ]
  },
  {
    id: 5,
    title: "Lesson 5: Vowels Mixed (Isolate)",
    subtitle: "تَدْرِيبَات",
    desc: "Read each letter with Fatha, Kasra, and Damma in sequence.",
    words: [
      { text: "أَ إِ أُ", phonetic: "a i u" },
      { text: "بَ بِ بُ", phonetic: "ba bi bu" },
      { text: "تَ تِ تُ", phonetic: "ta ti tu" },
      { text: "ثَ ثِ ثُ", phonetic: "tha thi thu" },
      { text: "جَ جِ جُ", phonetic: "ja ji ju" },
      { text: "حَ حِ حُ", phonetic: "ha hi hu" },
      { text: "خَ خِ خُ", phonetic: "kha khi khu" },
      { text: "دَ دِ دُ", phonetic: "da di du" },
      { text: "ذَ ذِ ذُ", phonetic: "dha dhi dhu" },
      { text: "رَ رِ رُ", phonetic: "ra ri ru" },
      { text: "زَ زِ زُ", phonetic: "za zi zu" },
      { text: "سَ سِ سُ", phonetic: "sa si su" },
      { text: "شَ شِ شُ", phonetic: "sha shi shu" },
      { text: "صَ صِ صُ", phonetic: "sa si su" },
      { text: "ضَ ضِ ضُ", phonetic: "da di du" },
      { text: "طَ طِ طُ", phonetic: "ta ti tu" },
      { text: "ظَ ظِ ظُ", phonetic: "za zi zu" },
      { text: "عَ عِ عُ", phonetic: "a i u" },
      { text: "غَ غِ غُ", phonetic: "gha ghi ghu" },
      { text: "فَ فِ فُ", phonetic: "fa fi fu" },
      { text: "قَ قِ قُ", phonetic: "qa qi qu" },
      { text: "كَ كِ كُ", phonetic: "ka ki ku" },
      { text: "لَ لِ لُ", phonetic: "la li lu" },
      { text: "مَ مِ مُ", phonetic: "ma mi mu" },
      { text: "نَ نِ نُ", phonetic: "na ni nu" },
      { text: "وَ وِ وُ", phonetic: "wa wi wu" },
      { text: "هَ هِ هُ", phonetic: "ha hi hu" },
      { text: "ءَ ءِ ءُ", phonetic: "a i u" },
      { text: "يَ يِ يُ", phonetic: "ya yi yu" }
    ]
  },
  {
    id: 6,
    title: "Lesson 6: Vowels Mixed (Joined)",
    subtitle: "تَدْرِيبَات",
    desc: "Read the same mixed vowels, but notice how the letters connect to one another.",
    words: [
      { text: "آإِأُ", phonetic: "a i u" },
      { text: "بَبِبُ", phonetic: "ba bi bu" },
      { text: "تَتِتُ", phonetic: "ta ti tu" },
      { text: "ثَثِثُ", phonetic: "tha thi thu" },
      { text: "جَجِجُ", phonetic: "ja ji ju" },
      { text: "حَحِحُ", phonetic: "ha hi hu" },
      { text: "خَخِخُ", phonetic: "kha khi khu" },
      { text: "دَدِدُ", phonetic: "da di du" },
      { text: "ذَذِذُ", phonetic: "dha dhi dhu" },
      { text: "رَرِرُ", phonetic: "ra ri ru" },
      { text: "زَزِزُ", phonetic: "za zi zu" },
      { text: "سَسِسُ", phonetic: "sa si su" },
      { text: "شَشِشُ", phonetic: "sha shi shu" },
      { text: "صَصِصُ", phonetic: "sa si su" },
      { text: "ضَضِضُ", phonetic: "da di du" },
      { text: "طَطِطُ", phonetic: "ta ti tu" },
      { text: "ظَظِظُ", phonetic: "za zi zu" },
      { text: "عَعِعُ", phonetic: "a i u" },
      { text: "غَغِغُ", phonetic: "gha ghi ghu" },
      { text: "فَفِفُ", phonetic: "fa fi fu" },
      { text: "قَقِقُ", phonetic: "qa qi qu" },
      { text: "كَكِكُ", phonetic: "ka ki ku" },
      { text: "لَلِلُ", phonetic: "la li lu" },
      { text: "مَمِمُ", phonetic: "ma mi mu" },
      { text: "نَنِنُ", phonetic: "na ni nu" },
      { text: "وَوِوُ", phonetic: "wa wi wu" },
      { text: "هَهْهُ", phonetic: "ha hi hu" },
      { text: "ءَئِؤُ", phonetic: "a i u" },
      { text: "يَيِيُ", phonetic: "ya yi yu" }
    ]
  },
  {
    id: 7,
    title: "Lesson 7: Lam-Alif Joining",
    subtitle: "تَدْرِيبَات",
    desc: "Practice connecting letters to Lam-Alif (لا).",
    words: [
      { text: "أَلَا", phonetic: "a-laa" },
      { text: "بَلَا", phonetic: "ba-laa" },
      { text: "تَلَا", phonetic: "ta-laa" },
      { text: "ثَلَا", phonetic: "tha-laa" },
      { text: "جَلَا", phonetic: "ja-laa" },
      { text: "حَلَا", phonetic: "ha-laa" },
      { text: "خَلَا", phonetic: "kha-laa" },
      { text: "دَلَا", phonetic: "da-laa" },
      { text: "ذَلَا", phonetic: "dha-laa" },
      { text: "رَلَا", phonetic: "ra-laa" },
      { text: "زَلَا", phonetic: "za-laa" },
      { text: "سَلَا", phonetic: "sa-laa" },
      { text: "شَلَا", phonetic: "sha-laa" },
      { text: "صَلَا", phonetic: "sa-laa" },
      { text: "ضَلَا", phonetic: "da-laa" },
      { text: "طَلَا", phonetic: "ta-laa" },
      { text: "ظَلَا", phonetic: "za-laa" },
      { text: "عَلَا", phonetic: "a-laa" },
      { text: "غَلَا", phonetic: "gha-laa" },
      { text: "فَلَا", phonetic: "fa-laa" },
      { text: "قَلَا", phonetic: "qa-laa" },
      { text: "كَلَا", phonetic: "ka-laa" },
      { text: "لَلَا", phonetic: "la-laa" },
      { text: "مَلَا", phonetic: "ma-laa" },
      { text: "نَلَا", phonetic: "na-laa" },
      { text: "وَلَا", phonetic: "wa-laa" },
      { text: "هَلَا", phonetic: "ha-laa" },
      { text: "لَاءِ", phonetic: "laa-e" },
      { text: "يَلَا", phonetic: "ya-laa" }
    ]
  },
  {
    id: 8,
    title: "Lesson 8: Nun Shadda Kasra ('nnee')",
    subtitle: "تَدْرِيبَات",
    desc: "Practice identifying the 'nnee' sound (Nun with Shadda and Kasra).",
    words: [
      { text: "إِنِّي", phonetic: "innee" },
      { text: "بِنِّي", phonetic: "binnee" },
      { text: "تِنِّي", phonetic: "tinnee" },
      { text: "ثِنِّي", phonetic: "thinnee" },
      { text: "جِنِّي", phonetic: "jinnee" },
      { text: "حِنِّي", phonetic: "hinnee" },
      { text: "خِنِّي", phonetic: "khinnee" },
      { text: "دِنِّي", phonetic: "dinnee" },
      { text: "ذِنِّي", phonetic: "dhinnee" },
      { text: "رِنِّي", phonetic: "rinnee" },
      { text: "زِنِّي", phonetic: "zinnee" },
      { text: "سِنِّي", phonetic: "sinnee" },
      { text: "شِنِّي", phonetic: "shinnee" },
      { text: "صِنِّي", phonetic: "sinnee" },
      { text: "ضِنِّي", phonetic: "dinnee" },
      { text: "طِنِّي", phonetic: "tinnee" },
      { text: "ظِنِّي", phonetic: "zinnee" },
      { text: "عِنِّي", phonetic: "innee" },
      { text: "غِنِّي", phonetic: "ghinnee" },
      { text: "فِنِّي", phonetic: "finnee" },
      { text: "قِنِّي", phonetic: "qinnee" },
      { text: "كِنِّي", phonetic: "kinnee" },
      { text: "لِنِّي", phonetic: "linnee" },
      { text: "مِنِّي", phonetic: "minnee" },
      { text: "نِنِّي", phonetic: "ninnee" },
      { text: "وَنِّي", phonetic: "wannee" },
      { text: "هِنِّي", phonetic: "hinnee" },
      { text: "لَاءِنِّي", phonetic: "laa-innee" },
      { text: "يِنِّي", phonetic: "yinnee" }
    ]
  },
  {
    id: 9,
    title: "Lesson 9: Long Vowels & Diphthongs + Na",
    subtitle: "تَدْرِيبَات",
    desc: "Practice combinations of letters with Alif, Waw, Yaa ending with Noon Fatha (aana, awna, ayna, eena, oona).",
    words: [
      { text: "آَنَ", phonetic: "aana" }, { text: "أَوْنَ", phonetic: "awna" }, { text: "أَيْنَ", phonetic: "ayna" }, { text: "إِينَ", phonetic: "eena" }, { text: "أُونَ", phonetic: "oona" },
      { text: "بَانَ", phonetic: "baana" }, { text: "بَوْنَ", phonetic: "bawna" }, { text: "بَيْنَ", phonetic: "bayna" }, { text: "بِينَ", phonetic: "beena" }, { text: "بُونَ", phonetic: "boona" },
      { text: "تَانَ", phonetic: "taana" }, { text: "تَوْنَ", phonetic: "tawna" }, { text: "تَيْنَ", phonetic: "tayna" }, { text: "تِينَ", phonetic: "teena" }, { text: "تُونَ", phonetic: "toona" },
      { text: "ثَانَ", phonetic: "thaana" }, { text: "ثَوْنَ", phonetic: "thawna" }, { text: "ثَيْنَ", phonetic: "thayna" }, { text: "ثِينَ", phonetic: "theena" }, { text: "ثُونَ", phonetic: "thoona" },
      { text: "جَانَ", phonetic: "jaana" }, { text: "جَوْنَ", phonetic: "jawna" }, { text: "جَيْنَ", phonetic: "jayna" }, { text: "جِينَ", phonetic: "jeena" }, { text: "جُونَ", phonetic: "joona" },
      { text: "حَانَ", phonetic: "haana" }, { text: "حَوْنَ", phonetic: "hawna" }, { text: "حَيْنَ", phonetic: "hayna" }, { text: "حِينَ", phonetic: "heena" }, { text: "حُونَ", phonetic: "hoona" },
      { text: "خَانَ", phonetic: "khaana" }, { text: "خَوْنَ", phonetic: "khawna" }, { text: "خَيْنَ", phonetic: "khayna" }, { text: "خِينَ", phonetic: "kheena" }, { text: "خُونَ", phonetic: "khoona" },
      { text: "دَانَ", phonetic: "daana" }, { text: "دَوْنَ", phonetic: "dawna" }, { text: "دَيْنَ", phonetic: "dayna" }, { text: "دِينَ", phonetic: "deena" }, { text: "دُونَ", phonetic: "doona" },
      { text: "ذَانَ", phonetic: "dhaana" }, { text: "ذَوْنَ", phonetic: "dhawna" }, { text: "ذَيْنَ", phonetic: "dhayna" }, { text: "ذِينَ", phonetic: "dheena" }, { text: "ذُونَ", phonetic: "dhoona" },
      { text: "رَانَ", phonetic: "raana" }, { text: "رَوْنَ", phonetic: "rawna" }, { text: "رَيْنَ", phonetic: "rayna" }, { text: "رِينَ", phonetic: "reena" }, { text: "رُونَ", phonetic: "roona" },
      { text: "زَانَ", phonetic: "zaana" }, { text: "زَوْنَ", phonetic: "zawna" }, { text: "زَيْنَ", phonetic: "zayna" }, { text: "زِينَ", phonetic: "zeena" }, { text: "زُونَ", phonetic: "zoona" },
      { text: "سَانَ", phonetic: "saana" }, { text: "سَوْنَ", phonetic: "sawna" }, { text: "سَيْنَ", phonetic: "sayna" }, { text: "سِينَ", phonetic: "seena" }, { text: "سُونَ", phonetic: "soona" },
      { text: "شَانَ", phonetic: "shaana" }, { text: "شَوْنَ", phonetic: "shawna" }, { text: "شَيْنَ", phonetic: "shayna" }, { text: "شِينَ", phonetic: "sheena" }, { text: "شُونَ", phonetic: "shoona" },
      { text: "صَانَ", phonetic: "saana" }, { text: "صَوْنَ", phonetic: "sawna" }, { text: "صَيْنَ", phonetic: "sayna" }, { text: "صِينَ", phonetic: "seena" }, { text: "صُونَ", phonetic: "soona" },
      { text: "ضَانَ", phonetic: "daana" }, { text: "ضَوْنَ", phonetic: "dawna" }, { text: "ضَيْنَ", phonetic: "dayna" }, { text: "ضِينَ", phonetic: "deena" }, { text: "ضُونَ", phonetic: "doona" },
      { text: "طَانَ", phonetic: "taana" }, { text: "طَوْنَ", phonetic: "tawna" }, { text: "طَيْنَ", phonetic: "tayna" }, { text: "طِينَ", phonetic: "teena" }, { text: "طُونَ", phonetic: "toona" },
      { text: "ظَانَ", phonetic: "zaana" }, { text: "ظَوْنَ", phonetic: "zawna" }, { text: "ظَيْنَ", phonetic: "zayna" }, { text: "ظِينَ", phonetic: "zeena" }, { text: "ظُونَ", phonetic: "zoona" },
      { text: "عَانَ", phonetic: "aana" }, { text: "عَوْنَ", phonetic: "awna" }, { text: "عَيْنَ", phonetic: "ayna" }, { text: "عِينَ", phonetic: "eena" }, { text: "عُونَ", phonetic: "oona" },
      { text: "غَانَ", phonetic: "ghaana" }, { text: "غَوْنَ", phonetic: "ghawna" }, { text: "غَيْنَ", phonetic: "ghayna" }, { text: "غِينَ", phonetic: "gheena" }, { text: "غُونَ", phonetic: "ghoona" },
      { text: "فَانَ", phonetic: "faana" }, { text: "فَوْنَ", phonetic: "fawna" }, { text: "فَيْنَ", phonetic: "fayna" }, { text: "فِينَ", phonetic: "feena" }, { text: "فُونَ", phonetic: "foona" },
      { text: "قَانَ", phonetic: "qaana" }, { text: "قَوْنَ", phonetic: "qawna" }, { text: "قَيْنَ", phonetic: "qayna" }, { text: "قِينَ", phonetic: "qeena" }, { text: "قُونَ", phonetic: "qoona" },
      { text: "كَانَ", phonetic: "kaana" }, { text: "كَوْنَ", phonetic: "kawna" }, { text: "كَيْنَ", phonetic: "kayna" }, { text: "كِينَ", phonetic: "keena" }, { text: "كُونَ", phonetic: "koona" },
      { text: "لَانَ", phonetic: "laana" }, { text: "لَوْنَ", phonetic: "lawna" }, { text: "لَيْنَ", phonetic: "layna" }, { text: "لِينَ", phonetic: "leena" }, { text: "لُونَ", phonetic: "loona" },
      { text: "مَانَ", phonetic: "maana" }, { text: "مَوْنَ", phonetic: "mawna" }, { text: "مَيْنَ", phonetic: "mayna" }, { text: "مِينَ", phonetic: "meena" }, { text: "مُونَ", phonetic: "moona" },
      { text: "نَانَ", phonetic: "naana" }, { text: "نَوْنَ", phonetic: "nawna" }, { text: "نَيْنَ", phonetic: "nayna" }, { text: "نِينَ", phonetic: "neena" }, { text: "نُونَ", phonetic: "noona" },
      { text: "وَانَ", phonetic: "waana" }, { text: "وَوْنَ", phonetic: "wawna" }, { text: "وَيْنَ", phonetic: "wayna" }, { text: "وِينَ", phonetic: "weena" }, { text: "وُونَ", phonetic: "woona" },
      { text: "هَانَ", phonetic: "haana" }, { text: "هَوْنَ", phonetic: "hawna" }, { text: "هَيْنَ", phonetic: "hayna" }, { text: "هِينَ", phonetic: "heena" }, { text: "هُونَ", phonetic: "hoona" },
      { text: "يَانَ", phonetic: "yaana" }, { text: "يَوْنَ", phonetic: "yawna" }, { text: "يَيْنَ", phonetic: "yayna" }, { text: "يِينَ", phonetic: "yeena" }, { text: "يُونَ", phonetic: "yoona" }
    ]
  },
  {
    id: 10,
    title: "Lesson 10: Joined Syllables (Waw/Yaa)",
    subtitle: "تَدْرِيبَات",
    desc: "Practice reading joined syllables with Waw and Yaa after the Walsalam.",
    words: [
      { text: "اِبْنَوْ", phonetic: "ibnaw" },
      { text: "زُوْ", phonetic: "zoo" },
      { text: "جَا", phonetic: "jaa" },
      { text: "خُوْ", phonetic: "khoo" },
      { text: "زُوْ", phonetic: "zoo" },
      { text: "زُبْ", phonetic: "zub" },
      { text: "رَبِّي", phonetic: "rabbee" },
      { text: "زَأْسُوْ", phonetic: "za'soo" },
      { text: "شَوْوِيْ", phonetic: "shawwee" },
      { text: "صَيْ", phonetic: "say" },
      { text: "طَا", phonetic: "taa" },
      { text: "ظُفْرُ", phonetic: "zufru" },
      { text: "مَغْوْ", phonetic: "maghw" },
      { text: "غَيْ", phonetic: "ghay" },
      { text: "بِنْ", phonetic: "bin" },
      { text: "قَوْ", phonetic: "qaw" },
      { text: "لَوْ", phonetic: "law" },
      { text: "بِيْ", phonetic: "bee" },
      { text: "رَا", phonetic: "raa" },
      { text: "مُوْهِيْ", phonetic: "moohee" },
      { text: "تَكْوَلَاءُ", phonetic: "takwalaa'u" },
      { text: "قَوْلَاءُ", phonetic: "qawlaa'u" },
      { text: "وَالسَّلَام", phonetic: "wassalaam" }
    ]
  },
  {
    id: 11,
    title: "Lesson 11: Joined Syllables & Phrases",
    subtitle: "تَدْرِيبَات",
    desc: "Practice reading joined syllables and short phrases after the Walsalam.",
    words: [
      { text: "اِبْزُوْ", phonetic: "ibzoo" },
      { text: "زُوْ", phonetic: "zoo" },
      { text: "جَا", phonetic: "jaa" },
      { text: "خُوْ", phonetic: "khoo" },
      { text: "زُوْ", phonetic: "zoo" },
      { text: "زُبْ", phonetic: "zub" },
      { text: "رَبِّي", phonetic: "rabbee" },
      { text: "زَأْسُوْ", phonetic: "za'soo" },
      { text: "شَوْوِيْ", phonetic: "shawwee" },
      { text: "صَيْ", phonetic: "say" },
      { text: "طَا", phonetic: "taa" },
      { text: "ظُفْرُ", phonetic: "zufru" },
      { text: "مَغْوْ", phonetic: "maghw" },
      { text: "غَيْ", phonetic: "ghay" },
      { text: "بِنْ", phonetic: "bin" },
      { text: "قَوْ", phonetic: "qaw" },
      { text: "لَوْ", phonetic: "law" },
      { text: "بِيْ", phonetic: "bee" },
      { text: "رَا", phonetic: "raa" },
      { text: "مُوْهِيْ", phonetic: "moohee" },
      { text: "تَكْوَلَاءُ", phonetic: "takwalaa'u" },
      { text: "قَوْلَاءُ", phonetic: "qawlaa'u" },
      { text: "وَالسَّلَام", phonetic: "wassalaam" },
      { text: "مَلِكِ النَّاسِ", phonetic: "malikin-naas" }
    ]
  },
  {
    id: 12,
    title: "Lesson 12: Mixed Syllables",
    subtitle: "تَدْرِيبَات",
    desc: "A mix of syllables to practice reading fluency.",
    words: [
      { text: "أَبُو", phonetic: "a-boo" },
      { text: "تُوتُ", phonetic: "too-tu" },
      { text: "ثِجِ", phonetic: "thi-ji" },
      { text: "حَاخُو", phonetic: "haa-khoo" },
      { text: "دُودِي", phonetic: "doo-dee" },
      { text: "رَيْزَا", phonetic: "ray-zaa" },
      { text: "سُوشُو", phonetic: "soo-shoo" },
      { text: "صِيضِي", phonetic: "see-dee" },
      { text: "طَاظُو", phonetic: "taa-zoo" },
      { text: "عُوغِي", phonetic: "oo-ghee" },
      { text: "فِقَا", phonetic: "fi-qaa" },
      { text: "كُولُو", phonetic: "koo-loo" },
      { text: "مِينِي", phonetic: "mee-nee" },
      { text: "وَاهُو", phonetic: "waa-hoo" },
      { text: "هِيلاَءُ", phonetic: "hee-laa-u" },
      { text: "يِ", phonetic: "yi" },
      { text: "مَلِكِ النَّاسِ", phonetic: "malikin-naas" },
      { text: "اِلَهِ النَّاسِ", phonetic: "ilaahin-naas" }
    ]
  },
  {
    id: 13,
    title: "Lesson 13: Joining 1",
    subtitle: "تَدْرِيبَات",
    desc: "Practice reading joined words with vowels.",
    words: [
      { text: "أَغْوَا", phonetic: "aghwa" },
      { text: "أَفْوَا", phonetic: "afwa" },
      { text: "أَقْوَا", phonetic: "aqwa" },
      { text: "أَكْوَا", phonetic: "akwa" },
      { text: "أَلْوَا", phonetic: "alwa" },
      { text: "أَمْوَا", phonetic: "amwa" },
      { text: "أَنْوَا", phonetic: "anwa" },
      { text: "أَوْوَا", phonetic: "awwa" },
      { text: "أَهْوَا", phonetic: "ahwa" },
      { text: "لَاء", phonetic: "laa" },
      { text: "أَيَّوَا", phonetic: "ayyawa" },
    ]
  },
  {
    id: 14,
    title: "Lesson 14: Joining 2",
    subtitle: "تَدْرِيبَات",
    desc: "More joined words.",
    words: [
      { text: "أَبِي", phonetic: "abi" },
      { text: "أَتِي", phonetic: "ati" },
      { text: "أَثِي", phonetic: "athi" },
      { text: "أَجِي", phonetic: "aji" },
      { text: "أَحِي", phonetic: "ahi" },
      { text: "أَخِي", phonetic: "akhi" },
      { text: "أَدِي", phonetic: "adi" },
      { text: "أَذِي", phonetic: "adhi" },
      { text: "أَرِي", phonetic: "ari" },
      { text: "أَزِي", phonetic: "azi" },
      { text: "أَسِي", phonetic: "asi" },
      { text: "أَشِي", phonetic: "ashi" },
      { text: "أَصِي", phonetic: "asi" },
      { text: "أَضِي", phonetic: "adi" },
      { text: "أَطِي", phonetic: "ati" },
      { text: "أَظِي", phonetic: "athi" },
      { text: "أَعِي", phonetic: "a'i" },
      { text: "أَغِي", phonetic: "aghi" },
      { text: "أَفِي", phonetic: "afi" },
      { text: "أَقِي", phonetic: "aqi" },
      { text: "أَكِي", phonetic: "aki" },
      { text: "أَلِي", phonetic: "ali" },
      { text: "أَمِي", phonetic: "ami" },
      { text: "أَنِي", phonetic: "ani" },
      { text: "أَوِي", phonetic: "awi" },
      { text: "هَوِي", phonetic: "hawi" },
      { text: "يَوِي", phonetic: "yawi" }
    ]
  },
  {
    id: 15,
    title: "Lesson 15: Practice",
    subtitle: "تَدْرِيبَات",
    desc: "Longer words and agreements.",
    words: [
      { text: "خَائِفُونَ", phonetic: "khaa-ifoon" },
      { text: "قَائِمُونَ", phonetic: "qaa-imoon" },
      { text: "غَافِلُونَ", phonetic: "ghaa-filoon" },
      { text: "حَاضِرُونَ", phonetic: "haa-diroon" },
      { text: "تَائِبُونَ", phonetic: "taa-iboon" },
      { text: "تَعْلَمُونَ", phonetic: "ta'lamoon" },
      { text: "يَعْقِلُونَ", phonetic: "ya'qiloon" },
      { text: "مَالِكُونَ", phonetic: "maa-likoon" },
      { text: "هَاشِمُونَ", phonetic: "haa-shimoon" },
      { text: "وَاسِعُونَ", phonetic: "waa-si'oon" },
      { text: "تَكْلِمُونَ", phonetic: "tak-limoon" },
      { text: "بَيْنَهُم", phonetic: "bay-nahum" }
    ]
  },
  {
    id: 16,
    title: "Lesson 16: Phrases",
    subtitle: "تَدْرِيبَات",
    desc: "Short sentences and phrases.",
    words: [
      { text: "ذَاكِرُونَ", phonetic: "dhaa-kiroon" },
      { text: "رَاشِدُونَ", phonetic: "raa-shidoon" },
      { text: "رَاهِبِينَ", phonetic: "raa-hibeen" },
      { text: "الْعَالَمِينَ", phonetic: "al-aalameen" },
      { text: "إنَّ اللَّهَ", phonetic: "innallaha" },
      { text: "غَفُورٌ رَّحِيمٌ", phonetic: "ghafoorun-raheem" }
    ]
  },
  {
    id: 17,
    title: "Lesson 17: More Words",
    subtitle: "تَدْرِيبَات",
    desc: "Additional spelling practice.",
    words: [
      { text: "قَلِيلٌ", phonetic: "qaleelun" },
      { text: "جَلِيلٌ", phonetic: "jaleelun" },
      { text: "عَلِيلٌ", phonetic: "aleelun" },
      { text: "رَفِيقٌ", phonetic: "rafeequn" },
      { text: "رَحِيقٌ", phonetic: "raheequn" },
      { text: "شَهِيقٌ", phonetic: "shaheequn" },
      { text: "عَمِيقٌ", phonetic: "ameequn" },
      { text: "مُعِينٌ", phonetic: "mu'eenun" },
      { text: "مَتِينٌ", phonetic: "mateenun" },
      { text: "أَمِينٌ", phonetic: "ameenun" },
      { text: "بَعِيدٌ", phonetic: "ba'eedun" },
      { text: "رَشِيدٌ", phonetic: "rasheedun" }
    ]
  }
];

export default function ArabicLearning() {
  const [activeLessonId, setActiveLessonId] = useState(1);
  const [activeWord, setActiveWord] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      const saved = localStorage.getItem("deeni_qaida_progress");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [txState, setTxState] = useState("idle"); // idle | pending | confirming | confirmed | error
  const [txError, setTxError] = useState(null);

  const { isConnected } = useAccount();
  const { completeLesson: recordOnChain, txHash, isPending, isConfirming, isConfirmed, error } = useQaidaProgress();

  // When the on-chain transaction confirms, mark the lesson complete locally and advance.
  // We depend on txHash (not just isConfirmed) so the effect fires on every new
  // transaction - otherwise isConfirmed stays true after the first lesson and the
  // page never auto-advances for subsequent lessons.
  useEffect(() => {
    if (!isConfirmed || !txHash) return;
    setTxState("confirmed");

    if (!completedLessons.includes(activeLessonId)) {
      const nextProgress = [...completedLessons, activeLessonId];
      setCompletedLessons(nextProgress);
      try {
        localStorage.setItem("deeni_qaida_progress", JSON.stringify(nextProgress));
      } catch {
        // ignore
      }
    }

    // Go to next lesson and refresh the page
    if (activeLessonId < QAIDA_LESSONS.length) {
      const nextId = activeLessonId + 1;
      setActiveLessonId(nextId);
      setActiveWord(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Force a full page reload so the new lesson loads fresh
      window.location.reload();
    }
  }, [isConfirmed, txHash]);

  // Surface write-contract errors
  useEffect(() => {
    if (!error) return;
    setTxState("error");
    setTxError(error);
  }, [error]);

  const currentLesson = QAIDA_LESSONS.find(l => l.id === activeLessonId);

  const selectWord = (wordObj) => {
    setActiveWord(wordObj);
    speak(wordObj.text);
  };

  const completeLesson = () => {
    if (isConnected) {
      // On-chain flow: trigger transaction, advance on confirmation
      setTxState("pending");
      setTxError(null);
      recordOnChain(activeLessonId);
    } else {
      // Fallback: local-only (no wallet connected)
      if (!completedLessons.includes(activeLessonId)) {
        const nextProgress = [...completedLessons, activeLessonId];
        setCompletedLessons(nextProgress);
        try {
          localStorage.setItem("deeni_qaida_progress", JSON.stringify(nextProgress));
        } catch {
          // ignore
        }
      }
      if (activeLessonId < QAIDA_LESSONS.length) {
        setActiveLessonId(activeLessonId + 1);
        setActiveWord(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="p-5 max-w-3xl mx-auto pt-6 pb-24">
      <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-emerald-600 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Home
      </Link>

      <h2 className="text-2xl font-extrabold text-emerald-800 mb-1">
        Learn to Read the Quran
      </h2>
      <p className="text-gray-500 text-sm mb-5">
        Follow the lessons exactly as they appear in the book. Finish each page by reading all words and tapping Walsalam.
      </p>

      {/* Lesson Selector Row */}
      <div className="flex overflow-x-auto gap-2 pb-3 mb-4 scrollbar-hide">
        {QAIDA_LESSONS.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => { setActiveLessonId(lesson.id); setActiveWord(null); }}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all ${activeLessonId === lesson.id
              ? "bg-emerald-600 text-white shadow-sm"
              : completedLessons.includes(lesson.id)
                ? "bg-emerald-100/50 text-emerald-700 border-emerald-200 border"
                : "bg-white text-gray-500 border border-gray-200"
              }`}
          >
            {completedLessons.includes(lesson.id) ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
                {lesson.id}
              </span>
            )}
            Lesson {lesson.id}
          </button>
        ))}
      </div>

      {/* Lesson Header */}
      <div className="mb-5 bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📖</span>
            <h3 className="text-lg font-bold text-emerald-800">{currentLesson.title}</h3>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{currentLesson.desc}</p>
        </div>
        <div className="text-2xl font-arabic text-emerald-500 hidden sm:block">
          {currentLesson.subtitle}
        </div>
      </div>

      {/* Practice Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3 bg-white p-4 sm:p-5 rounded-t-2xl shadow-sm border border-emerald-100 border-b-0" dir="rtl">
        {currentLesson.words.map((item, idx) => (
          <button
            key={idx}
            onClick={() => selectWord(item)}
            className={`bg-emerald-50/40 rounded-xl border p-3 flex flex-col items-center justify-center gap-1 transition-all active:scale-90 ${activeWord && activeWord.text === item.text
              ? "border-emerald-500 ring-2 ring-emerald-200 bg-emerald-100"
              : "border-emerald-100 hover:bg-emerald-100/60"
              }`}
          >
            <div className="text-3xl font-arabic text-emerald-800 leading-none">
              {item.text}
            </div>
            <div className="text-[9px] text-gray-400 italic font-sans mt-1" dir="ltr">
              {item.phonetic}
            </div>
          </button>
        ))}
      </div>

      {/* Walsalam Button Bottom Bar */}
      <button
        onClick={completeLesson}
        disabled={isPending || isConfirming}
        className={`w-full relative overflow-hidden rounded-b-2xl p-6 shadow-sm transition-all group flex flex-col items-center justify-center ${
          isPending || isConfirming
            ? "bg-gradient-to-r from-emerald-500 to-emerald-700 cursor-wait"
            : "bg-gradient-to-r from-emerald-600 to-emerald-800 active:scale-[0.99]"
        }`}
      >
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="border border-emerald-400/30 px-8 py-3 rounded bg-emerald-900/20 backdrop-blur-sm">
          {isPending || isConfirming ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-200" />
              <span className="text-lg font-bold text-emerald-100">
                {isPending ? "Confirm in wallet…" : "Recording on-chain…"}
              </span>
            </div>
          ) : (
            <span className="text-4xl sm:text-5xl font-arabic font-extrabold tracking-widest drop-shadow-sm text-emerald-50">وَالسَّلَام</span>
          )}
        </div>
        <span className="text-emerald-100/70 text-[11px] font-bold uppercase mt-3 tracking-widest group-hover:text-white transition-colors">
          {isPending || isConfirming
            ? "Please wait…"
            : isConnected
            ? "Sign on-chain to complete this lesson"
            : "Tap when finished with this page"}
        </span>
      </button>

      {/* Transaction error banner */}
      {txState === "error" && txError && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Transaction failed</p>
            <p className="text-xs text-red-500 mt-1">{txError.shortMessage || txError.message || "Unknown error"}</p>
            <button
              onClick={() => { setTxState("idle"); setTxError(null); }}
              className="mt-2 text-xs font-semibold text-red-600 underline hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Active Pronunciation Card */}
      {activeWord && (
        <div className="mt-6 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-3xl p-6 text-center animate-fade-up shadow-lg">
          <div className="text-7xl font-arabic mb-4 leading-none pt-2">
            {activeWord.text}
          </div>
          <div className="text-xl font-bold font-sans tracking-wide text-emerald-50">{activeWord.phonetic}</div>
          <button
            onClick={() => speak(activeWord.text)}
            className="mt-6 inline-flex items-center justify-center w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full transition-colors active:scale-90"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
