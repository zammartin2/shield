import fastify from 'fastify';
import { FABShield } from '../../src';
const app = fastify();
const port = 3000;
const shield = new FABShield({
    headers: { enabled: true },
    csp: { enabled: true }
});
app.use(shield.middleware());
app.get('/', async (req, reply) => {
    return { message: 'Hello from FAB Shield with Fastify!' };
});
app.listen({ port }, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map