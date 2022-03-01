module.exports = {
    /**/
    async returnOneVariable( {res, conn, session, queryString, arg2} ){
        
        try {
            const result = await session.run( queryString, arg2 )     
            const singleRecord = result.records[0]
            const node = singleRecord.get(0)
        
            console.log(node.properties.name)
            res.writeHead( 200, {'Content-Type':'application/json'})
            res.end(JSON.stringify(node.properties));
        }
        catch( dbError){
            console.error( dbError )
            res.writeHead( 500, {'Content-Type':'text/plain'})
            res.end('Trouble executing API');            
        }
        finally {
            await session.close()
            await conn.close()          
        }
    },

    /** */ 
    async returnTwoVariables( {res, conn, session, queryString, arg2} ){
        try {

            const result = await session.run( queryString, arg2 )        
            let arrayOfNodeProperties = [];
            let records = result.records;

            console.log(`createPair : ${JSON.stringify(records[0]['_fields'][0].properties)}`)
            for ( let i=0; i < 2; i++ ){
                let properties = records[0]['_fields'][i].properties;
                arrayOfNodeProperties.push( properties );
            }
            res.writeHead( 200, {'Content-Type':'application/json'})
            res.end(JSON.stringify(arrayOfNodeProperties));
        }
        catch( dbError){
            console.error( dbError )
            res.writeHead( 500, {'Content-Type':'text/plain'} )
            res.end('Trouble executing API');            
        }
        finally {
            await session.close()
            await conn.close()          
        }
    },

    /** */ 
    async returnOneVariableArray( {res, conn, session, queryString, arg2} ){
        try {
            const result = await session.run( queryString, arg2 )
            let arrayOfNodeProperties = [];
            for (let record of result.records){
                let properties = record.get(0).properties;
                arrayOfNodeProperties.push( properties );
            }    
            
            res.writeHead( 200, {'Content-Type':'application/json'})
            res.end(JSON.stringify(arrayOfNodeProperties));
        }
        catch( dbError){
            console.error( dbError )
            res.writeHead( 500, {'Content-Type':'text/plain'})
            res.end(`'Trouble executing API':\n${queryString}`);            
        }
        finally {
            await session.close()
            await conn.close()          
        }
    },

    /** */ 
    CorsMiddleware( req, res ){
        //pre-flight
        if (req.method === "OPTIONS") {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");      
            res.setHeader("Access-Control-Allow-Headers", "cypherquery, jsonargs, email");          
            res.end();
            return;
          }
        //post-flight
        else {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");      
        res.setHeader("Access-Control-Allow-Headers", "cypherquery, jsonargs, email");
        }
    },

    /** */
    generateFamID(){
        const allCaps = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`;
        const allLower ='abcdefghijklmnopqrstuvwxyz';
        const allLettersArray = (allCaps + allLower).split('');
        // make four random text digits, slicing off the prefixed '0.'
        const fourDigits = ((Math.random()).toFixed(4)).slice(2);    
        const fourLetters = allLettersArray.reduce((r,m,i,a)=>{
            if (r.length < 4){
                let index = Math.floor(a.length * Math.random());
                r += a[index];
                return r;
            }
        }, "");
        return `${fourLetters}${fourDigits}`
    }

    /** */ 

    

};