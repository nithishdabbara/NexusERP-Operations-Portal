import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/auth';
import { generateChallanPDF } from '../utils/pdfGenerator';

const challanItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0')
});

const createChallanSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  status: z.enum(['DRAFT', 'CONFIRMED']).default('DRAFT'),
  items: z.array(challanItemSchema).min(1, 'Challan must contain at least 1 item')
});

const updateChallanStatusSchema = z.object({
  status: z.enum(['DRAFT', 'CONFIRMED', 'CANCELLED'])
});

// Helper to generate next unique Challan Number
const generateChallanNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.challan.count();
  const nextNum = (count + 1).toString().padStart(4, '0');
  return `SCH-${year}-${nextNum}`;
};

export const getChallans = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string || '').trim();
    const status = req.query.status as string;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { challanNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { businessName: { contains: search } } }
      ];
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, businessName: true, mobile: true, address: true } },
          createdBy: { select: { name: true, role: true } },
          items: true
        }
      }),
      prisma.challan.count({ where })
    ]);

    return res.json({
      challans,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getChallanById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: { select: { name: true, role: true, email: true } },
        items: true
      }
    });

    if (!challan) {
      return res.status(404).json({ error: 'Challan not found' });
    }

    return res.json({ challan });
  } catch (err) {
    next(err);
  }
};

export const createChallan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { customerId, status, items } = createChallanSchema.parse(req.body);

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Fetch product details for snapshot and stock checks
    const productIds = items.map(i => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    // Validate all products exist
    for (const item of items) {
      if (!productMap.has(item.productId)) {
        return res.status(400).json({ error: `Product with ID ${item.productId} not found` });
      }
    }

    // If status is CONFIRMED, check stock availability
    if (status === 'CONFIRMED') {
      const insufficient: string[] = [];
      for (const item of items) {
        const prod = productMap.get(item.productId)!;
        if (prod.currentStock < item.quantity) {
          insufficient.push(`'${prod.name}' (Available: ${prod.currentStock}, Requested: ${item.quantity})`);
        }
      }

      if (insufficient.length > 0) {
        return res.status(400).json({
          error: `Insufficient stock for the following products: ${insufficient.join('; ')}`
        });
      }
    }

    // Prepare line item snapshots and calculation
    let totalAmount = 0;
    let totalQuantity = 0;

    const lineItemsData = items.map(item => {
      const prod = productMap.get(item.productId)!;
      const subtotal = prod.unitPrice * item.quantity;
      totalAmount += subtotal;
      totalQuantity += item.quantity;

      return {
        productId: prod.id,
        productName: prod.name,
        productSku: prod.sku,
        unitPrice: prod.unitPrice,
        quantity: item.quantity,
        subtotal
      };
    });

    const challanNumber = await generateChallanNumber();

    // Execute within Prisma transaction
    const createdChallan = await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.create({
        data: {
          challanNumber,
          customerId,
          status,
          totalAmount,
          totalQuantity,
          createdById: req.user!.id,
          items: {
            create: lineItemsData
          }
        },
        include: {
          customer: true,
          createdBy: { select: { name: true, role: true } },
          items: true
        }
      });

      // If CONFIRMED, deduct stock & create stock movement logs
      if (status === 'CONFIRMED') {
        for (const item of lineItemsData) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: { decrement: item.quantity }
            }
          });

          await tx.stockLog.create({
            data: {
              productId: item.productId,
              qtyChanged: item.quantity,
              type: 'OUT',
              reason: `Sales Challan Confirmed (${challanNumber})`,
              createdById: req.user!.id
            }
          });
        }
      }

      return challan;
    });

    return res.status(201).json({ challan: createdChallan });
  } catch (err) {
    next(err);
  }
};

export const updateChallanStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status: newStatus } = updateChallanStatusSchema.parse(req.body);

    const challan = await prisma.challan.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!challan) {
      return res.status(404).json({ error: 'Challan not found' });
    }

    if (challan.status === newStatus) {
      return res.json({ challan });
    }

    const updatedChallan = await prisma.$transaction(async (tx) => {
      // Transition 1: DRAFT -> CONFIRMED
      if (challan.status === 'DRAFT' && newStatus === 'CONFIRMED') {
        // Stock check
        const productIds = challan.items.map(i => i.productId);
        const products = await tx.product.findMany({ where: { id: { in: productIds } } });
        const productMap = new Map(products.map(p => [p.id, p]));

        const insufficient: string[] = [];
        for (const item of challan.items) {
          const prod = productMap.get(item.productId);
          if (!prod || prod.currentStock < item.quantity) {
            insufficient.push(`'${item.productName}' (Available: ${prod?.currentStock || 0}, Requested: ${item.quantity})`);
          }
        }

        if (insufficient.length > 0) {
          throw { status: 400, message: `Cannot confirm challan. Insufficient stock for: ${insufficient.join('; ')}` };
        }

        // Deduct stock
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } }
          });

          await tx.stockLog.create({
            data: {
              productId: item.productId,
              qtyChanged: item.quantity,
              type: 'OUT',
              reason: `Sales Challan Confirmed (${challan.challanNumber})`,
              createdById: req.user!.id
            }
          });
        }
      }

      // Transition 2: CONFIRMED -> CANCELLED (Restore stock)
      if (challan.status === 'CONFIRMED' && newStatus === 'CANCELLED') {
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } }
          });

          await tx.stockLog.create({
            data: {
              productId: item.productId,
              qtyChanged: item.quantity,
              type: 'IN',
              reason: `Sales Challan Cancelled (${challan.challanNumber})`,
              createdById: req.user!.id
            }
          });
        }
      }

      // Update status
      return tx.challan.update({
        where: { id },
        data: { status: newStatus },
        include: {
          customer: true,
          createdBy: { select: { name: true, role: true } },
          items: true
        }
      });
    });

    return res.json({ challan: updatedChallan });
  } catch (err) {
    next(err);
  }
};

export const downloadChallanPDF = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: { select: { name: true, role: true, email: true } },
        items: true
      }
    });

    if (!challan) {
      return res.status(404).json({ error: 'Challan not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${challan.challanNumber}.pdf`);

    generateChallanPDF(challan, res);
  } catch (err) {
    next(err);
  }
};
