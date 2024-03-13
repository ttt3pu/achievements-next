import Footer from '../components/molecules/Footer';
import Header from '../components/molecules/Header';
import '../styles/globals.scss';
import '../styles/variables.scss';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
      <Footer />
      <ToastContainer />
    </>
  );
}

export default MyApp;
