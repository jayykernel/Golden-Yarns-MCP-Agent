import { Prisma } from '@prisma/client';

export type StockLotWithRelations = Prisma.StockLotGetPayload<{
  include: {
    yarnType: true;
    yarnCount: true;
    color: true;
    supplier: true;
  };
}>;

export interface GetStockLotsOptions {
  skip?: number;
  take?: number;
  yarnTypeId?: number;
  yarnCountId?: number;
  colorId?: number;
  currentStatus?: string;
  supplierId?: number;
}
