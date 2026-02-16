'use server'

import { prisma } from "../lib/prisma"
import { auth, signOut } from "../auth" // Додано signOut в імпорт
import { revalidatePath } from "next/cache"

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