import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const PORT = process.env.PORT;

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());
app.post("/signup", async (req: Request, res: Response) => {
  const { username, password } = req.body as {
    username: string;
    password: string;
  };
  try {
    const newuser = await prisma.user.create({
      data: {
        username,
        password,
      },
    });
    res.json({ newuser });
  } catch (error) {
    res.status(401).json({ msg: "Error in creating a new user" });
  }
});
app.post("/task", async (req: Request, res: Response) => {
  const { task, description, duration, userId } = req.body;

  try {
    const newTask = await prisma.task.create({
      data: {
        task,
        description,
        duration,
        startTime: BigInt(0),
        userId,
      },
    });
    res.json({
      ...newTask,
      startTime: newTask.startTime.toString(),
    });
  } catch (error: any) {
    console.log("erro in the post task: ", error.message);
    res.status(401).json({
      msg: "Error in the task creation.",
    });
  }
});
app.patch("/task/start/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: { startTime: Date.now(), status: "in_progress" },
    });
    res.json({ ...task, startTime: task.startTime.toString() });
  } catch (error: any) {
    console.log("eror in task starting ", error.message);
    res.status(401).json({
      msg: "error in task starting",
    });
  }
});
app.get("/tasks/user/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const fetcheddata = await prisma.task.findMany({
      where: { userId: Number(userId) },
    });
    const formattedata = fetcheddata.map((each) => ({
      ...each,
      startTime: each.startTime.toString(),
    }));
    res.json(formattedata);
  } catch (error: any) {
    console.log("error in getting tasks ", error.message);
    res.status(401).json({
      msg: "Error in getting all task",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Port running on ${PORT}`);
});
