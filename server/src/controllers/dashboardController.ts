import { Response, NextFunction } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalCustomers,
      leadsCount,
      activeCustomersCount,
      totalProducts,
      products,
      totalChallans,
      confirmedChallans,
      recentChallans,
      recentStockLogs
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'LEAD' } }),
      prisma.customer.count({ where: { status: 'ACTIVE' } }),
      prisma.product.count(),
      prisma.product.findMany({ select: { id: true, name: true, sku: true, currentStock: true, minAlertQty: true } }),
      prisma.challan.count(),
      prisma.challan.findMany({ where: { status: 'CONFIRMED' }, select: { totalAmount: true } }),
      prisma.challan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true, businessName: true } } }
      }),
      prisma.stockLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, sku: true } },
          createdBy: { select: { name: true } }
        }
      })
    ]);

    const lowStockProducts = products.filter(p => p.currentStock <= p.minAlertQty);
    const totalRevenue = confirmedChallans.reduce((sum, c) => sum + c.totalAmount, 0);

    return res.json({
      stats: {
        totalCustomers,
        leadsCount,
        activeCustomersCount,
        totalProducts,
        lowStockCount: lowStockProducts.length,
        totalChallans,
        confirmedChallansCount: confirmedChallans.length,
        totalRevenue
      },
      lowStockProducts,
      recentChallans,
      recentStockLogs
    });
  } catch (err) {
    next(err);
  }
};
