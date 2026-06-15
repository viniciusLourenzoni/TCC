import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1733143200000 implements MigrationInterface {
  name = 'InitialSchema1733143200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM('ADMIN', 'OPERATOR');
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "name" character varying NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'OPERATOR',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email")
    `);

    // Create products table
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "price" integer NOT NULL,
        "barcode" character varying,
        "stock" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_products_barcode" UNIQUE ("barcode"),
        CONSTRAINT "PK_products" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_products_name" ON "products" ("name")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_products_barcode" ON "products" ("barcode")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_products_is_active" ON "products" ("is_active")
    `);

    // Create customers table
    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "cpf" character varying,
        "email" character varying,
        "phone" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_customers_cpf" UNIQUE ("cpf"),
        CONSTRAINT "PK_customers" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customers_name" ON "customers" ("name")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customers_cpf" ON "customers" ("cpf")
    `);

    // Create sales table
    await queryRunner.query(`
      CREATE TYPE "payment_method_enum" AS ENUM('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'FIADO');
    `);

    await queryRunner.query(`
      CREATE TYPE "sale_status_enum" AS ENUM('PENDING', 'COMPLETED', 'CANCELLED');
    `);

    await queryRunner.query(`
      CREATE TABLE "sales" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "customer_id" uuid,
        "subtotal" integer NOT NULL,
        "discount" integer NOT NULL DEFAULT 0,
        "total" integer NOT NULL,
        "payment_method" "payment_method_enum",
        "status" "sale_status_enum" NOT NULL DEFAULT 'PENDING',
        "offline_id" character varying,
        "synced_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_sales_offline_id" UNIQUE ("offline_id"),
        CONSTRAINT "PK_sales" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_sales_status" ON "sales" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_sales_offline_id" ON "sales" ("offline_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_sales_created_at" ON "sales" ("created_at")
    `);

    // Create sale_items table
    await queryRunner.query(`
      CREATE TABLE "sale_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sale_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "product_name" character varying NOT NULL,
        "quantity" integer NOT NULL,
        "unit_price" integer NOT NULL,
        "subtotal" integer NOT NULL,
        CONSTRAINT "PK_sale_items" PRIMARY KEY ("id")
      )
    `);

    // Add foreign keys
    await queryRunner.query(`
      ALTER TABLE "sales"
      ADD CONSTRAINT "FK_sales_user_id"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "sales"
      ADD CONSTRAINT "FK_sales_customer_id"
      FOREIGN KEY ("customer_id")
      REFERENCES "customers"("id")
      ON DELETE SET NULL
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "sale_items"
      ADD CONSTRAINT "FK_sale_items_sale_id"
      FOREIGN KEY ("sale_id")
      REFERENCES "sales"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "sale_items"
      ADD CONSTRAINT "FK_sale_items_product_id"
      FOREIGN KEY ("product_id")
      REFERENCES "products"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "sale_items" DROP CONSTRAINT "FK_sale_items_product_id"`);
    await queryRunner.query(`ALTER TABLE "sale_items" DROP CONSTRAINT "FK_sale_items_sale_id"`);
    await queryRunner.query(`ALTER TABLE "sales" DROP CONSTRAINT "FK_sales_customer_id"`);
    await queryRunner.query(`ALTER TABLE "sales" DROP CONSTRAINT "FK_sales_user_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "sale_items"`);
    await queryRunner.query(`DROP INDEX "IDX_sales_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_sales_offline_id"`);
    await queryRunner.query(`DROP INDEX "IDX_sales_status"`);
    await queryRunner.query(`DROP TABLE "sales"`);
    await queryRunner.query(`DROP TYPE "sale_status_enum"`);
    await queryRunner.query(`DROP TYPE "payment_method_enum"`);

    await queryRunner.query(`DROP INDEX "IDX_customers_cpf"`);
    await queryRunner.query(`DROP INDEX "IDX_customers_name"`);
    await queryRunner.query(`DROP TABLE "customers"`);

    await queryRunner.query(`DROP INDEX "IDX_products_is_active"`);
    await queryRunner.query(`DROP INDEX "IDX_products_barcode"`);
    await queryRunner.query(`DROP INDEX "IDX_products_name"`);
    await queryRunner.query(`DROP TABLE "products"`);

    await queryRunner.query(`DROP INDEX "IDX_users_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
