/*
  m = MODEL: Object where app data is kept
  v = VIEW: Object that holds references to HTML elements with IDs.
  c = CONTROLLER: Object with functions (methods) that mediate between the MODEL and the VIEW.
  In our case, all CONTROLLER funtions are "event  handlers".
  
  In addition, there is one more object that is not part of the MVC
  architecture:
  h = HELPER: Object that holds all functions that are not event handlers
*/
////////////////////////////////////
///////| data and references: |/////

//const { connectivityVerifier } = require("neo4j-driver-core/types/internal");



////////////////////////////////////
let m = { // the MODEL object
  username: "",
  
  IDs: Array.from( document.getElementsByTagName('*') )
  .filter( element => !!element.id )
  .map( element => element.id ),

};
const v = {}; // the VIEW object

////////////////////////////////////
//| define helper functions: |////
////////////////////////////////////
const h = { // the HELPER object
  IDsToView( IDs, view ){
    IDs.forEach( id => {
      view[id] = document.getElementById(id);
      view[id].on = view[id].addEventListener;
    });
	IDs.forEach( id => console.log(id) );
  },
};

/////////////////////////////////////
//| define handler functions: |///
/////////////////////////////////////
const c = { // the CONTROLLER object
  /**/
  async createPair( eo ){
    const sourceName = {
      lastName: v.sLastName.value.trim(),
      firstName: v.sFirstName.value.trim(),
    }; 
    const  targetName = {
      lastName: v.tLastName.value.trim(),
      firstName: v.tFirstName.value.trim(),
    };   
    const parameters = {
      method: 'POST',
      headers: {
        jsonSourceName: JSON.stringify(sourceName),
        jsonTargetName: JSON.stringify(targetName),
        relationship: v.relationship.value.trim().toUpperCase()
      }
    }
    console.log(parameters)
    const result = await fetch('./api/createPair', parameters ).then( r=>r.text() );
    console.log(result);
  }
};

////////////////////////////////////
/////////| initialization: |////////
////////////////////////////////////
h.IDsToView( m.IDs, v );


////////////////////////////////////
//////| establish listeners: |/////
////////////////////////////////////
v.btnCreatePair.on('click', c.createPair);