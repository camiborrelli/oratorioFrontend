import { createSlice } from "@reduxjs/toolkit";

const initialState = { divisiones: [] };

const divisionSlice = createSlice({
  name: "division",
  initialState,
  reducers: {
    // keep plural and singular aliases to match existing imports
    listarDivisiones(state, action) {
      state.divisiones = action.payload || [];
    },
    listarDivision(state, action) {
      state.divisiones = action.payload || [];
    },
    agregarDivision(state, action) {
      state.divisiones.push(action.payload);
    },
    editarDivision(state, action) {
      const index = state.divisiones.findIndex(
        (division) => division.id === action.payload.id,
      );
      if (index !== -1) state.divisiones[index] = action.payload;
    },
    eliminarDivision(state, action) {
      state.divisiones = state.divisiones.filter(
        (division) => division.id !== action.payload,
      );
    },
    // optional: store a cached count
    contarDivisiones(state, action) {
      state.count =
        typeof action.payload === "number"
          ? action.payload
          : state.divisiones.length;
    },
  },
});

export const {
  listarDivisiones,
  listarDivision,
  agregarDivision,
  editarDivision,
  eliminarDivision,
  contarDivisiones,
} = divisionSlice.actions;

export default divisionSlice.reducer;
