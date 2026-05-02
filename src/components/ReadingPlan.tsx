import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Calendar, CheckCircle2, Type, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ReadingPlan as ReadingPlanType, BibleVersion } from '../types';
import { fetchReadingPassages } from '../services/bibleService';
import { VersionSelector } from './VersionSelector';
import { Comments } from './Comments';

function getCSTDate() {
  return new Date();
}

// Web Audio chime played when a new comment arrives and the section isn't in view
function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    [[523.25, 0], [659.25, 0.22]].forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.9);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.9);
    });
  } catch {
    // Audio context not available
  }
}

function showBrowserNotification() {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  new Notification("New comment on today's reading", {
    body: 'Someone shared a thought — tap to view.',
    icon: '/favicon.ico',
    tag: 'new-comment',
  });
}

export function ReadingPlan() {
  const [currentDate, setCurrentDate] = useState(getCSTDate());
  const [reading, setReading] = useState<ReadingPlanType | null>(null);
  const [selectedPassage, setSelectedPassage] = useState<string | null>(null);
  const [passageText, setPassageText] = useState<string>('');
  const [version, setVersion] = useState<BibleVersion>('ESV');
  const [loading, setLoading] = useState(true);
  const [loadingPassage, setLoadingPassage] = useState(false);
  const [completedPassages, setCompletedPassages] = useState<Set<string>>(new Set());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [unreadComments, setUnreadComments] = useState(0);
  const [communityVisible, setCommunityVisible] = useState(false);
  const communityRef = useRef<HTMLDivElement>(null);

  // Request browser notification permission once
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    loadReading(currentDate);
  }, [currentDate]);

  useEffect(() => {
    if (reading) {
      loadCompletedPassages();
      setSelectedPassage(null);
      setPassageText('');
      setUnreadComments(0);
      setCommunityVisible(false);
    }
  }, [reading]);

  useEffect(() => {
    if (selectedPassage) {
      const refetch = async () => {
        setLoadingPassage(true);
        const results = await fetchReadingPassages(selectedPassage, version);
        if (results.length > 0) setPassageText(results[0].text);
        setLoadingPassage(false);
      };
      refetch();
    }
  }, [version]);

  async function loadReading(date: Date) {
    setLoading(true);
    const dateStr = date.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('reading_plan')
      .select('*')
      .eq('date', dateStr)
      .maybeSingle();

    if (error) console.error('Error loading reading:', error);
    else setReading(data);

    setLoading(false);
  }

  function loadCompletedPassages() {
    if (!reading) return;
    const key = `completed_${reading.date}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setCompletedPassages(new Set(JSON.parse(stored)));
      } catch {
        setCompletedPassages(new Set());
      }
    } else {
      setCompletedPassages(new Set());
    }
  }

  async function handlePassageClick(passage: string) {
    if (!reading) return;
    setSelectedPassage(passage);
    setLoadingPassage(true);
    const results = await fetchReadingPassages(passage, version);
    if (results.length > 0) setPassageText(results[0].text);
    setLoadingPassage(false);

    if (!completedPassages.has(passage)) {
      const updated = new Set([...completedPassages, passage]);
      setCompletedPassages(updated);
      localStorage.setItem(`completed_${reading.date}`, JSON.stringify([...updated]));
    }
  }

  function navigateDay(offset: number) {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    setCurrentDate(newDate);
  }

  function goToToday() {
    setCurrentDate(getCSTDate());
  }

  function handleDateSelect(dateString: string) {
    setCurrentDate(new Date(dateString + 'T00:00:00'));
    setShowDatePicker(false);
  }

  function handleOpenCommunity() {
    setCommunityVisible(true);
    setUnreadComments(0);
    setTimeout(() => communityRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  function handleNewCommentArrived() {
    if (!communityVisible) {
      playChime();
      showBrowserNotification();
    }
  }

  function increaseTextSize() {
    if (textSize === 'small') setTextSize('medium');
    else if (textSize === 'medium') setTextSize('large');
  }

  function decreaseTextSize() {
    if (textSize === 'large') setTextSize('medium');
    else if (textSize === 'medium') setTextSize('small');
  }

  const getTextSizeClass = () => {
    switch (textSize) {
      case 'small': return 'text-base leading-relaxed';
      case 'large': return 'text-xl leading-relaxed';
      default: return 'text-lg leading-relaxed';
    }
  };

  const getDayOfWeek = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'long' });

  const expandBookName = (reference: string): string => {
    const bookMappings: Record<string, string> = {
      'Gen': 'Genesis', 'Ex': 'Exodus', 'Exod': 'Exodus', 'Lev': 'Leviticus',
      'Num': 'Numbers', 'Deut': 'Deuteronomy', 'Josh': 'Joshua', 'Judg': 'Judges',
      '1 Sam': '1 Samuel', '2 Sam': '2 Samuel', '1 Kgs': '1 Kings', '2 Kgs': '2 Kings',
      '1 Chr': '1 Chronicles', '2 Chr': '2 Chronicles', 'Neh': 'Nehemiah',
      'Ps': 'Psalm', 'Prov': 'Proverbs', 'Eccl': 'Ecclesiastes', 'Ecc': 'Ecclesiastes',
      'Song': 'Song of Solomon', 'Isa': 'Isaiah', 'Jer': 'Jeremiah', 'Lam': 'Lamentations',
      'Ezek': 'Ezekiel', 'Ez': 'Ezekiel', 'Dan': 'Daniel', 'Hos': 'Hosea', 'Obad': 'Obadiah',
      'Jon': 'Jonah', 'Mic': 'Micah', 'Nah': 'Nahum', 'Hab': 'Habakkuk',
      'Zeph': 'Zephaniah', 'Hag': 'Haggai', 'Zech': 'Zechariah', 'Zec': 'Zechariah', 'Mal': 'Malachi',
      'Matt': 'Matthew', 'Mt': 'Matthew', 'Mk': 'Mark', 'Lk': 'Luke', 'Jn': 'John',
      'Rom': 'Romans', '1 Cor': '1 Corinthians', '2 Cor': '2 Corinthians',
      'Gal': 'Galatians', 'Eph': 'Ephesians', 'Phil': 'Philippians', 'Col': 'Colossians',
      '1 Thess': '1 Thessalonians', '2 Thess': '2 Thessalonians',
      '1 Tim': '1 Timothy', '2 Tim': '2 Timothy', 'Tit': 'Titus', 'Phlm': 'Philemon',
      'Heb': 'Hebrews', 'Jas': 'James', 'Jam': 'James', '1 Pet': '1 Peter',
      '2 Pet': '2 Peter', '1 Jn': '1 John', '2 Jn': '2 John', '3 Jn': '3 John',
      'Rev': 'Revelation',
    };
    for (const [abbrev, fullName] of Object.entries(bookMappings)) {
      if (reference.startsWith(abbrev + ' ')) return reference.replace(abbrev, fullName);
    }
    return reference;
  };

  const formatDate = (date: Date) => {
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();
    const getOrdinal = (n: number) => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    return `${month} ${getOrdinal(day)}`;
  };

  const isToday = currentDate.toDateString() === getCSTDate().toDateString();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-slate-400 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Loading reading plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6 sm:py-12">
        <header className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 mb-2">
            Daily Bible Reading
          </h1>
          <p className="text-slate-600">2026 Reading Plan</p>
        </header>

        {/* Main reading card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-3 sm:px-6 py-6 sm:py-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateDay(-1)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Previous day"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    aria-label="Select date"
                  >
                    <Calendar className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium uppercase tracking-wide">
                    {getDayOfWeek(currentDate)}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  {formatDate(currentDate)}
                </h2>

                {showDatePicker && (
                  <div className="mt-4 inline-block">
                    <input
                      type="date"
                      value={currentDate.toISOString().split('T')[0]}
                      onChange={(e) => handleDateSelect(e.target.value)}
                      className="px-4 py-2 rounded-lg text-slate-900 font-medium"
                      max="2026-12-31"
                      min="2026-01-01"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={() => navigateDay(1)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Next day"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {!isToday && (
              <div className="text-center">
                <button
                  onClick={goToToday}
                  className="text-sm px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  Go to Today
                </button>
              </div>
            )}
          </div>

          <div className="p-3 sm:p-8">
            {reading ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Today's Reading</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 border border-slate-300 rounded-lg p-1">
                      <button
                        onClick={decreaseTextSize}
                        disabled={textSize === 'small'}
                        className="p-2 hover:bg-slate-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Decrease text size"
                        title="Smaller text"
                      >
                        <Type className="w-4 h-4 text-slate-700" />
                      </button>
                      <button
                        onClick={increaseTextSize}
                        disabled={textSize === 'large'}
                        className="p-2 hover:bg-slate-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Increase text size"
                        title="Larger text"
                      >
                        <Type className="w-5 h-5 text-slate-700" />
                      </button>
                    </div>
                    <VersionSelector version={version} onChange={setVersion} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-8">
                  {reading.reading.split(';').map((passage, index) => {
                    const trimmed = passage.trim();
                    const isCompleted = completedPassages.has(trimmed);
                    const isSelected = selectedPassage === trimmed;
                    return (
                      <button
                        key={index}
                        onClick={() => handlePassageClick(trimmed)}
                        className={`text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center gap-3 group ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                            : isCompleted
                              ? 'border-green-300 hover:border-green-400 hover:bg-green-50'
                              : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`text-lg font-semibold whitespace-nowrap ${
                          isSelected ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-slate-700 group-hover:text-slate-900'
                        }`}>
                          {trimmed}
                        </span>
                        {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {selectedPassage && (
                  <div className="border-t border-slate-200 pt-6">
                    {loadingPassage ? (
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-slate-100 rounded w-full" />
                        <div className="h-4 bg-slate-100 rounded w-full" />
                        <div className="h-4 bg-slate-100 rounded w-5/6" />
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-xl p-4 sm:p-6">
                        <h4 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 text-center">
                          {expandBookName(selectedPassage)}
                        </h4>
                        <div className="mx-auto">
                          <div className={`text-slate-700 ${getTextSizeClass()}`}>
                            {passageText.split('\n').map((verse, idx) => {
                              const chapterMatch = verse.match(/^CHAPTER (\d+)$/);
                              if (chapterMatch) {
                                const [, chapterNum] = chapterMatch;
                                return (
                                  <div key={idx} className="mt-6 mb-3 first:mt-0">
                                    <h5 className="text-2xl font-bold text-slate-900">Chapter {chapterNum}</h5>
                                  </div>
                                );
                              }
                              const verseMatch = verse.match(/^(\d+)\s+(.+)$/);
                              if (verseMatch) {
                                const [, number, text] = verseMatch;
                                return (
                                  <span key={idx}>
                                    <sup className="font-bold text-slate-900 mr-1">{number}</sup>
                                    {text}{' '}
                                  </span>
                                );
                              }
                              return verse ? <span key={idx}>{verse} </span> : null;
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">
                  {currentDate.getDay() === 0 || currentDate.getDay() === 6
                    ? 'No reading on weekends — enjoy your rest day!'
                    : 'No reading scheduled for this date'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Guide card (renamed from Resources) */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden p-3 sm:p-8 mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
            Guide
          </h3>
          <p className="text-slate-600 text-center py-6 sm:py-8">
            Guide videos and resources coming soon…
          </p>
        </div>

        {/* Community / Comments card */}
        <div ref={communityRef} className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden p-3 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
              Community
              {unreadComments > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold leading-none">
                  {unreadComments > 9 ? '9+' : unreadComments}
                </span>
              )}
            </h3>
            {!communityVisible && (
              <button
                onClick={handleOpenCommunity}
                className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View
              </button>
            )}
          </div>

          {communityVisible && reading && (
            <Comments
              date={reading.date}
              isActive={communityVisible}
              onUnreadCountChange={setUnreadComments}
              onNewCommentArrived={handleNewCommentArrived}
            />
          )}

          {!communityVisible && (
            <p className="text-slate-500 text-sm text-center py-4">
              {unreadComments > 0
                ? `${unreadComments} new comment${unreadComments === 1 ? '' : 's'} — tap View to read`
                : 'Share a thought on today\'s reading'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
