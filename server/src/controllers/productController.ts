import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/auth';

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(2, 'SKU code is required'),
  category: z.string().min(2, 'Category is required'),
  unitPrice: z.number().positive('Unit price must be greater than 0'),
  currentStock: z.number().int().min(0, 'Stock cannot be negative'),
  minAlertQty: z.number().int().min(0).default(10),
  location: z.string().min(2, 'Warehouse location is required')
});

const stockAdjustmentSchema = z.object({
  qtyChanged: z.number().int().positive('Quantity changed must be a positive integer'),
  type: z.enum(['IN', 'OUT']),
  reason: z.string().min(2, 'Reason for stock adjustment is required')
});

export const getProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = (req.query.search as string || '').trim();
    const category = req.query.category as string;
    const lowStockOnly = req.query.lowStock === 'true';

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { category: { contains: search } },
        { location: { contains: search } }
      ];
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          createdBy: { select: { name: true, role: true } }
        }
      }),
      prisma.product.count({ where })
    ]);

    // Filter low stock if requested
    let resultProducts = products;
    if (lowStockOnly) {
      resultProducts = products.filter(p => p.currentStock <= p.minAlertQty);
    }

    return res.json({
      products: resultProducts,
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

export const getProductById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true, role: true } },
        stockLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { createdBy: { select: { name: true, role: true } } }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({ product });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = productSchema.parse(req.body);

    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku }
    });

    if (existingSku) {
      return res.status(400).json({ error: `Product with SKU '${data.sku}' already exists` });
    }

    const product = await prisma.$transaction(async (tx) => {
      const newProd = await tx.product.create({
        data: {
          ...data,
          createdById: req.user!.id
        }
      });

      // Log initial stock if stock > 0
      if (data.currentStock > 0) {
        await tx.stockLog.create({
          data: {
            productId: newProd.id,
            qtyChanged: data.currentStock,
            type: 'IN',
            reason: 'Initial stock setup on product creation',
            createdById: req.user!.id
          }
        });
      }

      return newProd;
    });

    return res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = productSchema.partial().parse(req.body);

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (data.sku && data.sku !== existing.sku) {
      const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (existingSku) {
        return res.status(400).json({ error: `Product with SKU '${data.sku}' already exists` });
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data
    });

    return res.json({ product: updated });
  } catch (err) {
    next(err);
  }
};

export const adjustStock = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { qtyChanged, type, reason } = stockAdjustmentSchema.parse(req.body);

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (type === 'OUT' && product.currentStock < qtyChanged) {
      return res.status(400).json({
        error: `Insufficient stock for '${product.name}'. Current stock is ${product.currentStock}, requested reduction is ${qtyChanged}.`
      });
    }

    const newStock = type === 'IN' ? product.currentStock + qtyChanged : product.currentStock - qtyChanged;

    const result = await prisma.$transaction(async (tx) => {
      const updatedProd = await tx.product.update({
        where: { id },
        data: { currentStock: newStock }
      });

      const log = await tx.stockLog.create({
        data: {
          productId: id,
          qtyChanged,
          type,
          reason,
          createdById: req.user!.id
        },
        include: { createdBy: { select: { name: true, role: true } } }
      });

      return { product: updatedProd, log };
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getStockLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 30;
    const type = req.query.type as string;
    const productId = req.query.productId as string;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (productId) {
      where.productId = productId;
    }

    const [logs, total] = await Promise.all([
      prisma.stockLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true, location: true } },
          createdBy: { select: { name: true, role: true } }
        }
      }),
      prisma.stockLog.count({ where })
    ]);

    return res.json({
      logs,
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
