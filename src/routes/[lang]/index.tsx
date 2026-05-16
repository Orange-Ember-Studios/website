import type { RouteComponent } from "@emberkit/core";
import Hero from "../../components/Hero/Hero.tsx";
import Portfolio from "../../components/Portfolio/Portfolio.tsx";
import Services from "../../components/Services/Services.tsx";
import About from "../../components/About/About.tsx";
import Contact from "../../components/Contact/Contact.tsx";

const LangHome: RouteComponent = (props) => (
  <main>
    <Hero />
    <Portfolio lang={props.params.lang} />
    <Services />
    <About />
    <Contact />
  </main>
);

export default LangHome;
