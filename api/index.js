import 'dotenv/config';

const app = await import('../src/app.js').then((m) => m.default);

export default app;

if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
