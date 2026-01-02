import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Calendar, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ReadingPlan as ReadingPlanType, BibleVersion } from '../types';
import { fetchReadingPassages } from '../services/bibleService';
import { VersionSelector } from './VersionSelector';
import { PassageDisplay } from './PassageDisplay';

export function ReadingPlan() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reading, setReading] = useState<ReadingPlanType | null>(null);
  const [passages, setPassages] = useState<Array<{ reference: string; text: string }>>([]);
  const [version, setVersion] = useState<BibleVersion>('ESV');
  const [loading, setLoading] = useState(true);
  const [loadingPassages, setLoadingPassages] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionLoading, setCompletionLoading] = useState(false);

  useEffect(() => {
    loadReading(currentDate);
  }, [currentDate]);

  useEffect(() => {
    if (reading) {
      loadPassages();
      checkCompletion();
    }
  }, [reading, version]);

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

  async function loadPassages() {
    if (!reading) return;

    setLoadingPassages(true);
    const results = await fetchReadingPassages(reading.reading, version);
    setPassages(results);
    setLoadingPassages(false);
  }

  async function checkCompletion() {
    if (!reading) return;

    const { data } = await supabase
      .from('completed_readings')
      .select('*')
      .eq('date', reading.date)
      .maybeSingle();

    setIsCompleted(!!data);
  }

  async function toggleCompletion() {
    if (!reading) return;

    setCompletionLoading(true);

    if (isCompleted) {
      const { error } = await supabase
        .from('completed_readings')
        .delete()
        .eq('date', reading.date);

      if (!error) {
        setIsCompleted(false);
      }
    } else {
      const { error } = await supabase
        .from('completed_readings')
        .insert({ date: reading.date });

      if (!error) {
        setIsCompleted(true);
      }
    }

    setCompletionLoading(false);
  }

  function navigateDay(offset: number) {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    setCurrentDate(newDate);
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isToday = currentDate.toDateString() === new Date().toDateString();

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
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium uppercase tracking-wide">
                    {reading?.day_of_week === 'M' && 'Monday'}
                    {reading?.day_of_week === 'T' && 'Tuesday'}
                    {reading?.day_of_week === 'W' && 'Wednesday'}
                    {reading?.day_of_week === 'Th' && 'Thursday'}
                    {reading?.day_of_week === 'F' && 'Friday'}
                    {reading?.day_of_week === 'S' && 'Saturday'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  {formatDate(currentDate)}
                </h2>
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      Today's Reading
                    </h3>
                    <p className="text-2xl font-bold text-slate-700">
                      {reading.reading}
                    </p>
                  </div>
                  <VersionSelector
                    version={version}
                    onChange={setVersion}
                  />
                </div>

                <PassageDisplay
                  passages={passages}
                  loading={loadingPassages}
                />

                <div className="mt-8 pt-6 border-t border-slate-200 flex justify-center">
                  <button
                    onClick={toggleCompletion}
                    disabled={completionLoading}
                    className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      isCompleted
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Check className={`w-5 h-5 ${isCompleted ? 'animate-pulse' : ''}`} />
                    {isCompleted ? 'Completed' : 'Mark as Complete'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No reading scheduled for this date</p>
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
