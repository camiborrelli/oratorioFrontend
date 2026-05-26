import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { desloguear } from "../../features/animador.slice";
import "./BottomNav.css";
import "../../App.css";
import ListarAnimadores from "../Animadores/ListarAnimadores";

const BottomNav = () => {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const logout = () => {
    try {
      dispatch(desloguear());
    } catch (e) {
      try {
        localStorage.clear();
      } catch (er) {}
    }
    close();
    navigate("/login");
  };

  const openPerfil = (anim) => {
    navigate(`/animadores/perfil`, { state: { anim } });
  };

  return (
    <>
      {/* Top navigation for medium+ screens (hidden on small) */}
      <nav className="top-nav" role="navigation" aria-label="Top navigation">
        <div className="nav-content">
          <div className="logo" onClick={() => navigate("/inicio")}>
            Inicio
          </div>
          <div className="listagurises" onClick={() => navigate("/ninios")}>
            Gurises
          </div>
          <div
            className="listanimadores"
            onClick={() => navigate("/animadores")}
          >
            Animadores
          </div>
          <div
            className="reunionAnimadores"
            onClick={() => navigate("/reunion")}
          >
            Reunion
          </div>
          <div
            className="perfil"
            onClick={() => navigate("/animadores/perfil")}
          >
            Perfil
          </div>
          <button className="logout" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Bottom navigation for small screens */}
      <nav
        className="bottom-nav"
        role="navigation"
        aria-label="Bottom navigation"
      >
        <NavLink
          to="/inicio"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="icon" aria-hidden>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 11.5L12 4l9 7.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 11.5v7a1 1 0 001 1h3v-5h6v-5h3a1 1 0 001-1v-7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="label">Inicio</span>
        </NavLink>

        <NavLink
          to="/ninios"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="icon" aria-hidden>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="9"
                cy="8"
                r="2.2"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M3 20c1.2-3 4.2-5 6-5s4.8 2 6 5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="17"
                cy="8"
                r="2.2"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </span>
          <span className="label">Gurises</span>
        </NavLink>

        <NavLink
          to="/animadores"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="icon" aria-hidden>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 11.5a2 2 0 11-4 0 2 2 0 014 0zM8 11.5a2 2 0 11-4 0 2 2 0 014 0z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 20c1.8-3 5-5 8-5s6.2 2 8 5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="label">Animadores</span>
        </NavLink>

        <NavLink
          to="/reunion"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="icon" aria-hidden>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 20c4.97 0 9.19-3.11 11-8-1.03-2.53-2.7-4.63-4.7-6.01M12 20c-4.97 0-9.19-3.11-11-8 1.03-2.53 2.7-4.63 4.7-6.01M12 20v-5m0 0l3 3m-3-3l-3 3"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="label">Reunión</span>
        </NavLink>

        <NavLink
          to="/animadores/perfil"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="icon" aria-hidden>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="8"
                r="2.6"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M4 20c1.5-3 4.5-5 8-5s6.5 2 8 5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="label">Perfil</span>
        </NavLink>
      </nav>
    </>
  );
};

export default BottomNav;
