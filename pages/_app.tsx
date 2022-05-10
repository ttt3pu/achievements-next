import Footer from '../components/molecules/Footer';
import Header from '../components/molecules/Header';
import '../styles/globals.scss';
import '../styles/variables.scss';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default MyApp;
