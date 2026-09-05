import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import Header from "./components/Header";
import Navigation from "./components/Navigation";
import RotaPrivada from "./components/RotaPrivada";
import RotaPermissao from "./components/RotaPermissao";

import Dashboard from "./pages/Dashboard";
import Alunos from "./pages/Alunos";
import AlunoForm from "./pages/AlunoForm";
import Presencas from "./pages/Presencas";
import PresencaForm from "./pages/PresencaForm";
import Matriculas from "./pages/Matriculas";
import MatriculaForm from "./pages/MatriculaForm";
import Turmas from "./pages/Turmas";
import TurmaForm from "./pages/TurmaForm";
import Professores from "./pages/Professores";
import ProfessorForm from "./pages/ProfessorForm";
import Modalidades from "./pages/Modalidades";
import ModalidadeForm from "./pages/ModalidadeForm";
import Login from "./pages/Login";
import Usuarios from "./pages/Usuarios";
import UsuarioForm from "./pages/UsuarioForm";
import Perfis from "./pages/Perfis";
import PerfilForm from "./pages/PerfilForm";
import AlterarSenha from "./pages/AlterarSenha";
import ChamadaForm from "./pages/ChamadaForm";

function LayoutPrivado() {
  return (
    <div className="app">
      <Header />

      <Navigation />

      <Outlet />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route element={<RotaPrivada />}>
          <Route element={<LayoutPrivado />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* ALUNOS */}
            <Route element={<RotaPermissao nome="ALUNO_LISTAR" />}>
              <Route path="/alunos" element={<Alunos />} />
            </Route>

            <Route element={<RotaPermissao nome="ALUNO_CRIAR" />}>
              <Route path="/alunos/novo" element={<AlunoForm />} />
            </Route>

            <Route element={<RotaPermissao nome="ALUNO_EDITAR" />}>
              <Route path="/alunos/:id" element={<AlunoForm />} />
            </Route>

            {/* PRESENÇAS */}
            <Route element={<RotaPermissao nome="PRESENCA_LISTAR" />}>
              <Route path="/presencas" element={<Presencas />} />
            </Route>

            <Route element={<RotaPermissao nome="PRESENCA_CRIAR" />}>
              <Route path="/presencas/nova" element={<PresencaForm />} />
            </Route>

            <Route element={<RotaPermissao nome="PRESENCA_CRIAR" />}>
              <Route path="/presencas/chamada" element={<ChamadaForm />} />
            </Route>

            <Route element={<RotaPermissao nome="PRESENCA_EDITAR" />}>
              <Route path="/presencas/:id" element={<PresencaForm />} />
            </Route>

            {/* MATRÍCULAS */}
            <Route element={<RotaPermissao nome="MATRICULA_LISTAR" />}>
              <Route path="/matriculas" element={<Matriculas />} />
            </Route>

            <Route element={<RotaPermissao nome="MATRICULA_CRIAR" />}>
              <Route path="/matriculas/nova" element={<MatriculaForm />} />
            </Route>

            <Route element={<RotaPermissao nome="MATRICULA_EDITAR" />}>
              <Route path="/matriculas/:id" element={<MatriculaForm />} />
            </Route>

            {/* TURMAS */}
            <Route element={<RotaPermissao nome="TURMA_LISTAR" />}>
              <Route path="/turmas" element={<Turmas />} />
            </Route>

            <Route element={<RotaPermissao nome="TURMA_CRIAR" />}>
              <Route path="/turmas/nova" element={<TurmaForm />} />
            </Route>

            <Route element={<RotaPermissao nome="TURMA_EDITAR" />}>
              <Route path="/turmas/:id" element={<TurmaForm />} />
            </Route>

            {/* PROFESSORES */}
            <Route element={<RotaPermissao nome="PROFESSOR_LISTAR" />}>
              <Route path="/professores" element={<Professores />} />
            </Route>

            <Route element={<RotaPermissao nome="PROFESSOR_CRIAR" />}>
              <Route path="/professores/novo" element={<ProfessorForm />} />
            </Route>

            <Route element={<RotaPermissao nome="PROFESSOR_EDITAR" />}>
              <Route path="/professores/:id" element={<ProfessorForm />} />
            </Route>

            {/* MODALIDADES */}
            <Route element={<RotaPermissao nome="MODALIDADE_LISTAR" />}>
              <Route path="/modalidades" element={<Modalidades />} />
            </Route>

            <Route element={<RotaPermissao nome="MODALIDADE_CRIAR" />}>
              <Route path="/modalidades/nova" element={<ModalidadeForm />} />
            </Route>

            <Route element={<RotaPermissao nome="MODALIDADE_EDITAR" />}>
              <Route path="/modalidades/:id" element={<ModalidadeForm />} />
            </Route>

            {/* USUÁRIOS */}
            <Route element={<RotaPermissao nome="USUARIO_LISTAR" />}>
              <Route path="/usuarios" element={<Usuarios />} />
            </Route>

            <Route element={<RotaPermissao nome="USUARIO_CRIAR" />}>
              <Route path="/usuarios/novo" element={<UsuarioForm />} />
            </Route>

            <Route element={<RotaPermissao nome="USUARIO_EDITAR" />}>
              <Route path="/usuarios/:id" element={<UsuarioForm />} />
            </Route>

            {/* PERFIS */}
            <Route element={<RotaPermissao nome="PERFIL_LISTAR" />}>
              <Route path="/perfis" element={<Perfis />} />
            </Route>

            <Route element={<RotaPermissao nome="PERFIL_CRIAR" />}>
              <Route path="/perfis/novo" element={<PerfilForm />} />
            </Route>

            <Route element={<RotaPermissao nome="PERFIL_EDITAR" />}>
              <Route path="/perfis/:id" element={<PerfilForm />} />
            </Route>

            <Route path="/alterar-senha" element={<AlterarSenha />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
