import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import api from "../../api";
import "./Registro.css";
import toast from "react-hot-toast";
// import { setUser } from "../../store";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      // Asegurar roles por defecto
      if (
        !data.roles ||
        (Array.isArray(data.roles) && data.roles.length === 0)
      ) {
        data.roles = ["animador"];
      }
      const response = await api.post("/animador/register", data, {
        skipAuth: true,
      });
      toast.success("Registro exitoso");
      const token = response?.data?.token;
      if (token) localStorage.setItem("Token", token);
      // Dispatch user info to redux store (adjust shape as needed)
      dispatch(setUser(response.data.user ?? { token }));
      reset();
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(
        (error?.response?.data && error.response.data.message) ||
          "Error en el registro",
      );
      // keep form data so user can edit, don't navigate away on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.classList.add("login-dark");
    return () => document.body.classList.remove("login-dark");
  }, []);

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Registro de Animadores</h2>
        <form
          className="register-form"
          onSubmit={handleSubmit(onSubmit, (formErrors) => {
            // collect validation messages and show as toast
            const msgs = Object.values(formErrors || {}).map(
              (f) => f.message || "Campo inválido",
            );
            if (msgs.length) {
              toast.error(msgs.join(". "));
            }
          })}
        >
          <div className="input-group">
            <input
              placeholder="Nombre"
              type="text"
              {...register("nombre", { required: "El nombre es obligatorio" })}
            />
          </div>
          {errors.nombre && <p className="error">{errors.nombre.message}</p>}

          <div className="input-group">
            <input
              placeholder="Apellido"
              type="text"
              {...register("apellido", {
                required: "El apellido es obligatorio",
              })}
            />
          </div>
          {errors.apellido && (
            <p className="error">{errors.apellido.message}</p>
          )}

          <div className="input-group">
            <input
              placeholder="Apodo (opcional)"
              type="text"
              {...register("apodo")}
            />
          </div>

          <div className="input-group">
            <input
              placeholder="Correo electrónico"
              type="email"
              {...register("email", {
                required: "El email es obligatorio",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "El email no es válido",
                },
              })}
            />
          </div>
          {errors.email && <p className="error">{errors.email.message}</p>}

          <div className="input-group">
            <input
              placeholder="Edad"
              type="number"
              {...register("edad", {
                required: "La edad es obligatoria",
                valueAsNumber: true,
                min: { value: 0, message: "Edad inválida" },
              })}
            />
          </div>
          {errors.edad && <p className="error">{errors.edad.message}</p>}

          <div className="input-group">
            <input
              placeholder="Fecha de nacimiento"
              type="date"
              {...register("fechaCumple", {
                required: "La fecha es obligatoria",
              })}
            />
          </div>
          {errors.fechaCumple && (
            <p className="error">{errors.fechaCumple.message}</p>
          )}

          <div className="input-group">
            <textarea
              placeholder="Restricciones (alergias, observaciones)"
              {...register("restricciones")}
              rows={3}
            />
          </div>

          <div className="input-group">
            <select
              {...register("division", {
                required: "La división es obligatoria",
              })}
              defaultValue=""
            >
              <option value="" disabled>
                Seleccioná tu división
              </option>
              <option value="chiquitos">Chiquitos</option>
              <option value="medianitos">Medianitos</option>
              <option value="medianos">Medianos</option>
              <option value="grandes">Grandes</option>
            </select>
          </div>
          {errors.division && (
            <p className="error">{errors.division.message}</p>
          )}

          <div className="input-group">
            <select
              {...register("recorrida", {
                required: "La recorrida es obligatoria",
              })}
              defaultValue=""
            >
              <option value="" disabled>
                Seleccioná tu recorrida
              </option>
              <option value="rojo">Rojo</option>
              <option value="azul">Azul</option>
              <option value="naranja">Naranja</option>
              <option value="amarillo">Amarillo</option>
            </select>
          </div>
          {errors.recorrida && (
            <p className="error">{errors.recorrida.message}</p>
          )}

          <div className="input-group">
            <input
              placeholder="Contraseña"
              type="password"
              autoComplete="new-password"
              {...register("password", {
                required: "La contraseña es obligatoria",
                minLength: {
                  value: 6,
                  message: "La contraseña debe tener al menos 6 caracteres",
                },
              })}
            />
          </div>
          {errors.password && (
            <p className="error">{errors.password.message}</p>
          )}

          {/* roles por defecto para registro */}
          <input type="hidden" {...register("roles")} value={["animador"]} />

          <button type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>
        <p className="login-link">
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
