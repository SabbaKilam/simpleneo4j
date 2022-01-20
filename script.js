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
////////////////////////////////////
let m = { // the MODEL object
  username: "",
  menuOpen: false,
  
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
  /** */
  IDsToView( IDs, view ){
    IDs.forEach( id => {
      view[id] = document.getElementById(id);
      view[id].on = view[id].addEventListener;
      view[id].css = css.bind( view[id] ); //see inner helper css below
    });
    ////| CSS helper /////
    function css( styles ){
      let propetyValuesArray = [];
			let cleanStyles = styles.replace( /\/\*.*\//g, `` );//delete multi-line comments		
			let stylesArray = cleanStyles.split(`;`);
			stylesArray.forEach( styleDeclaration => {
				let property_value = styleDeclaration.split(`:`);
				if ( property_value[0] && property_value[1] ){
					this.style[property_value[0].trim()] = property_value[1].trim();
          let propertyValue = `${property_value[0].trim()} : ${property_value[1].trim()}`;
          propetyValuesArray.push( propertyValue );    	
				}
			});
      return propetyValuesArray;
		}
    //////| show IDs |////
    IDs.forEach( id => console.log(id) );
    console.log(`(${IDs.length} id elements)`)
  },

  /** */ 
  adjustMenuPage(){
    if( self.innerWidth > self.innerHeight){
      v.menu.css(`
        width: 50vw;
      `);
    }
    else{
      v.menu.css(`
        width: 85vw;
      `);
    }
    ///////| move the left |/////
    if ( m.menuOpen ){
      v.menu.css(`
        top: 12%;                   
        bottom: 0;
      `);
    }
    else {
      v.menu.css(`    
        top: calc( -100vh - 5px );   
      `);
    }
  },

  /** */
  async createBurnsPollerFamily(){
    let burnsPollerCSV = await fetch( './assets/BurnsPollerFamily.csv')
        .then( response => response.text());
    let burnsPollerMembers = burnsPollerCSV.split(`\n`);
    alert( burnsPollerMembers);
    console.log( burnsPollerMembers);
    
  },

  /** */
  rotateMenuOpen(){
    v.topBun.css(`
      transform: rotateZ( 45deg );
    `);
    v.middleBurger.css(`
      transform: translateY( -50% ) rotateY( 90deg );
    `)
    v.bottomBun.css(`
      transform: rotateZ( -45deg );
    `);
    h.adjustMenuPage();
  },

  /** */
  rotateMenuClosed(){
    v.topBun.css(`
      transform: rotateZ(0deg);
    `);      
    v.middleBurger.css(`
      transform: translateY( -50% ) rotateY( 0deg );
    `);
    v.bottomBun.css(`
      transform: rotateZ( 0deg );
    `); 
    h.adjustMenuPage();     
  },

  /** */
  showDbForm( dbForm = v.createMemberBox ){
    console.log('form to show:', dbForm.id);
    let dbForms = document.querySelectorAll('.dbForm');
    Array.from(dbForms).forEach(form => {
      console.log(form.id);
      form.css(`
        visibility: hidden;
      `);
    });
    dbForm.css(`
      visibility: visible;
    `);
  },
};/////| END of h Helpers |///////

/////////////////////////////////////
//| define handler functions: |//////
/////////////////////////////////////
const c = { // the CONTROLLER object
  /**/
  async createPair( eo ){
    if (v.relationshipNewPair.selectedIndex == 0){
      console.log("You need to select a relationship");
      alert("You need to select a relationship");      
      return;
    }
    const names = [
      v.sFirstName.value.trim(),
      v.sLastName.value.trim(),
      v.tFirstName.value.trim(),
      v.tLastName.value.trim()
    ];
    if ( names.includes('') ){
      console.log(`createPair says: "No blank fields allowed"`);
      alert("No blank fields allowed");
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
        console.log(parameters);        
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
      alert("You need to select a relationship");      
      return;
    }
    const data = [
      v.currentMemberEmail.value.trim(),
      v.newFirstName.value.trim(),
      v.newLastName.value.trim()
    ];
    if ( data.includes('') ){
      console.log(`relateNewMember says: "No blank fields allowed"`);
      alert("No blank fields allowed");      
      return;
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
  async addProperty( eo ){
    const data = [
      v.emailAddProperty.value.trim(),
      v.txtNewPropertyName.value.trim(),
      v.txtNewPropertyValue.value.trim()
    ];
    if ( data.includes('') ){
      console.log(`addProperty says: "No blank fields allowed"`);
      alert("No blank fields allowed");      
      return;
    }
    const parameters = {
      method: 'POST',
      headers: {
        targetemail: v.emailAddProperty.value.trim(),
        propertyname: v.txtNewPropertyName.value.trim(),
        propertyvalue: v.txtNewPropertyValue.value.trim()
      }
    };
    try{
      const result = await fetch('./api/addProperty', parameters).then( response => {
        if ( response.status > 299 ){ throw new Error(`Trouble setting new property: ${response.status}` )}
        return response.text();
      });
      console.log(`Server response to addProperty:\n${result}`);
    }
    catch(error){
      console.log(error);
    }
  },

  /** */ 
  async createMember( eo ){
    const data = [
      v.singleNewFirstName.value.trim(),
      v.singleNewLastName.value.trim(),
    ];
    if ( data.includes('') ){
      console.log(`createMember says: "No blank fields allowed"`);
      alert("No blank fields allowed");      
      return;
    }
    const parameters = {
      method: 'POST',
      headers: {
        firstname: v.singleNewFirstName.value.trim(),
        lastname: v.singleNewLastName.value.trim(),
        dob: v.singleDOB.value.trim(),
        sex: v.singleSex.value.trim(),
      }
    };
    // clear fields after data is copied
    v.singleNewFirstName.value = '';
    v.singleNewLastName.value = '';
    v.singleDOB.value = '';
    v.singleSex.value = '';

    try{
      const result = await fetch('./api/createMember', parameters).then( response => {
        if ( response.status > 299 ){ throw new Error(`Trouble creating new member: ${response.status}` )}
        return response.text();
      });
      console.log(`Server response to createMember:\n${result}`);
    }
    catch(error){
      console.log(error);
    }    
  },

  /** */
  async createRelationship( eo ){
    
    if (v.selectRelationship.selectedIndex == 0){
      console.log("You need to select a relationship");
      alert("You need to select a relationship");      
      return;
    }
    const data = [
      (v.relationSourceEmail.value.trim()).indexOf('@'),
      (v.relationTargetEmail.value.trim()).indexOf('@'),
    ];
    if ( data.includes(0) ){
      console.log(`createMember says: "Need full email addresses"`);
      alert("Need full email addresses");      
      return;
    }
    const parameters = {
      method: 'POST',
      headers: {
        sourceemail: v.relationSourceEmail.value.trim(),
        relationship: v.selectRelationship.value.trim(),
        targetemail: v.relationTargetEmail.value.trim(),
        directional: v.directional.checked ? "1" : "0"
      }
    };
    try{
      const result = await fetch('./api/createRelationshipAB', parameters)
        .then( response => {
          if ( response.status > 299 ){ throw new Error(`Trouble creating relationship: ${response.status}` )}
          return response.text();
        });
      console.log(`Server response to createRelationship:\n${result}`);
    }
    catch(error){
      console.log(error);
    }    
  },

  /** */ 
  async login( eo ){
    //eo.preventDefault();
    const keyCode = eo.keyCode || eo.keyCode;
    const enter = 13;
    if (keyCode != enter){ return }
    const possiblePassword = v.passwordInput.value.trim();
    v.passwordInput.value = '';
    try{
      const parameters = {
        method: 'POST',
        headers: {
          password: possiblePassword
        }
      };
      const result = await fetch('./login', parameters).then( response => {
        if (response.status > 299){ throw new Error(`Password error: ${response.status}`)}
        return response.json();
      });
      if ( result === true ){ v.loginCover.style.visibility = "hidden" }
    }
    catch(error){
      console.log(`password error:\n${error}`)
    }
  },

  /** */
  showBigGraph( eo ){
    m.menuOpen = false;
    h.rotateMenuClosed()

    h.adjustMenuPage();
    v.overlay.style.visibility = "visible";
    v.overlay.style.opacity = "1";    
  },
  
  /** */
  hideBigGraph( eo ){
    v.overlay.style.visibility = "hidden";
    v.overlay.style.opacity = "0";    
  },
  /** */
  toggleMenu( eo ){
    m.menuOpen = !m.menuOpen;
    if ( m.menuOpen ){ h.rotateMenuOpen() }
    else { h.rotateMenuClosed() }
  }
  
};//////| END of c Handlers |/////

////////////////////////////////////
/////////| initialization: |////////
////////////////////////////////////
h.IDsToView( m.IDs, v );
if ( self.location.protocol == "http:" ) {
  self.location.assign(`https://${location.host}`)
}
v.passwordInput.focus();

v.createMemberBox.css(`
  visibility: visible;
`);



async function customQuery( URL, cypherquery, jsonargs ){ 
  const metadata = { 
    method: "GET", 
    headers: { 
      cypherquery,
      jsonargs
    }
  };
  try{
    const result = await fetch( URL, metadata ).then( response => {
      if (response.status > 299){
         throw Error("Custom query error: " + response.status)
      }      
      return response.json();      
    }); 
    return result;
  }
  catch(error){
    console.log(error)
  }
} 
var URL = "https://kin-keepers-neo4j.herokuapp.com/api/returnOneVariable";
var cypherquery = "MATCH (p) WHERE p.lastName = $param1  RETURN p"; 
var jsonargs = JSON.stringify({param1: "Burns"});
var result = customQuery(URL, cypherquery, jsonargs); //the request returns a promise
result.then(console.log); //view the result

////////////////////////////////////
//////| establish listeners: |/////
////////////////////////////////////
v.btnCreatePair.on('click', c.createPair);
v.btnRelateNewMember.on('click', c.relateNewMember);
v.btnAddProperty.on('click', c.addProperty);
v.btnCreateMember.on('click', c.createMember);
v.btnCreateRelationship.on('click', c.createRelationship);
v.btnShowBigGraph.on('click', c.showBigGraph);

v.passwordInput.on( 'keydown', c.login);
v.overlay.on('click', c.hideBigGraph);
v.menuCover.on('click', c.toggleMenu);

self.addEventListener('resize', h.adjustMenuPage);
self.addEventListener('orientationchange', h.adjustMenuPage);
self.addEventListener('DOMContentLoaded', h.adjustMenuPage);

v.menuTable.on( 'click', eo => {
  alert(eo.target.dataset['menu']);
});
