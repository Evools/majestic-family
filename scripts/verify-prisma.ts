import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Testing Prisma Client...')
  try {
    // Try to count users using the new client
    const count = await prisma.user.count()
    console.log(`User count: ${count}`)

    // Try to query using a new field (lastActiveAt) just to be sure the types are correct
    const activeUsers = await prisma.user.findMany({
      where: {
        lastActiveAt: {
          gte: new Date(Date.now() - 1000 * 60 * 60)
        }
      },
      take: 1
    })
    console.log(`Active users in last hour: ${activeUsers.length}`)

    // Try to find unique by staticId (new unique constraint)
    const userByStaticId = await prisma.user.findUnique({
      where: { staticId: 'non-existent-id' }
    })
    console.log('Unique find successful (even if null)')

    console.log('Verification Success')
  } catch (e) {
    console.error('Verification Failed', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
