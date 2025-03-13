import { useEffect } from 'react';
import { useRouter } from 'next/router'; 

const ScrollToTop = () => {
  const { asPath } = useRouter();

  useEffect(() => {
    const hash = asPath.split('#')[1]; // Extract hash manually from asPath

    const removeHighlight = () => {
      const highlighted = document.querySelector('.highlight-target');
      if (highlighted) {
        highlighted.classList.remove('highlight-target');
      }
    };

    if (hash) {
      const decodedHash = decodeURIComponent(hash);
      const elem = document.getElementById(decodedHash);
      console.log('Scrolling to:', decodedHash, elem); // Debugging line

      if (elem) {
        const yPosition = elem.getBoundingClientRect().top + window.pageYOffset - 70;
        window.scrollTo({ top: yPosition, behavior: 'instant' });
        elem.classList.add('highlight-target');
        window.addEventListener('click', removeHighlight, { once: true });
      }
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      removeHighlight();
    }

    return () => window.removeEventListener('click', removeHighlight);
  }, [asPath]); // Depend on asPath for reactivity

  return null;
};

export default ScrollToTop;
