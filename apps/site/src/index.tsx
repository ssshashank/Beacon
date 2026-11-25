import { render } from '@solidjs/web';
import LandingPage from './components/landingPage';
import './index.css';

const root = document.getElementById('root');

if (root) {
  render(() => <LandingPage />, root);
}
