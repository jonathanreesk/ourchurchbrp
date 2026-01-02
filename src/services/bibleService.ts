import { BibleVersion } from '../types';

const BIBLE_API_KEY = import.meta.env.VITE_BIBLE_API_KEY;

const BIBLE_API_VERSIONS: Record<BibleVersion, string> = {
  'ESV': 'de4e12af7f28f599-02',
  'NIV': '78a9f6124f344018-01',
  'NLT': '7142879509583d59-04'
};

async function fetchPassage(reference: string, version: BibleVersion): Promise<string> {
  if (!BIBLE_API_KEY || BIBLE_API_KEY === 'your_api_bible_key_here') {
    return `📖 ${reference}\n\n[Get your free API key from https://scripture.api.bible to view Bible text]`;
  }

  try {
    const versionId = BIBLE_API_VERSIONS[version];
    const cleanRef = reference.trim().replace(/\s+/g, '%20');

    const response = await fetch(
      `https://api.scripture.api.bible/v1/bibles/${versionId}/search?query=${cleanRef}&limit=1`,
      {
        headers: {
          'api-key': BIBLE_API_KEY,
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      return `Unable to load ${reference}`;
    }

    const data = await response.json();

    if (data.data?.passages && data.data.passages.length > 0) {
      const text = data.data.passages[0].content
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      return text || `${reference} text not available`;
    }

    return `${reference} text not available`;
  } catch (error) {
    console.error('Error fetching passage:', error);
    return `Error loading ${reference}`;
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
