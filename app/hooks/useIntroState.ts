import { useState, useEffect } from "react";

export function useIntroState() {
  const [shouldShowIntro, setShouldShowIntro] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("introSeen");
    setShouldShowIntro(!seen);
    setChecked(true);
  }, []);

  const markIntroSeen = () => {
    sessionStorage.setItem("introSeen", "true");
    setShouldShowIntro(false);
  };

  return { shouldShowIntro, checked, markIntroSeen };
}
