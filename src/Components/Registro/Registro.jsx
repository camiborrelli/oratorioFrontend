import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import api from "../../api";
import { setUser } from "../../store";
import { toast } from "react-hot-toast";
import "./Registro.css";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({ mode: "onChange" });

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      // ensure roles is an array
      if (!data.roles) data.roles = ["animador"];
      else if (typeof data.roles === "string") data.roles = [data.roles];

      const payload = {
        nombre: data.nombre,
        apellido: data.apellido,
        apodo: data.apodo || "",
        email: data.email,
        // edad: data.edad || null,
        fechaCumple: data.fechaCumple || "",
        restricciones: data.restricciones || "",
        division: data.division,
        recorrida: data.recorrida,
        password: data.password,
        roles: data.roles,
      };

      const res = await api.post("/animador/register", payload, {
        skipAuth: true,
      });
      toast.success(res.data?.message || "Registro exitoso");
      const token = res.data?.token;
      if (token) localStorage.setItem("Token", token);
      // persist user in redux and also store convenient keys in localStorage
      const user = res.data?.user ?? { token };
      dispatch(setUser(user));
      try {
        const ap = user?.apodo || payload.apodo || "";
        if (ap) localStorage.setItem("apodo", ap);
        const uname = user?.username || user?.email || payload.email || "";
        if (uname) localStorage.setItem("username", uname);
      } catch (e) {
        // ignore storage errors
      }
      reset();
      navigate("/inicio");
    } catch (err) {
      console.error("Registro error:", err?.response || err);
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

  useEffect(() => {
    document.body.classList.add("with-bg", "register-open");
    document.documentElement.classList.add("register-open");
    return () => {
      document.body.classList.remove("with-bg", "register-open");
      document.documentElement.classList.remove("register-open");
    };
  }, []);

  return (
    <div className="register-page min-h-[60vh] flex items-center justify-center">
      <div className="register-card bg-white p-6 rounded-xl shadow-md w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Registro de Animadores</h2>
        <form
          className="register-form space-y-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            className="w-full border rounded-md px-3 py-2"
            placeholder="Nombre"
            {...register("nombre", { required: true })}
          />
          {errors.nombre && (
            <p className="text-sm text-red-600">Nombre obligatorio</p>
          )}

          <input
            className="w-full border rounded-md px-3 py-2"
            placeholder="Apellido"
            {...register("apellido", { required: true })}
          />
          {errors.apellido && (
            <p className="text-sm text-red-600">Apellido obligatorio</p>
          )}

          <input
            className="w-full border rounded-md px-3 py-2"
            placeholder="Apodo (opcional)"
            {...register("apodo")}
          />

          <input
            className="w-full border rounded-md px-3 py-2"
            placeholder="Email"
            type="email"
            {...register("email", { required: true })}
          />
          {errors.email && (
            <p className="text-sm text-red-600">Email obligatorio</p>
          )}

          <select
            className="w-full border rounded-md px-3 py-2"
            {...register("division", { required: true })}
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
          {errors.division && (
            <p className="text-sm text-red-600">División obligatoria</p>
          )}

          <select
            className="w-full border rounded-md px-3 py-2"
            {...register("recorrida", { required: true })}
            defaultValue=""
          >
            <option value="" disabled>
              Seleccioná recorrida
            </option>
            <option value="rojo">Rojo</option>
            <option value="azul">Azul</option>
            <option value="naranja">Naranja</option>
            <option value="amarillo">Amarillo</option>
          </select>
          {errors.recorrida && (
            <p className="text-sm text-red-600">Recorrida obligatoria</p>
          )}

          <input
            className="w-full border rounded-md px-3 py-2"
            placeholder="Contraseña"
            type="password"
            {...register("password", { required: true, minLength: 6 })}
          />
          {errors.password && (
            <p className="text-sm text-red-600">
              Contraseña (min 6 caracteres)
            </p>
          )}

          <div className="flex items-center justify-between">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-md"
              type="submit"
              disabled={submitting || !isValid}
            >
              {submitting ? "Registrando..." : "Registrarse"}
            </button>
            <div className="login-link">
              <Link to="/login" className="text-sm">
                ¿Ya tienes cuenta?{" "}
                <span className="text-green-600">Iniciar sesión</span>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
