'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { BOTTLENECK_SCENARIOS } from '@/lib/data';

interface Diagnosis {
  intervention: string;
  justification: string;
  participantName?: string;
}

interface Props { 
  participantCount: number;
  responses?: Record<string, any>;
  config?: { scenarioId?: string };
}

export default function BottleneckAnalystPresenter({ participantCount, responses = {}, config }: Props) {
  const diagnoses = Object.values(responses) as Diagnosis[];
  const scenario = BOTTLENECK_SCENARIOS.find(s => s.id === config?.scenarioId) || BOTTLENECK_SCENARIOS[0];

  // Calculate counts for each intervention
  const counts = scenario.interventions.map(intervention => ({
    ...intervention,
    count: diagnoses.filter(d => d.intervention === intervention.id).length
  }));

  const maxCount = Math.max(...counts.map(c => c.count), 1);

  return (
    <div className="flex flex-col h-full px-12 py-12 relative font-sans">
      <div className="flex items-center justify-between mb-8 border-b border-[#E8E4DF] pb-4">
        <h3 className="text-[#6B6560] text-[10px] uppercase tracking-[0.2em]">System Diagnosis</h3>
        <span className="text-[#6B6560] text-[10px] uppercase tracking-[0.2em]">{diagnoses.length} / {participantCount} submitted</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="text-center mb-16 max-w-2xl"
        >
          <p className="text-[#8B7D56] text-[10px] uppercase tracking-[0.2em] mb-4 font-bold">{scenario.title}</p>
          <p className="text-2xl font-serif text-[#1C1C1C] leading-relaxed">{scenario.description}</p>
        </motion.div>

        <div className="w-full max-w-4xl space-y-6">
          <AnimatePresence>
            {counts.map((item, i) => {
              const percentage = diagnoses.length > 0 ? (item.count / diagnoses.length) * 100 : 0;
              const isLeading = item.count === maxCount && item.count > 0;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1.0] }}
                  className="relative"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl grayscale">{item.emoji}</span>
                      <span className={`text-sm uppercase tracking-[0.15em] ${isLeading ? 'text-[#1C1C1C] font-bold' : 'text-[#6B6560] font-medium'}`}>
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[#1C1C1C] font-serif text-lg">{item.count}</span>
                  </div>
                  
                  <div className="h-4 w-full bg-[#E8E4DF] rounded-none overflow-hidden relative">
                    <motion.div
                      className={`absolute top-0 left-0 h-full ${isLeading ? 'bg-[#1C1C1C]' : 'bg-[#8B7D56]'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {diagnoses.length > 0 && (
          <div className="mt-16 w-full max-w-4xl">
            <p className="text-[#6B6560] text-[10px] uppercase tracking-[0.2em] mb-4 border-b border-[#E8E4DF] pb-2">Selected Rationales</p>
            <div className="grid grid-cols-3 gap-6">
              {diagnoses.slice(-3).map((d, i) => {
                const intervention = scenario.interventions.find(int => int.id === d.intervention);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + i * 0.2 }}
                    className="bg-[#FFFFFF] border border-[#E8E4DF] p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="grayscale">{intervention?.emoji}</span>
                      <span className="text-[#1C1C1C] text-[9px] uppercase tracking-[0.1em] font-bold">{intervention?.label}</span>
                    </div>
                    <p className="text-[#6B6560] text-sm italic mb-4">"{d.justification}"</p>
                    {d.participantName && (
                      <p className="text-[#8D8881] text-[9px] uppercase tracking-[0.1em] text-right">— {d.participantName}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}