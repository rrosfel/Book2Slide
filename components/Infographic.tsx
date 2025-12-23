import React, { useRef, useState } from 'react';
import { BookInfographicData } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface InfographicProps {
  data: BookInfographicData;
  onReset: () => void;
}

const Infographic: React.FC<InfographicProps> = ({ data, onReset }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Ref for the container holding all slides for printing (hidden from user)
  const printContainerRef = useRef<HTMLDivElement>(null);

  const totalSlides = 10;

  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  const handleDownloadPdf = async () => {
    if (!printContainerRef.current) return;
    setIsDownloading(true);

    try {
      // 16:9 Aspect Ratio for Slides in PDF
      // A4 Landscape is approx 297mm x 210mm. 
      // Let's use a custom slide size close to 1080p ratio but in mm. 
      // 297mm width, ~167mm height.
      const pdf = new jsPDF('l', 'mm', [297, 167]); 
      
      const slides = printContainerRef.current.children;
      
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i] as HTMLElement;
        
        // Use html2canvas
        const canvas = await html2canvas(slide, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false,
          backgroundColor: '#fdfbf7' // Ensure background is captured
        });

        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, 297, 167);
      }
      
      pdf.save(`${data.title.replace(/\s+/g, '_')}_Presentation.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // --- SLIDE COMPONENTS ---

  const SlideWrapper = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
    <div className={`w-full aspect-video bg-[#fdfbf7] relative overflow-hidden flex flex-col shadow-2xl ${className}`}>
      {/* Top Bar Decoration */}
      <div className="h-2 w-full bg-gradient-to-r from-amber-900 via-amber-600 to-amber-900 flex-shrink-0"></div>
      
      {/* Slide Content */}
      <div className="flex-grow p-8 md:p-12 flex flex-col relative z-10 h-full overflow-hidden">
        {children}
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-4 right-6 text-[10px] text-stone-400 font-bold tracking-widest uppercase z-20 bg-[#fdfbf7]/80 px-2 rounded">
        Book2Slide • {data.title}
      </div>
      
      {/* Background Texture */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" style={{
         backgroundImage: 'radial-gradient(#2d2a26 1px, transparent 1px)',
         backgroundSize: '20px 20px'
      }}></div>
    </div>
  );

  const SlideTitle = ({ text, sub }: { text: string, sub?: string }) => (
    <div className="mb-6 border-b border-stone-200 pb-4 flex-shrink-0">
      {sub && <div className="text-amber-600 font-bold uppercase tracking-widest text-sm mb-2">{sub}</div>}
      <h2 className="text-4xl font-serif font-bold text-stone-900">{text}</h2>
    </div>
  );

  // --- RENDERERS FOR EACH SLIDE TYPE ---

  const renderSlideContent = (index: number) => {
    switch(index) {
      case 0: // COVER
        return (
          <SlideWrapper className="justify-center items-center text-center">
            <div className="bg-amber-100 px-4 py-1 rounded-full text-amber-800 font-bold text-sm tracking-widest mb-6 border border-amber-200 inline-block">
              LITERARY ANALYSIS DECK
            </div>
            <h1 className="text-6xl md:text-7xl font-serif font-black text-stone-900 mb-4 leading-tight">
              {data.title}
            </h1>
            <p className="text-2xl md:text-3xl font-serif text-stone-600 italic mb-8">
              by {data.author}
            </p>
            <div className="w-24 h-1 bg-amber-600 mx-auto mb-8"></div>
            <p className="text-lg text-stone-500 max-w-2xl mx-auto">
              "{data.tagline}"
            </p>
            <div className="absolute bottom-12 left-0 right-0 text-center text-sm text-stone-400">
              {data.genre} • {data.publicationYear}
            </div>
          </SlideWrapper>
        );

      case 1: // SYNOPSIS
        return (
          <SlideWrapper>
            <SlideTitle text="Central Thesis" sub="The Core Argument" />
            <div className="flex-grow flex items-center overflow-hidden">
              <div className="bg-white p-8 rounded-lg shadow-sm border-l-4 border-amber-600 w-full max-h-full overflow-y-auto">
                 <p className="font-serif text-lg md:text-xl leading-relaxed text-stone-800 text-justify">
                  {data.summary}
                 </p>
              </div>
            </div>
          </SlideWrapper>
        );

      case 2: // TARGET AUDIENCE
        return (
          <SlideWrapper>
            <SlideTitle text="Context & Audience" sub="The Framework" />
            <div className="grid grid-cols-2 gap-8 flex-grow">
               <div className="bg-stone-100 p-8 rounded-lg flex flex-col justify-center border-t-4 border-stone-300">
                  <h3 className="text-stone-400 font-bold uppercase tracking-widest mb-4">Genre & Style</h3>
                  <p className="text-4xl font-serif text-stone-800">{data.genre}</p>
               </div>
               <div className="bg-amber-50 p-8 rounded-lg border-t-4 border-amber-400 flex flex-col justify-center">
                  <h3 className="text-amber-800/60 font-bold uppercase tracking-widest mb-4">Ideal Reader</h3>
                  <p className="text-3xl font-serif text-amber-900 italic">"{data.targetAudience}"</p>
               </div>
            </div>
          </SlideWrapper>
        );

      case 3: // CHARACTERS OR ARCHETYPES
        return (
          <SlideWrapper>
            <SlideTitle text="Key Figures / Archetypes" sub="The Players" />
            <div className="grid grid-cols-2 gap-6 overflow-y-auto h-full pb-4">
              {data.characters.slice(0, 4).map((char, idx) => (
                <div key={idx} className="bg-white p-5 rounded border border-stone-200 shadow-sm flex gap-4 h-full">
                  <div className="text-4xl flex-shrink-0">{char.icon || '👤'}</div>
                  <div className="flex flex-col">
                    <h4 className="font-bold text-lg text-stone-900">{char.name}</h4>
                    <span className="text-xs font-bold text-amber-600 uppercase mb-2 block">{char.role}</span>
                    <p className="text-sm text-stone-600 leading-relaxed">{char.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </SlideWrapper>
        );

      case 4: // NARRATIVE ARC / LOGIC
        return (
          <SlideWrapper>
            <SlideTitle text="Structural Evolution" sub="The Progression" />
            <div className="flex-grow flex items-center justify-center">
              <div className="w-full relative">
                {/* Horizontal Line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-stone-200 -translate-y-1/2 rounded-full"></div>
                
                <div className="grid grid-cols-4 gap-4 relative z-10">
                  {data.plotArc.map((point, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center group">
                      <div className="w-8 h-8 bg-white border-4 border-amber-600 rounded-full mb-4 group-hover:scale-125 transition-transform shadow-sm flex items-center justify-center font-bold text-amber-800 text-xs">
                        {idx + 1}
                      </div>
                      <h4 className="font-bold text-sm uppercase text-stone-800 mb-2 h-10 flex items-end justify-center">{point.stage}</h4>
                      <div className="bg-white p-3 rounded shadow-sm border border-stone-100 text-xs text-stone-600 w-full h-32 overflow-hidden hover:overflow-y-auto leading-relaxed">
                        {point.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SlideWrapper>
        );

      case 5: // THEMES
        return (
          <SlideWrapper>
             <SlideTitle text="Core Themes" sub="Underlying Messages" />
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
               {data.themes.slice(0, 3).map((theme, idx) => (
                 <div key={idx} className="bg-stone-900 text-stone-100 p-6 rounded relative overflow-hidden flex flex-col border-l-8" style={{borderLeftColor: theme.color}}>
                   <h3 className="font-bold text-xl mb-4 text-white">{theme.name}</h3>
                   <p className="text-stone-300 text-sm leading-relaxed flex-grow">{theme.description}</p>
                 </div>
               ))}
             </div>
          </SlideWrapper>
        );

      case 6: // KEY CONCEPTS 1
        return (
          <SlideWrapper>
            <SlideTitle text="Critical Terminology (I)" sub="Authorial Concepts" />
            <div className="space-y-6 flex-grow flex flex-col justify-center">
              {data.keyConcepts.slice(0, 2).map((concept, idx) => (
                <div key={idx} className="flex gap-6 items-start bg-white p-6 rounded-lg shadow-sm border border-stone-100 h-full">
                  <div className="text-5xl bg-amber-50 p-4 rounded-full flex-shrink-0">{concept.icon || '💡'}</div>
                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-stone-800 mb-2">{concept.term}</h3>
                    <div className="h-1 w-20 bg-amber-200 mb-4"></div>
                    <p className="text-lg text-stone-600 leading-relaxed">{concept.definition}</p>
                  </div>
                </div>
              ))}
            </div>
          </SlideWrapper>
        );

      case 7: // KEY CONCEPTS 2
        return (
          <SlideWrapper>
             <SlideTitle text="Critical Terminology (II)" sub="Authorial Concepts" />
             <div className="space-y-6 flex-grow flex flex-col justify-center">
              {data.keyConcepts.slice(2, 4).map((concept, idx) => (
                <div key={idx} className="flex gap-6 items-start bg-white p-6 rounded-lg shadow-sm border border-stone-100 h-full">
                  <div className="text-5xl bg-amber-50 p-4 rounded-full flex-shrink-0">{concept.icon || '💡'}</div>
                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-stone-800 mb-2">{concept.term}</h3>
                    <div className="h-1 w-20 bg-amber-200 mb-4"></div>
                    <p className="text-lg text-stone-600 leading-relaxed">{concept.definition}</p>
                  </div>
                </div>
              ))}
            </div>
          </SlideWrapper>
        );

      case 8: // KEY QUOTE
        return (
          <SlideWrapper className="justify-center items-center">
            <div className="text-center px-8 md:px-16 w-full">
              <div className="text-8xl md:text-9xl text-amber-200 font-serif leading-none mb-6 opacity-50">"</div>
              <blockquote className="text-3xl md:text-5xl font-serif text-stone-900 leading-tight italic mb-8 relative z-10">
                {data.keyQuote}
              </blockquote>
              <div className="w-32 h-1 bg-stone-300 mx-auto"></div>
            </div>
          </SlideWrapper>
        );

      case 9: // CONCLUSION
        return (
          <SlideWrapper>
            <SlideTitle text="Final Diagnosis" sub="Critical Takeaways" />
            <div className="flex-grow flex items-center">
              <div className="w-full bg-stone-50 p-8 rounded-xl border-2 border-stone-200 border-dashed">
                <ul className="space-y-6">
                  {data.takeaways && data.takeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-4">
                      <span className="w-8 h-8 flex-shrink-0 bg-stone-800 text-white rounded-full flex items-center justify-center font-bold text-sm">{idx + 1}</span>
                      <p className="text-xl text-stone-700 font-medium leading-relaxed">{point}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {data.sources.length > 0 && (
              <div className="mt-4 text-xs text-stone-400 text-right">
                Based on analysis from: {new URL(data.sources[0]).hostname}
              </div>
            )}
          </SlideWrapper>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-24 font-sans">
      
      {/* --- VIEWER --- */}
      <div className="relative shadow-2xl rounded-sm overflow-hidden border-8 border-white bg-stone-800 aspect-video">
        
        {/* Current Slide Display */}
        {renderSlideContent(currentSlide)}

        {/* Navigation Overlays */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-start pl-4 cursor-pointer" onClick={prevSlide}>
          <button className="bg-white/90 p-3 rounded-full shadow-lg text-stone-900 disabled:opacity-50 hover:bg-white" disabled={currentSlide === 0}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-end pr-4 cursor-pointer" onClick={nextSlide}>
           <button className="bg-white/90 p-3 rounded-full shadow-lg text-stone-900 disabled:opacity-50 hover:bg-white" disabled={currentSlide === totalSlides - 1}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        {/* Slide Counter Info */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-stone-900/80 text-white px-4 py-1 rounded-full text-xs font-bold backdrop-blur-sm z-20">
          Slide {currentSlide + 1} of {totalSlides}
        </div>
      </div>

      {/* --- CONTROLS --- */}
      <div className="mt-8 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-stone-200">
        <button onClick={onReset} className="text-stone-500 hover:text-stone-900 font-bold text-sm uppercase tracking-wide">
           ← Create New Deck
        </button>

        <div className="flex gap-4">
          <button onClick={prevSlide} disabled={currentSlide === 0} className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-medium disabled:opacity-50">
            Previous
          </button>
          <button onClick={nextSlide} disabled={currentSlide === totalSlides - 1} className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-medium disabled:opacity-50">
            Next
          </button>
        </div>

        <button 
          onClick={handleDownloadPdf} 
          disabled={isDownloading}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating PDF...
            </>
          ) : (
            <>
              <span>Save as PDF</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            </>
          )}
        </button>
      </div>

      {/* --- HIDDEN PRINT CONTAINER --- */}
      {/* This container renders ALL slides at once but is hidden from view. html2canvas will target this. */}
      <div className="absolute top-0 left-[-9999px]" ref={printContainerRef}>
        <div className="w-[1280px]"> {/* Fixed width for consistent high-res capture */}
          {Array.from({ length: totalSlides }).map((_, idx) => (
             <div key={idx} className="mb-10">
                {renderSlideContent(idx)}
             </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Infographic;
