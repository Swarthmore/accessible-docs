import React, { useState, useEffect } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Tooltip } from '@mui/material';

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);


  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);


  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Tooltip title="Scroll to Top" placement="left">
    <button
      className={`fixed cursor-pointer bottom-5 right-5 z-50 p-3 rounded-full shadow-lg transition-opacity duration-300 ease-in-out 
                 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'} 
                 bg-[#b43135] hover:bg-[#95272b] dark:bg-[#b43135] dark:hover:bg-[#95272b]
                 text-white dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#b43135] focus:ring-opacity-50`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >

      <ArrowUpwardIcon className="w-6 h-6" />
    </button>
    </Tooltip>
  );
};

export default ScrollToTopButton;
