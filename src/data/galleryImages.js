// Real photo files stored locally in src/assets/gallery/
// (populated by running: npm run images:download — see scripts/download-images.js)
import g1 from '../assets/gallery/gallery-1.jpg';
import g2 from '../assets/gallery/gallery-2.jpg';
import g3 from '../assets/gallery/gallery-3.jpg';
import g4 from '../assets/gallery/gallery-4.jpg';
import g5 from '../assets/gallery/gallery-5.jpg';
import g6 from '../assets/gallery/gallery-6.jpg';
import g7 from '../assets/gallery/gallery-7.jpg';
import g8 from '../assets/gallery/gallery-8.jpg';

// Used on the Home page (first 6 photos)
export const homeGalleryImages = [g1, g2, g3, g4, g5, g6];

// Used on the full Gallery page (all 8 photos)
export const galleryImages = [g1, g2, g3, g4, g5, g6, g7, g8];

export default galleryImages;
