const http = require('http');
require( 'dotenv' ).config();
const api = require('./api_methods.js');

const host = 'localhost';
const port = 3000;

http.createServer( ( req, res )=>{
    console.log(`raw url: ${req.url}`);
    let url = decodeURI(req.url)
    url = `.${url}`;
    console.log(`cleaned-up url: ${url}`)
    const urlArray =  req.url.split('/')
    const isLoginRequest = urlArray[1].toLowerCase() == 'login';
    const isApiRequest = urlArray[1].toLowerCase() == 'api';
    if ( isApiRequest ){
        const apiType = urlArray[2];
        if ( apiType && api[apiType] ){
            api[apiType](req,res);
        }
        else {
            res.writeHead( 500, {'Content-Type': 'text/plain'});
            res.end('Missing or Bad API Type.');       
        }
    }
    else if (isLoginRequest){
        res.writeHead( 200, {'Content-Type': 'text/plain'});
        res.end('Login code: work in progress');   
    }
    else if (false){}
    else if (false){}
    else {
        res.writeHead( 500, {'Content-Type': 'text/plain'});
        res.end('Bad or Malformed request.')
    }    


} ).listen(port, host, ()=>{
    console.log(`Server running at http://${host}:${port}`);
});