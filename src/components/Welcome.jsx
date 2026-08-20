import { useState } from "react";

function Welcome() {
  const [mensagem, setMensagem] = useState("");

  function handleEntrar() {
    setMensagem("Bem-vindo ao BlackBelt!");
  }

  return (
    <main className="main">
      <h2>Bem-vindo ao BlackBelt</h2>

      <p>Gerencie alunos, turmas, matrículas e presenças.</p>

      <button type="button" onClick={handleEntrar}>
        Entrar no sistema
      </button>

      {mensagem && <p>{mensagem}</p>}
    </main>
  );
}

export default Welcome;
