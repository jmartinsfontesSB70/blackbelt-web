import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { fazerLogin } from "../services/authService";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");

    try {
      const data = await fazerLogin(username, password);

      localStorage.setItem("token", data.token);

      navigate("/dashboard");
    } catch (error) {
      setErro(error.message);
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>BlackBelt</h1>

        <h2>Login</h2>

        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {erro && <p className="login-error">{erro}</p>}

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;
