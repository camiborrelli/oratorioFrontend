import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import api from "../../api";
import toast from "react-hot-toast";
import { loguear } from "../../features/animador.slice";
import { useDispatch } from "react-redux";
import { FaRegUser } from "react-icons/fa";
import CambiarContrasenia from "../Animadores/CambiarContrasenia";

const Login = () => {
  const naviagate = useNavigate();
  const dispatch = useDispatch();
  const [role, setRole] = useState("animador");
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showCambiarContrasenia, setShowCambiarContrasenia] = useState(false);

  useEffect(() => {
    document.body.classList.add("with-bg", "login-open");
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

  const login = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!email) {
      toast.error("El email es obligatorio");
      // toast.error("El email es obligatorio");
      return;
    }
    if (!password) {
      toast.error("La contraseña es obligatoria");
      // toast.error("La contraseña es obligatoria");
      return;
    }

    try {
      const payload = { email, password, role };
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

      // final fallback: use email or username so greeting isn't empty
      if (!apodo) apodo = userObj?.email || userObj?.username || email || null;
      if (apodo) localStorage.setItem("apodo", apodo);
      // store animador id for later actions (e.g., confirmar asistencia)
      const animId = userObj?._id || userObj?.id || userObj?.userId || null;
      if (animId) localStorage.setItem("animadorId", animId);

      toast.success(res.data?.message || "Login exitoso");
      console.log("Login response:", res.data);
      console.log(userObj.roles);
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
      // if backend provides field errors, set them
      if (
        err?.response?.data?.errors &&
        typeof err.response.data.errors === "object"
      ) {
        console.error("Field errors:", err.response.data.errors);
      }
      toast.error(msg);
    }
  };

  return (
    <div className="login-page min-h-screen flex items-center justify-center">
      <div className="login-card bg-white rounded-xl shadow-md p-6 w-full max-w-md">
        <div className="logo-circle mb-3 inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-600 text-white">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff">
            <path d="M12 2C9.8 2 8 3.8 8 6c0 .7.2 1.4.6 2H6c-1.1 0-2 .9-2 2v6h16v-6c0-1.1-.9-2-2-2h-2.6c.4-.6.6-1.3.6-2 0-2.2-1.8-4-4-4zM6 18v2h12v-2H6z" />
          </svg>
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
            <input
              className="w-full border rounded-md px-3 py-2"
              placeholder="Correo electrónico"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FaRegUser
              styles={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                margin: "8px",
              }}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email}</p>
          )}

          <div className="input-group">
            <input
              className="input-field"
              placeholder="Contraseña"
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <button
            type="button"
            className="btn-restore"
            onClick={() => setShowCambiarContrasenia(true)}
          >
            ¿Olvidaste tu contraseña?
          </button>

          <button
            className="primary-btn w-full bg-green-600 text-white py-2 rounded-md"
            type="submit"
          >
            Iniciar Sesión
          </button>
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
