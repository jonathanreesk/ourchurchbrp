import { BibleVersion } from '../types';

// Book name mapping for common abbreviations
const BOOK_MAPPINGS: Record<string, string> = {
  // Old Testament
  'Gen': 'Genesis', 'Ex': 'Exodus', 'Exod': 'Exodus', 'Lev': 'Leviticus',
  'Num': 'Numbers', 'Deut': 'Deuteronomy', 'Josh': 'Joshua', 'Judg': 'Judges',
  '1 Sam': '1 Samuel', '2 Sam': '2 Samuel', '1 Kgs': '1 Kings', '2 Kgs': '2 Kings',
  '1 Chr': '1 Chronicles', '2 Chr': '2 Chronicles', 'Neh': 'Nehemiah',
  'Ps': 'Psalm', 'Prov': 'Proverbs', 'Eccl': 'Ecclesiastes', 'Ecc': 'Ecclesiastes',
  'Song': 'Song Of Solomon', 'Isa': 'Isaiah', 'Jer': 'Jeremiah', 'Lam': 'Lamentations',
  'Ezek': 'Ezekiel', 'Dan': 'Daniel', 'Hos': 'Hosea', 'Obad': 'Obadiah',
  'Jon': 'Jonah', 'Mic': 'Micah', 'Nah': 'Nahum', 'Hab': 'Habakkuk',
  'Zeph': 'Zephaniah', 'Hag': 'Haggai', 'Zech': 'Zechariah', 'Mal': 'Malachi',

  // New Testament
  'Matt': 'Matthew', 'Mt': 'Matthew', 'Mk': 'Mark', 'Lk': 'Luke', 'Jn': 'John',
  'Rom': 'Romans', '1 Cor': '1 Corinthians', '2 Cor': '2 Corinthians',
  'Gal': 'Galatians', 'Eph': 'Ephesians', 'Phil': 'Philippians', 'Col': 'Colossians',
  '1 Thess': '1 Thessalonians', '2 Thess': '2 Thessalonians',
  '1 Tim': '1 Timothy', '2 Tim': '2 Timothy', 'Tit': 'Titus', 'Phlm': 'Philemon',
  'Heb': 'Hebrews', 'Jas': 'James', 'Jam': 'James', '1 Pet': '1 Peter',
  '2 Pet': '2 Peter', '1 Jn': '1 John', '2 Jn': '2 John', '3 Jn': '3 John',
  'Rev': 'Revelation'
};

// Cache for loaded Bible JSON files
const bibleCache: Record<BibleVersion, any> = {} as Record<BibleVersion, any>;

async function loadBibleVersion(version: BibleVersion): Promise<any> {
  if (bibleCache[version]) {
    return bibleCache[version];
  }

  try {
    const response = await fetch(`/bible/${version}_bible.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${version} Bible`);
    }
    const data = await response.json();
    bibleCache[version] = data;
    return data;
  } catch (error) {
    console.error(`Error loading ${version} Bible:`, error);
    throw error;
  }
}

function parseReference(reference: string): { book: string; chapter: string; verses?: string } | null {
  // Clean up the reference
  const cleaned = reference.trim();

  // Match patterns like "Gen 1", "2 Tim 2", "Ecc 5", "John 3:16", "Gen 1:1-10"
  const match = cleaned.match(/^([\d\s]*[A-Za-z]+)\s+(\d+)(?::(\d+(?:-\d+)?))?$/);

  if (!match) {
    console.error('Could not parse reference:', cleaned);
    return null;
  }

  let [, bookPart, chapter, verses] = match;
  bookPart = bookPart.trim();

  // Try to find the full book name
  let bookName = bookPart;

  // Check if it's an abbreviation
  if (BOOK_MAPPINGS[bookPart]) {
    bookName = BOOK_MAPPINGS[bookPart];
  }

  return { book: bookName, chapter, verses };
}

async function fetchPassage(reference: string, version: BibleVersion): Promise<string> {
  try {
    const bibleData = await loadBibleVersion(version);
    const parsed = parseReference(reference);

    if (!parsed) {
      return `Unable to parse reference: ${reference}`;
    }

    const { book, chapter, verses } = parsed;

    // Check if book exists
    if (!bibleData[book]) {
      console.error(`Book not found: ${book}`, 'Available:', Object.keys(bibleData).slice(0, 10));
      return `Book not found: ${book}`;
    }

    // Check if chapter exists
    if (!bibleData[book][chapter]) {
      return `Chapter ${chapter} not found in ${book}`;
    }

    const chapterData = bibleData[book][chapter];
    let formattedText = '';

    if (verses) {
      // Specific verse or range
      if (verses.includes('-')) {
        const [start, end] = verses.split('-').map(Number);
        for (let v = start; v <= end; v++) {
          const verseText = chapterData[v.toString()];
          if (verseText) {
            formattedText += `${v} ${verseText}\n`;
          }
        }
      } else {
        // Single verse
        const verseText = chapterData[verses];
        if (verseText) {
          formattedText = `${verses} ${verseText}`;
        }
      }
    } else {
      // Whole chapter
      const verseNumbers = Object.keys(chapterData).sort((a, b) => Number(a) - Number(b));
      for (const verseNum of verseNumbers) {
        formattedText += `${verseNum} ${chapterData[verseNum]}\n`;
      }
    }

    return formattedText.trim() || `${reference} not found`;
  } catch (error) {
    console.error('Error fetching passage:', error);
    return `Error loading ${reference}: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

export async function fetchReadingPassages(
  reading: string,
  version: BibleVersion
): Promise<Array<{ reference: string; text: string }>> {
  const passages = reading.split(';').map(r => r.trim());

  const results = await Promise.all(
    passages.map(async (passage) => ({
      reference: passage,
      text: await fetchPassage(passage, version)
    }))
  );

  return results;
}
