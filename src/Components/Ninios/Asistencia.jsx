import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Asistencia.css";

function fechaHoyTexto(d = new Date()) {
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

const Asistencia = () => {
  const [loading, setLoading] = useState(false);
  const [ninios, setNinios] = useState([]);
  const [divisiones, setDivisiones] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [attendance, setAttendance] = useState({}); // { ninioId: { status: 'present'|'late'|'absent', note } }
  const [faltasMap, setFaltasMap] = useState({}); // { ninioId: count }

  // Fetch persisted attendance for the selected date (default: today)
  const fetchAttendance = async (dateIso) => {
    const isoDate = dateIso || new Date().toISOString().slice(0, 10);
    const fechaHoy = new Date();
    const tryPaths = [
      "/asistencia",
      "/asistencias",
      "/asistencia/diaria",
      `/asistencia/fecha/${fechaHoy.toISOString()}`,
      "/asistencia/today",
      "/ninios/asistencia",
      "/ninios/asistencias",
    ];

    for (const p of tryPaths) {
      try {
        const res = await api.get(p, { params: { date: isoDate } });
        const d = res?.data;
        if (!d) continue;

        const att = {};
        const faltas = {};

        // normalize arrays
        const rows = Array.isArray(d)
          ? d
          : Array.isArray(d.results)
            ? d.results
            : Array.isArray(d.data)
              ? d.data
              : null;

        if (rows) {
          rows.forEach((it) => {
            const id = it.ninioId || it.ninio || it.id || it._id || it.ninio_id;
            if (!id) return;
            const status = it.status || it.estado || it.state || null;
            if (status) att[id] = { status };
            const f = it.faltas ?? it.cantFaltas ?? null;
            if (f != null) faltas[id] = f;
          });
        } else if (typeof d === "object") {
          // object mapping id -> { status }
          for (const [k, v] of Object.entries(d)) {
            if (!v) continue;
            if (v && typeof v === "object") {
              const id = v.ninioId || v.ninio || v.id || v._id || k;
              const status =
                v.status ||
                v.estado ||
                v.state ||
                (typeof v === "string" ? v : null);
              if (status) att[id] = { status };
              const f = v.faltas ?? v.cantFaltas ?? null;
              if (f != null) faltas[id] = f;
            }
          }
        }

        if (Object.keys(att).length > 0 || Object.keys(faltas).length > 0) {
          setAttendance((s) => ({ ...s, ...att }));
          setFaltasMap((s) => ({ ...s, ...faltas }));
          return;
        }
      } catch (e) {
        // try next endpoint
      }
    }
    // nothing found - leave states as is
  };

  useEffect(() => {
    setLoading(true);
    api
      .get("/ninios")
      .then((r1) => {
        const list = Array.isArray(r1.data)
          ? r1.data
          : Array.isArray(r1.data?.ninios)
            ? r1.data.ninios
            : Array.isArray(r1.data?.data)
              ? r1.data.data
              : [];
        setNinios(list);
        // derive divisions from ninios (handle backend shape variations)
        const map = new Map();
        list
          .map((n) => {
            const raw = n.division || n.grupo || n.divisionId || n.divisionName;
            if (!raw) return null;
            if (typeof raw === "string") return raw;
            if (typeof raw === "object") return raw.nombre || raw.name || null;
            return null;
          })
          .filter(Boolean)
          .forEach((label) => {
            const key = String(label).trim().toLowerCase();
            if (!map.has(key)) map.set(key, label);
          });
        const derived = Array.from(map.values());
        setDivisiones(derived);
        // keep no selection by default so all children are shown on open
        // setSelectedDivision(derived[0] || null);
        // try to load today's attendance if backend persists it
        fetchAttendance();
      })
      .catch((e) => {
        console.error("Asistencia: error cargando datos", e);
        toast.error("No se pudieron cargar los datos de asistencia");
      })
      .finally(() => setLoading(false));
  }, []);

  const marcar = async (ninioId, status) => {
    // Optimistic update
    setAttendance((s) => ({ ...s, [ninioId]: { status } }));
    try {
      await api.post(`/asistencia/${ninioId}`, { status });
    } catch (e) {
      console.error("Error marcando asistencia", e);
      toast.error("No se pudo actualizar la asistencia");
    }
  };

  const normalizeDivision = (n) => {
    if (!n) return null;
    const raw = n.division || n.grupo || n.divisionId || n.divisionName;
    if (!raw) return null;
    if (typeof raw === "string") return raw;
    if (typeof raw === "object") return raw.nombre || raw.name || null;
    return null;
  };

  const listadoFiltrado = ninios.filter((n) => {
    if (!selectedDivision) return true;
    const div = normalizeDivision(n);
    return String(div).trim() === String(selectedDivision).trim();
  });

  return (
    <div className="asistencia-root">
      <header className="asistencia-header">
        <h3 className="subtitle">REGISTRO DIARIO</h3>
        <h1 className="title">Registro de Asistencia</h1>
      </header>

      <div className="asistencia-controls">
        <div className="date-card">
          <div className="date-label">Fecha seleccionada</div>
          <div className="date-value">Hoy, {fechaHoyTexto()}</div>
        </div>

        <div className="division-chips">
          <button
            className={`chip ${selectedDivision == null ? "active" : ""}`}
            onClick={() => setSelectedDivision(null)}
          >
            Todas
          </button>
          {divisiones.map((d) => (
            <button
              key={d}
              className={`chip ${String(d).trim() === String(selectedDivision).trim() ? "active" : ""}`}
              onClick={() => setSelectedDivision(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="asistencia-summary">
        <div>{listadoFiltrado.length} Estudiantes</div>
        {/* <div className="ver-todos">Ver todos</div> */}
      </div>

      <div className="asistencia-list">
        {loading && <div className="muted">Cargando...</div>}

        {listadoFiltrado.map((n) => {
          const nid = n._id || n.id;
          const st = attendance[nid] && attendance[nid].status;
          return (
            <article className="student-card" key={nid}>
              <img
                className="avatar"
                src={"/img/imageee.png"}
                // src={n.foto || n.imagen || "/img/avatar-placeholder.png"}
                alt={n.nombre}
                onError={(e) =>
                  (e.currentTarget.src = "/img/avatar-placeholder.png")
                }
              />
              <div className="student-body">
                <div className="student-row">
                  <div className="student-name">
                    <strong>
                      {n.nombre} {n.apellido || ""}
                    </strong>
                    <div className="student-sub muted">
                      {st === "present"}

                      {st === "absent" && (
                        <span className="absent">Ausente hoy</span>
                      )}
                      {!st && <span className="muted">Sin registrar</span>}
                    </div>
                  </div>

                  <div className="student-actions">
                    <button
                      className={`action-btn present ${st === "present" ? "selected" : ""}`}
                      onClick={() => marcar(nid, "present")}
                      aria-label="Marcar presente"
                    >
                      ✓
                    </button>

                    <button
                      className={`action-btn absent ${st === "absent" ? "selected" : ""}`}
                      onClick={() => marcar(nid, "absent")}
                      aria-label="Marcar ausente"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default Asistencia;
