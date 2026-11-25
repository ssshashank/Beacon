import { onSettled } from 'solid-js';
import LandingPage from '../modules/landing/landingPage';

export default function Home() {
  onSettled(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Beacon — Lightweight Docker Monitoring & Management';
    }
  });

  return <LandingPage />;
}


