import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Mini ERP + CRM Database...');

  // Password hashing
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. Seed Users
  const usersData = [
    { name: 'Alice Smith', email: 'admin@company.com', role: 'ADMIN' },
    { name: 'Bob Jones', email: 'sales@company.com', role: 'SALES' },
    { name: 'Charlie Vance', email: 'warehouse@company.com', role: 'WAREHOUSE' },
    { name: 'Diane Miller', email: 'accounts@company.com', role: 'ACCOUNTS' }
  ];

  const users: Record<string, any> = {};

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hashedPassword, role: u.role, name: u.name },
      create: {
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role
      }
    });
    users[u.role] = user;
    console.log(`👤 Created User: ${u.name} (${u.role}) -> ${u.email}`);
  }

  // 2. Seed Customers
  const customersData = [
    {
      name: 'Rajesh Kumar',
      mobile: '+91 98765 43210',
      email: 'rajesh@apextech.in',
      businessName: 'Apex Tech Solutions',
      gstNumber: '07AAAAA0000A1Z5',
      type: 'WHOLESALE',
      address: 'Plot 42, Okhla Industrial Area Phase 3, New Delhi',
      status: 'ACTIVE',
      followUpDate: new Date(Date.now() + 86400000 * 3),
      notes: 'Interested in bulk purchase of SSD drives next week.'
    },
    {
      name: 'Sunita Sharma',
      mobile: '+91 91234 56789',
      email: 'sunita@sharmaretail.com',
      businessName: 'Sharma General Store',
      gstNumber: '07BBBBB1111B2Z8',
      type: 'RETAIL',
      address: 'Shop 12, Main Market, Karol Bagh, New Delhi',
      status: 'ACTIVE',
      followUpDate: new Date(Date.now() + 86400000 * 7),
      notes: 'Regular weekly order customer.'
    },
    {
      name: 'Vikram Patel',
      mobile: '+91 99887 76655',
      email: 'vikram@pateldistributors.com',
      businessName: 'Patel Logistics & Distribution',
      gstNumber: '24CCCCC2222C3Z1',
      type: 'DISTRIBUTOR',
      address: 'GIDC Estate, Naroda, Ahmedabad, Gujarat',
      status: 'LEAD',
      followUpDate: new Date(Date.now() + 86400000 * 1),
      notes: 'New inquiry for regional distribution partnership.'
    },
    {
      name: 'Meera Nair',
      mobile: '+91 94455 66778',
      email: 'meera@nairtraders.in',
      businessName: 'Nair Commercial Traders',
      gstNumber: null,
      type: 'RETAIL',
      address: 'MG Road, Kochi, Kerala',
      status: 'INACTIVE',
      followUpDate: null,
      notes: 'Account on hold due to pending payment review.'
    }
  ];

  const createdCustomers: any[] = [];
  for (const c of customersData) {
    const cust = await prisma.customer.create({
      data: {
        ...c,
        createdById: users['SALES'].id
      }
    });
    createdCustomers.push(cust);

    // Initial follow-up note
    await prisma.customerFollowUp.create({
      data: {
        customerId: cust.id,
        note: `Initial CRM onboarding notes recorded for ${cust.businessName}.`,
        createdById: users['SALES'].id
      }
    });
  }
  console.log(`🏢 Created ${createdCustomers.length} Customers with follow-ups.`);

  // 3. Seed Products
  const productsData = [
    {
      name: 'Wireless Ergonomic Mouse',
      sku: 'PRD-MS-001',
      category: 'Electronics',
      unitPrice: 1299,
      currentStock: 120,
      minAlertQty: 15,
      location: 'Rack A1 - Warehouse 1'
    },
    {
      name: 'Mechanical Gaming Keyboard RGB',
      sku: 'PRD-KB-002',
      category: 'Electronics',
      unitPrice: 3499,
      currentStock: 8, // Low Stock Alert Trigger!
      minAlertQty: 10,
      location: 'Rack A3 - Warehouse 1'
    },
    {
      name: '27-inch 4K UHD Monitor',
      sku: 'PRD-MN-003',
      category: 'Peripherals',
      unitPrice: 24999,
      currentStock: 25,
      minAlertQty: 5,
      location: 'Pallet B2 - Warehouse 2'
    },
    {
      name: 'USB-C Multi-Port Hub (8-in-1)',
      sku: 'PRD-HB-004',
      category: 'Accessories',
      unitPrice: 1899,
      currentStock: 5, // Low Stock Alert Trigger!
      minAlertQty: 20,
      location: 'Bin C1 - Warehouse 1'
    },
    {
      name: 'Cat6 Ethernet Cable (20 Meters)',
      sku: 'PRD-CB-005',
      category: 'Networking',
      unitPrice: 499,
      currentStock: 300,
      minAlertQty: 30,
      location: 'Rack D4 - Warehouse 2'
    }
  ];

  const createdProducts: any[] = [];
  for (const p of productsData) {
    const prod = await prisma.product.create({
      data: {
        ...p,
        createdById: users['WAREHOUSE'].id
      }
    });
    createdProducts.push(prod);

    // Initial Stock log
    await prisma.stockLog.create({
      data: {
        productId: prod.id,
        qtyChanged: prod.currentStock,
        type: 'IN',
        reason: 'Initial warehouse stock onboarding import',
        createdById: users['WAREHOUSE'].id
      }
    });
  }
  console.log(`📦 Created ${createdProducts.length} Products with stock logs.`);

  // 4. Seed Initial Sales Challans
  // Challan 1: Confirmed
  const c1Item1 = createdProducts[0]; // Mouse
  const c1Item2 = createdProducts[4]; // Cable

  const item1Subtotal = c1Item1.unitPrice * 5;
  const item2Subtotal = c1Item2.unitPrice * 10;
  const c1TotalAmount = item1Subtotal + item2Subtotal;

  const challan1 = await prisma.challan.create({
    data: {
      challanNumber: 'SCH-2026-0001',
      customerId: createdCustomers[0].id,
      status: 'CONFIRMED',
      totalAmount: c1TotalAmount,
      totalQuantity: 15,
      createdById: users['SALES'].id,
      items: {
        create: [
          {
            productId: c1Item1.id,
            productName: c1Item1.name,
            productSku: c1Item1.sku,
            unitPrice: c1Item1.unitPrice,
            quantity: 5,
            subtotal: item1Subtotal
          },
          {
            productId: c1Item2.id,
            productName: c1Item2.name,
            productSku: c1Item2.sku,
            unitPrice: c1Item2.unitPrice,
            quantity: 10,
            subtotal: item2Subtotal
          }
        ]
      }
    }
  });

  // Log stock reduction for confirmed challan 1
  await prisma.stockLog.create({
    data: {
      productId: c1Item1.id,
      qtyChanged: 5,
      type: 'OUT',
      reason: `Sales Challan Confirmed (${challan1.challanNumber})`,
      createdById: users['SALES'].id
    }
  });

  await prisma.stockLog.create({
    data: {
      productId: c1Item2.id,
      qtyChanged: 10,
      type: 'OUT',
      reason: `Sales Challan Confirmed (${challan1.challanNumber})`,
      createdById: users['SALES'].id
    }
  });

  // Challan 2: Draft
  const c2Item = createdProducts[2]; // Monitor
  const c2TotalAmount = c2Item.unitPrice * 2;

  await prisma.challan.create({
    data: {
      challanNumber: 'SCH-2026-0002',
      customerId: createdCustomers[1].id,
      status: 'DRAFT',
      totalAmount: c2TotalAmount,
      totalQuantity: 2,
      createdById: users['SALES'].id,
      items: {
        create: [
          {
            productId: c2Item.id,
            productName: c2Item.name,
            productSku: c2Item.sku,
            unitPrice: c2Item.unitPrice,
            quantity: 2,
            subtotal: c2TotalAmount
          }
        ]
      }
    }
  });

  console.log(`📄 Created initial Sales Challans.`);
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
