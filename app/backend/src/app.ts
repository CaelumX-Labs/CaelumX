import express from 'express';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { rateLimiter } from './middlewares/rateLimiter';
import session from 'express-session';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'caelumx-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60
  }
}));

app.use(rateLimiter);

app.use('/api', routes);

app.use(errorHandler);

app.post('/api/test', (req, res) => {
  console.log(req.body);
  res.json({ received: req.body });
});

export default app;

