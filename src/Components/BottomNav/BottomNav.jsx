import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { desloguear } from "../../features/animador.slice";
import "./BottomNav.css";
import "../../App.css";
import { IoHomeOutline } from "react-icons/io5";
import { RxPeople } from "react-icons/rx";
import { LuMessageCircleMore } from "react-icons/lu";
import { CiFaceSmile } from "react-icons/ci";
import { FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";

const BottomNav = () => {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobilePerfilOpen, setMobilePerfilOpen] = useState(false);
  const userMenuRef = useRef(null);
  const mobilePerfilRef = useRef(null);

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);
  const navigate = useNavigate();
  const location = useLocation();

  const apodo =
    localStorage.getItem("apodo") ||
    localStorage.getItem("username") ||
    "Usuario";

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
    setUserMenuOpen(false);
    setMobilePerfilOpen(false);
    navigate("/login");
  };

  const openPerfil = (anim) => {
    setUserMenuOpen(false);
    setMobilePerfilOpen(false);
    navigate(`/animadores/perfil`, { state: { anim } });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (
        mobilePerfilRef.current &&
        !mobilePerfilRef.current.contains(event.target)
      ) {
        setMobilePerfilOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isPerfilActive = location.pathname.startsWith("/animadores/perfil");

  return (
    <>
      {/* Top navigation for medium+ screens (hidden on small) */}
      <nav className="top-nav" role="navigation" aria-label="Top navigation">
        <div
          className="nav-logo"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <p className="nav-logo-text">Oratorio Cordon</p>
          <img
            src="/public/img/logo.jpg"
            alt="Logo"
            width={30}
            height={30}
            className="logo-circle"
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
        <div className="nav-content">
          <div className="logo" onClick={() => navigate("/inicio")}>
            <IoHomeOutline
              style={{ width: "20px", height: "20px", marginRight: "5px" }}
            />{" "}
            Inicio
          </div>
          <div className="listagurises" onClick={() => navigate("/ninios")}>
            <CiFaceSmile
              style={{ width: "20px", height: "20px", marginRight: "5px" }}
            />{" "}
            Gurises
          </div>
          <div
            className="listanimadores"
            onClick={() => navigate("/animadores")}
          >
            <RxPeople
              style={{ width: "20px", height: "20px", marginRight: "5px" }}
            />{" "}
            Animadores
          </div>
          <div
            className="reunionAnimadores"
            onClick={() => navigate("/reunion")}
          >
            <LuMessageCircleMore style={{ width: "20px", height: "20px" }} />{" "}
            Reunion
          </div>
          <div className="user-menu" ref={userMenuRef}>
            <button
              type="button"
              className="user-menu__trigger"
              onClick={() => setUserMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
            >
              <span className="user-menu__avatar" aria-hidden="true">
                <FiUser />
              </span>
              <span className="user-menu__text">
                <span className="user-menu__name">{apodo}</span>
                <span className="user-menu__subtitle">Ver opciones</span>
              </span>
              <FiChevronDown className="user-menu__chevron" />
            </button>

            {userMenuOpen && (
              <div className="user-menu__dropdown" role="menu">
                <button
                  type="button"
                  className="user-menu__item"
                  onClick={() => openPerfil()}
                >
                  <FiUser />
                  Ver perfil
                </button>
                <button
                  type="button"
                  className="user-menu__item user-menu__item--danger"
                  onClick={logout}
                >
                  <FiLogOut />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
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

        {/* Perfil: ahora es un botón que abre un dropdown hacia arriba,
            igual que el user-menu de desktop, en vez de navegar directo */}
        <div className="nav-item-menu" ref={mobilePerfilRef}>
          <button
            type="button"
            className={isPerfilActive ? "nav-item active" : "nav-item"}
            onClick={() => setMobilePerfilOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={mobilePerfilOpen}
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
          </button>

          {mobilePerfilOpen && (
            <div className="nav-item-menu__dropdown" role="menu">
              <button
                type="button"
                className="nav-item-menu__item"
                onClick={() => openPerfil()}
              >
                <FiUser />
                Ver perfil
              </button>
              <button
                type="button"
                className="nav-item-menu__item nav-item-menu__item--danger"
                onClick={logout}
              >
                <FiLogOut />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
