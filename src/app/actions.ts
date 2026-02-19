'use server'

import { prisma } from "../lib/prisma"
import { auth, signOut } from "../auth" // Додано signOut в імпорт
import { revalidatePath } from "next/cache"
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- ДОДАВАННЯ НОВОГО ЧАЮ ---
export async function addTeaAction(data: {
  name: string;
  type: string;
  year: number;
  origin: string;
  total: number;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error("Unauthorized");

  await prisma.tea.create({
    data: {
      name: data.name,
      type: data.type,
      year: data.year,
      origin: data.origin,
      total: data.total,
      remaining: data.total, // Спочатку залишок дорівнює повній вазі
      userId: userId
    }
  });

  revalidatePath("/");
}

// --- ВИДАЛЕННЯ ЧАЮ ---
export async function deleteTeaAction(teaId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error("Unauthorized");

  // Видаляємо чай тільки якщо він належить поточному юзеру
  try {
    await prisma.tea.delete({
      where: {
        id: teaId,
        userId: userId
      }
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to delete tea:", error);
  }
}

// --- ЗАПИС СЕСІЇ ---
export async function addSessionAction(data: {
  teaId: string;
  duration: number;
  steeps: number;
  grams: number;
  volume: number;
  rating: number;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  // 1. Створюємо запис сесії
  await prisma.session.create({
    data: { ...data, userId }
  });

  // 2. Віднімаємо вагу від запасу чаю
  const tea = await prisma.tea.findUnique({ where: { id: data.teaId } });
  if (tea) {
    const newRemaining = Math.max(0, tea.remaining - data.grams);
    await prisma.tea.update({
      where: { id: data.teaId },
      data: { remaining: newRemaining }
    });
  }

  revalidatePath("/");
}

// --- ВИХІД З АКАУНТУ (НОВЕ) ---
export async function signOutAction() {
  await signOut();
}

// --- ОНОВЛЕННЯ АВАТАРУ (НОВЕ) ---
export async function updateUserAvatarAction(imageUrl: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: userId },
    data: { image: imageUrl }
  });

  revalidatePath("/");
}

// --- ШІ РОЗПІЗНАВАННЯ ЧАЮ (GEMINI) ---

export async function analyzeTeaImageAction(formData: FormData) {
  const file = formData.get("image") as File;
  if (!file) return { error: "No image provided" };

  try {
    const buffer = await file.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Analyze this image of a tea packaging or cake. 
    Extract the following information and return ONLY a valid JSON object:
    {
      "name": "Name of the tea (e.g., Menghai 7572)",
      "type": "Type of tea (e.g., Puer, Oolong, Red)",
      "year": 2024 (number),
      "origin": "Region (e.g., Yunnan, Menghai)"
    }
    If you cannot identify something, use reasonable guesses or empty strings.
    If it's clearly not tea, return {"error": "Not a tea"}.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: file.type,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Clean up markdown code blocks if present
    const cleanJson = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return { error: "Failed to analyze image" };
  }
}