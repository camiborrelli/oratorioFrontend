import React, { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import api from "../../api";
import { toast } from "react-toastify";
import { editarAnimador } from "../../features/animador.slice";
import "./EditarAnimador.css";
import "../Registro/Registro.css";

const EditarAnimador = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const initialAnim =
    location?.state?.anim || location?.state?.animador || null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  useEffect(() => {
    if (initialAnim) {
      reset({
        id: initialAnim._id || initialAnim.id,
        nombre: initialAnim.nombre || "",
        apellido: initialAnim.apellido || "",
        email: initialAnim.email || initialAnim.correo || "",
        telefono: initialAnim.telefono || initialAnim.telefono_celular || "",
        division: initialAnim.division || "",
        recorrida: initialAnim.recorrida || initialAnim.route || "",
        foto: initialAnim.foto || initialAnim.imagen || "",
        observaciones: initialAnim.observaciones || initialAnim.notes || "",
      });
      const t = setTimeout(() => {
        const el = document.getElementById("form-animador");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return () => clearTimeout(t);
    }

    const fetchPerfil = async (animId) => {
      try {
        const res = await api.get(`/animadores/${animId}`);
        const d = res?.data;
        const candidate = d?.animador || d?.usuario || d?.user || d;
        if (candidate && typeof candidate === "object") {
          reset({
            id: candidate._id || candidate.id,
            nombre: candidate.nombre || "",
            apellido: candidate.apellido || "",
            email: candidate.email || candidate.correo || "",
            telefono: candidate.telefono || candidate.telefono_celular || "",
            division: candidate.division || "",
            recorrida: candidate.recorrida || candidate.route || "",
            foto: candidate.foto || candidate.imagen || "",
            observaciones: candidate.observaciones || candidate.notes || "",
          });
        }
      } catch (e) {
        console.warn("No se pudo obtener perfil para editar", e);
      }
    };

    if (id) fetchPerfil(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAnim, id, reset]);

  const onSubmit = async (data) => {
    if (!data) return toast.error("No hay datos para actualizar");
    const aid = data.id || id || localStorage.getItem("animadorId");
    if (!aid) return toast.error("No se encontró id del animador");
    try {
      const payload = {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        fechaCumple: data.fechaCumple,
        telefono: data.telefono,
        division: data.division,
        recorrida: data.recorrida,
        foto: data.foto,
        observaciones: data.observaciones,
      };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === undefined || payload[k] === "") delete payload[k];
      });

      let res;
      try {
        res = await api.patch(`/animadores/${aid}`, payload);
      } catch (e) {
        res = await api.put(`/animadores/${aid}`, payload);
      }

      const updated = res.data?.animador || res.data || res.data?.user;
      if (updated && typeof updated === "object")
        dispatch(editarAnimador(updated));
      toast.success("Perfil actualizado");
      reset();
      navigate(`/animadores/perfil/${aid}`);
    } catch (err) {
      console.error("Error updating animador", err);
      const server = err?.response?.data;
      toast.error(server?.message || err.message || "Error al actualizar");
    }
  };

  return (
    <div className="register-page min-h-[60vh] flex items-center justify-center">
      <div className="register-card bg-white p-6 rounded-xl shadow-md w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Editar Animador</h2>
        <form
          className="register-form"
          id="form-animador"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input type="hidden" {...register("id")} />

          <div className="grid">
            <div className="form-group">
              <label>Nombre</label>
              <input
                className="w-full"
                placeholder="Nombre"
                {...register("nombre", { required: true })}
              />
              {errors.nombre && <div className="error">Nombre obligatorio</div>}
            </div>

            <div className="form-group">
              <label>Apellido</label>
              <input
                className="w-full"
                placeholder="Apellido"
                {...register("apellido", { required: true })}
              />
              {errors.apellido && (
                <div className="error">Apellido obligatorio</div>
              )}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                className="w-full"
                placeholder="Email"
                type="email"
                {...register("email", { required: false })}
              />
            </div>

            <div className="form-group">
              <label>Fecha de nacimiento</label>
              <input
                className="w-full"
                placeholder="Fecha de nacimiento"
                type="date"
                {...register("fechaCumple", { required: false })}
              />
            </div>

            <div className="form-group">
              <label>División</label>
              <select
                className="w-full"
                {...register("division")}
                defaultValue=""
              >
                <option value="">Seleccioná división</option>
                <option value="chiquitos">Chiquitos</option>
                <option value="medianitos">Medianitos</option>
                <option value="medianos">Medianos</option>
                <option value="grandes">Grandes</option>
              </select>
            </div>

            <div className="form-group">
              <label>Recorrida</label>
              <select
                className="w-full"
                {...register("recorrida")}
                defaultValue=""
              >
                <option value="">Seleccioná recorrida</option>
                <option value="rojo">Rojo</option>
                <option value="azul">Azul</option>
                <option value="naranja">Naranja</option>
                <option value="amarillo">Amarillo</option>
                <option value="violeta">Violeta</option>
              </select>
            </div>

            <div className="form-group full">
              <label>Foto (URL)</label>
              <input
                className="w-full"
                placeholder="Foto (URL)"
                {...register("foto")}
              />
            </div>
          </div>

          <div className="actions">
            <button
              className="btn-primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => {
                reset({
                  id: null,
                  nombre: "",
                  apellido: "",
                  email: "",
                  division: "",
                  recorrida: "",
                  foto: "",
                });
                navigate(-1);
              }}
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarAnimador;
