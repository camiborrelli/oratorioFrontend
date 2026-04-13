// import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
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
import ListarEventos from "./Components/Eventos/ListarEventos";
import CumplenMes from "./Components/Ninios/CumplenMes";
import ProtectedRoute from "./Components/ProtectedRoute";
import EditarNinio from "./Components/Ninios/EditarNinio";
import Perfil from "./Components/Animadores/Perfil";
import ListarReunionesPublic from "./Components/Reunion/ListarReuniones";
import ListarReunionesCordi from "./Components/Cordi/ListarReuniones";
import "./App.css";

function InnerAppRoutes() {
  const location = useLocation();
  const isAuth = !!localStorage.getItem("Token");
  const hideOn = ["/", "/login", "/register", "/registro"];
  const hideBottom = hideOn.includes(location.pathname) || !isAuth;

  return (
    <>
      <div className="has-bottom-nav">
        <Routes>
          {/* public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/ninios" element={<Listado />} />
            {/* Render admin listing when logged user has 'admin' role */}
            <Route path="/animadores" element={<ListarAnimadores />} />
            <Route path="/ninios/perfil" element={<PerfilNinio />} />
            <Route path="/ninios/asistencia" element={<Asistencia />} />
            <Route path="/ninios/:id" element={<PerfilNinio />} />
            <Route path="/ninios/register" element={<RegistroNinio />} />
            <Route path="/ninios/edit" element={<EditarNinio />} />
            <Route path="/eventos/crear" element={<CrearEvento />} />
            <Route path="/eventos" element={<ListarEventos />} />
            <Route path="/ninios/cumplen-mes" element={<CumplenMes />} />
            <Route path="/dashboard" element={<Listado />} />
            <Route path="/inicio" element={<Inicio />} />
            <Route
              path="/reunion"
              element={(() => {
                try {
                  const roles = JSON.parse(
                    localStorage.getItem("roles") || "[]",
                  );
                  return Array.isArray(roles) &&
                    roles.includes("coordinador") ? (
                    <ListarReunionesCordi />
                  ) : (
                    <ListarReunionesPublic />
                  );
                } catch (e) {
                  return <ListarReunionesPublic />;
                }
              })()}
            />
            <Route
              path="/animadores/perfil"
              element={(() => {
                try {
                  const roles = JSON.parse(
                    localStorage.getItem("roles") || "[]",
                  );
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
                  const roles = JSON.parse(
                    localStorage.getItem("roles") || "[]",
                  );
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
            <Route path="/animadores/editar" element={<EditarAnimador />} />
            <Route path="/animadores/editar/:id" element={<EditarAnimador />} />
          </Route>

          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Routes>
      </div>
      <Toaster />
      <ToastContainer position="top-right" newestOnTop />
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
