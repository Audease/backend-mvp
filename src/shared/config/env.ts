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
  jwtSecret: process.env.JWT_SECRET,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET_TOKEN,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET_TOKEN,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  redisUrl: process.env.REDIS_URL,
  Emailfrom: process.env.EMAIL_FROM,
  mailerSend: process.env.MAILER_SEND_API_KEY,
  SlackBotToken: process.env.SLACK_BOT_TOKEN,
  SlackChannelId: process.env.SLACK_CHANNEL_ID,
  ClouinaryApiKey: process.env.CLOUDINARY_API_KEY,
  CloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  CloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  CloudinaryUrl: process.env.CLOUDINARY_URL,
});
