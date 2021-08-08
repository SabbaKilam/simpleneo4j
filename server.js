const http = require('http');
require( 'dotenv' ).config();
const {
    tryNeo,
} = require('./methods_module.js');

const host = 'localhost';
const port = 3000;

const server = http.createServer(( req, res )=>{});
    tryNeo('Abbas');
server.listen(port, host, ()=>{
    console.log(`Server running at http://${host}:${port}`);
});