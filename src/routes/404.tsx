import { createEffect, createSignal } from "@emberkit/core";
import type { RouteComponent } from "@emberkit/core";
import { IconArrowRight } from "@emberkit/icons";
import { getTranslation } from "../i18n/i18n.ts";

const embers = [
  { l: 12, t: 20, w: 3, d: 14, o: 0.35 },
  { l: 55, t: 70, w: 4, d: 18, o: 0.4 },
  { l: 80, t: 40, w: 2, d: 12, o: 0.3 },
  { l: 30, t: 85, w: 3, d: 16, o: 0.45 },
  { l: 65, t: 15, w: 5, d: 20, o: 0.25 },
];

const NotFoundPage: RouteComponent = () => {
  createEffect(() => {
    const container = document.getElementById("parallax-container");
    const content = document.getElementById("parallax-content");
    const handleMouseMove = (e: MouseEvent) => {
      if (!container || !content) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const moveX = (clientX - innerWidth / 2) / 25;
      const moveY = (clientY - innerHeight / 2) / 25;
      const rotateX = (clientY - innerHeight / 2) / 100;
      const rotateY = (clientX - innerWidth / 2) / 100;
      content.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  });

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-[#0b0f19] relative overflow-hidden perspective-1000"
      id="parallax-container"
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 select-none">
        <img
          src="/Shield.svg"
          alt=""
          className="w-[120%] max-w-none transform scale-150 blur-xl animate-pulse-slow"
        />
      </div>
      <div
        className="absolute inset-0 pointer-events-none sm:opacity-100 opacity-50"
        id="embers-field"
      >
        {embers.map((em, i) => (
          <div
            key={i}
            className="ember absolute rounded-full bg-linear-to-t from-orange-600 to-orange-300 blur-[1px]"
            style={{
              left: `${em.l}%`,
              top: `${em.t}%`,
              width: `${em.w}px`,
              height: `${em.w}px`,
              opacity: em.o,
              animation: `float-up ${em.d}s linear infinite`,
              animationDelay: `${-i * 2}s`,
            }}
          />
        ))}
      </div>
      <div
        className="relative z-10 text-center px-6 transition-transform duration-500 ease-out translate-z-0"
        id="parallax-content"
      >
        <div className="relative inline-block mb-8 group">
          <div className="absolute -inset-4 bg-orange-600/20 rounded-full blur-2xl group-hover:bg-orange-500/30 transition-all duration-700" />
          <h1 className="text-[10rem] md:text-[15rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-orange-300 via-orange-500 to-orange-900 drop-shadow-2xl select-none">
            404
          </h1>
        </div>
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2
            className="text-3xl md:text-5xl font-bold text-white tracking-tight"
            data-i18n="error404.message"
          >
            {getTranslation("error404.message")}
          </h2>
          <p
            className="text-orange-200/60 max-w-md mx-auto text-lg md:text-xl font-light leading-relaxed"
            data-i18n="error404.description"
          >
            {getTranslation("error404.description")}
          </p>
        </div>
        <div className="mt-12">
          <a href="/en/" className="relative inline-flex items-center group">
            <div className="absolute -inset-1 bg-linear-to-r from-orange-600 to-orange-400 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <span className="relative px-12 py-5 bg-[#0b0f19] text-white font-bold rounded-full border border-orange-500/30 transition-all duration-300 transform group-hover:scale-105 group-active:scale-95 flex items-center gap-3">
              <span data-i18n="error404.backHome">
                {getTranslation("error404.backHome")}
              </span>
              <IconArrowRight
                size={20}
                className="transition-transform group-hover:translate-x-1"
              />
            </span>
          </a>
        </div>
      </div>
      <div className="absolute inset-0 border-40 border-orange-600/5 pointer-events-none md:block hidden" />
      <style>
        {`
        .perspective-1000 { perspective: 1000px; }
        .translate-z-0 { transform: translateZ(0); }
        @keyframes float-up {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(50px) scale(0); opacity: 0; }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1.5) rotate(0deg); opacity: 0.1; }
          50% { transform: scale(1.6) rotate(5deg); opacity: 0.15; }
        }
        .animate-pulse-slow { animation: pulse-slow 20s ease-in-out infinite; }
      `}
      </style>
    </main>
  );
};

export default NotFoundPage;
