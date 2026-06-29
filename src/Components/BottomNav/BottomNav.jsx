import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { desloguear } from "../../features/animador.slice";
import "./BottomNav.css";
import "../../App.css";
import ListarAnimadores from "../Animadores/ListarAnimadores";
import { IoHomeOutline } from "react-icons/io5";
import { RxPeople } from "react-icons/rx";
import { LuMessageCircleMore } from "react-icons/lu";

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
            <IoHomeOutline style={{ width: "20px", height: "20px" }} />
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
            <RxPeople style={{ width: "20px", height: "20px" }} />
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
            <LuMessageCircleMore style={{ width: "20px", height: "20px" }} />
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
