import Header from './components/Header';
import Hero from './components/Hero';
import Loop from './components/Loop';
import Districts from './components/Districts';
import Raise from './components/Raise';
import Founder from './components/Founder';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <Hero />
        <Loop />
        <Districts />
        <Raise />
        <Founder />
      </main>
      <Footer />
    </>
  );
}
