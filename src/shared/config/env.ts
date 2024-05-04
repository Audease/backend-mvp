const isTest = () => (process.env.NODE_ENV === 'test' ? true : false);
const dbPort = isTest()
  ? process.env.DATABASE_PORT_TEST
  : process.env.DATABASE_PORT;

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    username: isTest()
      ? process.env.DATABASE_USERNAME_TEST
      : process.env.DATABASE_USERNAME,
    password: isTest()
      ? process.env.DATABASE_PASSWORD_TEST
      : process.env.DATABASE_PASSWORD,
    database: isTest()
      ? process.env.DATABASE_NAME_TEST
      : process.env.DATABASE_NAME,
    host: isTest() ? process.env.DATABASE_HOST_TEST : process.env.DATABASE_HOST,
    port: Number(dbPort),
  },
  frontendUrl: process.env.FRONTEND_URL,
  BackendUrl: process.env.BACKEND_URL,
});
