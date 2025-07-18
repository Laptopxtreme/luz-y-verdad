import React, { useState, useCallback } from 'react';
import { generatePrayer } from '../services/geminiService.ts';
import { Spinner } from './Icons.tsx';

const PrayerGenerator: React.FC = () => {
  const [request, setRequest] = useState('');
  const [prayer, setPrayer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.trim()) return;

    setIsLoading(true);
    setPrayer('');
    setError('');

    try {
      const result = await generatePrayer(request);
      setPrayer(result);
    } catch (err: any) {
      setError('Hubo un error al generar la oración.');
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-1">Generador de Oración</h2>
        <p className="text-center text-gray-500 mb-4">Describe tu necesidad y la IA creará una oración para guiarte.</p>
        <form onSubmit={handleGenerate} className="space-y-4">
          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="Escribe tu petición de oración aquí... (ej. por sanidad para un familiar, por guía en una decisión, etc.)"
            className="w-full h-32 px-4 py-3 bg-slate-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-800 placeholder:text-gray-500"
            rows={4}
          />
          <button
            type="submit"
            disabled={isLoading || !request.trim()}
            className="w-full px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 disabled:bg-sky-300 transition-colors flex items-center justify-center"
          >
            {isLoading ? <Spinner className="w-5 h-5 mr-2" /> : null}
            {isLoading ? 'Generando Oración...' : 'Crear Oración'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {prayer && (
        <div className="bg-yellow-50 p-6 rounded-xl shadow-lg border border-yellow-200">
          <h3 className="text-xl font-bold text-yellow-800 mb-4">Una Oración para Ti</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{prayer}</p>
        </div>
      )}
    </div>
  );
};

export default PrayerGenerator;