import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import api, { fetchList } from "../../api";
import { agregarNinio } from "../../features/ninio.slice";
import "react-toastify/dist/ReactToastify.css";
import "./RegistroNinio.css";
import "../../App.css";
import { listarDivision } from "../../features/division.slice";
import { listarRecorridas } from "../../features/recorrida.slice";

const RegistroNinio = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const location = useLocation();
  const initialNin =
    location.state?.nin ||
    location.state?.ninio ||
    location.state?.data ||
    null;
  const isEdit = !!initialNin;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data };

      if (contacts && contacts.length) {
        payload.contactos = contacts
          .map((c) => {
            const nombre = c.nombre || c.nombreCompleto || c.fullName;
            const telefono = c.telefono || c.telefono_celular || c.telefono1;
            const out = {};
            if (nombre) out.nombre = nombre;
            if (telefono) out.telefono = telefono;
            return out;
          })
          .filter((c) => Object.keys(c).length > 0);
      } else {
        payload.contactos = [];
      }

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

      // normalize division/recorrida to lowercase simple strings
      if (payload.division)
        payload.division = String(payload.division).trim().toLowerCase();
      if (payload.recorrida)
        payload.recorrida = String(payload.recorrida).trim().toLowerCase();

      // Resolve division to numeric ID when possible
      if (payload.division && divisions && divisions.length) {
        const found = divisions.find((d) =>
          [d.id, d._id, d.nombre, d.name].some(
            (v) => String(v) === String(payload.division),
          ),
        );
        if (found) {
          const rawId = found.id ?? found._id;
          const num = Number(rawId);
          if (!Number.isNaN(num)) {
            payload.divisionId = num;
            delete payload.division;
          }
        }
      }

      // Keep `recorrida` as string (backend disallows recorridaId)

      console.info("RegistroNinio contactos enviados:", payload.contactos);
      console.info("RegistroNinio payload:", payload);

      if (isEdit) {
        const nid = initialNin._id || initialNin.id || initialNin._id_ninio;
        const res = await api.put(`/ninios/${nid}`, payload);
        const responseData = res.data?.ninio || res.data;
        toast.success("Actualización exitosa");
        dispatch(agregarNinio(responseData));
        reset();
        navigate(`/ninios/${nid}`, { state: { nin: responseData } });
      } else {
        const res = await api.post("/ninios", payload);
        const responseData = res.data?.ninio || res.data;
        toast.success("Registro exitoso");
        dispatch(agregarNinio(responseData));
        reset();
        navigate("/ninios");
      }
    } catch (err) {
      console.error("Registro error:", err);
      const serverData = err?.response?.data;
      if (serverData) {
        console.info("Server response:", serverData);
        const serverMsg =
          serverData.message || serverData.msg || JSON.stringify(serverData);
        toast.error(serverMsg);
      } else {
        const msg = err?.message || "Error en el registro";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // no page background for this register page (use full-width form)
    // If we received data via navigation state, prefill form for editing
    if (initialNin) {
      // map fields that exist
      const fmtDate = (val) => {
        if (!val) return "";
        try {
          const d = new Date(val);
          if (Number.isNaN(d.getTime())) return "";
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}`;
        } catch (e) {
          return "";
        }
      };

      const mapped = {
        nombre: initialNin.nombre || "",
        apellido: initialNin.apellido || "",
        fechaNacimiento: fmtDate(
          initialNin.fechaNacimiento || initialNin.fecha_nacimiento,
        ),
        edad: initialNin.edad || "",
        division: initialNin.division || initialNin.grupo || "",
        recorrida: initialNin.recorrida || "",
        direccion: initialNin.direccion || initialNin.domicilio || "",
        foto: initialNin.foto || initialNin.imagen || "",
        observaciones: initialNin.observaciones || "",
      };
      reset(mapped);
      // setup contacts state if present
      const rawContacts =
        initialNin.contactos ||
        initialNin.contactosFamilia ||
        initialNin.contactosData ||
        [];
      if (Array.isArray(rawContacts) && rawContacts.length) {
        setContacts(
          rawContacts.map((c) => ({
            nombre: c.nombre || c.nombreCompleto || c.fullName || "",
            relacion: c.relacion || c.parentesco || c.rol || "",
            telefono: c.telefono || c.telefono_celular || c.telefono1 || "",
          })),
        );
      }
    }
    return undefined;
  }, []);

  // contacts state for dynamic inputs
  const [contacts, setContacts] = useState([]);

  const addContact = () =>
    setContacts((c) => [
      ...c,
      { nombre: "", relacion: "", telefono: "", email: "" },
    ]);
  const removeContact = (idx) =>
    setContacts((c) => c.filter((_, i) => i !== idx));
  const updateContact = (idx, field, value) =>
    setContacts((c) =>
      c.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );

  const divisions = useSelector((state) => state.division?.divisiones || []);
  const recorridas = useSelector((state) => state.recorrida?.recorridas || []);

  useEffect(() => {
    // load divisions if not present
    if (!divisions || divisions.length === 0) {
      fetchList("/division").then((data) => dispatch(listarDivision(data)));
    }
    if (!recorridas || recorridas.length === 0) {
      fetchList("/recorrida").then((data) => dispatch(listarRecorridas(data)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Registro de Niños</h2>
        <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid">
            <div className="form-group">
              <label>
                Nombre
                <span className="required-badge" aria-hidden="true">
                  OBLIGATORIO
                </span>
              </label>
              <input
                type="text"
                {...register("nombre", {
                  required: "El nombre es obligatorio",
                })}
              />
              {errors.nombre && (
                <span className="error">{errors.nombre.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>
                Apellido
                <span className="required-badge" aria-hidden="true">
                  OBLIGATORIO
                </span>
              </label>
              <input
                type="text"
                {...register("apellido", {
                  required: "El apellido es obligatorio",
                })}
              />
              {errors.apellido && (
                <span className="error">{errors.apellido.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Fecha de nacimiento</label>
              <input
                type="date"
                {...register("fechaNacimiento", { required: false })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="">
                Edad
                <span className="required-badge" aria-hidden="true">
                  OBLIGATORIO
                </span>
              </label>
              <input
                type="number"
                {...register("edad", {
                  required: "La edad es obligatoria",
                  min: { value: 0, message: "La edad no puede ser negativa" },
                })}
              />
              {errors.edad && (
                <span className="error">{errors.edad.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>
                División
                <span className="required-badge" aria-hidden="true">
                  OBLIGATORIO
                </span>
              </label>
              <select
                {...register("division", {
                  required: "La división es obligatoria",
                })}
              >
                <option value="">Selecciona una división</option>
                {divisions && divisions.length > 0 ? (
                  divisions.map((d, idx) => {
                    const val =
                      typeof d === "string"
                        ? d
                        : d.nombre || d.name || d.id || d._id || String(idx);
                    const label =
                      typeof d === "string" ? d : d.nombre || d.name || val;
                    return (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    );
                  })
                ) : (
                  <option value="">No hay divisiones disponibles</option>
                )}
              </select>
              {errors.division && (
                <span className="error">{errors.division.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>
                Recorrida
                <span className="required-badge" aria-hidden="true">
                  OBLIGATORIO
                </span>
              </label>
              <select
                {...register("recorrida", {
                  required: "La recorrida es obligatoria",
                })}
              >
                <option value="">Selecciona una recorrida</option>
                {recorridas && recorridas.length > 0 ? (
                  recorridas.map((r, idx) => {
                    const val =
                      typeof r === "string"
                        ? r
                        : r.nombre || r.name || r.id || r._id || String(idx);
                    const label =
                      typeof r === "string" ? r : r.nombre || r.name || val;
                    return (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    );
                  })
                ) : (
                  <option value="">No hay recorridas disponibles</option>
                )}
              </select>
              {errors.recorrida && (
                <span className="error">{errors.recorrida.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Direccion</label>
              <input
                type="text"
                {...register("direccion", {
                  optional: true,
                })}
              />
              {errors.direccion && (
                <span className="error">{errors.direccion.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Foto URL</label>
              <input type="text" {...register("foto", { required: false })} />
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
              <small className="hint">
                También puedes dejar vacío y agregar contactos desde el perfil.
              </small>
            </div>
          </div>

          <div className="form-group full">
            <label>Observaciones</label>
            <textarea
              {...register("observaciones", { required: false })}
              placeholder="Observaciones adicionales"
            />
          </div>

          <div className="actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              aria-label={isEdit ? "Guardar cambios" : "Registrar"}
              translate="no"
            >
              {isEdit ? "Guardar cambios" : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistroNinio;
