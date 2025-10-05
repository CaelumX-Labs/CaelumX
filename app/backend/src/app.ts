import express from 'express';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import {rateLimiter }from './middlewares/rateLimiter';
import session from 'express-session';
import cors from 'cors'; // ✅ Add this

const app = express();


const allowedOrigins = [
  "http://localhost:3000", 
  "https://www.caelum-x.com",
  "https://caelum-x.com",
  "https://api.caelum-x.com"
];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like mobile apps, curl, postman)
    if(!origin) return callback(null, true);

    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // if you use cookies/auth headers
}));

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
