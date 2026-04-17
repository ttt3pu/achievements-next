import Footer from '../components/molecules/Footer';
import Header from '../components/molecules/Header';
import '../styles/globals.css';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/variables.css';
import { ToastContainer } from 'react-toastify';
import { SessionProvider } from 'next-auth/react';
function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Header />
      <Component {...pageProps} />
      <Footer />
      <ToastContainer />
    </SessionProvider>
  );
}

export default MyApp;
