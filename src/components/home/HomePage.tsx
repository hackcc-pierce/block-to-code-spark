import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import STLViewer from '../stl/STLViewer';

function HomePage() {
  const [scrollAllowed, setScrollAllowed] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = scrollAllowed ? 'auto' : 'hidden';
  }, [scrollAllowed]);

  const smoothScrollTo = (targetY, duration = 800) => {
    const startY = window.scrollY;
    const distance = targetY - startY;
    let startTime = null;

    function easeInOutCubic(t) {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animation(currentTime) {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * ease);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }

    requestAnimationFrame(animation);
  };

  const handleJumpIn = () => {
    setFadeOut(true);
    setTimeout(() => {
      navigate('/code');
    }, 500);
  };

  const handleGoBack = () => {
    setScrollAllowed(true);
    setTimeout(() => {
      smoothScrollTo(0, 800);
      setTimeout(() => {
        setScrollAllowed(false);
      }, 850);
    }, 50);
  };

  return (
    <div className={`bg-white transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Hero Section */}
      <div className="relative flex flex-col items-center justify-center h-screen px-4 sm:px-6 md:px-12 lg:px-20 overflow-hidden">
        <STLViewer />

        <h1 className="font-momo text-3xl sm:text-4xl md:text-5xl text-center text-gray-800 mb-4">
          Learn to code by blowing bubbles!
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-700 text-center max-w-xl mb-8">
          Make programming simple and let your creativity flow!
        </p>

        <button
          onClick={handleJumpIn}
          className="font-bungee bg-green-400 hover:bg-purple-600 text-white font-bold py-4 sm:py-5 px-6 sm:px-10 text-xl sm:text-2xl md:text-3xl rounded-3xl border-4 border-black transition duration-300 hover:scale-110"
        >
          <span style={{
            textShadow: '-2px -2px 0 black, 2px -2px 0 black, -2px 2px 0 black, 2px 2px 0 black'
          }}>
            Jump In!
          </span>
        </button>

        <button 
          onClick={() => {
            setScrollAllowed(true);
            setTimeout(() => {
              const target = document.getElementById('features');
              if (target) {
                const targetY = target.getBoundingClientRect().top + window.scrollY;
                smoothScrollTo(targetY, 800);
                setTimeout(() => {
                  setScrollAllowed(false);
                }, 850);
              }
            }, 50);
          }}
          className="font-momo bg-white hover:bg-blue-200 text-blue-800 font-semibold py-2 px-4 sm:px-6 text-sm sm:text-base rounded-3xl border-2 border-blue-800 mt-4 hover:scale-110 mb-10"
        >
          Learn More
        </button>

        {/* Bottom Corner Images */}
        {/* 🟥 Red Bubble Layer (largest) */}
<div className="absolute bottom-0 left-0 w-96 h-96 z-10 origin-bottom-left transition-transform duration-300 hover:scale-110">
  <img src="/images/bubbles-red.png" alt="Red Bubble" className="w-full h-full object-contain" />
</div>
<div className="absolute bottom-0 right-0 w-96 h-96 z-10 origin-bottom-right transition-transform duration-300 hover:scale-110">
  <img src="/images/bubbles-red.png" alt="Red Bubble" className="w-full h-full object-contain" style={{ transform: 'scaleX(-1)' }} />
</div>

{/* 🟦 Blue Bubble Layer (medium) */}
<div className="absolute bottom-0 left-0 w-64 h-64 z-20 origin-bottom-left transition-transform duration-300 hover:scale-125">
  <img src="/images/bubbles-blue.png" alt="Blue Bubble" className="w-full h-full object-contain" />
</div>
<div className="absolute bottom-0 right-0 w-64 h-64 z-20 origin-bottom-right transition-transform duration-300 hover:scale-125">
  <img src="/images/bubbles-blue.png" alt="Blue Bubble" className="w-full h-full object-contain" style={{ transform: 'scaleX(-1)' }} />
</div>

{/* 🟩 Green Bubble Layer (smallest) */}
<div className="absolute bottom-0 left-0 w-40 h-40 z-30 origin-bottom-left transition-transform duration-300 hover:scale-125">
  <img src="/images/bubbles-green.png" alt="Green Bubble" className="w-full h-full object-contain" />
</div>
<div className="absolute bottom-0 right-0 w-48 h-48 z-30 origin-bottom-right transition-transform duration-300 hover:scale-125">
  <img src="/images/bubbles-green.png" alt="Green Bubble" className="w-full h-full object-contain" style={{ transform: 'scaleX(-1)' }} />
</div>

      </div>

      {/* About Me Section */}
      <section
        id="features"
        className="relative min-h-screen bg-white text-gray-800 px-4 sm:px-6 lg:px-8 py-16 overflow-hidden"
      >
        {/* Top Corner Images (Flipped Vertically) */}
        {/* 🟥 Red Bubble Layer (largest) */}
<div className="absolute top-0 left-0 w-96 h-96 z-10 origin-top-left transition-transform duration-300 hover:scale-110">
  <img src="/images/bubbles-red.png" alt="Red Bubble" className="w-full h-full object-contain" style={{ transform: 'scaleY(-1)' }} />
</div>
<div className="absolute top-0 right-0 w-96 h-96 z-10 origin-top-right transition-transform duration-300 hover:scale-110">
  <img src="/images/bubbles-red.png" alt="Red Bubble" className="w-full h-full object-contain" style={{ transform: 'scaleX(-1) scaleY(-1)' }} />
</div>

{/* 🟦 Blue Bubble Layer (medium) */}
<div className="absolute top-0 left-0 w-72 h-72 z-20 origin-top-left transition-transform duration-300 hover:scale-125">
  <img src="/images/bubbles-blue.png" alt="Blue Bubble" className="w-full h-full object-contain" style={{ transform: 'scaleY(-1)' }} />
</div>
<div className="absolute top-0 right-0 w-72 h-72 z-20 origin-top-right transition-transform duration-300 hover:scale-125">
  <img src="/images/bubbles-blue.png" alt="Blue Bubble" className="w-full h-full object-contain" style={{ transform: 'scaleX(-1) scaleY(-1)' }} />
</div>

{/* 🟩 Green Bubble Layer (smallest) */}
<div className="absolute top-0 left-0 w-48 h-48 z-30 origin-top-left transition-transform duration-300 hover:scale-125">
  <img src="/images/bubbles-green.png" alt="Green Bubble" className="w-full h-full object-contain" style={{ transform: 'scaleY(-1)' }} />
</div>
<div className="absolute top-0 right-0 w-48 h-48 z-30 origin-top-right transition-transform duration-300 hover:scale-125">
  <img src="/images/bubbles-green.png" alt="Green Bubble" className="w-full h-full object-contain" style={{ transform: 'scaleX(-1) scaleY(-1)' }} />
</div>

        {/* Go Back Button */}
        <button
          onClick={handleGoBack}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-transparent border-none transition-transform duration-300 hover:scale-110 z-50"
        >
          <img
            src="/images/arrow.png"
            alt="Go Back"
            className="w-32 sm:w-36 md:w-40 h-auto"
          />
        </button>

        {/* Description */}
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="font-momo text-base sm:text-lg md:text-xl leading-relaxed">
              Inspired by the simple and elegant block coding of&nbsp;
              <img src="/images/scratch.png" alt="Scratch" className="inline-block w-20 sm:w-24 align-middle relative -top-1" />
              &nbsp;we developed BubbleCode to bridge the gap between conceptual logic and actual, functional code.
            </p>
            <p className="font-momo text-base sm:text-lg md:text-xl leading-relaxed">
              With BubbleCode, you learn the fundamentals of coding by breaking it down into easy-to-digest bubbles, which convert into multiple programming languages.
            </p>
            <p className="font-momo text-base sm:text-lg md:text-xl leading-relaxed">
              Test your skills with built-in challenges — from completing tasks to reverse-engineering real code!
            </p>
          </div>
        </div>

        {/* Bottom Credits */}
        <footer className="font-bungee absolute bottom-8 left-1/2 transform -translate-x-1/2 text-sm sm:text-base text-gray-500 text-center space-y-2">
          <img src="/images/theboy.gif" alt="Mascot" className="inline-block w-20 sm:w-24 align-middle relative -top-1" /><br />
          <div>Developers</div>
          <div>Lexington Carey &nbsp;&nbsp; Hasti Salsali</div>
          <div>Alex Harwig &nbsp;&nbsp; Angel De Leon</div>
        </footer>
      </section>
    </div>
  );
}

export default HomePage;
