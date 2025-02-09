import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

const genAI = new GoogleGenerativeAI("AIzaSyA2RSxlb4AIi3g1YrxpskNQMuwpuQ-0lHA");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

router.post("/ask", async (req, res) => {
  const { question } = req.body;
  console.log(req.body);
  
  if (!question) {
    return res.status(400).send("Question is required");
  }
  const response = await model.generateContent(question);
  console.log(response.response.text());
  
  res.send(response.response.text());
});

export default router;
