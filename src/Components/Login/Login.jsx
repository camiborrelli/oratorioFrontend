import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import api from "../../api";
import toast from "react-hot-toast";

const Login = () => {
  // Evitamos dependencias externas: manejamos el formulario localmente
  const [role, setRole] = useState("animador");
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Si en el futuro hay auth se puede redirigir aquí
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email) newErrors.email = "El correo electrónico es obligatorio";
    else {
      // basic email pattern
      const re = /^\S+@\S+$/i;
      if (!re.test(email)) newErrors.email = "El email no es válido";
    }
    if (!password) newErrors.password = "La contraseña es obligatoria";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // show aggregated toast
      const msgs = Object.values(newErrors).join(". ");
      toast.error(msgs);
      return;
    }
    // Placeholder: integrar con AuthContext o API
    console.log("Login data:", { email, password, role });
    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-circle">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="#fff">
            <path d="M12 2C9.8 2 8 3.8 8 6c0 .7.2 1.4.6 2H6c-1.1 0-2 .9-2 2v6h16v-6c0-1.1-.9-2-2-2h-2.6c.4-.6.6-1.3.6-2 0-2.2-1.8-4-4-4zM6 18v2h12v-2H6z" />
          </svg>
        </div>
        <h1 className="brand">Oratorio Cordón</h1>
        <p className="subtitle">Bienvenidos a la app del mejor oratrorio</p>

        <div className="role-toggle">
          <button
            type="button"
            className={role === "animador" ? "active" : ""}
            onClick={() => setRole("animador")}
          >
            Animador
          </button>
          <button
            type="button"
            className={
              role === "coordinador" ? "active secondary" : "secondary"
            }
            onClick={() => setRole("coordinador")}
          >
            Coordinador
          </button>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <div className="input-group">
            <input
              placeholder="Correo electrónico"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {errors.email && <p className="error">{errors.email}</p>}

          <div className="input-group">
            <input
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
              aria-label="Mostrar contraseña"
            >
              {showPwd ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.password && <p className="error">{errors.password}</p>}

          <div className="forgot-row">
            <Link to="/forgot">¿Olvidaste tu contraseña?</Link>
          </div>

          <button className="primary-btn" type="submit">
            Iniciar Sesión
          </button>
        </form>

        <div className="register-row">
          ¿No tenés cuenta? <Link to="/register">Registrarse</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
