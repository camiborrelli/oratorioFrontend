import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../api";
import "./ListarPlanificacion.css";
import { MdFlatware } from "react-icons/md";
import { RiUserVoiceLine } from "react-icons/ri";
import { FaPeopleGroup, FaTractor } from "react-icons/fa6";
import { MdOutlineGamepad } from "react-icons/md";
import { FiDelete } from "react-icons/fi";
import { FaMasksTheater } from "react-icons/fa6";

const ListarPlanificaciones = () => {
  const [planificaciones, setPlanificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animadorId, setAnimadorId] = useState(null);
  const [animador, setAnimador] = useState(null);
  const [isCordi, setIsCordi] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const formatDate = (value) => {
    if (!value) return "--";

    let date;
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      // Parseo manual para evitar el desfasaje de zona horaria en fechas "YYYY-MM-DD"
      const [year, month, day] = value.slice(0, 10).split("-").map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) return String(value);

    const day = date.getDate();
    const month = new Intl.DateTimeFormat("es-AR", { month: "long" }).format(
      date,
    );
    return `${day} de ${month}`;
  };

  const getProximoDomingo = () => {
    const hoy = new Date();
    const diasHastaDomingo = (7 - hoy.getDay()) % 7 || 7;
    const proximoDomingo = new Date(hoy);
    proximoDomingo.setDate(hoy.getDate() + diasHastaDomingo);
    proximoDomingo.setHours(13, 0, 0, 0);
    return proximoDomingo;
  };

  // y en el componente:
  const LIMITE_EXPIRACION = getProximoDomingo();

  const formatValue = (value) => value || "Sin asignar";

  const isPlanificacionActiva = (plan) => {
    if (!plan?.fecha) return false;

    const fechaBase = new Date(plan.fecha);
    if (Number.isNaN(fechaBase.getTime())) return false;

    const ahora = new Date();
    return ahora < LIMITE_EXPIRACION && fechaBase <= LIMITE_EXPIRACION;
  };

  const buildItems = (plan) => [
    {
      id: "oracion",
      title: "Oración",
      value: formatValue(plan.oracionAnimadores),
      icon: <FaPeopleGroup />,
      accent: "mint",
    },
    {
      id: "buenas-tardes",
      title: "Buenas Tardes",
      value: formatValue(plan.buenasTardes),
      icon: <FaMasksTheater />,
      accent: "sage",
    },
    {
      id: "merienda",
      title: "Merienda",
      value: formatValue(plan.merienda),
      icon: <MdFlatware />,
      accent: "green",
    },
    ...(plan.bendicionMerienda
      ? [
          {
            id: "bendicion-merienda",
            title: "Bendición Merienda",
            value: formatValue(plan.bendicionMerienda),
            icon: <RiUserVoiceLine />,
            accent: "mint",
          },
        ]
      : []),
    ...(plan.oracionNinios
      ? [
          {
            id: "oracion-ninios",
            title: "Oración Niños",
            value: formatValue(plan.oracionNinios),
            icon: <MdOutlineGamepad />,
            accent: "sage",
          },
        ]
      : []),
  ];

  const listarPlanificaciones = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoints = [
        "/eventos/planificacion",
        "/eventos/planificaciones",
        "/planificacion",
        "/planificaciones",
      ];

      let data = null;
      let lastErr = null;
      for (const endpoint of endpoints) {
        try {
          const res = await api.get(endpoint);
          const d = res?.data;
          if (Array.isArray(d)) {
            data = d;
            break;
          }
          if (d && typeof d === "object") {
            if (Array.isArray(d.planificaciones)) {
              data = d.planificaciones;
              break;
            }
            if (Array.isArray(d.data)) {
              data = d.data;
              break;
            }
            if (Array.isArray(d.result)) {
              data = d.result;
              break;
            }
            // first array value
            for (const v of Object.values(d)) {
              if (Array.isArray(v)) {
                data = v;
                break;
              }
            }
            if (data) break;
          }
        } catch (err) {
          lastErr = err;
          if (err?.response?.status && err.response.status !== 404) {
            // rethrow for non-404 server errors so user sees it
            throw err;
          }
          // otherwise continue to next endpoint
        }
      }

      if (!data) throw lastErr || new Error("No planificaciones endpoint");
      const activas = (Array.isArray(data) ? data : []).filter(
        isPlanificacionActiva,
      );
      setPlanificaciones(activas);
    } catch (err) {
      console.error("Error fetching /planificaciones", err);
      if (err?.response?.status === 404) {
        setError(`No se encontró ninguna planificación (404).`);
      } else {
        setError(err?.response?.data || err.message || String(err));
        toast.error("No se pudieron cargar las planificaciones");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listarPlanificaciones().catch(() => {});
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      listarPlanificaciones().catch(() => {});
    };

    const ahora = new Date();
    if (ahora >= LIMITE_EXPIRACION) {
      setPlanificaciones([]);
      setError("La planificación ya expiró.");
      setLoading(false);
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPlanificaciones([]);
      setError("La planificación ya expiró.");
      setLoading(false);
    }, LIMITE_EXPIRACION.getTime() - ahora.getTime());

    window.addEventListener("focus", handleFocus);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);
  useEffect(() => {
    const cargarAnimador = async () => {
      try {
        const storedId = localStorage.getItem("animadorId");
        if (!storedId) {
          console.error("No existe animadorId en localStorage");
          return;
        }
        setAnimadorId(storedId);

        const res = await api.get(`/animador/id/${storedId}`);
        const datosAnimador = res.data?.animador || res.data;
        setAnimador(datosAnimador);

        const coordi =
          datosAnimador?.roles?.includes("coordinador") ||
          datosAnimador?.roles?.includes("cordi");
        setIsCordi(coordi);

        const admin = datosAnimador?.roles?.includes("admin");
        setIsAdmin(admin);
      } catch (error) {
        console.error(
          "Error obteniendo animador:",
          error?.response?.data || error,
        );
        setAnimador(null);
      }
    };
    cargarAnimador();
  }, []);

  const eliminarPlanificacion = async (id) => {
    try {
      const res = await api.delete(`/eventos/planificaciones/${id}`);
      if (res?.status === 200) {
        toast.success("Planificación eliminada exitosamente");
        listarPlanificaciones().catch(() => {});
      } else {
        throw new Error(`Error eliminando planificación: ${res?.status}`);
      }
    } catch (err) {
      console.error("Error eliminando planificación:", err);
      toast.error(
        err?.response?.data?.message || "Error al eliminar la planificación",
      );
    }
  };

  return (
    <div className="listar-planificaciones">
      <h2>Planificación del próximo domingo</h2>
      {loading && <p>Cargando planificaciones...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && planificaciones.length === 0 && (
        <p>No hay planificaciones disponibles.</p>
      )}
      {!loading && !error && planificaciones.length > 0 && (
        <div className="planificaciones-list">
          {planificaciones.map((plan) => (
            <article key={plan._id} className="plan-card">
              <div className="plan-card__hero">
                <div className="plan-card__badges">
                  <span className="plan-card__badge plan-card__badge--date">
                    {formatDate(plan.fecha)}
                  </span>

                  <span className="plan-card__badge plan-card__badge--type">
                    Planificación
                  </span>
                  {isCordi && (
                    <button
                      type="button"
                      className="plan-card__badge plan-card__badge--type btn-plan-eliminar"
                      onClick={() => eliminarPlanificacion(plan._id)}
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="plan-card__header">
                  <h3 className="plan-card__title">
                    {plan.Tema || "Sin tema"}
                  </h3>
                </div>
              </div>

              <div className="plan-card__items">
                {buildItems(plan).map((item) => (
                  <div key={item.id} className={`plan-mini ${item.accent}`}>
                    <div className="plan-mini__icon">{item.icon}</div>
                    <div className="plan-mini__body">
                      <div className="plan-mini__title">{item.title}</div>
                      <div className="plan-mini__value">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListarPlanificaciones;
