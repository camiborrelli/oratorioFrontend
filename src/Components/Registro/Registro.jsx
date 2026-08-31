import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import api from "../../api";
import { setUser } from "../../store";
import { toast } from "react-toastify";
import "./Registro.css";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    setSubmitting(true);

    try {
      const payload = {
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        apodo: data.apodo?.trim() || "",
        email: data.email.trim(),
        fechaCumple: data.fechaCumple || "",
        division: data.division,
        recorrida: data.recorrida,
        password: data.password,
        roles: ["animador"],
      };

      const res = await api.post("/animador/register", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success(res.data?.message || "Registro exitoso");

      const token = res.data?.token;

      if (token) {
        localStorage.setItem("Token", token);
      }

      const user = res.data?.user || {};

      dispatch(setUser(user));

      const apodo = user?.apodo || payload.apodo;

      if (apodo) {
        localStorage.setItem("apodo", apodo);
      }

      const username = user?.username || user?.email || payload.email;

      if (username) {
        localStorage.setItem("username", username);
      }

      navigate("/inicio");
    } catch (err) {
      console.error("Error en registro:", err?.response || err);

      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Error en el registro";

      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onError = () => {
    toast.error("Por favor completa correctamente los campos obligatorios.");
  };

  useEffect(() => {
    document.body.classList.add("with-bg", "register-open");

    document.documentElement.classList.add("register-open");

    return () => {
      document.body.classList.remove("with-bg", "register-open");

      document.documentElement.classList.remove("register-open");
    };
  }, []);

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Registro de Animadores</h2>

        <p className="register-subtitle">
          Completá tus datos para crear tu cuenta.
        </p>

        <form
          className="register-form"
          onSubmit={handleSubmit(onSubmit, onError)}
        >
          {/* NOMBRE */}

          <div className="register-field">
            <label htmlFor="nombre">Nombre</label>

            <input
              id="nombre"
              type="text"
              placeholder="Ingresá tu nombre"
              disabled={submitting}
              {...register("nombre", {})}
            />
          </div>

          {/* APELLIDO */}

          <div className="register-field">
            <label htmlFor="apellido">Apellido</label>

            <input
              id="apellido"
              type="text"
              placeholder="Ingresá tu apellido"
              disabled={submitting}
              {...register("apellido", {})}
            />
          </div>

          {/* APODO */}

          <div className="register-field">
            <label htmlFor="apodo">
              Apodo
              <span className="optional">Opcional</span>
            </label>

            <input
              id="apodo"
              type="text"
              placeholder="Ingresá tu apodo"
              disabled={submitting}
              {...register("apodo")}
            />
          </div>

          {/* EMAIL */}

          <div className="register-field">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              placeholder="ejemplo@email.com"
              disabled={submitting}
              {...register("email", {})}
            />
          </div>

          {/* FECHA DE CUMPLEAÑOS */}

          <div className="register-field">
            <label htmlFor="fechaCumple">
              Fecha de cumpleaños
              <span className="optional">Opcional</span>
            </label>

            <input
              id="fechaCumple"
              type="date"
              disabled={submitting}
              {...register("fechaCumple")}
            />
          </div>

          {/* DIVISIÓN */}

          <div className="register-field">
            <label htmlFor="division">División</label>

            <select
              id="division"
              disabled={submitting}
              {...register("division", {})}
              defaultValue=""
            >
              <option value="" disabled>
                Seleccioná división
              </option>

              <option value="chiquitos">Chiquitos</option>

              <option value="medianitos">Medianitos</option>

              <option value="medianos">Medianos</option>

              <option value="grandes">Grandes</option>
            </select>
          </div>

          {/* RECORRIDA */}

          <div className="register-field">
            <label htmlFor="recorrida">Recorrida</label>

            <select
              id="recorrida"
              disabled={submitting}
              {...register("recorrida", {})}
              defaultValue=""
            >
              <option value="" disabled>
                Seleccioná recorrida
              </option>

              <option value="roja">Roja</option>

              <option value="azul">Azul</option>

              <option value="naranja">Naranja</option>

              <option value="amarilla">Amarilla</option>
              <option value="violeta">Violeta</option>
            </select>
          </div>

          {/* CONTRASEÑA */}

          <div className="register-field">
            <label htmlFor="password">Contraseña</label>

            <input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              disabled={submitting}
              {...register("password", {})}
            />
          </div>

          {/* ACCIONES */}

          <div className="register-actions">
            <button
              className="register-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Registrando..." : "Registrarse"}
            </button>

            <div className="login-link">
              <Link to="/login">
                ¿Ya tienes cuenta? <span>Iniciar sesión</span>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
