import { useEffect, useState } from "react";
import useLocalStorage from "./useLocalStorage";

const useColorMode = () => {
  // First, check if there's a stored preference, otherwise use the system preference
  const [storedColorMode, setStoredColorMode] = useLocalStorage("color-theme");

  // Initialize state with either the stored theme or the system's preference
  const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const [colorMode, setColorMode] = useState(storedColorMode || systemPreference);

  useEffect(() => {
    const className = "dark";
    const bodyClass = window.document.body.classList;

    colorMode === "dark" ? bodyClass.add(className) : bodyClass.remove(className);

    // Add an event listener to respond to changes in the system's color scheme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const newColorMode = e.matches ? 'dark' : 'light';
      if (!storedColorMode) {  // Only update if there's no stored preference
        setColorMode(newColorMode);
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [colorMode, storedColorMode]);

  // Update local storage whenever the color mode changes
  useEffect(() => {
    if (colorMode !== storedColorMode) {
      setStoredColorMode(colorMode);
    }
  }, [colorMode, storedColorMode, setStoredColorMode]);

  return [colorMode, setColorMode];
};

export default useColorMode;
