import { auth } from "../auth";
import { prisma } from "../lib/prisma";
import { redirect } from "next/navigation";
import TeaDashboard from "../app/components/TeaDashboard";
import { startOfMonth } from "date-fns"; // Рекомендую встановити date-fns для роботи з датами

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const userId = session.user.id as string;
  const now = new Date();
  const monthStart = startOfMonth(now);

  // Завантажуємо дані паралельно
  const [teas, allSessions, currentUser] = await Promise.all([
    prisma.tea.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    }),
    prisma.session.findMany({
      where: { userId },
      include: {
        tea: {
          select: { name: true, type: true }
        }
      },
      orderBy: { date: 'desc' }
    }),
    prisma.user.findUnique({
      where: { id: userId }
    })
  ]);

  // Розрахунок статистики саме за ПОТОЧНИЙ МІСЯЦЬ (згідно зі специфікацією)
  const monthlySessions = allSessions.filter(s => s.date >= monthStart);

  const monthlyStats = monthlySessions.reduce((acc, s) => {
    // Об'єм води: кількість проливів * об'єм посуду (мл)
    const sessionVolumeLiters = (s.steeps * s.volume) / 1000;

    return {
      liters: acc.liters + sessionVolumeLiters,
      seconds: acc.seconds + s.duration
    };
  }, { liters: 0, seconds: 0 });

  // Форматуємо дані для відображення
  const displayStats = {
    liters: monthlyStats.liters.toFixed(1),
    hours: (monthlyStats.seconds / 3600).toFixed(1),
    sessionCount: monthlySessions.length
  };

  return (
    <TeaDashboard
      initialTeas={teas}
      initialSessions={JSON.parse(JSON.stringify(allSessions))} // Serialize to avoid "Date object" warning on Vercel
      stats={displayStats}
      user={currentUser || session.user}
    />
  );
}