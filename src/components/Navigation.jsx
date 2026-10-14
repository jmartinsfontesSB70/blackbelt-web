import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import MenuItem from "./MenuItem";
import Permissao from "./Permissao";
import ConfirmModal from "./ConfirmModal";

function Navigation() {
  const navigate = useNavigate();

  const navigationRef = useRef(null);

  const [menuAberto, setMenuAberto] = useState(null);

  const [modalSairAberto, setModalSairAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    function tratarCliqueFora(event) {
      if (
        navigationRef.current &&
        !navigationRef.current.contains(event.target)
      ) {
        setMenuAberto(null);
      }
    }

    document.addEventListener("mousedown", tratarCliqueFora);

    return () => {
      document.removeEventListener("mousedown", tratarCliqueFora);
    };
  }, []);

  function alternarMenu(nomeMenu) {
    setMenuAberto((menuAtual) => (menuAtual === nomeMenu ? null : nomeMenu));
  }

  function fecharMenu() {
    setMenuAberto(null);
  }

  function abrirModalSair() {
    fecharMenu();
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
      <nav ref={navigationRef} className="navigation">
        <div className="navigation-main">
          <Link to="/dashboard" onClick={fecharMenu}>
            Dashboard
          </Link>

          <Link to="/alunos" onClick={fecharMenu}>
            Alunos
          </Link>

          <Link to="/professores" onClick={fecharMenu}>
            Professores
          </Link>

          <Link to="/modalidades" onClick={fecharMenu}>
            Modalidades
          </Link>

          <Link to="/turmas" onClick={fecharMenu}>
            Turmas
          </Link>

          <Link to="/matriculas" onClick={fecharMenu}>
            Matrículas
          </Link>

          <Link to="/presencas" onClick={fecharMenu}>
            Presenças
          </Link>

          <Permissao nome="COBRANCA_LISTAR">
            <MenuItem
              titulo="Financeiro"
              aberto={menuAberto === "financeiro"}
              onClick={() => alternarMenu("financeiro")}
            >
              <Permissao nome="TIPO_COBRANCA_LISTAR">
                <Link to="/tipos-cobranca" onClick={fecharMenu}>
                  Tipos de cobrança
                </Link>
              </Permissao>

              <Permissao nome="COBRANCA_LISTAR">
                <Link to="/cobrancas" onClick={fecharMenu}>
                  Cobranças
                </Link>
              </Permissao>
            </MenuItem>
          </Permissao>

          <Permissao nome="USUARIO_LISTAR">
            <MenuItem
              titulo="Administrativo"
              aberto={menuAberto === "administrativo"}
              onClick={() => alternarMenu("administrativo")}
            >
              <Permissao nome="USUARIO_LISTAR">
                <Link to="/usuarios" onClick={fecharMenu}>
                  Usuários
                </Link>
              </Permissao>

              <Permissao nome="PERFIL_LISTAR">
                <Link to="/perfis" onClick={fecharMenu}>
                  Perfis
                </Link>
              </Permissao>
            </MenuItem>
          </Permissao>
        </div>

        <div className="navigation-footer">
          <Link to="/alterar-senha" onClick={fecharMenu}>
            Alterar senha
          </Link>

          <button
            type="button"
            className="navigation-logout"
            onClick={abrirModalSair}
          >
            Sair
          </button>
        </div>
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
