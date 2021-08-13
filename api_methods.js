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

        let url = decodeURI(req.url)
        url = `.${url}`;        

        const urlArray =  url.split('/')        
        const personName = urlArray[3] || req.headers.name;
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
    /**/
    async createPair( req, res ){

        if ( req.method=='POST' ){
            console.log('This is a POST:\nUser should be logged in and priviledged');
        }

        const conn = neo4j.driver( uri, auth )
        const session = conn.session()
        let url = decodeURI(req.url)
        url = `.${url}`;

        const urlArray =  url.split('/')        
        const sourceName = urlArray[3] || req.headers['sourcename'];
        const relationship =  urlArray[4] || req.headers['relationship'];
        const targetName = urlArray[5] || req.headers['targetname'];
        const relationshipComponent = `-[:${relationship.toUpperCase()}]->`;
        console.log(`sourceName: ${req.headers['sourceName']}`)
        console.log(`relationship:${req.headers['relationship']}`)
        try {
            const sourceFirstName = sourceName.split('.')[0]
            const sourceLastName = sourceName.split('.')[1]
            const targetFirstName = targetName.split('.')[0]
            const targetLastName = targetName.split('.')[1]            
      
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
    async createRelationshipAB( req, res ){

        if ( req.method=='POST' ){
            console.log('This is a POST:\nUser should be logged in and priviledged');
        }

        const conn = neo4j.driver( uri, auth )
        const session = conn.session()

        let url = decodeURI(req.url)
        url = `.${url}`;

        const urlArray =  url.split('/')        
        const sourceEmail = urlArray[3] || req.headers.sourceemail;
        const relationship =urlArray[4] || req.headers.relationship;
        const targetEmail = urlArray[5] || req.headers.targetemail;
        const directional = urlArray[6] || req.headers.directional;

        const directionalString = (directional == "1") ? ">" : "";     
   
        try {
            const queryString = `MATCH (s:Person {email: $sEmail })
            MATCH (t:Person {email: $tEmail})
            MERGE (s)-[:${relationship}]-${directionalString}(t)
            RETURN s, t`
            console.log(`createRelationAB queryString:\n${queryString}`)
            const result = await session.run(
                queryString,
                {
                     sEmail: sourceEmail,
                     tEmail: targetEmail
                }
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
    async dropAllRelationshipsAB( req, res ){

        if ( req.method=='POST' ){
            console.log('This is a POST:\nUser should be logged in and priviledged');
        }

        const conn = neo4j.driver( uri, auth )
        const session = conn.session()

        let url = decodeURI(req.url)
        url = `.${url}`;

        const urlArray =  url.split('/')        
        const sourceEmail = urlArray[3] || req.headers.sourceemail;
        const targetEmail = urlArray[4] || req.headers.targetemail;
   
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
        
        if ( req.method=='POST' ){
            console.log('This is a POST:\nUser should be logged in and priviledged');
        }

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
    },

    /** */
    async newMemberRelationship( req, res ){

        if ( req.method=='POST' ){
            console.log('This is a POST:\nUser should be logged in and priviledged');
        }

        const conn = neo4j.driver( uri, auth )
        const session = conn.session();

        let url = decodeURI(req.url)
        url = `.${url}`;

        const urlArray =  url.split('/') 
        const oldEmail = urlArray[3] || req.headers['memberemail'];
        const relationship = urlArray[4]?.toUpperCase() || req.headers['relationship'];        
        const firstName = urlArray[5]?.split('.')[0] || req.headers['firstname'];
        const lastName = urlArray[5]?.split('.')[1] || req.headers['lastname'];
        const newEmail = `${firstName}.${lastName}@kin-keepers.ai`;
        
        const queryString = `MATCH (oldMember:Person {email: '${oldEmail}' })
            MERGE (oldMember)-[:${relationship}]->(newMember:Person {email: '${newEmail}', name: '${firstName}', lastName: '${lastName}', firstName: '${firstName}'})
            RETURN oldMember, newMember`
        console.log( `queryString:\n${queryString}`) ;
        try {
            const result = await session.run( 
                queryString
            );      
            let arrayOfNodeProperties = [];
            let records = result.records;            
           
            for ( let i = 0; i < 2; i++ ){
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
    async addProperty( req, res ){
        // For now, just "echo back" the header values:
        const params = [];
        params.push(req.headers.targetemail);
        params.push(req.headers.propertyname);
        params.push(req.headers.propertyvalue);

        const paramsJson = JSON.stringify(params);
        console.log (paramsJson );
        
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end( paramsJson );
    }

};// END of module