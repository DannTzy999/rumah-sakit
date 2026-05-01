const serverless = require("serverless-http");
const { createNestApp } = require("../dist/main");

let cachedHandler = null;

async function getHandler() {
  if (cachedHandler) {
    return cachedHandler;
  }

  const app = await createNestApp();
  const expressInstance = app.getHttpAdapter().getInstance();
  cachedHandler = serverless(expressInstance);
  return cachedHandler;
}

module.exports = async function (req, res) {
  const handler = await getHandler();
  return handler(req, res);
};
