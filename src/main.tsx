import { createRoot } from 'react-dom/client';
import { EditorRoot } from './editor';
import './toolbar.css';

createRoot(document.getElementById('root')!).render(<EditorRoot />);
