import { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface PassageDisplayProps {
  passages: Array<{ reference: string; text: string }>;
  loading: boolean;
}

export function PassageDisplay({ passages, loading }: PassageDisplayProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-100 rounded"></div>
              <div className="h-4 bg-slate-100 rounded"></div>
              <div className="h-4 bg-slate-100 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (passages.length === 0) {
    return (
      <div className="text-center py-8 text-slate-600">
        <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-400" />
        <p>Loading passages...</p>
      </div>
    );
  }

  if (passages.length === 1) {
    return (
      <div className="border-l-4 border-slate-300 pl-4">
        <h4 className="text-lg font-bold text-slate-900 mb-3">
          {passages[0].reference}
        </h4>
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
            {passages[0].text}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        {passages.map((passage, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-3 font-medium text-sm transition-colors relative ${
              activeTab === index
                ? 'text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {passage.reference}
            {activeTab === index && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
            )}
          </button>
        ))}
      </div>

      <div className="border-l-4 border-slate-300 pl-4">
        <h4 className="text-lg font-bold text-slate-900 mb-3">
          {passages[activeTab].reference}
        </h4>
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
            {passages[activeTab].text}
          </p>
        </div>
      </div>
    </div>
  );
}
