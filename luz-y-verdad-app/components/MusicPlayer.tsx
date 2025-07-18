import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { searchChristianMusic } from '../services/geminiService.ts';
import type { YouTubeVideo } from '../types.ts';
import { Spinner, SearchIcon, HeartIcon, PlayIcon, StopIcon } from './Icons.tsx';

const FAVORITES_KEY = 'luz-y-verdad-music-favorites';

// TypeScript declaration for the YouTube IFrame Player API
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: new (id: string, options: any) => any;
    };
  }
}

const MusicPlayer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'favorites'>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [favorites, setFavorites] = useState<YouTubeVideo[]>([]);
  const [nowPlaying, setNowPlaying] = useState<YouTubeVideo | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);
  const playerRef = useRef<any>(null); // To hold the YT.Player instance

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (e) {
      console.error("Failed to load favorites", e);
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error("Failed to save favorites", e);
    }
  }, [favorites]);
  
  // Effect to initialize the YouTube player
  useEffect(() => {
    const initPlayer = () => {
      // Ensure we don't create multiple players
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      playerRef.current = new window.YT.Player('youtube-player-container', {
        // height and width are removed to allow the player to have a size.
        // It's placed off-screen so it's not visible to the user.
        playerVars: {
          playsinline: 1, // Important for mobile browsers
        },
        events: {
          'onReady': () => {
            // If a song was meant to be played before the player was ready, play it now.
            if (currentVideoId) {
                playerRef.current.loadVideoById(currentVideoId);
                playerRef.current.playVideo();
            }
          },
        },
      });
    };
    
    // If the YT object and Player constructor are not yet available,
    // the global callback will trigger initialization.
    if (!window.YT || !window.YT.Player) {
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      // If the API script is already loaded, just initialize the player.
      initPlayer();
    }

    // Cleanup on component unmount
    return () => {
      playerRef.current?.destroy();
    };
  }, []); // Empty dependency array ensures this runs only once on mount.


  // Effect to control playback when currentVideoId changes
  useEffect(() => {
    // Ensure the player and its methods are ready
    if (!playerRef.current || typeof playerRef.current.loadVideoById !== 'function') {
      return;
    }
    
    if (currentVideoId) {
      playerRef.current.loadVideoById(currentVideoId);
      playerRef.current.playVideo();
    } else {
      playerRef.current.stopVideo();
    }
  }, [currentVideoId]);


  const favoriteIds = useMemo(() => new Set(favorites.map(f => f.videoId)), [favorites]);
  const isFavorite = (videoId: string) => favoriteIds.has(videoId);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    setResults([]);
    setError('');
    try {
      const videoResults = await searchChristianMusic(query);
      setResults(videoResults);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handlePlay = (video: YouTubeVideo) => {
    setNowPlaying(video);
    setCurrentVideoId(video.videoId); // This triggers the playback effect
  };

  const handleStop = () => {
    setNowPlaying(null);
    setCurrentVideoId(null); // This triggers the stop effect
  };

  const toggleFavorite = (video: YouTubeVideo) => {
    setFavorites(prev => {
      if (isFavorite(video.videoId)) {
        return prev.filter(f => f.videoId !== video.videoId);
      } else {
        if (prev.find(f => f.videoId === video.videoId)) return prev;
        return [...prev, video];
      }
    });
  };

  const renderSongCard = (video: YouTubeVideo) => (
    <div key={video.videoId} className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4 transition-shadow hover:shadow-lg">
      <img src={video.thumbnailUrl} alt={video.title} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
      <div className="flex-grow min-w-0">
        <h3 className="font-bold text-gray-800 line-clamp-2">{video.title}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{video.channelTitle}</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <button
          onClick={() => handlePlay(video)}
          title="Reproducir"
          className="p-2 rounded-full text-sky-600 hover:bg-sky-100 transition-colors"
        >
          <PlayIcon className="w-6 h-6" />
        </button>
        <button
          onClick={() => toggleFavorite(video)}
          title={isFavorite(video.videoId) ? "Quitar de favoritos" : "Añadir a favoritos"}
          className={`p-2 rounded-full transition-colors ${
            isFavorite(video.videoId) ? 'text-red-500 hover:bg-red-100' : 'text-gray-400 hover:text-red-500 hover:bg-red-100'
          }`}
        >
          <HeartIcon className="w-6 h-6" filled={isFavorite(video.videoId)} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Container for the YouTube player, placed off-screen but with dimensions to allow playback */}
      <div id="youtube-player-container" className="fixed -top-[1000px] -left-[1000px]"></div>
      
      {/* Now Playing Bar */}
      {nowPlaying && (
          <div className="sticky top-4 z-20 bg-sky-600 text-white p-3 rounded-lg shadow-lg flex items-center justify-between animate-fade-in">
              <div className="flex-grow min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider">Reproduciendo ahora</p>
                  <p className="font-bold truncate">{nowPlaying.title}</p>
              </div>
              <button onClick={handleStop} title="Detener" className="p-2 rounded-full hover:bg-sky-700 transition-colors ml-4">
                  <StopIcon className="w-6 h-6"/>
              </button>
          </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-1">Música para el Alma</h2>
        <p className="text-center text-gray-500 mb-4">Busca o escucha tu música de adoración favorita.</p>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 text-center font-semibold transition-colors ${
              activeTab === 'search' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-gray-500 hover:text-sky-500'
            }`}
          >
            Buscar
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-3 text-center font-semibold transition-colors ${
              activeTab === 'favorites' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-gray-500 hover:text-sky-500'
            }`}
          >
            Favoritos ({favorites.length})
          </button>
        </div>

        {activeTab === 'search' && (
          <div>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej: 'Marcos Witt', 'Rojo', 'Adoración profética'"
                className="flex-grow w-full px-4 py-3 bg-slate-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-800 placeholder:text-gray-500"
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="w-full sm:w-auto px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 disabled:bg-sky-300 transition-colors flex items-center justify-center"
              >
                {isLoading ? <Spinner className="w-5 h-5" /> : <SearchIcon className="w-5 h-5" />}
                <span className="ml-2">{isLoading ? 'Buscando...' : 'Buscar'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
      
      {error && activeTab === 'search' && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {isLoading && activeTab === 'search' && (
           <div className="flex justify-center items-center py-10">
               <Spinner className="w-10 h-10 text-sky-600" />
           </div>
        )}

        {activeTab === 'search' && !isLoading && hasSearched && results.length === 0 && !error && (
            <div className="text-center py-10 px-4 bg-white rounded-xl shadow-lg">
                <SearchIcon className="w-12 h-12 mx-auto text-gray-300" />
                <h3 className="mt-4 text-xl font-semibold text-gray-700">No se encontraron resultados</h3>
                <p className="mt-2 text-gray-500">Intenta con otra búsqueda, por ejemplo el nombre de un artista o una canción.</p>
            </div>
        )}

        {activeTab === 'search' && !isLoading && results.length > 0 && results.map(renderSongCard)}
        
        {activeTab === 'favorites' && favorites.length > 0 && favorites.map(renderSongCard)}
        {activeTab === 'favorites' && favorites.length === 0 && (
          <div className="text-center py-10 px-4 bg-white rounded-xl shadow-lg">
            <HeartIcon className="w-12 h-12 mx-auto text-gray-300" />
            <h3 className="mt-4 text-xl font-semibold text-gray-700">Tu lista de favoritos está vacía</h3>
            <p className="mt-2 text-gray-500">Usa el ícono del corazón ❤️ en los resultados de búsqueda para guardar tus canciones preferidas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPlayer;