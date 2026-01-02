import { useEffect, useState } from 'react';
import { ReadingPlan } from './components/ReadingPlan';
import { seedReadingPlan } from './scripts/seedReadingPlan';

function App() {
  const [isSeeding, setIsSeeding] = useState(true);

  useEffect(() => {
    async function initializeData() {
      try {
        await seedReadingPlan();
      } catch (error) {
        console.error('Error seeding data:', error);
      } finally {
        setIsSeeding(false);
      }
    }

    initializeData();
  }, []);

  if (isSeeding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Initializing reading plan...</p>
        </div>
      </div>
    );
  }

  return <ReadingPlan />;
}

export default App;
