import React from 'react';
import { SparklesIcon } from './Icons.tsx';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-sky-100 via-slate-50 to-yellow-100 text-center text-gray-800 font-sans p-4">
      <div className="animate-fade-in space-y-8 max-w-2xl">
        <div className="flex justify-center items-center">
          <SparklesIcon className="w-20 h-20 text-yellow-500" />
        </div>
        
        <h1 className="text-6xl md:text-7xl font-cinzel font-bold tracking-wider text-amber-900">
          Luz y Verdad
        </h1>

        <p className="text-xl md:text-2xl text-slate-600 leading-relaxed" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Tu compañero de estudio bíblico y consejero espiritual, iluminado por la inteligencia artificial.
        </p>
        
        <p className="text-md text-slate-500 max-w-lg mx-auto">
          Explora las Escrituras, recibe una palabra de aliento en el chat, o genera oraciones personalizadas para tus necesidades. Un espacio de fe para tu crecimiento espiritual.
        </p>

        <div>
          <button
            onClick={onEnter}
            className="mt-4 px-10 py-4 bg-sky-600 text-white font-semibold text-lg rounded-full shadow-lg hover:bg-sky-700 transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-300"
          >
            Comenzar la Experiencia
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;