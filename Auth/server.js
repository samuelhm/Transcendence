const fastify = require('fastify')({ logger: true });

fastify.register(require('@fastify/jwt'), {
  secret: 'supersecret_key_42'
});

fastify.register(require('@fastify/postgres'), {
  connectionString: 'postgres://backuser:transcendence@postgres-db:5432/ventodb'
});

fastify.post('/login', async (request, reply) => {
  const { email, password } = request.body;

  const client = await fastify.pg.connect();
  try {
    const { rows } = await client.query(
      'SELECT id, email, password_hash FROM users WHERE email=$1', [email]
    );

    const user = rows[0];

    if (!user || user.password_hash !== password) {
      return reply.code(401).send({ error: 'Credenciales inválidas' });
    }

    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email
    });

    return { token };

  } finally {
    client.release();
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Auth Service corriendo en puerto 3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
