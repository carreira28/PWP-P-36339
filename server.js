const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { PrismaClient } = require("@prisma/client");
const { withAccelerate } = require("@prisma/extension-accelerate");

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);


// GET 
app.get("/tasks", async (req, res) => {
    const { completed } = req.query;
    
    const where = {};
    if (completed !== undefined) {
        where.completed = completed === "true";
    }

    const tasks = await prisma.task.findMany({ where });
    res.status(200).json(tasks);
});

// GET stats
app.get("/tasks/stats", async (req, res) => {
    const total = await prisma.task.count();
    const completas = await prisma.task.count({ where: { completed: true } });
    const pendentes = await prisma.task.count({ where: { completed: false } });
    
    res.status(200).json({ total, completas, pendentes });
});

// GET por ID
app.get("/tasks/:id", async (req, res) => {
    const task = await prisma.task.findUnique({
        where: { id: req.params.id },
    });
    if (!task) return res.status(404).json({ message: "Tarefa não encontrada" });
    res.status(200).json(task);
});

// POST
app.post("/tasks", async (req, res) => {
    const { title, description, priority } = req.body;


    if (!title || !priority) {
        return res.status(400).json({ message: "title e priority são obrigatórios" });
    }

    const validPriorities = ["low", "medium", "high"];
    if (!validPriorities.includes(priority)) {
        return res.status(400).json({ message: "priority inválida" });
    }

    const newTask = await prisma.task.create({
        data: { title, description, priority },
    });
    res.status(201).json(newTask);
});

// PUT
app.put("/tasks/:id", async (req, res) => {
    try {
        const { title, description, completed, priority } = req.body;
        const updatedTask = await prisma.task.update({
            where: { id: req.params.id },
            data: { title, description, completed, priority },
        });
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(404).json({ message: "Tarefa não encontrada" });
    }
});

// PATCH
app.patch("/tasks/:id/toggle", async (req, res) => {
    try {
        const currentTask = await prisma.task.findUnique({ where: { id: req.params.id } });
        if (!currentTask) return res.status(404).json({ message: "Não encontrada" });

        const updated = await prisma.task.update({
            where: { id: req.params.id },
            data: { completed: !currentTask.completed }
        });
        res.status(200).json(updated);
    } catch (e) {
        res.status(500).json({ message: "Erro ao alternar estado" });
    }
});

// DELETE
app.delete("/tasks/:id", async (req, res) => {
    try {
        await prisma.task.delete({
            where: { id: req.params.id },
        });
        res.status(204).send();
    } catch (e) {
        res.status(404).json({ message: "Tarefa não existe" });
    }
});


// 404
app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada" });
});


// Middleware global de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Erro interno do servidor" });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor a correr na porta ${PORT}`);
});

module.exports = app;