import Footer from '../components/molecules/Footer';
import '../styles/globals.scss';
import '../styles/variables.scss';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default MyApp;
