import { useState } from "react";
import { Volume2, ChevronLeft, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { speak } from "../utils/speak";

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
    title: "Lesson 8: Yaa (Long 'ee')",
    subtitle: "تَدْرِيبَات",
    desc: "Practice Kasra with Yaa elongation.",
    words: [
      { text: "إِي", phonetic: "ee" },
      { text: "بِي", phonetic: "bee" },
      { text: "تِي", phonetic: "tee" },
      { text: "ثِي", phonetic: "thee" },
      { text: "جِي", phonetic: "jee" },
      { text: "حِي", phonetic: "hee" },
      { text: "خِي", phonetic: "khee" },
      { text: "دِي", phonetic: "dee" },
      { text: "ذِي", phonetic: "dhee" },
      { text: "رِي", phonetic: "ree" },
      { text: "زِي", phonetic: "zee" },
      { text: "سِي", phonetic: "see" },
      { text: "شِي", phonetic: "shee" },
      { text: "صِي", phonetic: "see" },
      { text: "ضِي", phonetic: "dee" },
      { text: "طِي", phonetic: "tee" },
      { text: "ظِي", phonetic: "zee" },
      { text: "عِي", phonetic: "ee" },
      { text: "غِي", phonetic: "ghee" },
      { text: "فِي", phonetic: "fee" },
      { text: "قِي", phonetic: "qee" },
      { text: "كِي", phonetic: "kee" },
      { text: "لِي", phonetic: "lee" },
      { text: "مِي", phonetic: "mee" },
      { text: "نِي", phonetic: "nee" },
      { text: "وِي", phonetic: "wee" },
      { text: "هِي", phonetic: "hee" },
      { text: "لَاءِي", phonetic: "laa-ee" },
      { text: "يِي", phonetic: "yee" }
    ]
  },
  {
    id: 9,
    title: "Lesson 9: Diphthongs & Long Vowels",
    subtitle: "تَدْرِيبَات",
    desc: "Practice combinations of letters with Alif, Waw, Yaa ending with Noon Sukun (aan, awn, ayn, een).",
    words: [
      { text: "اَنْ", phonetic: "an" },
      { text: "بَانْ", phonetic: "baan" }, { text: "بَوْنْ", phonetic: "bawn" }, { text: "بَيْنْ", phonetic: "bayn" }, { text: "بِينْ", phonetic: "been" },
      { text: "تَانْ", phonetic: "taan" }, { text: "تَوْنْ", phonetic: "tawn" }, { text: "تَيْنْ", phonetic: "tayn" }, { text: "تِينْ", phonetic: "teen" },
      { text: "ثَانْ", phonetic: "thaan" }, { text: "ثَوْنْ", phonetic: "thawn" }, { text: "ثَيْنْ", phonetic: "thayn" }, { text: "ثِينْ", phonetic: "theen" },
      { text: "جَانْ", phonetic: "jaan" }, { text: "جَوْنْ", phonetic: "jawn" }, { text: "جَيْنْ", phonetic: "jayn" }, { text: "جِينْ", phonetic: "jeen" },
      { text: "حَانْ", phonetic: "haan" }, { text: "حَوْنْ", phonetic: "hawn" }, { text: "حَيْنْ", phonetic: "hayn" }, { text: "حِينْ", phonetic: "heen" },
      { text: "خَانْ", phonetic: "khaan" }, { text: "خَوْنْ", phonetic: "khawn" }, { text: "خَيْنْ", phonetic: "khayn" }, { text: "خِينْ", phonetic: "kheen" },
      { text: "دَانْ", phonetic: "daan" }, { text: "دَوْنْ", phonetic: "dawn" }, { text: "دَيْنْ", phonetic: "dayn" }, { text: "دِينْ", phonetic: "deen" },
      { text: "ذَانْ", phonetic: "dhaan" }, { text: "ذَوْنْ", phonetic: "dhawn" }, { text: "ذَيْنْ", phonetic: "dhayn" }, { text: "ذِينْ", phonetic: "dheen" },
      { text: "رَانْ", phonetic: "raan" }, { text: "رَوْنْ", phonetic: "rawn" }, { text: "رَيْنْ", phonetic: "rayn" }, { text: "رِينْ", phonetic: "reen" },
      { text: "زَانْ", phonetic: "zaan" }, { text: "زَوْنْ", phonetic: "zawn" }, { text: "زَيْنْ", phonetic: "zayn" }, { text: "زِينْ", phonetic: "zeen" },
      { text: "سَانْ", phonetic: "saan" }, { text: "سَوْنْ", phonetic: "sawn" }, { text: "سَيْنْ", phonetic: "sayn" }, { text: "سِينْ", phonetic: "seen" },
      { text: "شَانْ", phonetic: "shaan" }, { text: "شَوْنْ", phonetic: "shawn" }, { text: "شَيْنْ", phonetic: "shayn" }, { text: "شِينْ", phonetic: "sheen" },
      { text: "صَانْ", phonetic: "saan" }, { text: "صَوْنْ", phonetic: "sawn" }, { text: "صَيْنْ", phonetic: "sayn" }, { text: "صِينْ", phonetic: "seen" },
      { text: "ضَانْ", phonetic: "daan" }, { text: "ضَوْنْ", phonetic: "dawn" }, { text: "ضَيْنْ", phonetic: "dayn" }, { text: "ضِينْ", phonetic: "deen" },
      { text: "طَانْ", phonetic: "taan" }, { text: "طَوْنْ", phonetic: "tawn" }, { text: "طَيْنْ", phonetic: "tayn" }, { text: "طِينْ", phonetic: "teen" },
      { text: "ظَانْ", phonetic: "zaan" }, { text: "ظَوْنْ", phonetic: "zawn" }, { text: "ظَيْنْ", phonetic: "zayn" }, { text: "ظِينْ", phonetic: "zeen" },
      { text: "عَانْ", phonetic: "aan" }, { text: "عَوْنْ", phonetic: "awn" }, { text: "عَيْنْ", phonetic: "ayn" }, { text: "عِينْ", phonetic: "een" },
      { text: "غَانْ", phonetic: "ghaan" }, { text: "غَوْنْ", phonetic: "ghawn" }, { text: "غَيْنْ", phonetic: "ghayn" }, { text: "غِينْ", phonetic: "gheen" },
      { text: "فَانْ", phonetic: "faan" }, { text: "فَوْنْ", phonetic: "fawn" }, { text: "فَيْنْ", phonetic: "fayn" }, { text: "فِينْ", phonetic: "feen" },
      { text: "قَانْ", phonetic: "qaan" }, { text: "قَوْنْ", phonetic: "qawn" }, { text: "قَيْنْ", phonetic: "qayn" }, { text: "قِينْ", phonetic: "qeen" },
      { text: "كَانْ", phonetic: "kaan" }, { text: "كَوْنْ", phonetic: "kawn" }, { text: "كَيْنْ", phonetic: "kayn" }, { text: "كِينْ", phonetic: "keen" },
      { text: "لَانْ", phonetic: "laan" }, { text: "لَوْنْ", phonetic: "lawn" }, { text: "لَيْنْ", phonetic: "layn" }, { text: "لِينْ", phonetic: "leen" },
      { text: "مَانْ", phonetic: "maan" }, { text: "مَوْنْ", phonetic: "mawn" }, { text: "مَيْنْ", phonetic: "mayn" }, { text: "مِينْ", phonetic: "meen" },
      { text: "نَانْ", phonetic: "naan" }, { text: "نَوْنْ", phonetic: "nawn" }, { text: "نَيْنْ", phonetic: "nayn" }, { text: "نِينْ", phonetic: "neen" },
      { text: "وَانْ", phonetic: "waan" }, { text: "وَوْنْ", phonetic: "wawn" }, { text: "وَيْنْ", phonetic: "wayn" }, { text: "وِينْ", phonetic: "ween" },
      { text: "هَانْ", phonetic: "haan" }, { text: "هَوْنْ", phonetic: "hawn" }, { text: "هَيْنْ", phonetic: "hayn" }, { text: "هِينْ", phonetic: "heen" },
      { text: "يَانْ", phonetic: "yaan" }, { text: "يَوْنْ", phonetic: "yawn" }, { text: "يَيْنْ", phonetic: "yayn" }, { text: "يِينْ", phonetic: "yeen" }
    ]
  },
  {
    id: 10,
    title: "Lesson 10: Mixed Syllables",
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
    id: 11,
    title: "Lesson 11: Joining 1",
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
    id: 12,
    title: "Lesson 12: Joining 2",
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
    id: 13,
    title: "Lesson 13: Practice",
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
    id: 14,
    title: "Lesson 14: Phrases",
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
    id: 15,
    title: "Lesson 15: More Words",
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

  const currentLesson = QAIDA_LESSONS.find(l => l.id === activeLessonId);

  const selectWord = (wordObj) => {
    setActiveWord(wordObj);
    speak(wordObj.text);
  };

  const completeLesson = () => {
    // Mark as complete
    if (!completedLessons.includes(activeLessonId)) {
      const nextProgress = [...completedLessons, activeLessonId];
      setCompletedLessons(nextProgress);
      try {
        localStorage.setItem("deeni_qaida_progress", JSON.stringify(nextProgress));
      } catch {
        // ignore
      }
    }

    // Go to next lesson
    if (activeLessonId < QAIDA_LESSONS.length) {
      setActiveLessonId(activeLessonId + 1);
      setActiveWord(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
        className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-b-2xl p-6 shadow-sm active:scale-[0.99] transition-transform group flex flex-col items-center justify-center"
      >
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="border border-emerald-400/30 px-8 py-3 rounded bg-emerald-900/20 backdrop-blur-sm">
          <span className="text-4xl sm:text-5xl font-arabic font-extrabold tracking-widest drop-shadow-sm text-emerald-50">وَالسَّلَام</span>
        </div>
        <span className="text-emerald-100/70 text-[11px] font-bold uppercase mt-3 tracking-widest group-hover:text-white transition-colors">
          Tap when finished with this page
        </span>
      </button>

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
