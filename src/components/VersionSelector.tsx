import { BibleVersion } from '../types';

interface VersionSelectorProps {
  version: BibleVersion;
  onChange: (version: BibleVersion) => void;
}

export function VersionSelector({ version, onChange }: VersionSelectorProps) {
  const versions: BibleVersion[] = ['ESV', 'NIV', 'NLT'];

  return (
    <div className="flex gap-2">
      {versions.map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            version === v
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
