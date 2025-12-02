-- Insert ADMIN user
-- Email: admin@pwavarejo.com
-- Password: admin123
-- Hash gerado com bcrypt (10 rounds)

INSERT INTO users (id, email, password, name, role, created_at, updated_at)
VALUES (
  uuid_generate_v4(),
  'admin@pwavarejo.com',
  '$2b$10$4UtCLy12gTx4Ea0adLUDZe7OcI8yM0XXG419uS5gEAazq3tBQXwri',
  'Administrador',
  'ADMIN',
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

-- Insert test products
INSERT INTO products (id, name, description, price, barcode, stock, is_active, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'Coca-Cola 2L', 'Refrigerante Coca-Cola 2 litros', 899, '7894900011517', 50, true, now(), now()),
  (uuid_generate_v4(), 'Arroz 5kg', 'Arroz branco tipo 1', 2499, '7896029086841', 30, true, now(), now()),
  (uuid_generate_v4(), 'Feijão 1kg', 'Feijão preto tipo 1', 799, '7896089011234', 40, true, now(), now())
ON CONFLICT (barcode) DO NOTHING;

SELECT 'Seed completed successfully!' as message;
