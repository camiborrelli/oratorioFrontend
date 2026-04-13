import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import api from "../../api";
import { editarNinio } from "../../features/ninio.slice";
import "react-toastify/dist/ReactToastify.css";
import "./RegistroNinio.css";

const EditarNinio = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const initialNin = location.state?.nin || location.state?.ninio || null;

  const { register, handleSubmit, reset } = useForm();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const divisions = useSelector((s) => s.division?.divisiones || []);

  useEffect(() => {
    if (initialNin) {
      const fmtDate = (val) => {
        if (!val) return "";
        try {
          const d = new Date(val);
          if (Number.isNaN(d.getTime())) return "";
          // to yyyy-mm-dd needed by <input type="date">
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}`;
        } catch (e) {
          return "";
        }
      };

      reset({
        nombre: initialNin.nombre || "",
        apellido: initialNin.apellido || "",
        fechaNacimiento: fmtDate(
          initialNin.fechaNacimiento || initialNin.fecha_nacimiento,
        ),
        edad: initialNin.edad || "",
        division: initialNin.division || "",
        recorrida: initialNin.recorrida || "",
        direccion: initialNin.direccion || "",
        foto: initialNin.foto || "",
        observaciones: initialNin.observaciones || "",
      });
      const raw = initialNin.contactos || initialNin.contactosFamilia || [];
      if (Array.isArray(raw)) {
        setContacts(
          raw.map((c) => ({
            nombre: c.nombre || "",
            relacion: c.relacion || "",
            telefono: c.telefono || "",
          })),
        );
      }
    }
  }, [initialNin, reset]);

  const updateContact = (idx, field, value) =>
    setContacts((c) =>
      c.map((it, i) => (i === idx ? { ...it, [field]: value } : it)),
    );
  const addContact = () =>
    setContacts((c) => [...c, { nombre: "", relacion: "", telefono: "" }]);
  const removeContact = (idx) =>
    setContacts((c) => c.filter((_, i) => i !== idx));

  const onSubmit = async (data) => {
    if (!initialNin) return toast.error("No hay niño seleccionado para editar");
    setLoading(true);
    try {
      const payload = { ...data };
      // keep only allowed contact fields (include relacion when provided)
      payload.contactos = (contacts || [])
        .map((c) => {
          const obj = { nombre: c.nombre || "", telefono: c.telefono || "" };
          if (c.relacion) obj.relacion = c.relacion;
          return obj;
        })
        .filter((c) => c.nombre || c.telefono || c.relacion);
      console.info("EditarNinio payload (before send):", payload);
      if (!payload.foto) delete payload.foto;
      if (!payload.observaciones) delete payload.observaciones;
      if (!payload.direccion) delete payload.direccion;

      // normalize fechaNacimiento to ISO 8601 if provided
      if (payload.fechaNacimiento) {
        const d = new Date(payload.fechaNacimiento);
        if (!Number.isNaN(d.getTime())) {
          payload.fechaNacimiento = d.toISOString();
        } else {
          delete payload.fechaNacimiento;
        }
      }

      // ensure edad is a number
      if (payload.edad !== undefined && payload.edad !== "") {
        const num = Number(payload.edad);
        if (!Number.isNaN(num)) payload.edad = num;
        else delete payload.edad;
      }

      // normalize division to server-expected lowercase keys
      if (payload.division) {
        payload.division = String(payload.division).trim().toLowerCase();
      }

      // normalize recorrida to lowercase allowed values
      if (payload.recorrida) {
        payload.recorrida = String(payload.recorrida).trim().toLowerCase();
      }

      const nid = initialNin._id || initialNin.id;
      const res = await api.put(`/ninios/${nid}`, payload);
      const responseData = res.data?.ninio || res.data;
      toast.success("Guardado");
      dispatch(editarNinio(responseData));
      navigate(`/ninios/${nid}`, { state: { nin: responseData } });
    } catch (err) {
      console.error(err);
      toast.error("Error al editar los datos del niño");
      const serverData = err?.response?.data;
      console.info("Server error response:", serverData);
      const serverMsg =
        serverData?.message || serverData || err.message || "Error al guardar";
      try {
        toast.error(
          typeof serverMsg === "string" ? serverMsg : JSON.stringify(serverMsg),
        );
      } catch (e) {
        toast.error("Error al guardar");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Editar Niño</h2>
        <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid">
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" {...register("nombre")} />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input type="text" {...register("apellido")} />
            </div>
            <div className="form-group">
              <label>Fecha de nacimiento</label>
              <input type="date" {...register("fechaNacimiento")} />
            </div>
            <div className="form-group">
              <label>Edad</label>
              <input type="number" {...register("edad")} />
            </div>
            <div className="form-group">
              <label>División</label>
              <select {...register("division")}>
                <option value="">--</option>
                {divisions.map((d, i) => (
                  <option key={i} value={d.nombre || d.name || d.id}>
                    {d.nombre || d.name || d.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Recorrida</label>
              <select {...register("recorrida")}>
                <option value="">--</option>
                <option value="rojo">Rojo</option>
                <option value="azul">Azul</option>
                <option value="naranja">Naranja</option>
                <option value="amarillo">Amarillo</option>
              </select>
            </div>
            <div className="form-group">
              <label>Direccion</label>
              <input type="text" {...register("direccion")} />
            </div>
            <div className="form-group">
              <label>Foto URL</label>
              <input type="text" {...register("foto")} />
            </div>
          </div>

          <div className="form-group full">
            <label>Contactos</label>
            <div className="contacts-list">
              {contacts.map((c, idx) => (
                <div className="contact-row" key={idx}>
                  <input
                    placeholder="Nombre"
                    value={c.nombre}
                    onChange={(e) =>
                      updateContact(idx, "nombre", e.target.value)
                    }
                  />
                  <input
                    placeholder="Relación"
                    value={c.relacion}
                    onChange={(e) =>
                      updateContact(idx, "relacion", e.target.value)
                    }
                  />
                  <input
                    placeholder="Teléfono"
                    value={c.telefono}
                    onChange={(e) =>
                      updateContact(idx, "telefono", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeContact(idx)}
                  >
                    Cancelar
                  </button>
                </div>
              ))}
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={addContact}
                >
                  + Agregar contacto
                </button>
              </div>
            </div>
          </div>

          <div className="actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarNinio;
