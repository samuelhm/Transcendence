const fastify = require('fastify')({ logger: true });

// En producción, el 'secret' debe estar en variables de entorno
fastify.register(require('@fastify/jwt'), {
  secret: 'supersecret_key_42' 
});

// 2. Conexión a Base de Datos
fastify.register(require('@fastify/postgres'), {
  connectionString: 'postgres://backuser:transcendence@localhost:5432/ventodb'
});

// 3. Endpoint de Login
fastify.post('/login', async (request, reply) => {
  const { email, password } = request.body;

  // Query directa (Low level style)
  const client = await fastify.pg.connect();
  try {
    const { rows } = await client.query(
      'SELECT id, email, password_hash FROM users WHERE email=$1', [email]
    );

    const user = rows[0];

    // Validación básica
    if (!user || user.password_hash !== password) {
      return reply.code(401).send({ error: 'Credenciales inválidas' });
    }

    // GENERACIÓN DEL JWT
    // Aquí firmamos el payload. Esto es lo que valida el Gateway o otros servicios.
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
    await fastify.listen({ port: 3001 });
    console.log('Auth Service corriendo en puerto 3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();