const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { testConnection } = require('./config/db');
require('dotenv').config();
const authJwt = require('./middlewares/jwt');
const errorHandler = require('./middlewares/error_handler');
const authorizePostRequests = require('./middlewares/authorization');

const app = express();
const env = process.env;
const API = env.API_URL;

app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());
app.use(authJwt());
app.use(authorizePostRequests);
app.use(errorHandler);



const authRoutes = require('./routes/authRoutes');


app.use(`${API}/`, authRoutes);



const port = env.PORT || 9900;
const hostname = env.HOST || 'localhost';

// Test database connection before starting the server
testConnection().then(() => {
    console.log("Database synced");
        app.listen(port, hostname, () => {
            console.log(`Server running at http://${hostname}:${port}`);
        });
}).catch(err => {
    console.error("Database connection failed:", err);
    process.exit(1); 
});