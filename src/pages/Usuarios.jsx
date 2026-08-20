import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

import { listarUsuarios, excluirUsuario } from "../services/usuarioService";

import ConfirmModal from "../components/ConfirmModal";
import Permissao from "../components/Permissao";

function Usuarios() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function carregarUsuarios() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await listarUsuarios();

      setUsuarios(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  function handleExcluir(usuario) {
    setErro("");
    setUsuarioSelecionado(usuario);
    setModalExcluirAberto(true);
  }

  async function confirmarExclusao() {
    if (!usuarioSelecionado) {
      return;
    }

    try {
      setExcluindo(true);
      setErro("");

      await excluirUsuario(usuarioSelecionado.id);

      setModalExcluirAberto(false);
      setUsuarioSelecionado(null);

      await carregarUsuarios();
    } catch (error) {
      setModalExcluirAberto(false);
      setUsuarioSelecionado(null);
      setErro(error.message);
    } finally {
      setExcluindo(false);
    }
  }

  function cancelarExclusao() {
    if (excluindo) {
      return;
    }

    setModalExcluirAberto(false);
    setUsuarioSelecionado(null);
  }

  if (carregando) {
    return (
      <main className="main">
        <h2>Usuários</h2>
        <p>Carregando usuários...</p>
      </main>
    );
  }

  if (erro && usuarios.length === 0) {
    return (
      <main className="main">
        <h2>Usuários</h2>
        <p>{erro}</p>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>Usuários</h2>

          <p>Gerencie os usuários do sistema.</p>
        </div>

        <Permissao nome="USUARIO_CRIAR">
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/usuarios/novo")}
          >
            + Novo usuário
          </button>
        </Permissao>
      </div>

      {erro && <div className="form-message error-message">{erro}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuário</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>

                <td className="name-cell">{usuario.username}</td>

                <td>{usuario.perfilNome}</td>

                <td>
                  <span
                    className={
                      usuario.ativo ? "status active" : "status inactive"
                    }
                  >
                    {usuario.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>

                <td>
                  <div className="action-buttons">
                    <Permissao nome="USUARIO_EDITAR">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => navigate("/usuarios/" + usuario.id)}
                        title="Editar usuário"
                      >
                        <Pencil size={18} />
                      </button>
                    </Permissao>

                    <Permissao nome="USUARIO_EXCLUIR">
                      <button
                        type="button"
                        className="btn-delete"
                        onClick={() => handleExcluir(usuario)}
                        title="Excluir usuário"
                      >
                        <Trash2 size={18} />
                      </button>
                    </Permissao>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        aberto={modalExcluirAberto}
        titulo="Excluir usuário?"
        mensagem={
          usuarioSelecionado
            ? "Deseja realmente excluir o usuário " +
              usuarioSelecionado.username +
              "?"
            : ""
        }
        onConfirmar={confirmarExclusao}
        onCancelar={cancelarExclusao}
        carregando={excluindo}
      />
    </main>
  );
}

export default Usuarios;
