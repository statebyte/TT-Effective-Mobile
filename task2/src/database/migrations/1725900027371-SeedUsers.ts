import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedUsers1725900027371 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "user" ("firstName", "lastName", "age", "gender", "problems")
            SELECT
                'User' || i::text,
                'Surname' || i::text,
                (random() * 60 + 18)::int,
                CASE WHEN i % 2 = 0 THEN 'male' ELSE 'female' END,
                random() < 0.5
            FROM generate_series(1, 1000000) s(i);
            `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "user";`);
    }

}
