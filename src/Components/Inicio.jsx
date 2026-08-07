import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { desloguear } from "../features/animador.slice";
import api, { fetchCount, fetchList } from "../api";
import "./Inicio.compact.css";
import ListarEventos from "./Eventos/ListarEventos";
import CumplenMes from "./Ninios/CumplenMes";
import ListarRecordatorios from "./Eventos/ListarRecordatorios";

const Inicio = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    ninios: 0,
    animadores: 0,
    recorridas: 0,
    divisiones: 0,
  });

  const dispatch = useDispatch();

  useEffect(() => {
    let mounted = true;

    // use centralized fetchCount helper from api.js (tries /path/cantidad and fallbacks)
    const fetchSimpleCount = async (path) => {
      return await fetchCount(path);
    };

    (async () => {
      setLoading(true);
      try {
        const [ninios, animadores, recorridas, divisiones] = await Promise.all([
          fetchSimpleCount("/ninios"),
          fetchSimpleCount("/animador"),
          fetchSimpleCount("/recorrida"),
          fetchSimpleCount("/division"),
        ]);
        if (!mounted) return;
        setCounts((s) => ({
          ...s,
          ninios,
          animadores,
          recorridas,
          divisiones,
        }));
      } catch (err) {
        console.error("Error cargando contadores:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const apodo =
    localStorage.getItem("apodo") ||
    localStorage.getItem("username") ||
    "Usuario";
  console.log("Apodo:", apodo);

  // Robust age calculation: prefer explicit numeric `edad`/`age`, otherwise derive from birthdate fields.
  const getAge = (k) => {
    if (!k) return "-";
    const maybeNum = k.edad ?? k.age ?? k.Edad;
    if (typeof maybeNum === "number" && !Number.isNaN(maybeNum))
      return maybeNum;
    if (
      typeof maybeNum === "string" &&
      maybeNum.trim() !== "" &&
      !isNaN(Number(maybeNum))
    ) {
      return Number(maybeNum);
    }

    const dateKeys = [
      "fechaNacimiento",
      "fecha_nacimiento",
      "nacimiento",
      "birthdate",
      "birth_date",
      "fecha",
      "dob",
    ];

    let raw;
    for (const key of dateKeys) {
      if (k[key]) {
        raw = k[key];
        break;
      }
    }
    if (!raw) return "-";

    // Accept timestamps, ISO strings, or dd/mm/yyyy
    let dt;
    if (typeof raw === "number") dt = new Date(raw);
    else if (typeof raw === "string") {
      // try ISO parse
      const iso = Date.parse(raw);
      if (!isNaN(iso)) dt = new Date(iso);
      else if (raw.includes("/")) {
        const parts = raw.split(/\D+/).filter(Boolean);
        if (parts.length === 3) {
          // assume dd/mm/yyyy
          const [d, m, y] = parts;
          dt = new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
        }
      }
    }
    if (!dt || isNaN(dt.getTime())) return "-";
    const now = new Date();
    let age = now.getFullYear() - dt.getFullYear();
    const m = now.getMonth() - dt.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dt.getDate())) age--;
    return age >= 0 ? age : "-";
  };

  const handleLogout = () => {
    try {
      dispatch(desloguear());
    } catch (e) {
      try {
        localStorage.clear();
      } catch (er) {}
    }
    navigate("/login");
  };

  const edad = (k) => {
    return calcularEdad(k.fechaCumple) || "—";
  };

  const calcularEdad = (fechaCumple) => {
    if (!fechaCumple) return null;
    const hoy = new Date();
    const cumple = new Date(fechaCumple);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    const m = hoy.getMonth() - cumple.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
      edad--;
    }
    return edad;
  };

  return (
    <div className="inicio-container max-w-5xl mx-auto p-6">
      {/* <header className="app-header">
        <div className="logo">🌿 Oratorio</div>

        <div className="header-right">
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header> */}

      <div className="welcome inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-500 text-white py-2 px-4 rounded-full shadow-md mb-4">
        <span className="welcome-emoji text-2xl">👋</span>
        <span className="user font-semibold text-lg">Hola, {apodo}</span>
      </div>

      <div className="inicio-header mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gestión del Oratorio Cordon
          </h1>
          {/* <p className="text-sm text-slate-600">
            Administra niños, animadores, recorridas y divisiones
          </p> */}
        </div>
      </div>

      <div className="cards-grid grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div className="card flex items-center gap-4 bg-white p-4 rounded-xl shadow hover:shadow-lg border">
          <div className="card-icon w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600 text-xl">
            👦
          </div>

          <div className="flex-1 text-left">
            <div
              className="card-count text-2xl font-bold text-slate-900"
              onClick={() => navigate("/ninios")}
            >
              {loading ? "—" : counts.ninios}
            </div>
            <div className="card-label text-sm text-slate-500">Niños</div>
          </div>

          <button
            className="card-add-btn"
            onClick={() => navigate("/ninios/register")}
            title="Agregar niño"
            aria-label="Agregar"
          >
            +
          </button>
        </div>

        <div
          className="card flex items-center gap-4 bg-white p-4 rounded-xl shadow hover:shadow-lg border cursor-pointer"
          onClick={() => navigate("/animadores")}
        >
          <div className="card-icon w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 text-xl">
            👥
          </div>
          <div className="flex-1 text-left">
            <div className="card-count text-2xl font-bold">
              {loading ? "—" : counts.animadores}
            </div>
            <div className="card-label text-sm text-slate-500">Animadores</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 bg-white p-4 rounded-xl shadow hover:shadow-lg border">
          <div className="card-icon w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600 text-xl">
            📍
          </div>
          <div className="flex-1 text-left">
            <div className="card-count text-2xl font-bold">
              {loading ? "—" : counts.recorridas}
            </div>
            <div className="card-label text-sm text-slate-500">Recorridas</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 bg-white p-4 rounded-xl shadow hover:shadow-lg border">
          <div className="card-icon w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600 text-xl">
            📚
          </div>
          <div className="flex-1 text-left">
            <div
              className="card-count text-2xl font-bold"
              onClick={() => navigate("/ninios/asistencia")}
            >
              {loading ? "—" : counts.divisiones}
            </div>
            <div className="card-label text-sm text-slate-500">Divisiones</div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: "40px" }}>
        <ListarEventos />
        <ListarRecordatorios />
        <div style={{ marginTop: "24px" }}>
          <CumplenMes />
        </div>
      </div>
    </div>
  );
};

export default Inicio;
