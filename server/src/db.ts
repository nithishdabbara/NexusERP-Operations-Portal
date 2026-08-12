import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres.ijnnazbvnufevfyappts:P5Vqn0ALIGxUcJsG@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});
