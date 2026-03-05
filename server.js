require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { message } = require("statuses");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const PORT = process.env.SERVER_PORT || 3000;



/*let movies = [
  { id: 1, title: "Inception", year: 2010 },
  { id: 2, title: "Interstellar", year: 2014 }
];*/

let tasks = [
  { id: 1, title: "Estudar Node.js", completed: false, priority: "high" },
  { id: 2, title: "Fazer LAB-1", completed: true, priority: "medium" }
];

app.get("/tasks", (req, res) => {
  res.status(200).json({ data: tasks });
});

app.get("/tasks/:id", (req, res) => {

    const id = parseInt(req.params.id);
    const task = tasks.find((t) => t.id === id);

    if (!task) {
      return res.status(404).json({ message: "Tarefa não encontrado" });
    }

    res.status(200).json({ data: task });

    res.status(500).send(error.message)
  
});

app.get("/tasks/priority/:priority", (req, res) => {
  try {
    const priorityTipo = req.params.priority;
    const filtrarTasks = tasks.filter((t) => t.priority === priorityTipo);

    if (!filtrarTasks.length) {
      return res.status(404).json({ message: "Nenhuma tarefa com prioridade essa prioridade encontrada."});
    }

    res.status(200).json({ data: filtrarTasks });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.post("/tasks", (req, res) => {
  const { title, completed, priority } = req.body;

  // Validação
  if (!title || !completed || !priority) {
    return res.status(400).json({ message: "Campos 'title' , 'completed' e 'priority' são obrigatórios" });
  }

  const newtasks = {
    id: tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1,
    title,
    completed,
    priority
  };

  tasks.push(newtasks);
  res.status(201).json({ data: newtasks });
});

app.put("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Tarefa não encontrado" });
  }

  const { title, completed, priority } = req.body;

  if (!title || !completed || !priority) {
    return res.status(400).json({ message: "Campos 'title' , 'completed' e 'priority' são obrigatórios" });
  }

  tasks[index] = { id, title, completed, priority };
  res.status(200).json({ data: tasks[index] });
});

app.delete("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Tarefa não encontrado" });
  }

  tasks.splice(index, 1);
  res.status(200).json({ message: "Tarefa eliminado com sucesso" });
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