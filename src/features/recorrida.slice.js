import { createSlice } from "@reduxjs/toolkit";

export const RecorridaSlice = createSlice({
  name: "recorrida",
  initialState: {
    recorridas: [],
  },
  reducers: {
    listarRecorridas(state, action) {
      state.recorridas = action.payload || [];
    },
    agregarRecorrida(state, action) {
      state.recorridas.push(action.payload);
    },
    editarRecorrida(state, action) {
      const index = state.recorridas.findIndex(
        (recorrida) => recorrida.id === action.payload.id,
      );
      if (index !== -1) state.recorridas[index] = action.payload;
    },
    contarRecorridas(state, action) {
      if (Array.isArray(action.payload)) {
        state.count = action.payload.length;
      } else {
        state.count = state.recorridas.length;
      }
    },
  },
});

export const {
  listarRecorridas,
  agregarRecorrida,
  editarRecorrida,
  contarRecorridas,
} = RecorridaSlice.actions;

export default RecorridaSlice.reducer;
