require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const PORT = process.env.SERVER_PORT || 3000;

/*let users = [
  { id: 1, name: "Ana", email: "ana@email.com" },
  { id: 2, name: "João", email: "joao@email.com" }
];*/

let movies = [
  { id: 1, title: "Inception", year: 2010 },
  { id: 2, title: "Interstellar", year: 2014 }
];

app.get("/movies", (req, res) => {
  res.status(200).json({ data: movies });
});

app.get("/movies/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const movie = movies.find((m) => m.id === id);

  if (!movie) {
    return res.status(404).json({ message: "Filme não encontrado" });
  }

  res.status(200).json({ data: movie });
});

app.post("/movies", (req, res) => {
  const { title, year } = req.body;

  // Validação
  if (!title || !year) {
    return res.status(400).json({ message: "Campos 'title' e 'year' são obrigatórios" });
  }

  const newMovie = {
    id: movies.length > 0 ? movies[movies.length - 1].id + 1 : 1,
    title,
    year
  };

  movies.push(newMovie);
  res.status(201).json({ data: newMovie });
});

app.put("/movies/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = movies.findIndex((m) => m.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Filme não encontrado" });
  }

  const { title, year } = req.body;

  if (!title || !year) {
    return res.status(400).json({ message: "Campos 'title' e 'year' são obrigatórios" });
  }

  movies[index] = { id, title, year };
  res.status(200).json({ data: movies[index] });
});

app.delete("/movies/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = movies.findIndex((m) => m.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Filme não encontrado" });
  }

  movies.splice(index, 1);
  res.status(200).json({ message: "Filme eliminado com sucesso" });
});



// Rota não encontrada (404)
app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erro interno do servidor" });
});



// Para desenvolvimento local
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`✅ Servidor a correr em http://localhost:${PORT}`);
  });
}

// Para a Vercel
module.exports = app;