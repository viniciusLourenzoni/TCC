import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { PaymentMethod, SaleStatus } from '@core/domain/enums';
import { UserEntity } from './user.typeorm.entity';
import { CustomerEntity } from './customer.typeorm.entity';
import { SaleItemEntity } from './sale-item.typeorm.entity';

@Entity('sales')
export class SaleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'customer_id', nullable: true })
  customerId: string;

  @Column({ type: 'int' }) // in cents
  subtotal: number;

  @Column({ type: 'int', default: 0 }) // in cents
  discount: number;

  @Column({ type: 'int' }) // in cents
  total: number;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: SaleStatus,
    default: SaleStatus.PENDING,
  })
  @Index()
  status: SaleStatus;

  @Column({ name: 'offline_id', unique: true, nullable: true })
  @Index()
  offlineId: string;

  @Column({ name: 'synced_at', nullable: true })
  syncedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => CustomerEntity, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @OneToMany(() => SaleItemEntity, (item) => item.sale, {
    cascade: true,
    eager: true,
  })
  items: SaleItemEntity[];
}
