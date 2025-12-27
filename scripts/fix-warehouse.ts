import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Set the existing warehouse as default
  const wh = await prisma.warehouse.findFirst();
  
  if (wh) {
    const updated = await prisma.warehouse.update({
      where: { id: wh.id },
      data: { isDefault: true },
    });
    console.log('✅ Set warehouse as default:', updated.code, '| isDefault:', updated.isDefault);
  } else {
    // Create a default warehouse if none exists
    const created = await prisma.warehouse.create({
      data: {
        code: 'MAIN',
        name: 'Main Warehouse',
        isDefault: true,
      },
    });
    console.log('✅ Created default warehouse:', created.code);
  }

  await prisma.$disconnect();
}

main().catch(console.error);

