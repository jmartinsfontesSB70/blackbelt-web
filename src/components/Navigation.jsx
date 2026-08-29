import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Permissao from "./Permissao";
import ConfirmModal from "./ConfirmModal";

function Navigation() {
  const navigate = useNavigate();

  const [modalSairAberto, setModalSairAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);

  function abrirModalSair() {
    setModalSairAberto(true);
  }

  function cancelarLogout() {
    if (saindo) {
      return;
    }

    setModalSairAberto(false);
  }

  function confirmarLogout() {
    setSaindo(true);

    localStorage.removeItem("token");

    navigate("/login");
  }

  return (
    <>
      <nav className="navigation">
        <Link to="/dashboard">Dashboard</Link>

        <Link to="/alunos">Alunos</Link>

        <Link to="/professores">Professores</Link>

        <Link to="/modalidades">Modalidades</Link>

        <Link to="/turmas">Turmas</Link>

        <Link to="/matriculas">Matrículas</Link>

        <Link to="/presencas">Presenças</Link>

        <Permissao nome="USUARIO_LISTAR">
          <Link to="/usuarios">Usuários</Link>
        </Permissao>

        <Permissao nome="PERFIL_LISTAR">
          <Link to="/perfis">Perfis</Link>
        </Permissao>

        <Link to="/alterar-senha">Alterar senha</Link>

        <button type="button" onClick={abrirModalSair}>
          Sair
        </button>
      </nav>

      <ConfirmModal
        aberto={modalSairAberto}
        titulo="Sair do sistema?"
        mensagem="Deseja realmente sair do BlackBelt?"
        textoConfirmar="Sair"
        icone="🚪"
        onConfirmar={confirmarLogout}
        onCancelar={cancelarLogout}
        carregando={saindo}
      />
    </>
  );
}

export default Navigation;
