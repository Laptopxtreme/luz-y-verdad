import React, { useState, useCallback } from 'react';
import { searchVerse } from '../services/bibleService.ts';
import { getVerseExplanation } from '../services/geminiService.ts';
import type { BibleVerse } from '../types.ts';
import { Spinner } from './Icons.tsx';

const VerseFinder: React.FC = () => {
  const [query, setQuery] = useState('');
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setVerse(null);
    setExplanation('');
    setError('');

    try {
      const result = await searchVerse(query);
      setVerse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const handleExplain = useCallback(async () => {
    if (!verse) return;

    setIsExplaining(true);
    setExplanation('');
    setError('');

    try {
      const result = await getVerseExplanation(verse.reference, verse.text);
      setExplanation(result);
    } catch (err: any) {
      setError('Hubo un error al generar la explicación.');
    } finally {
      setIsExplaining(false);
    }
  }, [verse]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">Buscador de Versículos</h2>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: 'Juan 3:16' o 'amor de Dios'"
            className="flex-grow w-full px-4 py-3 bg-slate-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-800 placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 disabled:bg-sky-300 transition-colors flex items-center justify-center"
          >
            {isSearching ? <Spinner className="w-5 h-5" /> : 'Buscar'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {verse && (
        <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in">
          <div className="border-l-4 border-yellow-500 pl-4">
            <h3 className="text-2xl font-bold text-gray-800">{verse.reference}</h3>
            <p className="text-sm text-gray-500">{verse.translation_name}</p>
            <blockquote className="mt-4 text-lg text-gray-700 leading-relaxed">
              "{verse.text}"
            </blockquote>
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={handleExplain}
              disabled={isExplaining}
              className="px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 disabled:bg-yellow-300 transition-colors flex items-center justify-center mx-auto"
            >
              {isExplaining ? <Spinner className="w-5 h-5 mr-2" /> : null}
              {isExplaining ? 'Generando...' : 'Explicar Versículo con IA'}
            </button>
          </div>
        </div>
      )}

      {explanation && (
        <div className="bg-sky-50 p-6 rounded-xl shadow-lg animate-fade-in border border-sky-200">
            <h4 className="text-xl font-bold text-sky-800 mb-4">Explicación de Luz Divina</h4>
            <div className="prose prose-lg max-w-none text-gray-800 whitespace-pre-wrap">{explanation}</div>
        </div>
      )}
    </div>
  );
};

export default VerseFinder;