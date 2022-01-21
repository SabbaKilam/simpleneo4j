const http = require('http');
const fs = require('fs');
const { CorsMiddleware } = require('./helper_methods.js');
const api = require('./api_methods.js');
require( 'dotenv' ).config();

const port = process.env.PORT;

const mimeTypes = {
    html: 'text/html',
    css: 'text/css',
    csv: `text/plain`,
    js: 'text/javascript',
    ico: 'image/icon',
    jpg: `image/jpg`,
}

const apiList = [
    'getMember',
    'getAllMembers',
    'allMembers',
    'myGrandchildren',
    'myGrandsons',
    'myGranddaughters',
    'myChildren',
    'mySons',
    'myDaughters',
    'myGrandparents',
    'possibleGrandchildren',
    'possibleGrandparents',
    'returnOneVariable'
];

const forbiddenFiles = [
    './',
    './server.js',
    './package.json',
    './.env',
    './api_methods.js',
    './helper_methods.js'
];

http.createServer( ( req, res )=>{
    //allow cors:
    CorsMiddleware( req, res );

    let url = decodeURI(req.url)
    url = `.${url}`;
    if ( forbiddenFiles.includes(url) ){
        url = './index.html'
    }
    
    console.log(`url: ${url}`)

    const urlArray = url.split('/')
    const isLoginRequest = urlArray[1].toLowerCase() == 'login';
    const isApiRequest = urlArray[1].toLowerCase() == 'api';
    if ( isApiRequest ){
        const apiType = urlArray[2];
        if ( apiType && api[apiType] ){
            api[apiType]( req, res );
        }
        else if ( apiType == '' || apiType == undefined ){
            apiList.sort();
            const verticalApiList = apiList.join('\n');
            res.writeHead( 200, {'Content-Type': 'text/plain'});
            res.end(verticalApiList);
        }
        else {
            res.writeHead( 500, {'Content-Type': 'text/plain'});
            res.end('Bad or malformed API Type.');       
        }
    }
    else if ( isLoginRequest ){
        const possiblePassword = req.headers.password;
        if ( possiblePassword == process.env.PASSWORD ){
            res.writeHead( 200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(true)); 
        }
        else{
            res.writeHead( 200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(false));  
        }
    }
    else if ( req.method =='GET' ){
        const extension = url.split('.').reverse()[0];
        const mimeType = mimeTypes[extension] || 'application/octet-stream'
        fs.readFile( url, (error, content) => {
            if (!error){
                res.writeHead( 200, {'Content-Type': mimeType} );
                res.end(content);
            }
            else{
                res.writeHead( 500, {'Content-Type': 'text/plain'} );
                res.end(`Troublle getting ${url}`)
            }
        });
    }
    else if ( req.method =='POST'){
        res.writeHead( 500, {'Content-Type': 'text/plain'} );
        res.end(`Responding to API POSTs only from logged-in users`)
    }
    else {
        res.writeHead( 500, {'Content-Type': 'text/plain'});
        res.end('Bad or Malformed request.')
    }
}).listen(port, ()=>{
    console.log(`Server running at ${port}`);
});