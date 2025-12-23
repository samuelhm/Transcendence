const fastify = require('fastify')({ logger: true });


fastify.register(require('@fastify/http-proxy'), {
  upstream: 'http://localhost:3001',
  prefix: '/auth',
  http2: false
});

fastify.register(require('@fastify/http-proxy'), {
  upstream: 'http://localhost:3002',
  prefix: '/market',
  http2: false
});

// Ruta de prueba del propio Gateway
fastify.get('/', async () => {
  return { status: 'Gateway funcionando correctamente' };
});


const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Gateway (Router) corriendo en puerto 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();