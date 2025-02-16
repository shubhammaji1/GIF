import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search,
  Loader2,
  Heart,
  Share2,
  Code,
  Image,
  Sticker,
  Text,
  X,
  BookmarkIcon,
  Download,
  Copy,
  Sparkles,
  TrendingUp,
  Clock,
  Filter
} from 'lucide-react';
import type { Gif, ContentType } from './types';

const GIPHY_API_KEY = 'hpvZycW22qCjn5cRM1xtWB8NKq4dQ2My';
const GIPHY_API_URL = 'https://api.giphy.com/v1';

function App() {
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [favorites, setFavorites] = useState<Gif[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contentType, setContentType] = useState<ContentType>('gifs');
  const [selectedGif, setSelectedGif] = useState<Gif | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'trending' | 'recent'>('trending');
  const [showFilters, setShowFilters] = useState(false);

  // Load favorites from localStorage on initial render
  useEffect(() => {
    const savedFavorites = localStorage.getItem('giphyFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('giphyFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const fetchContent = async (query: string = '') => {
    if (showFavorites) return;
    
    setLoading(true);
    setError('');
    try {
      const endpoint = query
        ? `${GIPHY_API_URL}/${contentType}/search`
        : `${GIPHY_API_URL}/${contentType}/${sortBy === 'trending' ? 'trending' : 'random'}`;
      
      const response = await axios.get(endpoint, {
        params: {
          api_key: GIPHY_API_KEY,
          q: query,
          limit: 50,
          rating: 'g'
        }
      });
      
      setGifs(response.data.data);
    } catch (err) {
      setError('Failed to fetch content. Please try again later.');
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showFavorites) {
      fetchContent();
    }
  }, [contentType, showFavorites, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      fetchContent(search);
    }
  };

  const toggleFavorite = (gif: Gif) => {
    setFavorites(prev => 
      prev.some(f => f.id === gif.id)
        ? prev.filter(f => f.id !== gif.id)
        : [...prev, gif]
    );
  };

  const isFavorite = (gif: Gif) => favorites.some(f => f.id === gif.id);

  const handleShare = (gif: Gif) => {
    if (navigator.share) {
      navigator.share({
        title: gif.title,
        url: gif.images.fixed_height.url
      });
    } else {
      navigator.clipboard.writeText(gif.images.fixed_height.url);
      alert('URL copied to clipboard!');
    }
  };

  const handleDownload = async (gif: Gif) => {
    try {
      const response = await fetch(gif.images.fixed_height.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${gif.title || 'giphy'}.gif`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading gif:', error);
      alert('Failed to download. Please try again.');
    }
  };

  const getEmbedCode = (gif: Gif) => {
    return `<iframe src="${gif.images.fixed_height.url}" width="${gif.images.fixed_height.width}" height="${gif.images.fixed_height.height}" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>`;
  };

  const toggleView = () => {
    setShowFavorites(!showFavorites);
    setSearch('');
    setShowFilters(false);
  };

  const renderGifCard = (gif: Gif) => (
    <div
      key={gif.id}
      className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <img
        src={gif.images.fixed_height.url}
        alt={gif.title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute top-2 right-2 flex space-x-2">
          <button
            onClick={() => toggleFavorite(gif)}
            className={`p-2 rounded-full bg-gray-800/90 ${
              isFavorite(gif) ? 'text-red-500' : 'text-gray-400'
            } hover:bg-gray-700 transform hover:scale-110 transition-transform duration-200`}
            title={isFavorite(gif) ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={20} fill={isFavorite(gif) ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => handleShare(gif)}
            className="p-2 rounded-full bg-gray-800/90 text-blue-400 hover:bg-gray-700 transform hover:scale-110 transition-transform duration-200"
            title="Share"
          >
            <Share2 size={20} />
          </button>
          <button
            onClick={() => handleDownload(gif)}
            className="p-2 rounded-full bg-gray-800/90 text-green-400 hover:bg-gray-700 transform hover:scale-110 transition-transform duration-200"
            title="Download"
          >
            <Download size={20} />
          </button>
          <button
            onClick={() => setSelectedGif(gif)}
            className="p-2 rounded-full bg-gray-800/90 text-purple-400 hover:bg-gray-700 transform hover:scale-110 transition-transform duration-200"
            title="Get embed code"
          >
            <Code size={20} />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
          <p className="text-white text-sm truncate">{gif.title}</p>
          <p className="text-gray-400 text-xs mt-1">{gif.type}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/90 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6 text-center">
            GIPHY Clone
          </h1>
          
          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-4 mb-6">
            <button
              onClick={toggleView}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                showFavorites 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-purple-500 hover:bg-gray-700/50'
              }`}
            >
              <BookmarkIcon size={20} />
              <span>Favorites ({favorites.length})</span>
            </button>
            {!showFavorites && (
              <>
                <button
                  onClick={() => setContentType('gifs')}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                    contentType === 'gifs' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-purple-500 hover:bg-gray-700/50'
                  }`}
                >
                  <Image size={20} />
                  <span>GIFs</span>
                </button>
                <button
                  onClick={() => setContentType('stickers')}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                    contentType === 'stickers' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-purple-500 hover:bg-gray-700/50'
                  }`}
                >
                  <Sticker size={20} />
                  <span>Stickers</span>
                </button>
                <button
                  onClick={() => setContentType('text')}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                    contentType === 'text' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-purple-500 hover:bg-gray-700/50'
                  }`}
                >
                  <Text size={20} />
                  <span>Text</span>
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 rounded-lg flex items-center space-x-2 text-gray-400 hover:text-purple-500 hover:bg-gray-700/50 transition-all duration-200"
                >
                  <Filter size={20} />
                  <span>Filters</span>
                </button>
              </>
            )}
          </nav>
          
          {/* Filters */}
          {showFilters && !showFavorites && (
            <div className="flex justify-center gap-4 mb-6 animate-fadeIn">
              <button
                onClick={() => setSortBy('trending')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  sortBy === 'trending' 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-400 hover:text-purple-500'
                }`}
              >
                <TrendingUp size={20} />
                <span>Trending</span>
              </button>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  sortBy === 'recent' 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-400 hover:text-purple-500'
                }`}
              >
                <Clock size={20} />
                <span>Recent</span>
              </button>
            </div>
          )}
          
          {/* Search Form - Only show when not in favorites view */}
          {!showFavorites && (
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search for ${contentType}...`}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-purple-500 transition-colors duration-200"
                >
                  <Search size={24} />
                </button>
              </div>
            </form>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {showFavorites ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Your Favorites
              </h2>
              <div className="flex items-center space-x-2 text-gray-400">
                <Sparkles className="animate-pulse" size={20} />
                <span>{favorites.length} items</span>
              </div>
            </div>
            {favorites.length === 0 ? (
              <div className="text-center text-gray-400 py-12 bg-gray-800/30 rounded-lg backdrop-blur-sm">
                <BookmarkIcon size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-xl">No favorites yet</p>
                <p className="mt-2">Start adding some GIFs to your favorites!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {favorites.map(renderGifCard)}
              </div>
            )}
          </div>
        ) : (
          <>
            {loading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-red-500 text-center p-4 bg-red-500/10 rounded-lg">
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {gifs.map(renderGifCard)}
              </div>
            )}
          </>
        )}
      </main>

      {/* Embed Modal */}
      {selectedGif && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Embed Code
              </h3>
              <button
                onClick={() => setSelectedGif(null)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <pre className="text-gray-300 overflow-x-auto whitespace-pre-wrap">
                {getEmbedCode(selectedGif)}
              </pre>
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getEmbedCode(selectedGif));
                  alert('Embed code copied to clipboard!');
                }}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity duration-200 flex items-center justify-center gap-2"
              >
                <Copy size={20} />
                <span>Copy to Clipboard</span>
              </button>
              <button
                onClick={() => handleDownload(selectedGif)}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity duration-200 flex items-center justify-center gap-2"
              >
                <Download size={20} />
                <span>Download GIF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;