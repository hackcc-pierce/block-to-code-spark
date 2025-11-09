import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
      navigate('/');
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
    <div className={`bg-blue-100 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center h-screen p-8">
        <img
          src="/images/theboy.png"
          alt="TheBoy"
          className="w-72 md:w-96 lg:w-[30rem] mb-8"
        />

        <h1 className="font-momo text-4xl md:text-5xl text-center text-gray-800 mb-4">
          Learn to code by blowing bubbles!
        </h1>
        <p className="text-lg text-gray-700 text-center max-w-xl mb-8">
          Make programming simple and let your creativity flow!
        </p>

        <button
          onClick={handleJumpIn}
          className="font-bungee bg-purple-400 hover:bg-purple-600 text-white font-bold py-6 px-10 text-3xl rounded-3xl border-4 border-white transition duration-300 hover:scale-110"
        >
          Jump In!
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
          className="font-momo bg-white hover:bg-blue-200 text-blue-800 font-semibold py-2 px-6 text-base rounded-3xl border border-blue-800 mt-4 hover:scale-110"
        >
          Learn More
        </button>
      </div>

      {/* About Me Section */}
      <section id="features" className="relative min-h-screen bg-white px-6 py-12 text-gray-800">
        {/* Go Back Button */}
        <button
          onClick={handleGoBack}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 p-0 bg-transparent border-none transition-transform duration-300 hover:scale-110"
        >
          <img
            src="/images/arrow.png"
            alt="Go Back"
            className="w-40 h-20"
          />
        </button>

        {/* Centered Description */}
        <div className="flex items-center justify-center h-[80vh]">
          <p className="font-momo ax-w-2xl text-lg leading-relaxed text-center text-xl px-40">
            Inspired by the simple and elegant block coding of&nbsp;
             <img src="/images/scratch.png" alt="coding" className="inline-block w-24 align-middle relative -top-1"/>
            &nbsp;we developed BubbleCode as a way to bridge the gap between conceptual logic and actual, functional code!<br />
            With BubbleCode, you can learn the fundamentals of coding by breaking it down into easy-to-digest bubbles, which are converted into any of multiple programming languages!<br />
            You can even test your new skills by taking on built-in programming challenges, ranging from completing tasks to reverse-engineering real code!
          </p>
        </div>

        {/* Bottom Credits */}
        <footer className="font-bungee absolute bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-500 text-center text-xl">
            <img src="/images/theboy.png" alt="coding" className="inline-block w-24 align-middle relative -top-1"/><br />
            Developers<br />
            Lexington Carey&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Hasti Salsali<br />
            Alex Harwig&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Angel De Leon
        </footer>
      </section>
    </div>
  );
}

export default HomePage;