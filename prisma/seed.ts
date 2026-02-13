import { PrismaPg } from '@prisma/adapter-pg';
import { ContractStatus, PrismaClient, ReportStatus, Role } from '@prisma/client';
import { Pool } from 'pg';

// Load environment variables (Node.js 20+)
try {
  process.loadEnvFile();
} catch (e) {
  console.log('No .env file loaded or error loading it.');
}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // 1. System Settings
  const systemSettings = await prisma.systemSettings.upsert({
    where: { id: 'default-settings' }, // Assuming only one record, but using Create if empty
    update: {},
    create: {
      familyName: 'Shelby Family',
      familyDescription: 'By Order of the Peaky Blinders',
      userSharePercent: 60,
      familySharePercent: 40,
      minWithdrawal: 10000,
      contractCooldownHours: 24,
    },
  });
  console.log('✅ System Settings created');

  // 2. Dashboard Settings
  const dashboardSettings = await prisma.dashboardSettings.create({
    data: {
      familyBalance: 50000,
      goalName: 'Buy Mansion',
      goalTarget: 1000000,
      goalCurrent: 50000,
      familyLevel: 3,
      familyXP: 2500,
    }
  });
  console.log('✅ Dashboard Settings created');

  // 3. Contracts
  const contracts = [
    {
      title: 'Weed Distribution',
      description: 'Distribute premium kush to local dealers.',
      icon: 'Leaf',
      level: 1,
      reputation: 10,
      reward: 5000,
      cooldownUntil: null,
      maxSlots: 10,
      isFlexible: false,
      category: 'Illegal',
    },
    {
      title: 'Meth Laboratory',
      description: 'Cook and package blue sky.',
      icon: 'FlaskConical',
      level: 2,
      reputation: 25,
      reward: 12000,
      cooldownUntil: null,
      maxSlots: 5,
      isFlexible: false,
      category: 'Illegal',
    },
    {
      title: 'Money Laundering',
      description: 'Clean verify cash through local businesses.',
      icon: 'Banknote',
      level: 3,
      reputation: 50,
      reward: 2500,
      cooldownUntil: null,
      maxSlots: 20,
      isFlexible: true,
      category: 'Financial',
    },
  ];

  for (const contract of contracts) {
    await prisma.contract.create({ data: contract });
  }
  console.log('✅ Contracts created');

  const allContracts = await prisma.contract.findMany();

  // 4. Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shelby.com' },
    update: {},
    create: {
      email: 'admin@shelby.com',
      name: 'Thomas Shelby',
      firstName: 'Thomas',
      lastName: 'Shelby',
      role: Role.ADMIN,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas',
      rank: 10,
      roleName: 'Boss',
    },
  });

  const mod = await prisma.user.upsert({
    where: { email: 'mod@shelby.com' },
    update: {},
    create: {
      email: 'mod@shelby.com',
      name: 'Arthur Shelby',
      firstName: 'Arthur',
      lastName: 'Shelby',
      role: Role.MODERATOR,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arthur',
      rank: 8,
      roleName: 'Underboss',
    },
  });

  const memberNames = ['John', 'Finn', 'Ada', 'Polly', 'Michael'];
  const members = [];

  for (const name of memberNames) {
    const member = await prisma.user.create({
      data: {
        email: `${name.toLowerCase()}@shelby.com`,
        name: `${name} Shelby`,
        firstName: name,
        lastName: 'Shelby',
        role: Role.MEMBER,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        rank: Math.floor(Math.random() * 5) + 1,
        roleName: 'Soldier',
      },
    });
    members.push(member);
  }
  console.log('✅ Users created');

  // 5. User Contracts & Reports (History)
  // Create some history for the Admin
  const weedContract = allContracts.find(c => c.title === 'Weed Distribution');
  if (weedContract) {
    // Admin finished a contract
    const adminContract = await prisma.userContract.create({
      data: {
        userId: admin.id,
        contractId: weedContract.id,
        status: ContractStatus.COMPLETED,
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
      }
    });

    // Admin reported it
    await prisma.report.create({
      data: {
        userId: admin.id,
        userContractId: adminContract.id,
        contractType: weedContract.title,
        itemName: 'Bags',
        quantity: 50,
        proof: 'https://example.com/proof.jpg',
        status: ReportStatus.APPROVED,
        verifierId: mod.id,
        value: 5000,
        userShare: 3000,
        familyShare: 2000,
      }
    });
  }

  // 6. Active Activity
  // Member starts a contract
  if (members.length > 0 && allContracts.length > 0) {
    const activeMember = members[0];
    const randomContract = allContracts[1]; // Meth

    await prisma.userContract.create({
      data: {
        userId: activeMember.id,
        contractId: randomContract.id,
        status: ContractStatus.ACTIVE,
      }
    });
  }

  // 7. Pending Reports
  // Member submitted a report
  if (members.length > 1 && weedContract) {
    const reporter = members[1];

    const activeContract = await prisma.userContract.create({
      data: {
        userId: reporter.id,
        contractId: weedContract.id,
        status: ContractStatus.ACTIVE,
      }
    });

    await prisma.report.create({
      data: {
        userId: reporter.id,
        userContractId: activeContract.id,
        contractType: weedContract.title,
        itemName: 'Bags',
        quantity: 25,
        proof: 'https://imgur.com/example',
        status: ReportStatus.PENDING,
        comment: 'Done quickly, boss.',
      }
    });
  }

  console.log('✅ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
