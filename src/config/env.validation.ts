export function validateEnv() {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  for (const variable of requiredVars) {
    if (!process.env[variable]) {
      throw new Error(
        `${variable} is missing in .env`,
      );
    }
  }

  return process.env;
}