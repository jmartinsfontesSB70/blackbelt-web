import { useTheme } from "../contexts/ThemeContext";

function obterUsernameToken() {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return "";
    }

    const partes = token.split(".");

    if (partes.length !== 3) {
      return "";
    }

    const payloadBase64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");

    const payload = JSON.parse(
      decodeURIComponent(
        atob(payloadBase64)
          .split("")
          .map(
            (caractere) =>
              "%" + caractere.charCodeAt(0).toString(16).padStart(2, "0"),
          )
          .join(""),
      ),
    );

    return payload.sub || "";
  } catch {
    return "";
  }
}

function Header({ nome }) {
  const { tema, alternarTema } = useTheme();
  const username = obterUsernameToken();

  return (
    <header className="header">
      <div>
        <h1>{nome}</h1>
        <p>Gestão para academias de artes marciais</p>
      </div>

      <div className="header-actions">
        {username && (
          <span className="header-username" title="Usuário conectado">
            <span aria-hidden="true">👤</span>
            {username}
          </span>
        )}

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
      </div>
    </header>
  );
}

export default Header;
