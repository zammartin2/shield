import Koa from 'koa';
import { FABShield } from '../../src';
const app = new Koa();
const port = 3000;
const shield = new FABShield({
    headers: { enabled: true }
});
app.use(shield.middleware());
app.use(async (ctx) => {
    ctx.body = { message: 'Hello from FAB Shield with Koa!' };
});
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map