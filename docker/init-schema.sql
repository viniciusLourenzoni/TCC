-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE "user_role_enum" AS ENUM('ADMIN', 'OPERATOR');
CREATE TYPE "payment_method_enum" AS ENUM('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX');
CREATE TYPE "sale_status_enum" AS ENUM('PENDING', 'COMPLETED', 'CANCELLED');

-- Create users table
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
);

CREATE INDEX "IDX_users_email" ON "users" ("email");

-- Create products table
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
);

CREATE INDEX "IDX_products_name" ON "products" ("name");
CREATE INDEX "IDX_products_barcode" ON "products" ("barcode");
CREATE INDEX "IDX_products_is_active" ON "products" ("is_active");

-- Create customers table
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
);

CREATE INDEX "IDX_customers_name" ON "customers" ("name");
CREATE INDEX "IDX_customers_cpf" ON "customers" ("cpf");

-- Create sales table
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
);

CREATE INDEX "IDX_sales_status" ON "sales" ("status");
CREATE INDEX "IDX_sales_offline_id" ON "sales" ("offline_id");
CREATE INDEX "IDX_sales_created_at" ON "sales" ("created_at");

-- Create sale_items table
CREATE TABLE "sale_items" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "sale_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "product_name" character varying NOT NULL,
  "quantity" integer NOT NULL,
  "unit_price" integer NOT NULL,
  "subtotal" integer NOT NULL,
  CONSTRAINT "PK_sale_items" PRIMARY KEY ("id")
);

-- Add foreign keys
ALTER TABLE "sales"
ADD CONSTRAINT "FK_sales_user_id"
FOREIGN KEY ("user_id")
REFERENCES "users"("id")
ON DELETE NO ACTION
ON UPDATE NO ACTION;

ALTER TABLE "sales"
ADD CONSTRAINT "FK_sales_customer_id"
FOREIGN KEY ("customer_id")
REFERENCES "customers"("id")
ON DELETE SET NULL
ON UPDATE NO ACTION;

ALTER TABLE "sale_items"
ADD CONSTRAINT "FK_sale_items_sale_id"
FOREIGN KEY ("sale_id")
REFERENCES "sales"("id")
ON DELETE CASCADE
ON UPDATE NO ACTION;

ALTER TABLE "sale_items"
ADD CONSTRAINT "FK_sale_items_product_id"
FOREIGN KEY ("product_id")
REFERENCES "products"("id")
ON DELETE NO ACTION
ON UPDATE NO ACTION;
