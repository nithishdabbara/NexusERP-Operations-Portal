import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/auth';

const customerSchema = z.object({
  name: z.string().min(2, 'Customer name must be at least 2 characters'),
  mobile: z.string().min(5, 'Mobile number is required'),
  email: z.string().email('Invalid email address'),
  businessName: z.string().min(2, 'Business name is required'),
  gstNumber: z.string().optional().nullable(),
  type: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  address: z.string().min(3, 'Address is required'),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).default('LEAD'),
  followUpDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

const followUpSchema = z.object({
  note: z.string().min(1, 'Note cannot be empty')
});

export const getCustomers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string || '').trim();
    const type = req.query.type as string;
    const status = req.query.status as string;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { mobile: { contains: search } },
        { businessName: { contains: search } }
      ];
    }

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          createdBy: { select: { name: true, role: true } },
          _count: { select: { followUps: true, challans: true } }
        }
      }),
      prisma.customer.count({ where })
    ]);

    return res.json({
      customers,
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

export const getCustomerById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true, role: true } },
        followUps: {
          orderBy: { createdAt: 'desc' },
          include: { createdBy: { select: { name: true, role: true } } }
        },
        challans: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json({ customer });
  } catch (err) {
    next(err);
  }
};

export const createCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = customerSchema.parse(req.body);

    const customer = await prisma.customer.create({
      data: {
        ...data,
        gstNumber: data.gstNumber || null,
        notes: data.notes || null,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        createdById: req.user!.id
      },
      include: {
        createdBy: { select: { name: true, role: true } }
      }
    });

    return res.status(201).json({ customer });
  } catch (err) {
    next(err);
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = customerSchema.partial().parse(req.body);

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...data,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : data.followUpDate === null ? null : undefined
      },
      include: {
        createdBy: { select: { name: true, role: true } }
      }
    });

    return res.json({ customer: updated });
  } catch (err) {
    next(err);
  }
};

export const addFollowUp = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { note } = followUpSchema.parse(req.body);

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const followUp = await prisma.customerFollowUp.create({
      data: {
        customerId: id,
        note,
        createdById: req.user!.id
      },
      include: {
        createdBy: { select: { name: true, role: true } }
      }
    });

    // Touch customer updated timestamp
    await prisma.customer.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    return res.status(201).json({ followUp });
  } catch (err) {
    next(err);
  }
};
