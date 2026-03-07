const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// 1. Importar o Prisma Client

if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config();
}
const { PrismaClient } = require("@prisma/client");
const { withAccelerate } = require("@prisma/extension-accelerate");

// No Prisma 7 + Accelerate, passamos o link através da propriedade accelerateUrl
const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());



const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

// GET - Listar todas as tarefas da base de dados
app.get("/tasks", async (req, res) => {
  try {
    const allTasks = await prisma.task.findMany();
    res.status(200).json({ data: allTasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Buscar uma tarefa por ID
app.get("/tasks/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const task = await prisma.task.findUnique({
      where: { id: id }
    });

    if (!task) {
      return res.status(404).json({ message: "Tarefa não encontrada" });
    }

    res.status(200).json({ data: task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Criar nova tarefa
app.post("/tasks", async (req, res) => {
  const { title, completed, priority } = req.body;

  if (!title || priority === undefined) {
    return res.status(400).json({ message: "Campos 'title' e 'priority' são obrigatórios" });
  }

  try {
    const newTask = await prisma.task.create({
      data: {
        title,
        completed: completed === true || completed === "true",
        priority
      }
    });
    res.status(201).json({ data: newTask });
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar tarefa" });
  }
});

// PUT - Atualizar tarefa existente
app.put("/tasks/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, completed, priority } = req.body;

  try {
    const updatedTask = await prisma.task.update({
      where: { id: id },
      data: {
        title,
        completed: completed === true || completed === "true",
        priority
      }
    });
    res.status(200).json({ data: updatedTask });
  } catch (error) {
    res.status(404).json({ message: "Tarefa não encontrada ou erro na atualização" });
  }
});

// DELETE - Eliminar tarefa
app.delete("/tasks/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await prisma.task.delete({
      where: { id: id }
    });
    res.status(200).json({ message: "Tarefa eliminada com sucesso" });
  } catch (error) {
    res.status(404).json({ message: "Tarefa não encontrada" });
  }
});

// GET - Filtrar por prioridade
app.get("/tasks/priority/:priority", async (req, res) => {
  const priorityTipo = req.params.priority;
  try {
    const filtrarTasks = await prisma.task.findMany({
      where: { priority: priorityTipo }
    });

    if (filtrarTasks.length === 0) {
      return res.status(404).json({ message: "Nenhuma tarefa encontrada." });
    }

    res.status(200).json({ data: filtrarTasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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

app.listen(PORT, () => {
  console.log(`✅ Servidor a correr na porta ${PORT}`);
});

module.exports = app;