import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const clients = await prisma.client.findMany({
    include: {
      invoices: { include: { items: true, payments: true } },
      payments: true
    }
  })
  console.log(JSON.stringify(clients, null, 2))
}
main()
