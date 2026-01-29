
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Move, FutureMove, GameState, Outcome } from './types';

const STORAGE_KEY = 'future_you_game_state';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      score: 0,
      streak: 0,
      lastDecisionHour: 0,
      beastTask: 'Work on main project'
    };
  });

  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [tempTask, setTempTask] = useState(state.beastTask);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const currentHourStart = useMemo(() => {
    const date = new Date(currentTime);
    date.setMinutes(0, 0, 0);
    return date.getTime();
  }, [currentTime]);

  const isLocked = state.lastDecisionHour === currentHourStart;

  const currentHourBlockString = useMemo(() => {
    const start = new Date(currentHourStart);
    const end = new Date(currentHourStart + 3600000);
    const format = (d: Date) => d.getHours().toString().padStart(2, '0') + ':00';
    return `${format(start)} – ${format(end)}`;
  }, [currentHourStart]);

  const handleConfirm = useCallback(() => {
    if (!selectedMove) return;

    // Game Logic
    // Streak >= 3 -> Future You Cooperates
    // Streak = 0 -> Future You Defects
    const futureMove: FutureMove = state.streak >= 3 ? 'COOPERATE' : 'DEFECT';

    let scoreDelta = 0;
    let newStreak = 0;
    let message = "";
    let subMessage = "";

    if (selectedMove === 'FOCUS') {
      if (futureMove === 'COOPERATE') {
        // Momentum
        scoreDelta = 10;
        newStreak = state.streak + 1;
        message = "You cooperated 🤝";
        subMessage = "Future You rewards you. You made the next hour easier.";
      } else {
        // Burnout (Working hard but environment is hostile)
        scoreDelta = 4;
        newStreak = state.streak + 1;
        message = "You cooperated 🤝";
        subMessage = "But Future You is still skeptical. Keep pushing.";
      }
    } else {
      if (futureMove === 'COOPERATE') {
        // Guilt
        scoreDelta = -6;
        newStreak = 0;
        message = "You defected 💀";
        subMessage = "You let your Future Self down. Support is withdrawing.";
      } else {
        // Spiral
        scoreDelta = -8;
        newStreak = 0;
        message = "You defected 💀";
        subMessage = "You chose comfort over growth. The spiral continues.";
      }
    }

    const newOutcome: Outcome = {
      presentMove: selectedMove,
      futureMove,
      scoreChange: scoreDelta,
      streakChange: newStreak,
      message,
      subMessage
    };

    setOutcome(newOutcome);
    setState(prev => ({
      ...prev,
      score: prev.score + scoreDelta,
      streak: newStreak,
      lastDecisionHour: currentHourStart
    }));
  }, [selectedMove, state.streak, currentHourStart]);

  const closeOutcome = () => {
    setOutcome(null);
    setSelectedMove(null);
  };

  const handleTaskSave = () => {
    setState(prev => ({ ...prev, beastTask: tempTask }));
    setIsEditingTask(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#0a0a0a] text-gray-200">
      <div className="w-full max-w-md bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex flex-col items-center text-center">
          <h1 className="text-sm font-bold tracking-widest text-gray-500 mb-6 uppercase">
            Future You vs Present You
          </h1>
          
          <div className="flex flex-col gap-2 w-full">
            <div className="flex justify-between items-baseline px-2">
              <span className="text-gray-500 text-xs uppercase tracking-tighter">Life Score</span>
              <span className="text-4xl font-black text-white">{state.score}</span>
            </div>
            <div className="flex justify-between items-baseline px-2">
              <span className="text-gray-500 text-xs uppercase tracking-tighter">Control Streak</span>
              <span className="text-2xl font-bold text-orange-500">🔥 {state.streak}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">
          
          {/* Hour Block */}
          <div className="space-y-1">
            <label className="text-[10px] text-gray-600 uppercase tracking-[0.2em] block">Current Hour Block</label>
            <div className="text-xl font-bold tracking-tight text-white">{currentHourBlockString}</div>
          </div>

          {/* Beast Task */}
          <div className="space-y-1">
            <label className="text-[10px] text-gray-600 uppercase tracking-[0.2em] block">Beast Task</label>
            {isEditingTask ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  className="bg-gray-900 border border-gray-700 text-white p-2 rounded w-full text-sm outline-none focus:border-blue-500 transition-colors"
                  value={tempTask}
                  onChange={(e) => setTempTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTaskSave()}
                />
                <button 
                  onClick={handleTaskSave}
                  className="px-3 bg-gray-800 rounded text-xs font-bold hover:bg-gray-700"
                >
                  SET
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditingTask(true)}
                className="text-lg font-bold text-blue-400 hover:text-blue-300 transition-colors text-left w-full truncate border-b border-dashed border-blue-900/50 pb-1"
              >
                [ {state.beastTask} ]
              </button>
            )}
          </div>

          {!isLocked ? (
            <>
              {/* Question */}
              <div className="space-y-4 pt-4">
                <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] text-center block">What will you do this hour?</label>
                
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => setSelectedMove('FOCUS')}
                    className={`
                      group relative overflow-hidden p-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-between
                      ${selectedMove === 'FOCUS' 
                        ? 'border-green-500 bg-green-950/20 text-green-400 neon-border-green' 
                        : 'border-gray-800 hover:border-gray-700 bg-gray-900/50 text-gray-400'}
                    `}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-xl font-black uppercase tracking-widest">FOCUS</span>
                      <span className="text-[10px] opacity-50 uppercase font-bold tracking-widest">Cooperate</span>
                    </div>
                    <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">🤝</span>
                  </button>

                  <button
                    onClick={() => setSelectedMove('WASTE')}
                    className={`
                      group relative overflow-hidden p-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-between
                      ${selectedMove === 'WASTE' 
                        ? 'border-red-600 bg-red-950/20 text-red-500 neon-border-red' 
                        : 'border-gray-800 hover:border-gray-700 bg-gray-900/50 text-gray-400'}
                    `}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-xl font-black uppercase tracking-widest">WASTE</span>
                      <span className="text-[10px] opacity-50 uppercase font-bold tracking-widest">Defect</span>
                    </div>
                    <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">💀</span>
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <button
                disabled={!selectedMove}
                onClick={handleConfirm}
                className={`
                  w-full py-6 rounded-lg font-black text-lg tracking-[0.3em] uppercase transition-all duration-500
                  ${selectedMove 
                    ? 'bg-white text-black hover:bg-gray-200 cursor-pointer scale-[1.02]' 
                    : 'bg-gray-900 text-gray-700 cursor-not-allowed opacity-50'}
                `}
              >
                CONFIRM
              </button>
            </>
          ) : (
            <div className="pt-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-gray-800 border-t-white animate-spin mb-4" />
              <div className="text-2xl font-black uppercase tracking-tighter text-white">LOCKED</div>
              <p className="text-xs text-gray-500 uppercase tracking-widest max-w-[200px]">
                Hour intent established. Execute your task.
              </p>
              <div className="pt-4 font-bold text-gray-400">
                NEXT GAME AT: {(new Date(currentHourStart + 3600000)).getHours().toString().padStart(2, '0')}:00
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-gray-900/30 border-t border-gray-800/50 text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">Willpower Command Console v1.0.4</p>
        </div>

        {/* Outcome Modal Overlay */}
        {outcome && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-6">
            <div className="text-center w-full space-y-10 animate-in fade-in zoom-in duration-300">
              <div className="space-y-2">
                <h2 className={`text-3xl font-black uppercase tracking-tighter ${outcome.presentMove === 'FOCUS' ? 'text-green-500' : 'text-red-500'}`}>
                  {outcome.message}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                  {outcome.subMessage}
                </p>
              </div>

              <div className="flex justify-center gap-12">
                <div className="text-center">
                  <div className={`text-4xl font-black ${outcome.scoreChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {outcome.scoreChange >= 0 ? '+' : ''}{outcome.scoreChange}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Life Score</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-orange-500">
                    🔥 {outcome.streakChange}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Streak</div>
                </div>
              </div>

              <button
                onClick={closeOutcome}
                className="w-full py-4 border-2 border-white text-white font-black tracking-widest hover:bg-white hover:text-black transition-all uppercase rounded-lg"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-[10px] text-gray-700 uppercase tracking-[0.5em] font-bold text-center">
        The shadow of the future guides your hand.
      </div>
    </div>
  );
};

export default App;
