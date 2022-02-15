require( 'dotenv' ).config();
const {
   returnOneVariable,
   returnTwoVariables,
   returnOneVariableArray
} = require('./helper_methods.js');
const forbiddenWords = [
    'MERGE',
    'CREATE',
    'DROP',
    'DELETE',
    'DETACH',
    'UNION',
    'SET',
    'REMOVE',
    'ASSIGN',
    'ALTER',
    'REPLACE',
    'CHANGE',
    'EXECUTE',
    'DENY',
    'DROP',
    'DROP',
    'ACCESS',
    'STOP',
    'START',
    'WRITE',    
];
const uri = process.env.DB_URI;
const user = process.env.DB_USER;
const password = process.env.DB_PSWD;

const neo4j = require( 'neo4j-driver' );
const auth = neo4j.auth.basic( user, password );

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
    async createMember( req, res ){
        /* allow POST for now
        const prohibitedMethod = req.method !== 'GET' ? true : false;
        if ( prohibitedMethod ){
            res.writeHead( 500, {'Content-Type': 'text/plain'} );
            res.end('Forbidden or Malformed request.');
            return;           
        }
        */
        const conn = neo4j.driver( uri, auth );
        const session = conn.session();

        let url = decodeURI(req.url);
        url = `.${url}`;

        const urlArray =  url.split('/') ;
        const firstName = urlArray[3] || req.headers.firstname;
        const lastName = urlArray[4] || req.headers.lastname;
        const DOB = urlArray[5] || req.headers.dob;
        const sex = urlArray[6] || req.headers.sex;        
        
        const queryString = `MERGE (p:Person {name: '${firstName}', firstName: '${firstName}', lastName: '${lastName}', email: '${firstName}.${lastName}@kin-keepers.ai', DOB: '${DOB}', sex: '${sex}'})
        RETURN p`;
        const argObject = {
            res,
            session,
            conn,
            queryString
        }
        returnOneVariable( argObject );
    },

    /** */
    async getAllMembers( req, res ){
        const prohibitedMethod = req.method !== 'GET' ? true : false;
        if ( prohibitedMethod ){
            res.writeHead( 500, {'Content-Type': 'text/plain'} );
            res.end('Forbidden or Malformed request.');            
        }        

        const conn = neo4j.driver( uri, auth )
        const session = conn.session()
        const queryString = 'MATCH (a:Person) RETURN a'
        const argObject = {
            res,
            conn,
            session,
            queryString,
        };
        returnOneVariableArray( argObject );        
    },

    allMembers: function(req, res){this.getAllMembers(req, res)},

    /** */ 
    async getMember( req, res ){
        const prohibitedMethod = req.method !== 'GET' ? true : false;
        if ( prohibitedMethod ){
            res.writeHead( 500, {'Content-Type': 'text/plain'} );
            res.end('Forbidden or Malformed request.');            
        }
                
        const conn = neo4j.driver( uri, auth );
        const session = conn.session();

        let url = decodeURI(req.url);
        url = `.${url}`;

        const urlArray =  url.split('/') ;
        const email = urlArray[3] || req.headers.email;

        const queryString = `MATCH (p:Person {email: '${email}'})
        RETURN p`;
        const argObject = {
            res,
            conn,
            session,
            queryString
        };
        returnOneVariable( argObject );      
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

        const sourceFirstName = sourceName.split('.')[0]
        const sourceLastName = sourceName.split('.')[1]
        const targetFirstName = targetName.split('.')[0]
        const targetLastName = targetName.split('.')[1]            
  
        const queryString = `MERGE (s:Person {name: $sfn, lastName: $sln, firstName: $sfn, email: $semail})
        ${relationshipComponent}(t:Person {name: $tfn, lastName: $tln, firstName: $tfn, email: $temail})
        RETURN s, t`;

        const argObject = {
            res,
            conn,
            session,
            queryString,
            arg2: {
                sln: sourceLastName,
                sfn: sourceFirstName,
                tln: targetLastName,
                tfn: targetFirstName,
                semail: `${sourceFirstName}.${sourceLastName}@kin-keepers.ai`,
                temail: `${targetFirstName}.${targetLastName}@kin-keepers.ai`
            }
        };
        returnTwoVariables( argObject );
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
        const directional = urlArray[6] || req.headers.directional || "1";

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
   
        const queryString = `MATCH (s:Person {email: $sEmail })-[r]-(t:Person {email: $tEmail})
        DELETE r
        RETURN s, t`;

        const argObject = {
            res,
            conn,
            session,
            queryString,
            arg2: { sEmail: sourceEmail, tEmail: targetEmail }
        };
        returnTwoVariables( argObject );
    },

    /** */ 
    async deleteOneMember( req, res ){
        if ( req.method=='POST' ){
            console.log('This is a POST:\nUser should be logged in and priviledged');
        }

        const conn = neo4j.driver( uri, auth );
        const session = conn.session();

        let url = decodeURI(req.url);
        url = `.${url}`;
        const urlArray =  url.split('/');
        const email = urlArray[3] || req.headers.email;
        let returnValue = null;
        try {
            const result = await session.run(
                `MATCH ( s:Person {email: "${email}"} ) DETACH DELETE s RETURN s`
            )        
            const singleRecord = result.records[0]
            const node = singleRecord.get(0)
        
            returnValue = node.properties;

            console.log(node.properties.name)
            res.writeHead( 200, {'Content-Type':'application/json'})
            res.end(JSON.stringify(node.properties));
        }
        catch( dbError){
            console.error( dbError )
            res.writeHead( 500, {'Content-Type':'text/plain'})
            res.end('Possible trouble executing API');            
        }
        finally {
            await session.close()
            await conn.close()          
        }
        return returnValue;
    },

    /** */
    async deleteAllMembers( req, res ){
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

        if ( req.method=='POST' ){
            console.log('This is a POST:\nUser should be logged in and priviledged');
        }

        const conn = neo4j.driver( uri, auth )
        const session = conn.session();

        let url = decodeURI(req.url)
        url = `.${url}`;

        const urlArray =  url.split('/') 
        
        const memberEmail = urlArray[3] || req.headers.targetemail;
        const propertyName = urlArray[4] || req.headers.propertyname;
        const propertyValue = urlArray[5] || req.headers.propertyvalue;

        const queryString = `
        MATCH (p {email: '${memberEmail}'} )
        SET p.${propertyName} = '${propertyValue}'
        RETURN p
        `  
        const argObject = {
            res,
            conn,
            session,
            queryString
        };
        returnOneVariable( argObject );
    },

    /** */  
    async myGrandchildren( req, res ){
         const prohibitedMethod = req.method !== 'GET' ? true : false;
        if ( prohibitedMethod ){
            res.writeHead( 500, {'Content-Type': 'text/plain'} );
            res.end('Forbidden or Malformed request.');            
        }

        const conn = neo4j.driver( uri, auth )
        const session = conn.session();

        let url = decodeURI(req.url)
        url = `.${url}`;

        const urlArray =  url.split('/') 
        const email = urlArray[3] || req.headers['email']

        const queryString = `MATCH (p {email: '${email}'})-[:IS_PARENT_OF]->(c)
        MATCH (c)-[:IS_PARENT_OF]->(g)
        RETURN g`;
        const argObject = {
            res,
            conn,
            session,
            queryString           
        }
        returnOneVariableArray( argObject );
    },

    /** */
    async myGranddaughters( req, res ){
        const prohibitedMethod = req.method !== 'GET' ? true : false;
        if ( prohibitedMethod ){
            res.writeHead( 500, {'Content-Type': 'text/plain'} );
            res.end('Forbidden or Malformed request.');            
        }

        const conn = neo4j.driver( uri, auth )
        const session = conn.session();

        let url = decodeURI(req.url)
        url = `.${url}`;

        const urlArray =  url.split('/') 
        const email = urlArray[3] || req.headers['email']

        const queryString = `MATCH (p {email: '${email}'})-[:IS_PARENT_OF]->(c)
        MATCH (c)-[:IS_PARENT_OF]->(g)
        WHERE g.sex = 'f'
        RETURN g`;

        const argObject = {
            res,
            conn,
            session,
            queryString           
        }
        returnOneVariableArray( argObject );
    },

    /** */ 
    async myGrandsons( req, res ){
        const prohibitedMethod = req.method !== 'GET' ? true : false;
        if ( prohibitedMethod ){
            res.writeHead( 500, {'Content-Type': 'text/plain'} );
            res.end('Forbidden or Malformed request.');            
        }

        const conn = neo4j.driver( uri, auth )
        const session = conn.session();

        let url = decodeURI(req.url)
        url = `.${url}`;

        const urlArray =  url.split('/') 
        const email = urlArray[3] || req.headers['email']

        const queryString = `MATCH (p {email: '${email}'})-[:IS_PARENT_OF]->(c)
        MATCH (c)-[:IS_PARENT_OF]->(g)
        WHERE g.sex = 'm'
        RETURN g`;

        const argObject = {
            res,
            conn,
            session,
            queryString           
        }
        returnOneVariableArray( argObject );
    },

    /** */
    async myChildren( req, res){
        const prohibitedMethod = req.method !== 'GET' ? true : false;
        if ( prohibitedMethod ){
            res.writeHead( 500, {'Content-Type': 'text/plain'} );
            res.end('Forbidden or Malformed request.');            
        }

        const conn = neo4j.driver( uri, auth )
        const session = conn.session();

        let url = decodeURI(req.url)
        url = `.${url}`;

        const urlArray =  url.split('/') 
        const email = urlArray[3] || req.headers['email']

        const queryString = `MATCH (p {email: '${email}'})-[:IS_PARENT_OF]->(c)
        RETURN c`;

        const argObject = {
            res,
            conn,
            session,
            queryString           
        }
        returnOneVariableArray( argObject );
    },

    /** */ 
    async mySons( req, res ){
        const prohibitedMethod = req.method !== 'GET' ? true : false;
        if ( prohibitedMethod ){
            res.writeHead( 500, {'Content-Type': 'text/plain'} );
            res.end('Forbidden or Malformed request.');            
        }

        const conn = neo4j.driver( uri, auth )
        const session = conn.session();

        let url = decodeURI(req.url)
        url = `.${url}`;

        const urlArray =  url.split('/') 
        const email = urlArray[3] || req.headers['email']

        const queryString = `MATCH (p {email: '${email}'})-[:IS_PARENT_OF]->(c)
        WHERE c.sex = 'm'
        RETURN c`;

        const argObject = {
            res,
            conn,
            session,
            queryString           
        }
        returnOneVariableArray( argObject );
    },

    /** */ 
    async myDaughters( req, res ){
        const prohibitedMethod = req.method !== 'GET' ? true : false;
        if ( prohibitedMethod ){
            res.writeHead( 500, {'Content-Type': 'text/plain'} );
            res.end('Forbidden or Malformed request.');            
        }

        const conn = neo4j.driver( uri, auth )
        const session = conn.session();

        let url = decodeURI(req.url)
        url = `.${url}`;

        const urlArray =  url.split('/') 
        const email = urlArray[3] || req.headers['email']

        const queryString = `MATCH (p {email: '${email}'})-[:IS_PARENT_OF]->(c)
        WHERE c.sex = 'f'
        RETURN c`;

        const argObject = {
            res,
            conn,
            session,
            queryString           
        }
        returnOneVariableArray( argObject );
    },

    /** */
    async myGrandparents( req, res ){
        const prohibitedMethod = req.method !== 'GET' ? true : false;
        if ( prohibitedMethod ){
            res.writeHead( 500, {'Content-Type': 'text/plain'} );
            res.end('Forbidden or Malformed request.');            
        }

        const conn = neo4j.driver( uri, auth )
        const session = conn.session();

        let url = decodeURI(req.url)
        url = `.${url}`;

        const urlArray =  url.split('/') 
        const email = urlArray[3] || req.headers['email']

        const queryString = `MATCH (p)-[:IS_PARENT_OF]->(m {email: '${email}'})
        MATCH (pp)-[:IS_PARENT_OF]->(p)
        RETURN pp`;
        const argObject = {
            res,
            conn,
            session,
            queryString           
        }
        returnOneVariableArray( argObject );
    },

    /** */
    async possibleGrandchildren( req, res ){
        const prohibitedMethod = req.method !== 'GET' ? true : false;
        if ( prohibitedMethod ){
            res.writeHead( 500, {'Content-Type': 'text/plain'} );
            res.end('Forbidden or Malformed request.');            
        }

        const conn = neo4j.driver( uri, auth )
        const session = conn.session();

        let url = decodeURI(req.url)
        url = `.${url}`;

        const urlArray =  url.split('/') 
        const email = urlArray[3] || req.headers['email']

        const queryString = `MATCH (p {email: '${email}'})-[:IS_SPOUSE_OF]-(s)
        MATCH (s)-[:IS_PARENT_OF]->(c)
        MATCH (c)-[:IS_PARENT_OF]->(g)
        RETURN g`;
        const argObject = {
            res,
            conn,
            session,
            queryString,                      
        }
        returnOneVariableArray( argObject ); 
    },

    /** */  
    async possibleGrandparents( req, res ){  
        const prohibitedMethod = req.method !== 'GET' ? true : false;
        if ( prohibitedMethod ){
            res.writeHead( 500, {'Content-Type': 'text/plain'} );
            res.end('Forbidden or Malformed request.');            
        }

        const conn = neo4j.driver( uri, auth )
        const session = conn.session();

        let url = decodeURI(req.url)
        url = `.${url}`;

        const urlArray =  url.split('/') 
        const email = urlArray[3] || req.headers['email']

        const queryString = `MATCH (p)-[:IS_PARENT_OF]->(m {email: '${email}'})
        MATCH (gp)-[:IS_PARENT_OF]->(p)
        MATCH (gp)-[:IS_SPOUSE_OF]-(q)
        RETURN q`;
        const argObject = {
            res,
            conn,
            session,
            queryString           
        }
        returnOneVariableArray( argObject );        
    },

    /** */  
    async returnOneVariable( req, res ){
        console.log( req.headers.cypherquery);
        const prohibitedMethod = req.method !== 'GET' ? true : false;
        if ( prohibitedMethod ){
            res.writeHead( 500, {'Content-Type': 'text/plain'} );
            res.end('Forbidden or Malformed request.');            
        }

        const conn = neo4j.driver( uri, auth )
        const session = conn.session();

        let url = decodeURI(req.url)
        url = `.${url}`;

        const urlArray =  url.split('/') 
        const queryString = urlArray[3] || req.headers['cypherquery'] || "MATCH (f:Foobar) RETURN f";
        const jsonArgs = urlArray[4] || req.headers['jsonargs'] || "{}";
        
        console.log( req.headers['jsonargs'] );

        const queryOk = forbiddenWords.every( word => queryString.toUpperCase().indexOf(word) == -1 ) 
        if  ( queryOk ) {
            const argObject = {
                res,
                conn,
                session,
                queryString,
                arg2: JSON.parse(jsonArgs)
            }
            returnOneVariableArray( argObject ); 
        }
        else {
            res.writeHead( 500, {'Content-Type': 'text/plain'} );
            res.end('Forbidden or Malformed request.');
        }
    }
};// END of module
