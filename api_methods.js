const fs = require('fs');
const { url } = require('inspector');
require( 'dotenv' ).config();

const uri = process.env.DB_URI;
const user = process.env.DB_USER;
const password = process.env.DB_PSWD;

const neo4j = require( 'neo4j-driver' )
const auth = neo4j.auth.basic( user, password )

module.exports = {
    /** */
    async tryNeo( req, res ){
        const conn = neo4j.driver( uri, auth )
        const session = conn.session()

        const urlArray =  req.url.split('/')        
        const personName = urlArray[3] || url.headers.name;
        console.log(`personName: ${personName}`)
   
        try {
            if( !personName ){ throw new Error("Name not provided.")} 

            const result = await session.run(
                'MERGE (a:Person {name: $var}) RETURN a',
                { var: personName  }
            )        
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
    async getAllMembers( req, res ){
        const conn = neo4j.driver( uri, auth )
        const session = conn.session()
        
        try {
            const result = await session.run(
                'MATCH (a:Person) RETURN a'
            )
            let arrayOfNodeProperties = [];
            let record = null;
            for (record of result.records){
                let properties = record.get(0).properties;
                arrayOfNodeProperties.push( properties );
            }
            res.writeHead( 200, {'Content-Type':'application/json'})
            res.end(JSON.stringify(arrayOfNodeProperties));
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
    async createPair( req, res ){
        const conn = neo4j.driver( uri, auth )
        const session = conn.session()

        const urlArray =  req.url.split('/')        
        const jsonSourceName = urlArray[3] || url.headers.jsonSourceName;
        const relationship =  urlArray[4] || url.headers.relationship;
        const jsonTargetName = urlArray[5] || url.headers.jsonTargetName;
        const relationshipComponent = `-[:${relationship.toUpperCase()}]->`;
           
        try {
            const sourceLastName = JSON.parse(jsonSourceName)['lastName'];
            const sourceFirstName = JSON.parse(jsonSourceName)['firstName'];
            const targetLastName = JSON.parse(jsonTargetName)['lastName'];
            const targetFirstName = JSON.parse(jsonTargetName)['firstName'];

            const queryString = `MERGE (s:Person {lastName: $sln, firstName: $sfn});
            ${relationshipComponent}(t:Person {lastName: $tln, firstName: $tfn})
            RETURN s, t`;

            const result = await session.run(
                queryString,
                {
                    sln: sourceLastName,
                    sfn: sourceFirstName,
                    tln: targetLastName,
                    tfn: targetFirstName
                }        
            )        
            let arrayOfNodeProperties = [];
            let record = null;
            for (record of result.records){
                let properties = record.get(0).properties;
                arrayOfNodeProperties.push( properties );
            }
            res.writeHead( 200, {'Content-Type':'application/json'})
            res.end(JSON.stringify(arrayOfNodeProperties));
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

};// END of module