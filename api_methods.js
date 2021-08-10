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
                'MERGE (a:Person {name: $var, firstName: $var}) RETURN a',
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
            res.end('Trouble executing API');            
        }
        finally {
            await session.close()
            await conn.close()          
        }        
    },
    /** 
     * 
    */
   //
    async createPair( req, res ){
        const conn = neo4j.driver( uri, auth )
        const session = conn.session()
        let url = decodeURI(req.url)
        url = `.${url}`;

        const urlArray =  url.split('/')        
        const jsonSourceName = urlArray[3] || req.headers['jsonSourceName'];
        const relationship =  urlArray[4] || req.headers['relationship'];
        const jsonTargetName = urlArray[5] || req.headers['jsonTargetName'];
        const relationshipComponent = `-[:${relationship.toUpperCase()}]->`;
        console.log(`jsonSourceName: ${req.headers['jsonSourceName']}`)
        console.log(`relationship:${req.headers['relationship']}`)
        try {
            
            const sourceLastName = JSON.parse(jsonSourceName)['lastName'];
            const sourceFirstName = JSON.parse(jsonSourceName)['firstName'];
            const targetLastName = JSON.parse(jsonTargetName)['lastName'];
            const targetFirstName = JSON.parse(jsonTargetName)['firstName'];
            
            /*
            const sourceLastName = jsonSourceName['lastName'];
            const sourceFirstName = jsonSourceName['firstName'];
            const targetLastName = jsonTargetName['lastName'];
            const targetFirstName = jsonTargetName['firstName'];
            */
      
            const queryString = `MERGE (s:Person {name: $sfn, lastName: $sln, firstName: $sfn, email: $semail})
            ${relationshipComponent}(t:Person {name: $tfn, lastName: $tln, firstName: $tfn, email: $temail})
            RETURN s, t`;

            const result = await session.run(
                queryString,
                {
                    sln: sourceLastName,
                    sfn: sourceFirstName,
                    tln: targetLastName,
                    tfn: targetFirstName,
                    semail: `${sourceFirstName}.${sourceLastName}@kin-keepers.ai`,
                    temail: `${targetFirstName}.${targetLastName}@kin-keepers.ai`
                }        
            )        
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
            res.writeHead( 500, {'Content-Type':'text/plain'})
            res.end('Trouble executing API');            
        }
        finally {
            await session.close()
            await conn.close()          
        }
    },
    /** */
    async dropAllRelationshipsAB( req, res ){
        const conn = neo4j.driver( uri, auth )
        const session = conn.session()

        let url = decodeURI(req.url)
        url = `.${url}`;

        const urlArray =  url.split('/')        
        const sourceEmail = urlArray[3] || url.headers.sourceEmail;
        const targetEmail = urlArray[4] || url.headers.targetEmail;
   
        try {
            const queryString = `MATCH (s:Person {email: $sEmail })-[r]-(t:Person {email: $tEmail})
            DELETE r
            RETURN s, t`
            const result = await session.run(
                queryString,
                { sEmail: sourceEmail, tEmail: targetEmail }
            )        
            let arrayOfNodeProperties = [];
            let records = result.records;
            
            console.log(`dropAllRelationsAB : ${JSON.stringify(records[0]['_fields'][0].properties)}`)
            for ( let i = 0; i < 2; i++ ){
                let properties = records[0]['_fields'][i].properties;
                arrayOfNodeProperties.push( properties );
            }
            res.writeHead( 200, {'Content-Type':'application/json'})
            res.end(JSON.stringify(arrayOfNodeProperties));            

        }
        catch( dbError ){
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
    async deleteAllMembers( req, res){
        //https://neo4j.com/docs/cypher-manual/current/clauses/delete/
        const conn = neo4j.driver( uri, auth )
        const session = conn.session()
   
        try {
            const result = await session.run(
                'MATCH (n) DETACH DELETE n RETURN n'
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
    }

};// END of module