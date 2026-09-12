import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    const temaSalvo = localStorage.getItem("blackbelt-tema");

    return temaSalvo || "light";
  });

  useEffect(() => {
    localStorage.setItem("blackbelt-tema", tema);
  }, [tema]);

  function alternarTema() {
    setTema((temaAtual) => (temaAtual === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
