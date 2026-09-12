import { useTheme } from "../contexts/ThemeContext";

function Header({ nome }) {
  const { tema, alternarTema } = useTheme();

  return (
    <header className="header">
      <div>
        <h1>{nome}</h1>
        <p>Gestão para academias de artes marciais</p>
      </div>

      <button
        className="theme-toggle"
        onClick={alternarTema}
        aria-label={
          tema === "light" ? "Ativar modo escuro" : "Ativar modo claro"
        }
        title={tema === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
      >
        {tema === "light" ? "🌙" : "☀️"}
      </button>
    </header>
  );
}

export default Header;
