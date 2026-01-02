import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const readingPlanData = `
Th Jan 01 Ecc 3-4; 2 Tim 1
F Jan 02 Ecc 5; 2 Tim 2
M Jan 05 Ecc 6-7; Ps 125
T Jan 06 Ecc 8; 2 Tim 3
W Jan 07 Ecc 9-10
Th Jan 08 Ecc 11; 2 Tim 4
F Jan 09 Ecc 12; Ps 46
M Jan 12 1 Kings 12; 2 Chr 10-11
T Jan 13 1 Kings 13; Jude
W Jan 14 1 Kings 14; 2 Chr 12
Th Jan 15 1 Kings 15; 2 Chr 13-14
F Jan 16 2 Chr 15-16; 1 Kings 16
M Jan 19 1 Kings 17; Titus 1
T Jan 20 1 Kings 18; Titus 2
W Jan 21 Ps 119
Th Jan 22 Ps 47; Titus 3
F Jan 23 Philemon
M Jan 26 1 Kings 19; Ps 129
T Jan 27 1 Kings 20; Ps 20
W Jan 28 1 Kings 21; 2 Chr 17
Th Jan 29 1 Kings 22; 2 Chr 18
F Jan 30 2 Chr 19-20; Matt 1
M Feb 02 2 Kings 1; Matt 2
T Feb 03 2 Kings 2; Matt 3
W Feb 04 2 Kings 3; Ps 48
Th Feb 05 2 Kings 4-5; Matt 4
F Feb 06 2 Kings 6; Matt 5
M Feb 09 2 Kings 7; Matt 6
T Feb 10 2 Kings 8; 2 Chr 21
W Feb 11 2 Kings 9; Ps 49
Th Feb 12 2 Kings 10; Ps 131
F Feb 13 2 Chr 22-23
M Feb 16 2 Kings 11; Ps 50
T Feb 17 2 Chr 24; Matt 7
W Feb 18 2 Kings 12; Matt 8
Th Feb 19 Matt 9
F Feb 20 Joel; Matt 10
M Feb 23 Jonah
T Feb 24 2 Kings 13; Matt 11
W Feb 25 2 Kings 14; 2 Chr 25
Th Feb 26 Amos 1-2; Ps 53
F Feb 27 Amos 3-4
M Mar 02 Amos 5; Matt 12
T Mar 03 Amos 6; Ps 55
W Mar 04 Amos 7; Matt 13
Th Mar 05 Amos 8; Matt 14
F Mar 06 Amos 9; Matt 15
M Mar 09 Hos 1-2
T Mar 10 Hos 3; Matt 16
W Mar 11 Hos 4-5
Th Mar 12 Hos 6; Ps 58
F Mar 13 Hos 7-8; Matt 17
M Mar 16 Hos 9; Matt 18
T Mar 17 Hos 10-11
W Mar 18 Hos 12; Ps 61
Th Mar 19 Hos 13-14; Matt 19
F Mar 20 2 Chr 26-27; Matt 20
M Mar 23 2 Kings 15; Ps 9
T Mar 24 2 Kings 16
W Mar 25 Is 1-2; Matt 21
Th Mar 26 Is 3-4
F Mar 27 Is 5-6; Matt 22
M Mar 30 Mic 1-2; Matt 23
T Mar 31 Mic 3-4
W Apr 01 Mic 5; Ps 10
Th Apr 02 Mic 6; Matt 24
F Apr 03 Mic 7; Matt 25
M Apr 06 Is 7-8; Ps 22
T Apr 07 Is 9-10
W Apr 08 Is 11; Matt 26
Th Apr 09 Is 12-13; Ps 118
F Apr 10 Is 14; Matt 27
M Apr 13 Is 15-16
T Apr 14 Is 17-18; Ps 62
W Apr 15 Is 19; Matt 28
Th Apr 16 Is 20-21; 1 Cor 1
F Apr 17 Is 22; 1 Cor 2
M Apr 20 Is 23-24
T Apr 21 Is 25; 1 Cor 3
W Apr 22 Is 26-27; Ps 65
Th Apr 23 Is 28-29; 1 Cor 4
F Apr 24 Is 30; 1 Cor 5
M Apr 27 Is 31; 1 Cor 6
T Apr 28 Is 32-33
W Apr 29 Is 34; 1 Cor 7
Th Apr 30 Is 35; Ps 66
F May 01 2 Chr 28; 2 Kings 17
M May 04 2 Chr 29-30; 1 Cor 8
T May 05 2 Chr 31-32; 1 Cor 9
W May 06 2 Kings 18-19; Ps 67
Th May 07 Is 36; Ps 123
F May 08 Is 37; 1 Cor 10
M May 11 2 Kings 20; Ps 68
T May 12 Is 38-39
W May 13 Is 40; 1 Cor 11
Th May 14 Is 41-42; 1 Cor 12
F May 15 Is 43-44
M May 18 Is 45-46; 1 Cor 13
T May 19 Is 47-48; 1 Cor 14
W May 20 Is 49-50; Ps 69
Th May 21 Is 51-52
F May 22 Is 53-54; Ps 128
M May 25 Is 55-56; 1 Cor 15
T May 26 Is 57-58; Ps 70
W May 27 Is 59-60; 1 Cor 16
Th May 28 Is 61-62
F May 29 Is 63; 2 Cor 1
M Jun 01 Is 64; 2 Cor 2
T Jun 02 Is 65; 2 Cor 3
W Jun 03 Is 66; 2 Cor 4
Th Jun 04 2 Kings 21
F Jun 05 2 Chr 33; Ps 71
M Jun 08 Nahum
T Jun 09 2 Kings 22; 2 Cor 5
W Jun 10 2 Kings 23; Ps 73
Th Jun 11 2 Chr 34; 2 Cor 6
F Jun 12 2 Chr 35; Ps 149
M Jun 15 Habakkuk
T Jun 16 Zephaniah
W Jun 17 Jer 1; Ps 74
Th Jun 18 Jer 2; 2 Cor 7
F Jun 19 Jer 3; 2 Cor 8
M Jun 22 Jer 4; Ps 130
T Jun 23 Jer 5-6; 2 Cor 9
W Jun 24 Jer 7; 2 Cor 10
Th Jun 25 Jer 8-9; Ps 75
F Jun 26 Jer 10; 2 Cor 11
M Jun 29 Jer 11-12; 2 Cor 12
T Jun 30 Jer 13-14; 2 Cor 13
W Jul 01 Jer 15-16; Ps 76
Th Jul 02 Jer 17-18
F Jul 03 Jer 19-20
M Jul 06 Jer 22-23; Ps 77
T Jul 07 Jer 26; James 1
W Jul 08 Jer 25; James 2
Th Jul 09 Jer 35-36; Ps 133
F Jul 10 Jer 45; James 3
M Jul 13 Jer 27-28
T Jul 14 Jer 29, 24
W Jul 15 Jer 37, 21; Ps 79
Th Jul 16 Jer 34; James 4
F Jul 17 Jer 30; James 5
M Jul 20 Jer 31-32; Ps 126
T Jul 21 Jer 33; 1 Pet 1
W Jul 22 Jer 38-39; 1 Pet 2
Th Jul 23 Jer 52; 1 Pet 3
F Jul 24 2 Kings 24-25; 2 Chr 36
M Jul 27 Lamentations; Ps 137
T Jul 28 Obadiah; Ps 147
W Jul 29 Jer 40; 1 Pet 4
Th Jul 30 Jer 41; 1 Pet 5
F Jul 31 Jer 42-43
M Aug 03 Jer 44; 2 Pet 1
T Aug 04 Jer 46; 2 Pet 2
W Aug 05 Jer 47; 2 Pet 3
Th Aug 06 Jer 48-49; Ps 80
F Aug 07 Jer 50-51
M Aug 10 Ezekiel 1-2
T Aug 11 Ez 3; John 1
W Aug 12 Ez 4-5; Ps 82
Th Aug 13 Ez 6; John 2
F Aug 14 Ez 7-8
M Aug 17 Ez 9; John 3
T Aug 18 Ez 10-11; Ps 83
W Aug 19 Ez 12; John 4
Th Aug 20 Ez 13-14; Ps 136
F Aug 21 Ez 15; John 5
M Aug 24 Ez 16-17; Ps 84
T Aug 25 Ez 18; John 6
W Aug 26 Ez 19-20
Th Aug 27 Ez 21; John 7
F Aug 28 Ez 22-23; Ps 134
M Aug 31 Ez 24; John 8
T Sep 01 Ez 25-26; Ps 85
W Sep 02 Ez 27; John 9
Th Sep 03 Ez 28-29
F Sep 04 Ez 30; John 10
M Sep 07 Ez 31-32
T Sep 08 Ez 33; John 11
W Sep 09 Ez 34-35; Ps 86
Th Sep 10 Ez 36; John 12
F Sep 11 Ez 37-38; Ps 87
M Sep 14 Ez 39; John 13
T Sep 15 Ez 40-41
W Sep 16 Ez 42; John 14
Th Sep 17 Ez 43-44; Ps 135
F Sep 18 Ez 45; John 15
M Sep 21 Ez 46-47
T Sep 22 Ez 48; John 16
W Sep 23 Dan 1; John 17
Th Sep 24 Dan 2-3; Ps 88
F Sep 25 Dan 4; John 18
M Sep 28 Dan 5-6
T Sep 29 Dan 7; John 19
W Sep 30 Dan 8-9; Ps 91
Th Oct 01 Dan 10; John 20
F Oct 02 Dan 11-12
M Oct 05 Ezra 1; John 21
T Oct 06 Ezra 2-3; 1 John 1
W Oct 07 Ezra 4; 1 John 2
Th Oct 08 Haggai
F Oct 09 Zechariah 1; Ps 92
M Oct 12 Zec 2; 1 John 3
T Oct 13 Zec 3-4; Ps 138
W Oct 14 Zec 5; 1 John 4
Th Oct 15 Zec 6-7
F Oct 16 Zec 8; Ps 93
M Oct 19 Zec 9-10
T Oct 20 Zec 11-12
W Oct 21 Zec 13-14; Ps 94
Th Oct 22 Ezra 5; 1 John 5
F Oct 23 Ezra 6; 2 John
M Oct 26 Esther 1; 3 John
T Oct 27 Esther 2-3; Ps 95
W Oct 28 Esther 4; Rev 1
Th Oct 29 Esther 5; Ps 139
F Oct 30 Esther 6; Rev 2
M Nov 02 Esther 7-8; Rev 3
T Nov 03 Esther 9-10
W Nov 04 Ezra 7-8; Ps 97
Th Nov 05 Ezra 9; Rev 4
F Nov 06 Ezra 10; Rev 5
M Nov 09 Nehemiah 1-2
T Nov 10 Neh 3-4; Ps 98
W Nov 11 Neh 5; Rev 6
Th Nov 12 Neh 6-7; Ps 140
F Nov 13 Neh 8-9; Rev 7
M Nov 16 Neh 10-11; Rev 8
T Nov 17 Neh 12-13
W Nov 18 Malachi 1-2; Rev 9
Th Nov 19 Malachi 3-4; Ps 2
F Nov 20 Job 1; Rev 10
M Nov 23 Job 2-3; Rev 11
T Nov 24 Job 4-5; Ps 29
W Nov 25 Job 6-7; Rev 12
Th Nov 26 Job 8-9
F Nov 27 Job 10-11; Ps 99
M Nov 30 Job 12-13; Rev 13
M Dec 01 Job 14; Ps 100
T Dec 02 Job 15-16
W Dec 03 Job 17; Rev 14
Th Dec 04 Job 18-19; Ps 141
S Dec 07 Job 20; Rev 15
M Dec 08 Job 21-22; Ps 101
T Dec 09 Job 23; Rev 16
W Dec 10 Job 24-25
Th Dec 11 Job 26-27; Rev 17
S Dec 14 Job 28-29
M Dec 15 Job 30; Rev 18
T Dec 16 Job 31-32; Ps 102
W Dec 17 Job 33; Rev 19
Th Dec 18 Job 34; Rev 20
S Dec 21 Job 35-36
M Dec 22 Job 37; Rev 21
T Dec 23 Job 38-39; Ps 103
W Dec 24 Job 40; Rev 22
Th Dec 25 Job 41-42; Ps 150
`;

function parseReadingPlan() {
  const lines = readingPlanData.trim().split('\n');
  const entries = [];

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 3) continue;

    const dayOfWeek = parts[0];
    const month = parts[1];
    const day = parts[2];
    const reading = parts.slice(3).join(' ');

    const monthMap: { [key: string]: string } = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };

    const dateStr = `2026-${monthMap[month]}-${day.padStart(2, '0')}`;

    entries.push({
      date: dateStr,
      day_of_week: dayOfWeek,
      reading: reading
    });
  }

  return entries;
}

export async function seedReadingPlan() {
  const entries = parseReadingPlan();

  const { error } = await supabase
    .from('reading_plan')
    .upsert(entries, { onConflict: 'date' });

  if (error) {
    console.error('Error seeding reading plan:', error);
    throw error;
  }

  console.log(`Successfully seeded ${entries.length} reading plan entries`);
}
