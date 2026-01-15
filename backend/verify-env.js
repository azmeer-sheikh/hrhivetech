// Environment verification script - run this before deploying
console.log('🔍 Railway Environment Check\n');

const requiredEnvVars = [
  'NODE_ENV',
  'MONGODB_URI',
  'JWT_SECRET',
  'PORT'
];

const optionalEnvVars = [
  'FRONTEND_URL',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS'
];

console.log('Required Environment Variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  console.log(`${status} ${varName}: ${value ? '(set)' : '(missing)'}`);
});

console.log('\nOptional Environment Variables:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '⚠️ ';
  console.log(`${status} ${varName}: ${value ? '(set)' : '(not set)'}`);
});

console.log('\n📦 Build Information:');
console.log(`Node Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Port: ${process.env.PORT || 5000}`);
console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);

const allRequiredSet = requiredEnvVars.every(v => process.env[v]);
if (allRequiredSet) {
  console.log('\n✅ All required environment variables are set!');
  process.exit(0);
} else {
  console.log('\n❌ Some required environment variables are missing!');
  process.exit(1);
}
