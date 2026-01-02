import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Calendar, Check, Sparkles, Type } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ReadingPlan as ReadingPlanType, BibleVersion } from '../types';
import { fetchReadingPassages } from '../services/bibleService';
import { VersionSelector } from './VersionSelector';

function getCSTDate() {
  // Use local timezone to avoid date parsing issues
  return new Date();
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

  useEffect(() => {
    loadReading(currentDate);
  }, [currentDate]);

  useEffect(() => {
    if (reading) {
      loadCompletedPassages();
      setSelectedPassage(null);
      setPassageText('');
    }
  }, [reading]);

  useEffect(() => {
    // Re-fetch passage when version changes
    if (selectedPassage) {
      const refetchPassage = async () => {
        setLoadingPassage(true);
        const results = await fetchReadingPassages(selectedPassage, version);
        if (results.length > 0) {
          setPassageText(results[0].text);
        }
        setLoadingPassage(false);
      };
      refetchPassage();
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

    if (error) {
      console.error('Error loading reading:', error);
    } else {
      setReading(data);
    }

    setLoading(false);
  }

  async function loadCompletedPassages() {
    if (!reading) return;

    const { data } = await supabase
      .from('completed_readings')
      .select('passage')
      .eq('date', reading.date);

    if (data) {
      setCompletedPassages(new Set(data.map(d => d.passage)));
    }
  }

  async function handlePassageClick(passage: string) {
    if (!reading) return;

    // Load the passage text
    setSelectedPassage(passage);
    setLoadingPassage(true);

    const results = await fetchReadingPassages(passage, version);
    if (results.length > 0) {
      setPassageText(results[0].text);
    }

    setLoadingPassage(false);

    // Mark as completed if first time clicking
    if (!completedPassages.has(passage)) {
      const { error } = await supabase
        .from('completed_readings')
        .insert({ date: reading.date, passage });

      if (!error) {
        setCompletedPassages(prev => new Set([...prev, passage]));
      }
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
    const selectedDate = new Date(dateString + 'T00:00:00');
    setCurrentDate(selectedDate);
    setShowDatePicker(false);
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
      case 'medium': return 'text-lg leading-relaxed';
      case 'large': return 'text-xl leading-relaxed';
      default: return 'text-lg leading-relaxed';
    }
  };

  const getDayOfWeek = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const formatDate = (date: Date) => {
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();

    // Add ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
    const getOrdinalSuffix = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${month} ${getOrdinalSuffix(day)}`;
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
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-2">
            Daily Bible Reading
          </h1>
          <p className="text-slate-600">2026 Reading Plan</p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-8 text-white">
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

          <div className="p-6 sm:p-8">
            {reading ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Today's Reading
                  </h3>
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
                    <VersionSelector
                      version={version}
                      onChange={setVersion}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-8">
                  {reading.reading.split(';').map((passage, index) => {
                    const trimmedPassage = passage.trim();
                    const isCompleted = completedPassages.has(trimmedPassage);
                    const isSelected = selectedPassage === trimmedPassage;

                    return (
                      <button
                        key={index}
                        onClick={() => handlePassageClick(trimmedPassage)}
                        className={`text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center gap-2 group ${
                          isSelected
                            ? 'border-slate-900 bg-slate-50 shadow-md'
                            : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`text-lg font-semibold whitespace-nowrap ${
                          isSelected ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'
                        }`}>
                          {trimmedPassage}
                        </span>
                        {isCompleted && (
                          <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedPassage && (
                  <div className="border-t border-slate-200 pt-6">
                    {loadingPassage ? (
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                        <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-xl p-6">
                        <h4 className="text-xl font-bold text-slate-900 mb-4 text-center">
                          {selectedPassage}
                        </h4>
                        <div className="max-w-3xl mx-auto">
                          <div className={`text-slate-700 ${getTextSizeClass()}`}>
                            {passageText.split('\n').map((verse, idx) => {
                              // Check for chapter headers
                              const chapterMatch = verse.match(/^CHAPTER (\d+)$/);
                              if (chapterMatch) {
                                const [, chapterNum] = chapterMatch;
                                return (
                                  <div key={idx} className="mt-6 mb-3 first:mt-0">
                                    <h5 className="text-2xl font-bold text-slate-900">
                                      Chapter {chapterNum}
                                    </h5>
                                  </div>
                                );
                              }

                              // Check for verse lines
                              const verseMatch = verse.match(/^(\d+)\s+(.+)$/);
                              if (verseMatch) {
                                const [, number, text] = verseMatch;
                                return (
                                  <span key={idx}>
                                    <sup className="font-bold text-slate-900 mr-1">
                                      {number}
                                    </sup>
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
                    ? 'No reading on weekends - Enjoy your rest day!'
                    : 'No reading scheduled for this date'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-slate-700" />
            Helpful Resources
          </h3>
          <p className="text-slate-600 text-center py-8">
            Resource videos coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
