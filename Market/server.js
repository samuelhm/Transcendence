const fastify = require('fastify')({ logger: true });

fastify.register(require('@fastify/jwt'), {
  secret: 'supersecret_key_42' 
});

fastify.register(require('@fastify/postgres'), {
  connectionString: 'postgres://backuser:transcendence@localhost:5432/ventodb'
});

// 3. Decorador: Una función "middleware" para proteger rutas
fastify.decorate('authenticate', async function (request, reply) {
  try {
    // Esto busca el header 'Authorization: Bearer <token>' y verifica la firma
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// 4. Ruta Protegida: Obtener mi perfil
// Usamos { onRequest: [fastify.authenticate] } para blindar la ruta
fastify.get('/me', { onRequest: [fastify.authenticate] }, async (request, reply) => {
  
  // Si llegamos aquí, el token es válido.
  // request.user contiene el payload decodificado del token (id, email...)
  const userId = request.user.id;

  const client = await fastify.pg.connect();
  try {
    // Seleccionamos todo MENOS el hash de la contraseña (seguridad básica)
    const { rows } = await client.query(
      `SELECT id, email, nickname, first_name, last_name, city, avatar_path 
       FROM users 
       WHERE id = $1`,
       [userId]
    );

    if (rows.length === 0) {
      return reply.code(404).send({ error: 'Usuario no encontrado en DB' });
    }

    return rows[0];

  } finally {
    client.release();
  }
});

// Arrancar en puerto 3002
const start = async () => {
  try {
    await fastify.listen({ port: 3002 });
    console.log('Market Service corriendo en puerto 3002');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();