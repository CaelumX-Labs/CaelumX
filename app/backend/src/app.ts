import express from 'express';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import {rateLimiter }from './middlewares/rateLimiter';
import session from 'express-session';
import cors from 'cors'; // ✅ Add this

const app = express();

const allowedOrigins = [
  "http://localhost:3000",               // for local dev
  "https://www.caelum-x.com",            // your deployed backend
];

// ✅ Add CORS before routes
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
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

app.use('/api', routes); // all routes handled here

app.use(errorHandler);

// Optional test endpoint
app.post('/api/test', (req, res) => {
  console.log(req.body);
  res.json({ received: req.body });
});

export default app;
