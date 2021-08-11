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
  .map( element => element.id )
  .sort(),

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
    if (v.relationshipNewPair.selectedIndex == 0){
      console.log("You need to select a relationship");
      return;
    }
    const parameters = {
      method: 'POST',
      headers: {
        sourcename: `${v.sFirstName.value.trim()}.${v.sLastName.value.trim()}`,
        targetname: `${v.tFirstName.value.trim()}.${v.tLastName.value.trim()}`,
        relationship: v.relationshipNewPair.value.trim().toUpperCase()
      }
    }
    try{
        console.log(parameters)
        //const result = await fetch(`./api/createPair/${JSON.stringify(sourcename)}/${v.relationship.value.trim().toUpperCase()}/${JSON.stringify(targetname)}`, parameters ).then( response =>{
        const result = await fetch('./api/createPair', parameters ).then( response =>{
        console.log(`response.status: ${response.status}`);
        return response.json();
      });
      console.log(result);
    }
    catch(error){
      console.log(`createPair Error:\n${error}`)
    }
  },
  /** */
  async relateNewMember( eo ){
    if (v.relationshipNewMember.selectedIndex == 0){
      console.log("You need to select a relationship");
      return
    }
    const parameters = {
      method: 'POST',
      headers: {
        relationship: v.relationshipNewMember.value.trim(),
        memberemail: v.currentMemberEmail.value.trim(),
        firstname: v.newFirstName.value.trim(),
        lastname: v.newLastName.value.trim(),
      }
    }
    console.log(`sent parameters:\n${JSON.stringify(parameters)}\n`);    
    try{
      const result = await fetch('./api/newMemberRelationship', parameters)
      .then( response =>{
        if( response.status > 299 ) { throw new Error(`relateNewMember had trouble: ${response.status}`)}
        return response.text();
      });
      console.log( result)
    }
    catch(error){
      console.log(error);
    }

  },
  /** */
  showBigGraph( eo ){
    v.overlay.style.visibility = "visible";
    v.overlay.style.opacity = "1";    
  },
  /** */
  hideBigGraph( eo ){
    v.overlay.style.visibility = "hidden";
    v.overlay.style.opacity = "0";    
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
v.btnRelateNewMember.on('click', c.relateNewMember);
v.familyGraph.on('click', c.showBigGraph);
v.overlay.on('click', c.hideBigGraph);