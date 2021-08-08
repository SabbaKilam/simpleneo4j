const fs = require('fs');
require( 'dotenv' ).config();

const uri = process.env.DB_URI;
const user = process.env.DB_USER;
const password = process.env.DB_PSWD;

const neo4j = require( 'neo4j-driver' )
const auth = neo4j.auth.basic( user, password )


module.exports = {
    /** */
    async tryNeo(name){
        const conn = neo4j.driver( uri, auth )
        const session = conn.session()
        const personName = name
        
        try {
            const result = await session.run(
            'MERGE (a:Person {name: $name}) RETURN a',
            { name: personName }
            )        
            const singleRecord = result.records[0]
            const node = singleRecord.get(0)
        
            console.log(node.properties.name)
        }
        catch( dbError){
            console.error( dbError )
        }
        finally {
            await session.close()
            await conn.close()          
        }
    },

};// END of module