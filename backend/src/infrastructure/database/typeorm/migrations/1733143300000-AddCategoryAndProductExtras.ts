import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryAndProductExtras1733143300000
  implements MigrationInterface
{
  name = 'AddCategoryAndProductExtras1733143300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cria tabela categories
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "color" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_categories_name" UNIQUE ("name"),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_categories_name" ON "categories" ("name")`,
    );

    // Adiciona colunas em products
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN "cost_price" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN "category_id" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_products_category_id" ON "products" ("category_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD CONSTRAINT "FK_products_category_id"
      FOREIGN KEY ("category_id")
      REFERENCES "categories"("id")
      ON DELETE SET NULL
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_products_category_id"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_products_category_id"`);
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "category_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "cost_price"`,
    );

    await queryRunner.query(`DROP INDEX "IDX_categories_name"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
