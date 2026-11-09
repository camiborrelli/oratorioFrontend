import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "../../api";
import { toast } from "react-toastify";
import { loguear } from "../../features/animador.slice";
import { useDispatch } from "react-redux";
import { FaRegUser } from "react-icons/fa";
import CambiarContrasenia from "../Animadores/CambiarContrasenia";
import "./Login.css";

const Login = () => {
  const naviagate = useNavigate();
  const dispatch = useDispatch();
  const [role, setRole] = useState("animador");
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showCambiarContrasenia, setShowCambiarContrasenia] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [slowNotice, setSlowNotice] = useState(false);

  useEffect(() => {
    document.body.classList.add("with-bg", "login-open");
    // Pre-calentar el servidor en segundo plano (Render entra en reposo por inactividad)
    api.get("/health", { skipAuth: true }).catch(() => {});
    return () => document.body.classList.remove("with-bg", "login-open");
  }, []);

  const decodeJwt = (token) => {
    try {
      const parts = token.split(".");
      if (parts.length < 2) return null;
      // base64url -> base64
      let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      // pad
      while (payload.length % 4) payload += "=";
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const login = async (e) => {
    e.preventDefault();
    setErrors({});

    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPassword = formData.password.trim();

    if (!cleanEmail || !cleanPassword) {
      toast.error("El email y la contraseña son obligatorios");
      return;
    }

    setLoading(true);
    setSlowNotice(false);

    // Si la respuesta tarda más de 3.5s (típico cuando Render está reactivando el servidor)
    const slowTimer = setTimeout(() => {
      setSlowNotice(true);
    }, 3500);

    try {
      const payload = {
        email: cleanEmail,
        password: cleanPassword,
        role,
      };
      const res = await api.post("/animador/login", payload, {
        skipAuth: true,
      });
      // normalize user object from response before using its props
      const userObj = res?.data?.user || res?.data || {};
      dispatch(loguear(res.data.token));
      // persist apodo if present (safe guard)
      let apodo = userObj?.apodo || userObj?.nickname || userObj?.name || null;
      // If not available, try to decode JWT token payload (some backends put user info there)
      if (!apodo && res?.data?.token) {
        const payload = decodeJwt(res.data.token);
        if (payload) {
          apodo = payload?.apodo || payload?.nickname || payload?.name || apodo;
          console.log("Decoded token payload for apodo:", payload);
        }
      }

      console.log("Token received:", res.data.token);

      // final fallback: use email or username so greeting isn't empty
      if (!apodo) apodo = userObj?.email || userObj?.username || cleanEmail || null;
      if (apodo) localStorage.setItem("apodo", apodo);
      // store animador id for later actions (e.g., confirmar asistencia)
      const animId = userObj?._id || userObj?.id || userObj?.userId || null;
      if (animId) localStorage.setItem("animadorId", animId);
      if (Array.isArray(userObj?.rol || userObj?.roles)) {
        localStorage.setItem(
          "roles",
          JSON.stringify(userObj.rol || userObj.roles),
        );
      }

      naviagate("/inicio");
    } catch (err) {
      // log full response for debugging
      console.error("Login error:", err?.response || err);
      const serverData = err?.response?.data;
      const prettyServer =
        serverData && typeof serverData === "object"
          ? JSON.stringify(serverData)
          : serverData;
      const msg =
        (serverData && (serverData.message || serverData.error)) ||
        prettyServer ||
        err?.message ||
        "Error en el login";
      toast.error(msg);
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setSlowNotice(false);
    }
  };

  return (
    <div className="login-page min-h-screen flex items-center justify-center">
      <div className="login-card bg-white rounded-xl shadow-md p-6 w-full max-w-md">
        <div className="logo-circle mb-3 inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-600 text-white">
          <img
            src="/img/logo.jpg"
            alt="logo"
            className="login-circle"
            width="30"
            height="30"
          />
        </div>
        <h1 className="brand text-xl font-bold">Oratorio Cordón</h1>
        <p className="subtitle text-sm text-slate-600 mb-4">
          Bienvenidos a la app del mejor oratorio
        </p>

        <div className="role-toggle flex gap-2 mb-4">
          <button
            type="button"
            className={`px-3 py-1 rounded ${role === "animador" ? "active" : ""}`}
            onClick={() => setRole("animador")}
          >
            Animador
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded ${role === "coordinador" ? "active" : ""}`}
            onClick={() => setRole("coordinador")}
          >
            Coordinador
          </button>
        </div>

        <form className="login-form space-y-3" onSubmit={login}>
          <div className="input-group">
            <span className="input-icon" aria-hidden="true">
              <FaRegUser />
            </span>
            <input
              className="input-field"
              placeholder="Correo electrónico"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              name="email"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email}</p>
          )}

          <div className="input-group">
            <span className="input-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              className="input-field"
              placeholder="Contraseña"
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPwd((s) => !s)}
              aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {/* Simple inline SVG eye icon (toggles to eye-off when visible) */}
              {showPwd ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-4.97 0-9.19-3.11-11-8 1.03-2.53 2.7-4.63 4.7-6.01"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M1 1l22 22"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password}</p>
          )}

          {/* <button
            type="button"
            className="btn-restore"
            onClick={() => setShowCambiarContrasenia(true)}
          >
            ¿Olvidaste tu contraseña?
          </button> */}

          <button
            className="primary-btn w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Iniciando sesión...</span>
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>

          {slowNotice && (
            <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center transition-all animate-pulse shadow-sm">
              ☁️ Despertando el servidor en la nube... Por favor aguarde unos segundos más.
            </div>
          )}
        </form>

        <div className="register-row text-sm text-slate-600 mt-3">
          ¿No tenés cuenta?{" "}
          <Link className="text-green-600" to="/register">
            Registrarse
          </Link>
        </div>

        <CambiarContrasenia
          isOpen={showCambiarContrasenia}
          onClose={() => setShowCambiarContrasenia(false)}
          desdePerfil={false}
        />
      </div>
    </div>
  );
};

export default Login;
