module.exports = {
  apps: [
    {
      name: "subscription-manager",
      script: "build/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "127.0.0.1",
        ORIGIN: "http://49.12.226.164",
	PROTOCOL_HEADER: "x-forwarded-proto",
	BETTER_AUTH_TRUST_CONNECTED_HW: "true",
	BETTER_AUTH_URL: "http://49.12.226.164",
        DATABASE_URL: "postgres://root:mysecretpassword@localhost:5432/local",
        BETTER_AUTH_SECRET: "h0JKHatKebNDlXAjeVG0f3NouBFA52Av"
      }
    }
  ]
};
