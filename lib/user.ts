import { prisma } from "@/lib/prisma"

export async function getUserCredits(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  })

  return user?.credits || 0
}

export async function addUserCredits(userId: string, amount: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      credits: {
        increment: amount,
      },
    },
  })
}

export async function useUserCredit(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  })

  if (!user || user.credits < 1) {
    return false
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      credits: {
        decrement: 1,
      },
    },
  })

  return true
}

