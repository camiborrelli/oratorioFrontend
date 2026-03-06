const ListarAnimadores = () => {
  const dispatch = useDispatch();
  const animadores = useSelector((state) => state.animadores);

  useEffect(() => {
    fetchAnimadores();
  }, []);

  const fetchAnimadores = () => {
    api
      .get("/animador")
      .then((response) => {
        dispatch(listarAnimadores(response.data));
      })
      .catch((error) => {
        console.error("Error fetching animadores:", error);
      });
  };

  return (
    <div>
      <h2>Lista de Animadores</h2>
      <ul>
        {animadores.map((animador) => (
          <li key={animador.id}>{animador.nombre}</li>
        ))}
      </ul>
    </div>
  );
};
