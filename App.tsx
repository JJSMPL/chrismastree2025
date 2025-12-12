import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { TreeState } from './types';
import { Loader } from '@react-three/drei';

function App() {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);
  const [showUI, setShowUI] = useState(true);

  const toggleState = () => {
    setTreeState((prev) => 
      prev === TreeState.SCATTERED ? TreeState.TREE_SHAPE : TreeState.SCATTERED
    );
    // Hide header controls during the show, but keep the button visible
    if (treeState === TreeState.TREE_SHAPE) {
      setTimeout(() => setShowUI(false), 500);
    } else {
      setShowUI(true);
    }
  };

  const isTree = treeState === TreeState.TREE_SHAPE;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans select-none">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene treeState={treeState} />
      </div>

      {/* Loading Overlay from Drei */}
      <Loader />

      {/* End Screen Overlay */}
      <div 
        className={`absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-2000 ease-in-out ${!isTree ? 'opacity-100' : 'opacity-0'}`}
      >
         <h1 className="text-6xl md:text-8xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-400 drop-shadow-[0_0_25px_rgba(255,215,0,0.6)] animate-pulse">
            Happy Holidays
         </h1>
         <p className="mt-4 text-emerald-200/80 tracking-[0.5em] uppercase text-sm">From Smpl</p>
      </div>

      {/* Header UI Layer - Fades out */}
      <div className={`absolute inset-x-0 top-0 z-10 p-8 transition-opacity duration-1000 ${showUI ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
        <header className="flex justify-between items-start animate-fade-in pointer-events-auto">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-['Satoshi'] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-white to-amber-200 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              Smpl Co
            </h1>
            <p className="text-emerald-400/80 text-[10px] md:text-xs tracking-[0.3em] uppercase mt-1 font-['Satoshi']">
              Interactive Experience
            </p>
          </div>
        </header>
      </div>

      {/* Footer UI Layer - Always Visible */}
      <div className="absolute inset-x-0 bottom-0 z-30 p-8 flex justify-center items-end pointer-events-none">
        <button
            onClick={toggleState}
            className={`
              pointer-events-auto
              group relative px-12 py-4 overflow-hidden rounded-full 
              transition-all duration-700 ease-out
              ${isTree 
                ? 'bg-gradient-to-r from-amber-700/80 to-amber-500/80 shadow-[0_0_40px_rgba(255,191,0,0.4)]' 
                : 'bg-gradient-to-r from-emerald-900/80 to-emerald-700/80 shadow-[0_0_40px_rgba(0,255,128,0.2)]'
              }
              backdrop-blur-xl border border-white/20 hover:scale-105 active:scale-95
            `}
          >
            <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 -skew-x-12 opacity-50 w-full transform -translate-x-full" />
            
            <span className={`
              relative z-10 text-sm md:text-lg font-bold tracking-widest uppercase transition-colors duration-300
              ${isTree ? 'text-amber-100' : 'text-emerald-100'}
            `}>
              {isTree ? 'Release Magic' : 'Restart'}
            </span>
          </button>
      </div>
      
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-amber-500/10 to-transparent pointer-events-none z-10" />
    </div>
  );
}

export default App;