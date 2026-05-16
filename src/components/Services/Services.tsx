import {
  IconGrid,
  IconLayers,
  IconPhone,
  IconPlay,
} from "@emberkit/icons";

const services = [
  {
    title: "Desktop Video Games",
    titleKey: "services.desktopGamesTitle",
    description:
      "Engaging gameplay experiences designed specifically for PC and Steam releases, bringing polished, creative worlds to life.",
    descriptionKey: "services.desktopGamesDesc",
    Icon: IconPlay,
    iconClass: "text-ember-400",
  },
  {
    title: "Mobile Games",
    titleKey: "services.mobileGamesTitle",
    description:
      "Highly optimized mobile games tailored to captivate players on Android devices. (iOS compatibility coming soon).",
    descriptionKey: "services.mobileGamesDesc",
    Icon: IconPhone,
    iconClass: "text-ember-500",
  },
  {
    title: "Web Applications",
    titleKey: "services.webAppsTitle",
    description:
      "State-of-the-art, responsive web platforms built with modern frameworks for exceptional user experiences.",
    descriptionKey: "services.webAppsDesc",
    Icon: IconLayers,
    iconClass: "text-ember-400",
  },
  {
    title: "Mobile Apps",
    titleKey: "services.mobileAppsTitle",
    description:
      "Cross-platform hybrid mobile applications crafted meticulously with Flutter and React Native / Expo to scale your business.",
    descriptionKey: "services.mobileAppsDesc",
    Icon: IconGrid,
    iconClass: "text-ember-700",
  },
] as const;

export function Services() {
  return (
    <section
      id="services"
      aria-label="Our Services"
      className="py-24 bg-ash-950 text-white relative border-t border-white/5"
    >
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-void-500/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 -translate-x-1/2" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 relative">
          <span
            data-i18n="services.tagline"
            className="text-ember-400 font-semibold tracking-[0.3em] uppercase mb-4 block text-sm md:text-base"
          >
            Expertise
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span data-i18n="services.title">What We</span>{" "}
            <span
              data-i18n="services.titleHighlight"
              className="text-transparent bg-clip-text bg-linear-to-r from-ember-400 via-ember-500 to-ember-700"
            >
              Forge
            </span>
          </h2>
          <p
            data-i18n="services.description"
            className="text-gray-400 max-w-2xl mx-auto text-lg"
          >
            We specialize in creating top-tier interactive experiences. From the
            adrenaline of gaming to the seamless utility of modern apps.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {services.map((service) => (
            <article
              key={service.titleKey}
              className="group relative p-8 md:p-10 rounded-3xl bg-gray-900 border border-white/5 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(45,43,100,0.3)] hover:border-void-500/50 cursor-default"
            >
              <div className="absolute inset-0 bg-linear-to-br from-void-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-ash-950 border border-white/10 flex items-center justify-center mb-8 shadow-inner group-hover:border-ember-500/40 group-hover:shadow-[0_0_20px_rgba(255,91,13,0.1)] transition-all duration-500">
                  <service.Icon className={`w-10 h-10 ${service.iconClass}`} />
                </div>
                <h3
                  data-i18n={service.titleKey}
                  className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-ember-400 transition-colors duration-300"
                >
                  {service.title}
                </h3>
                <p
                  data-i18n={service.descriptionKey}
                  className="text-gray-400 leading-relaxed text-base md:text-lg"
                >
                  {service.description}
                </p>
              </div>
              <div className="absolute bottom-0 left-0 w-0 h-1 md:h-[6px] bg-linear-to-r from-ember-400 via-ember-500 to-ember-700 transition-all duration-700 ease-out group-hover:w-full" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
