import { createRoot } from 'react-dom/client';
import '@fontsource/inter';
import EditorRouter from './App';

const element = document.getElementById('root');

if (!element) {
  throw new Error('Root element not found');
}

createRoot(element).render(<EditorRouter />);
