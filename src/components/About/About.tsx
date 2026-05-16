import { IconZap } from "@emberkit/icons";

export function About() {
  return (
    <section
      id="about"
      aria-label="Our Story"
      className="py-24 bg-ash-950 text-white relative border-t border-white/5 overflow-hidden"
    >
      <div className="absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3 w-[500px] h-[500px] bg-ember-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col space-y-8">
            <div>
              <span
                data-i18n="about.tagline"
                className="text-ember-400 font-semibold tracking-[0.3em] uppercase text-sm md:text-base block mb-4"
              >
                Our Story
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
                <span data-i18n="about.titlePrefix">Forging the</span> <br />{" "}
                <span
                  data-i18n="about.titleHighlight"
                  className="text-transparent bg-clip-text bg-linear-to-r from-void-500 via-ember-500 to-ember-400"
                >
                  Future of Play
                </span>
              </h2>
              <div className="w-16 h-1 bg-ember-500 rounded-full mb-6" />
            </div>
            <p
              data-i18n="about.paragraph1"
              className="text-gray-400 text-lg md:text-xl leading-relaxed"
            >
              At Orange Ember Studios, we believe that great software and great games
              are born from the same spark: an obsessive dedication to craftsmanship and
              user experience.
            </p>
            <p
              data-i18n="about.paragraph2"
              className="text-gray-400 text-lg md:text-xl leading-relaxed"
            >
              Our mission is to bridge the gap between high-end game development and
              premium web/mobile applications. Whether we're optimizing an engine for a
              desktop RPG or architecting a robust enterprise dashboard, our glowing ember
              of creativity never dims.
            </p>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white">10+</span>
                <span
                  data-i18n="about.gamesPublished"
                  className="text-sm text-ember-400 tracking-wider uppercase mt-1"
                >
                  Games Published
                </span>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white">50+</span>
                <span
                  data-i18n="about.appsDelivered"
                  className="text-sm text-ember-400 tracking-wider uppercase mt-1"
                >
                  Apps Delivered
                </span>
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 rounded-[2rem] bg-linear-to-r from-void-500 via-ember-700 to-ember-400 opacity-50 blur-[20px] group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative rounded-[2rem] overflow-hidden border border-white/10 aspect-square shadow-2xl bg-gray-900">
              <img
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop"
                alt="Orange Ember Development Process"
                className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-linear-to-t from-ash-950 via-transparent to-transparent opacity-80" />
            </div>
            <div className="absolute -bottom-6 -left-6 md:-left-12 bg-ash-950 border border-white/10 rounded-2xl p-6 shadow-[0_20px_40px_rgba(45,43,100,0.4)] flex items-center gap-4 hover:-translate-y-2 transition-transform duration-500">
              <div className="w-12 h-12 rounded-full bg-ember-500/20 flex items-center justify-center text-ember-400">
                <IconZap className="w-6 h-6" />
              </div>
              <div>
                <span
                  data-i18n="about.ignitingIdeas"
                  className="block text-white font-bold text-lg"
                >
                  Igniting Ideas
                </span>
                <span
                  data-i18n="about.sinceDay1"
                  className="block text-gray-400 text-sm"
                >
                  Since Day One
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
