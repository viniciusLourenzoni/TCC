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

  // Categorias (loja de embalagens)
  const categoriesData = [
    { name: 'Sacolas', color: '#F59E0B' },
    { name: 'Copos e Descartáveis', color: '#06B6D4' },
    { name: 'Caixas e Marmitas', color: '#8B5CF6' },
    { name: 'Papéis e Filmes', color: '#10B981' },
    { name: 'Fitas e Acessórios', color: '#EF4444' },
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

  // Produtos (loja de embalagens)
  const productsData = [
    { name: 'Sacola Plástica Branca 30x40 (100un)', price: 1290, costPrice: 900, stock: 80, categoryName: 'Sacolas' },
    { name: 'Sacola Kraft Delivery M (50un)', price: 2490, costPrice: 1750, stock: 60, categoryName: 'Sacolas' },
    { name: 'Sacola Boutique c/ Alça (25un)', price: 1990, costPrice: 1400, stock: 40, categoryName: 'Sacolas' },
    { name: 'Copo Descartável 200ml (100un)', price: 450, costPrice: 300, stock: 150, categoryName: 'Copos e Descartáveis' },
    { name: 'Copo Descartável 300ml (100un)', price: 690, costPrice: 470, stock: 120, categoryName: 'Copos e Descartáveis' },
    { name: 'Prato Descartável 15cm (10un)', price: 390, costPrice: 250, stock: 90, categoryName: 'Copos e Descartáveis' },
    { name: 'Kit Talher Descartável (50un)', price: 890, costPrice: 600, stock: 70, categoryName: 'Copos e Descartáveis' },
    { name: 'Caixa de Pizza 35cm (25un)', price: 3290, costPrice: 2300, stock: 50, categoryName: 'Caixas e Marmitas' },
    { name: 'Marmita Isopor (100un)', price: 2890, costPrice: 2000, stock: 60, categoryName: 'Caixas e Marmitas' },
    { name: 'Caixa Papelão Correios 16x11x6', price: 150, costPrice: 90, stock: 200, categoryName: 'Caixas e Marmitas' },
    { name: 'Bobina Papel Kraft 30cm', price: 1890, costPrice: 1300, stock: 45, categoryName: 'Papéis e Filmes' },
    { name: 'Filme PVC 28cm x 300m', price: 1490, costPrice: 1000, stock: 55, categoryName: 'Papéis e Filmes' },
    { name: 'Papel Manteiga 30x30 (100un)', price: 990, costPrice: 680, stock: 65, categoryName: 'Papéis e Filmes' },
    { name: 'Fita Adesiva Transparente 45x45', price: 490, costPrice: 320, stock: 130, categoryName: 'Fitas e Acessórios' },
    { name: 'Fita Crepe 18x50', price: 590, costPrice: 390, stock: 110, categoryName: 'Fitas e Acessórios' },
    { name: 'Etiqueta Adesiva (rolo 100un)', price: 790, costPrice: 520, stock: 75, categoryName: 'Fitas e Acessórios' },
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
