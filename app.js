const express = require('express');
const bodyParser = require('body-parser');
const morgan= require ('morgan');
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
app.use(morgan('dev'));
app.use(cors());
app.options('*', cors());
app.use(authJwt());
app.use(authorizePostRequests);
app.use(errorHandler);


// Import routes 
const authRoutes= require('./routes/authRoutes'); 
const accountRoutes= require('./routes/accountRoutes');
const transactionRoutes= require('./routes/transactionRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const loanRoutes = require('./routes/loanRoutes');

// Use routes 
app.use(`${API}/`, authRoutes); 
app.use(`${API}/accounts`,accountRoutes)
app.use(`${API}/transactions`,transactionRoutes)
app.use(`${API}/admins`,adminRoutes)
app.use(`${API}/loans`,loanRoutes)


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