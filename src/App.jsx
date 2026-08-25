import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Provider } from "react-redux";
import store from "./store";

import Login from "./Components/Login/Login";
import Register from "./Components/Registro/Registro";
import Listado from "./Components/Ninios/Listado";
import PerfilNinio from "./Components/Ninios/PerfilNinio";
import RegistroNinio from "./Components/Ninios/RegistroNinio";
import Inicio from "./Components/Inicio";
import Asistencia from "./Components/Ninios/Asistencia";
import ListarAnimadores from "./Components/Animadores/ListarAnimadores";
import AsignarCordis from "./Components/Admin/AsignarCordis";
import EditarAnimador from "./Components/Animadores/EditarAnimador";
import BottomNav from "./Components/BottomNav/BottomNav";
import CrearEvento from "./Components/Eventos/CrearEvento";
import CrearPlanificacion from "./Components/Eventos/CrearPlanificacion";
import CrearRecordatorio from "./Components/Eventos/CrearRecordatorio";
import ListarEventos from "./Components/Eventos/ListarEventos";
import CumplenMes from "./Components/Ninios/CumplenMes";
import ProtectedRoute from "./Components/ProtectedRoute";
import EditarNinio from "./Components/Ninios/EditarNinio";
import Perfil from "./Components/Animadores/Perfil";
import ListarReunionesPublic from "./Components/Reunion/ListarReuniones";
import ListarReunionesCordi from "./Components/Cordi/ListarReuniones";
import ListarRecordatorios from "./Components/Eventos/ListarRecordatorios";
import ModalEliminarAnimador from "./Components/Animadores/ModalEliminarAnimador";

import "./App.css";

function InnerAppRoutes() {
  const location = useLocation();

  const isAuth = !!localStorage.getItem("Token");

  const hideOn = ["/", "/login", "/register", "/registro"];

  const hideBottom = hideOn.includes(location.pathname) || !isAuth;

  return (
    <>
      <Routes>
        {/* ========================= */}
        {/* RUTAS PÚBLICAS */}
        {/* ========================= */}

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/registro" element={<Register />} />

        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<Login />} />

        {/* ========================= */}
        {/* RUTAS PROTEGIDAS */}
        {/* ========================= */}

        <Route element={<ProtectedRoute />}>
          <Route path="/ninios" element={<Listado />} />

          <Route path="/animadores" element={<ListarAnimadores />} />

          <Route path="/ninios/perfil" element={<PerfilNinio />} />

          <Route path="/ninios/asistencia" element={<Asistencia />} />

          <Route path="/ninios/:id" element={<PerfilNinio />} />

          <Route path="/ninios/register" element={<RegistroNinio />} />

          <Route path="/ninios/edit" element={<EditarNinio />} />

          <Route path="/eventos/crear" element={<CrearEvento />} />

          <Route
            path="/eventos/recordatorio"
            element={<ListarRecordatorios />}
          />

          <Route
            path="/eventos/planificacion"
            element={<CrearPlanificacion />}
          />

          <Route path="/eventos/recordatorio" element={<CrearRecordatorio />} />

          <Route path="/eventos" element={<ListarEventos />} />

          <Route path="/ninios/cumplen-mes" element={<CumplenMes />} />

          <Route path="/dashboard" element={<Listado />} />

          <Route path="/inicio" element={<Inicio />} />

          {/* ========================= */}
          {/* REUNIONES */}
          {/* ========================= */}

          <Route
            path="/reunion"
            element={(() => {
              try {
                const roles = JSON.parse(localStorage.getItem("roles") || "[]");

                return Array.isArray(roles) && roles.includes("coordinador") ? (
                  <ListarReunionesCordi />
                ) : (
                  <ListarReunionesPublic />
                );
              } catch (e) {
                return <ListarReunionesPublic />;
              }
            })()}
          />

          {/* ========================= */}
          {/* PERFIL ANIMADOR */}
          {/* ========================= */}

          <Route
            path="/animadores/perfil"
            element={(() => {
              try {
                const roles = JSON.parse(localStorage.getItem("roles") || "[]");

                return Array.isArray(roles) && roles.includes("admin") ? (
                  <AsignarCordis />
                ) : (
                  <Perfil />
                );
              } catch (e) {
                return <Perfil />;
              }
            })()}
          />

          <Route
            path="/animadores/perfil/:id"
            element={(() => {
              try {
                const roles = JSON.parse(localStorage.getItem("roles") || "[]");

                return Array.isArray(roles) && roles.includes("admin") ? (
                  <AsignarCordis />
                ) : (
                  <Perfil />
                );
              } catch (e) {
                return <Perfil />;
              }
            })()}
          />

          {/* ========================= */}
          {/* EDITAR ANIMADOR */}
          {/* ========================= */}

          <Route path="/animadores/editar" element={<EditarAnimador />} />

          <Route path="/animadores/editar/:id" element={<EditarAnimador />} />

          <Route
            path="/animadores/eliminar/:id"
            element={<ModalEliminarAnimador />}
          />
        </Route>

        {/* ========================= */}
        {/* RUTA NO ENCONTRADA */}
        {/* ========================= */}

        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Routes>

      {/* TOAST */}
      <ToastContainer
        position="bottom-right"
        style={{ marginBottom: "20px" }}
        autoClose={3000}
      />

      {/* BOTTOM NAV */}
      {!hideBottom && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <InnerAppRoutes />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
