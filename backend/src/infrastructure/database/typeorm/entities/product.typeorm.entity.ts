import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CategoryEntity } from './category.typeorm.entity';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' }) // venda, em centavos
  price: number;

  @Column({ name: 'cost_price', type: 'int', nullable: true }) // custo, em centavos
  costPrice: number;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  @Index()
  categoryId: string;

  @ManyToOne(() => CategoryEntity, { nullable: true, eager: false })
  @JoinColumn({ name: 'category_id' })
  category?: CategoryEntity;

  @Column({ unique: true, nullable: true })
  @Index()
  barcode: string;

  @Column({ name: 'image_url', type: 'text', nullable: true }) // foto em data URL (base64)
  imageUrl: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
