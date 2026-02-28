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

app.get("/users", (req, res) => {
  res.status(200).json({ data: users });
});

app.get("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ message: "Utilizador não encontrado" });
  }

  res.status(200).json({ data: user });
});

app.post("/users", (req, res) => {
  const { name, email } = req.body;

  // Validação
  if (!name || !email) {
    return res.status(400).json({ message: "Campos 'name' e 'email' são obrigatórios" });
  }

  const newUser = {
    id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
    name,
    email
  };

  users.push(newUser);
  res.status(201).json({ data: newUser });
});

app.put("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Utilizador não encontrado" });
  }

  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Campos 'name' e 'email' são obrigatórios" });
  }

  users[index] = { id, name, email };
  res.status(200).json({ data: users[index] });
});

app.delete("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Utilizador não encontrado" });
  }

  users.splice(index, 1);
  res.status(200).json({ message: "Utilizador eliminado com sucesso" });
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