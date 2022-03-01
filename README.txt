Attempt an as-simple-as-possible api for the family circle graph database.

An Expanding list of database methods in module api_methods.js:
    tryNeo
    getMember 
    getAllMembers or allMembers
    createPair (has a front end button)
    newMemberRelationship (has a front end button)
    createRelationshipAB
    dropAllRelationshipsAB
    deleteAllMembers
    addProperty (has a front end button)
    createMember (has a front end button)
    createRelationship (has a front end button)
    added:
    myGrandchildren
    myGrandsons
    myGranddaughters
    myChildren 
    mySons 
    myDaughters
    myGrandparents
    possibleGrandchildren
    possibleGrandparents
    returnOneVariable
    
    ----------Breakdown of Relationships----------
    MARRIED
        Tom Burns, Sarah Burns
        Frank West, Josephine West
        Kurt Poller, Julie Poller
        Tom Burns, Helen Burns

    PARENT of
        Juile Poller: Natalie Poller, Billy Poller
        Kurt Poller: Natalie Poller, Billy Poller

        Peter Burns: Victoria Poller, Tom Burns
        Sarah Burns: Victoria Poller, Tom Burns

        Victoria Poller: Mark Poller, Alice Poller
        Billy Poller: Mark Poller, Alice Poller
  
        FRIEND
            Sarah Burns: Samuel Adams, Richard Boomsma

///////////| Readying the app for VC testing |////////////
Responses to all GET requests should be modified to work only for
members who are logged in (verified in the database), and only for
data from their family (memebers with famIDs that match the logged-in user) .

Responses to all requests that add, remove or modify data (POST, PUT, DELETE)
should have the smae aforementioned requirements with the crucial 
addition requirement that the user is the primary care giver (verified
in the database).
