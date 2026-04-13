import { createSlice } from "@reduxjs/toolkit";

export const getAnimadores = (state) => state.animadores.animadores;

const initialState = { animadores: [], usuario: null };

const animadorSlice = createSlice({
  name: "animador",
  initialState,
  reducers: {
    loguear(state, action) {
      state.usuario = action.payload;
      localStorage.setItem("Token", action.payload);
    },

    desloguear(state) {
      state.usuario = null;
      localStorage.clear();
    },
    listarAnimadores(state, action) {
      state.animadores = action.payload;
    },
    agregarAnimador(state, action) {
      state.animadores.push(action.payload);
    },
    editarAnimador(state, action) {
      const index = state.animadores.findIndex(
        (animador) => animador.id === action.payload.id,
      );
      if (index !== -1) state.animadores[index] = action.payload;
    },
    eliminarAnimador(state, action) {
      state.animadores = state.animadores.filter(
        (animador) => animador.id !== action.payload,
      );
    },
    asignarRol(state, action) {
      const { id, rol } = action.payload;
      const animador = state.animadores.find((a) => a.id === id);
      if (
        animador &&
        Array.isArray(animador.roles) &&
        !animador.roles.includes(rol)
      ) {
        animador.roles.push(rol);
      }
    },
    contarAnimadores(state, action) {
      if (Array.isArray(action.payload)) {
        state.count = action.payload.length;
      } else {
        state.count = state.animadores.length;
      }
    },
  },
});

export const {
  loguear,
  desloguear,
  listarAnimadores,
  agregarAnimador,
  editarAnimador,
  eliminarAnimador,
  asignarRol,
  contarAnimadores,
} = animadorSlice.actions;
export default animadorSlice.reducer;
