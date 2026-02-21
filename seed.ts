import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@tea.com'; // Можеш змінити на свій email
  const password = 'password123'; // Твій пароль для входу

  // Хешуємо пароль (щоб не зберігати його відкритим текстом)
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {}, // Якщо юзер вже є, нічого не змінюємо
    create: {
      email,
      password: hashedPassword,
    },
  });

  console.log(`✅ Користувача створено!`);
  console.log(`Email: ${user.email}`);
  console.log(`Pass: ${password}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
