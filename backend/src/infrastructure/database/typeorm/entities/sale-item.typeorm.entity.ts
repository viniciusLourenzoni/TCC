import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SaleEntity } from './sale.typeorm.entity';
import { ProductEntity } from './product.typeorm.entity';

@Entity('sale_items')
export class SaleItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sale_id' })
  saleId: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'product_name' }) // Denormalized for historical records
  productName: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'int' }) // in cents
  unitPrice: number;

  @Column({ type: 'int' }) // in cents
  subtotal: number;

  @ManyToOne(() => SaleEntity, (sale) => sale.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sale_id' })
  sale: SaleEntity;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;
}
