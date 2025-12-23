import React, { useState, useCallback } from 'react';
import { generateBookInfographic } from './services/geminiService';
import { BookInfographicData } from './types';
import Infographic from './components/Infographic';

function App() {
  const [step, setStep] = useState<'input' | 'loading' | 'result' | 'error'>('input');
  const [inputs, setInputs] = useState({ title: '', author: '' });
  const [data, setData] = useState<BookInfographicData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirm = useCallback(async () => {
    if (!inputs.title || !inputs.author) {
      setErrorMsg("Please enter both the book title and the author.");
      return;
    }

    setStep('loading');
    setErrorMsg('');

    try {
      const result = await generateBookInfographic(inputs.title, inputs.author);
      setData(result);
      setStep('result');
    } catch (err) {
      setStep('error');
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  }, [inputs]);

  const handleReset = () => {
    setInputs({ title: '', author: '' });
    setData(null);
    setStep('input');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen font-sans text-stone-800">
      
      {/* Background Pattern */}
      <div className="fixed inset-0 z-[-1] opacity-40 pointer-events-none" style={{
         backgroundImage: 'radial-gradient(#d6d3d1 1px, transparent 1px)',
         backgroundSize: '20px 20px'
      }}></div>

      {step === 'input' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
          <div className="w-full max-w-lg bg-white p-8 md:p-12 rounded-xl shadow-2xl border-t-8 border-amber-600">
            <div className="text-center mb-10">
              <h1 className="text-6xl font-serif font-black text-stone-900 mb-2">Book2Slide</h1>
              <p className="text-stone-500 font-serif italic text-lg">Transforming books into slide decks</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-1">The Book</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Type book´s title"
                  value={inputs.title}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-lg font-serif"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-1">The Writer</label>
                <input
                  type="text"
                  name="author"
                  placeholder="Author"
                  value={inputs.author}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-lg font-serif"
                />
              </div>
              
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleConfirm}
                className="w-full py-4 mt-4 bg-stone-900 hover:bg-black text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                Create Deck
              </button>
            </div>
          </div>
          
          <div className="mt-8 text-stone-400 text-xs text-center max-w-xs leading-relaxed">
            Powered by Gemini 3 Pro Preview. <br/> Automated presentation generation.
          </div>
        </div>
      )}

      {step === 'loading' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-4 border-stone-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-amber-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2 animate-pulse">Drafting Slides...</h2>
          <p className="text-stone-500">Reading "{inputs.title}" by {inputs.author}</p>
          <div className="mt-8 flex gap-2">
            <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </div>
        </div>
      )}

      {step === 'result' && data && (
        <div className="py-8 px-4 md:px-0 flex justify-center w-full">
          <Infographic data={data} onReset={handleReset} />
        </div>
      )}

      {step === 'error' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-md text-center border-t-4 border-red-500">
            <div className="text-4xl mb-4">😔</div>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-stone-600 mb-6">{errorMsg}</p>
            <button 
              onClick={() => setStep('input')}
              className="px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;