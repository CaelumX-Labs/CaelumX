import app from './app';
import { listen } from './listeners/solanaListener';

const PORT = process.env.SERVER_PORT || 3000;

app.listen(PORT, () => {
  console.log(`CaelumX Backend running on port ${PORT}`);
  listen();
});
