/* eslint-disable no-console */
import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../typeorm/config/typeorm.config';
import { UserEntity } from '../typeorm/entities/user.typeorm.entity';
import { CategoryEntity } from '../typeorm/entities/category.typeorm.entity';
import { ProductEntity } from '../typeorm/entities/product.typeorm.entity';
import { UserRole } from '@core/domain/enums';

async function run() {
  await AppDataSource.initialize();
  console.log('🔧 DataSource inicializado');

  const usersRepo = AppDataSource.getRepository(UserEntity);
  const categoriesRepo = AppDataSource.getRepository(CategoryEntity);
  const productsRepo = AppDataSource.getRepository(ProductEntity);

  // Admin
  const adminEmail = 'admin@pwavarejo.com';
  let admin = await usersRepo.findOne({ where: { email: adminEmail } });
  if (!admin) {
    admin = usersRepo.create({
      email: adminEmail,
      name: 'Administrador',
      password: await bcrypt.hash('admin123', 10),
      role: UserRole.ADMIN,
    });
    await usersRepo.save(admin);
    console.log(`✅ Usuário admin criado: ${adminEmail} / admin123`);
  } else {
    console.log(`ℹ️  Admin já existe: ${adminEmail}`);
  }

  // Categorias
  const categoriesData = [
    { name: 'Alimentos', color: '#1E3A8A' },
    { name: 'Bebidas', color: '#10B981' },
    { name: 'Outros', color: '#6B7280' },
  ];

  const categoryByName = new Map<string, CategoryEntity>();
  for (const data of categoriesData) {
    let cat = await categoriesRepo.findOne({ where: { name: data.name } });
    if (!cat) {
      cat = categoriesRepo.create(data);
      await categoriesRepo.save(cat);
      console.log(`✅ Categoria criada: ${data.name}`);
    }
    categoryByName.set(data.name, cat);
  }

  // Produtos do mockup
  const productsData = [
    {
      name: 'Arroz Branco 5kg',
      price: 2290,
      costPrice: 1700,
      stock: 45,
      categoryName: 'Alimentos',
      barcode: '7891000100103',
    },
    {
      name: 'Feijão Preto 1kg',
      price: 890,
      costPrice: 620,
      stock: 30,
      categoryName: 'Alimentos',
      barcode: '7891000200203',
    },
    {
      name: 'Óleo de Soja 900ml',
      price: 790,
      costPrice: 550,
      stock: 60,
      categoryName: 'Alimentos',
      barcode: '7891000300303',
    },
    {
      name: 'Refrigerante 2L',
      price: 990,
      costPrice: 600,
      stock: 25,
      categoryName: 'Bebidas',
      barcode: '7891000400403',
    },
  ];

  for (const p of productsData) {
    const exists = await productsRepo.findOne({ where: { name: p.name } });
    if (exists) continue;
    const cat = categoryByName.get(p.categoryName);
    const product = productsRepo.create({
      name: p.name,
      price: p.price,
      costPrice: p.costPrice,
      stock: p.stock,
      categoryId: cat?.id,
      barcode: p.barcode,
      isActive: true,
    });
    await productsRepo.save(product);
    console.log(`✅ Produto criado: ${p.name}`);
  }

  await AppDataSource.destroy();
  console.log('🎉 Seed concluído');
}

run().catch((err) => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});
