import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
config();

const isTest = process.env.NODE_ENV === 'test';

export const databaseOptions: DataSourceOptions = {
  type: 'postgres',
  host: isTest ? process.env.DATABASE_HOST_TEST : process.env.DATABASE_HOST,
  port: isTest
    ? Number(process.env.DATABASE_PORT_TEST)
    : Number(process.env.DATABASE_PORT),
  username: isTest
    ? process.env.DATABASE_USERNAME_TEST
    : process.env.DATABASE_USERNAME,
  password: isTest
    ? process.env.DATABASE_PASSWORD_TEST
    : process.env.DATABASE_PASSWORD,
  database: isTest ? process.env.DATABASE_NAME_TEST : process.env.DATABASE_NAME,
  subscribers: [],
  entities: ['dist/src/**/*.entity.js'],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'audease_migration_table',

  // ssl: isTest ? false : { rejectUnauthorized: false },
};

export const dataSource = new DataSource(databaseOptions);
