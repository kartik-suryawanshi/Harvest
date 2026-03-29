import { useState } from 'react';
import Header from '@/components/Header';
import ResidueAdvisor from '@/components/residue/ResidueAdvisor';

const ResidueModule = () => {
  const [scenario, setScenario] = useState('normal');

  return (
    <div className="min-h-screen bg-background">
      <Header scenario={scenario} onScenarioChange={setScenario} />
      <main className="container mx-auto px-4 py-8">
        <ResidueAdvisor />
      </main>
    </div>
  );
};

export default ResidueModule;
