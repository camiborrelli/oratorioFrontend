import React, { useState, useEffect } from "react";
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
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    apodo: "",
    email: "",
    fechaCumple: "",
    division: "",
    recorrida: "",
    password: "",
    roles: ["animador"],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ mode: "onChange" });

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);

      if (!data.roles) data.roles = ["animador"];
      else if (typeof data.roles === "string") {
        data.roles = [data.roles];
      }

      if (
        !data.nombre.trim() ||
        !data.apellido.trim() ||
        !data.email.trim() ||
        !data.division.trim() ||
        !data.recorrida.trim() ||
        !data.password.trim()
      ) {
        toast.error("Por favor completa todos los campos obligatorios.");
        setSubmitting(false);
        return;
      }

      if (data.password.length < 6) {
        toast.error("La contraseña debe tener al menos 6 caracteres.");
        setSubmitting(false);
        return;
      }

      const res = await api.post("/animador/register", payload, {
        skipAuth: true,
      });

      toast.success(res.data?.message || "Registro exitoso");

      const token = res.data?.token;

      if (token) {
        localStorage.setItem("Token", token);
      }

      const user = res.data?.user ?? { token };

      dispatch(setUser(user));

      const ap = user?.apodo || payload.apodo || "";

      if (ap) {
        localStorage.setItem("apodo", ap);
      }

      const uname = user?.username || user?.email || payload.email || "";

      if (uname) {
        localStorage.setItem("username", uname);
      }

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

  const onError = () => {
    toast.error("Por favor completa todos los campos obligatorios.");
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
          onSubmit={handleSubmit(onSubmit, onError)}
        >
          <input
            className="w-full border rounded-md px-3 py-2"
            placeholder="Nombre"
            {...register("nombre")}
          />
          {errors.nombre && (
            <p className="text-sm text-red-600">Nombre obligatorio</p>
          )}

          <input
            className="w-full border rounded-md px-3 py-2"
            placeholder="Apellido"
            {...register("apellido")}
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
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-600">Email obligatorio</p>
          )}

          <select
            className="w-full border rounded-md px-3 py-2"
            {...register("division")}
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
            {...register("recorrida")}
            defaultValue=""
          >
            <option value="" disabled>
              Seleccioná recorrida
            </option>
            <option value="roja">Roja</option>
            <option value="azul">Azul</option>
            <option value="naranja">Naranja</option>
            <option value="amarilla">Amarilla</option>
          </select>
          {errors.recorrida && (
            <p className="text-sm text-red-600">Recorrida obligatoria</p>
          )}

          <input
            type="date"
            {...register("fechaCumple")}
            placeholder="Fecha de cumpleaños"
          />

          <input
            className="w-full border rounded-md px-3 py-2"
            placeholder="Contraseña"
            type="password"
            {...register("password")}
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
              disabled={submitting}
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
