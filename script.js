/*
  m = MODEL: Object where app data is kept
  v = VIEW: Object that holds references to HTML elements with IDs.
  c = CONTROLLER: Object with functions (methods) that mediate between the MODEL and the VIEW.
  In our case, all CONTROLLER funtions are "event  handlers".
  
  In addition, there is one more object that is not part of the MVC
  architecture:
  h = HELPER: Object that holds all functions that are not event handlers
  Note:
    Restore default family database with this key combination:
    Shift + Alt + arrowUp  ( in any order )

*/
////////////////////////////////////
///////| data and references: |/////
////////////////////////////////////
let m = { // the MODEL object
  username: "",
  menuOpen: false,
  loginActive: false,
  eventsArray: [ {}, {}, {} ], /* looking for Shift + Alt + arrowUp for eo.code */ 
  
  //////////| AbdulmallikFamily |/////////////////
  abdulmalikFamily: [
    ["Abbas","Abdulmalik"],
    ["Linda","Melendez"],
    ["Sharif","Abdulmalik"],
    ["Lucy", "Pistilli"],
    ["Anwar","Abdulmalik"],
    ["Aylan","Malik"],    
  ],  
  abdulmalikParentChild: [
    ["Abbas.Abdulmalik", "Sharif.Abdulmalik"],
    ["Abbas.Abdulmalik", "Anwar.Abdulmalik"],
    ["Linda.Melendez", "Sharif.Abdulmalik"],
    ["Linda.Melendez", "Anwar.Abdulmalik"],
    ["Sharif.Abdulmalik", "Aylan.Malik"],
    ["Lucy.Pistilli", "Aylan.Malik"],
  ],
  abdulmalikSpouses:[
    ["Abbas.Abdulmalik","Linda.Melendez"],
    ["Sharif.Abdulmalik","Lucy.Pistilli"],
  ],

  /////////////| BurnsPoller Family |/////////
  burnsPollerFamily: [
    ["Peter", "Burns"],
    ["Sarah", "Burns"],
    ["Tom", "Burns"],
    ["Helen", "Burns"],
    ["Kurt", "Poller"],
    ["Julie", "Poller"],
    ["Billy", "Poller"],
    ["Natalie", "Poller"],
    ["Mark", "Poller"],
    ["Alice", "Poller"],
    ["Victoria", "Poller"],
    ["Frank", "West"],
    ["Josephine", "West"],
    ["Samuel", "Adams"],
    ["Richard", "Boomsma"],    
  ],
  burnsPollerParentChild: [
    ["Julie.Poller", "Natalie.Poller"],
    ["Julie.Poller", "Billy.Poller"],
    ["Kurt.Poller", "Natalie.Poller"],
    ["Kurt.Poller", "Billy.Poller"],
    ["Peter.Burns", "Victoria.Poller"],
    ["Peter.Burns", "Tom.Burns"],
    ["Sarah.Burns", "Victoria.Poller"],
    ["Sarah.Burns", "Tom.Burns"],
    ["Victoria.Poller", "Mark.Poller"],
    ["Victoria.Poller", "Alice.Poller"],    
    ["Billy.Poller", "Mark.Poller"],
    ["Billy.Poller", "Alice.Poller"],
    ["Frank.West", "Julie.Poller"],
    ["Josephine.West", "Julie.Poller"],        
  ],
  burnsPollerSpouses: [
    ["Peter.Burns", "Sarah.Burns"],
    ["Frank.West", "Josephine.West"],
    ["Kurt.Poller", "Julie.Poller"],
    ["Tom.Burns", "Helen.Burns"],    
  ],  
  burnsPollerFriends: [
    ["Sarah.Burns", "Samuel.Adams"],
    ["Sarah.Burns", "Richard.Boomsma"],  
  ],

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
  async reloadAbdulmalikFamily(){
    h.batchDeleteOneMember( m.abdulmalikFamily );
    await h.pause(0.5);
    h.createMembersFromCsv( 'AbdulmalikFamily.csv' );
    await h.pause(1.5);    
    h.batchParentChild( m.abdulmalikParentChild );
    await h.pause(0.5);    
    h.batchCreateSpouse( m.abdulmalikSpouses );
  },

  /** */ 
  async reloadBurnsPollerFamily(){
    h.batchDeleteOneMember( m.burnsPollerFamily );
    await h.pause(0.5);
    h.createMembersFromCsv( 'BurnsPollerFamily.csv' );
    await h.pause(1.5);    
    h.batchParentChild( m.burnsPollerParentChild );
    await h.pause(0.5);    
    h.batchCreateSpouse( m.burnsPollerSpouses );
    await h.pause(0.5); 
    h.batchCreateFriend( m.burnsPollerFriends );
  },

  /** */ 
  async createSpouse( [spouse1, spouse2] ){
    const parameters = {
      method: 'POST',
      headers: {
        sourceemail: `${spouse1}@kin-keepers.ai`,
        relationship: 'IS_SPOUSE_OF',
        targetemail: `${spouse2}@kin-keepers.ai`,
        directional: '0'
      }
    };
    try{
      const result = await fetch('./api/createRelationshipAB', parameters)
        .then( response => {
          if ( response.status > 299 ){ throw new Error(`Trouble creating spouse: ${response.status}` )}
          return response.text();
        });
      console.log(`Server response to creating spouse:\n${result}`);
    }
    catch(error){
      console.log(error);
    }
  },

  /** */ 
  async batchCreateSpouse( arrayOfArrays ){
    for await (let array of arrayOfArrays){
      h.createSpouse( array );
    }    
  },

  /** */
  async createMembersFromCsv( csvFile = 'BurnsPollerFamily.csv' ){
    let membersCSV = await fetch( `./assets/${csvFile}` )
        .then( response => response.text());
    let arrayMembers = membersCSV.split(`\n`);
    let headings = arrayMembers.splice(0,1);
    headings = String(headings);
    console.log( `headings: ${headings}`);
    console.log( `typeof headings: ${typeof headings}`)
    let count = headings.split(',').length;
    let arrayOfArrays = [];
    for ( let member of arrayMembers ){
      member = member.replace(/\//g, '-'); // replace all slashes with hyphens     
      let memberArray = member.split(`,`);
      memberArray.splice( count-1, 1 ); // remove email
      memberArray.splice( 2, 1 ); // remove name      
      arrayOfArrays.push( memberArray );
    }
    console.log( arrayOfArrays );

    for await (array of arrayOfArrays){
      let parameters = {
        firstname: array[0],
        lastname: array[1],
        dob: array[2],
        sex: array[3],
      };
      h.createMember( parameters );
    }
  },

  /** */  
  async createMember( {firstname, lastname, dob, sex} ){
      const parameters = {
      method: 'POST',
      headers: {
        firstname,
        lastname,
        dob,
        sex,
      }
    };
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
  async batchParentChild( parentChildArray =[ ["Linda.Melendez", "Sharif.Abdulmalik"], ["Sharif.Abdulmalik", "Aylan.Malik"] ] ){
    for await ( let parentChild of parentChildArray){
      h.createParentChild( parentChild );
    }
  },

  /** */ 
  async createParentChild( [parent, child] ){
    const parameters = {
      method: 'POST',
      headers: {
        sourceemail: `${parent}@kin-keepers.ai`,
        relationship: 'IS_PARENT_OF',
        targetemail: `${child}@kin-keepers.ai`,
        directional: '1'
      }
    };
    try{
      const result = await fetch('./api/createRelationshipAB', parameters)
        .then( response => {
          if ( response.status > 299 ){ throw new Error(`Trouble creating parent child: ${response.status}` )}
          return response.text();
        });
      console.log(`Server response to creating parent child:\n${result}`);
    }
    catch(error){
      console.log(error);
    }
  },

  /** */ 
  async batchCreateFriend( arrayOfArrays ){
    for await (let array of arrayOfArrays){
      h.createFriend( array );
    } 
  },

  /** */ 
  async createFriend( [friend1, friend2] ){
    const parameters = {
      method: 'POST',
      headers: {
        sourceemail: `${friend1}@kin-keepers.ai`,
        relationship: 'IS_FRIEND_OF',
        targetemail: `${friend2}@kin-keepers.ai`,
        directional: '0'
      }
    };
    try{
      const result = await fetch('./api/createRelationshipAB', parameters)
        .then( response => {
          if ( response.status > 299 ){ throw new Error(`Trouble creating friend: ${response.status}` )}
          return response.text();
        });
      console.log(`Server response to creating friend:\n${result}`);
    }
    catch(error){
      console.log(error);
    }    
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
    c.hideBigGraph();
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

  /** */
  async batchDeleteOneMember( arrayOfArrays ){
    for await (let array of arrayOfArrays){
      h.deleteOneMember( array );
      h.pause(0.75);
    }
  },

  /** */  
  async deleteOneMember( [firstname, lastname] ){
    const parameters = {
      method: 'POST',
      headers: {
        email: `${firstname}.${lastname}@kin-keepers.ai`
      }
    };
    try{
      let result = await fetch( "./api/deleteOneMember", parameters )
        .then( response => response.text() );
      console.log( result );
      return result;
    }
    catch(error){
      console.log( error );
      return error;     
    }     
  },

  /** */
  async deleteAll(){
    try{
      let result = await fetch( "./api/deleteAllMembers", {method: "POST"} )
        .then( response => response.text() );
      alert( result );
    }
    catch(error){
      alert(`Error\n${error}`)
    }      
  },

  /** */ 
  async pause( sec ){
    return new Promise( (yea, nay)=>{
      self.setTimeout( yea, 1000*sec, `${sec} second${parseFloat(sec) == 1.0 ? '' : 's' }` );
    });
  },

  /** */ 
  async getApiOptions(){ 
    try{
      const result = await fetch('./api/').then( response => {
        if ( response.status > 299 ){ throw new Error(`Trouble creating new member: ${response.status}` )}
        return response.text();
      })
      return result;
    }
    catch(error){
      console.log(error);
    }
  },

  /** */ 
  async showApiOptions(){
    v.apiSelector.innerHTML = '';

    let option = document.createElement('option');
    option.innerText = 'API OPTIONS';
    v.apiSelector.appendChild(option);

    let apiOptions = await h.getApiOptions();
    let apiOptionsArray = apiOptions.split('\n');
    for (let apiOption of apiOptionsArray){
      let option = document.createElement('option');
      option.innerText = apiOption;
      v.apiSelector.appendChild(option);
    }
  },

  /** */ 
  async beautifyResult( result=[{"lastName": "Smith", "firstName": "John"}]){
    console.log(result);
    const resultDiv = document.createElement(`div`);
    resultDiv.style.position = "absolute";
    resultDiv.style.top = "10%";    
    resultDiv.style.height = "100%";
    resultDiv.style.width ="100%";    
    JSON.parse(result).forEach( member =>{
      let circle = document.createElement(`div`);
      circle.style.display ="inline-block";
      circle.style.placeContent ="center";      
      circle.style.height = "4.5rem";
      circle.style.width ="5.75rem";
      circle.style.border ="1px solid white";
      circle.style.borderRadius ="50%";
      circle.style.margin ="1rem";
      circle.style.paddingTop ="1.25rem";           
      circle.style.color ="white";
      circle.style.backgroundColor ="teal"; 

      circle.innerText = `${member.firstName}\n${member.lastName}`
      resultDiv.appendChild( circle );
    });
    return resultDiv;
  },

  /** */  
  async getAge( firstname="Peter", lastname="Burns" ) {
    
    let apiString = `./api/getMember/${firstname}.${lastname}@kin-keepers.ai`;
    let result;
    try{
      result = await fetch( apiString ).then( response => {
        if ( response.status > 299 ){ throw new Error(`Trouble with API request: ${response.status}` )}
        return response.text();        
      })
    }
    catch(error){
      console.log(`Error getting age\n${error}`);
    }    
    let DOB = JSON.parse( result )["DOB"].split("-");
    let ageObject = { year: DOB.pop(), day: DOB.pop(), month: DOB.pop()}
    let day = ageObject.day.length == 2 ? 
        ageObject.day 
      : "0" + ageObject.day;
    let month = ageObject.month.length == 2 ?
        ageObject.month
      : "0" + ageObject.month;
    let dateString = `${ageObject.year}-${month}-${day}`;
    //source:https://stackoverflow.com/questions/4060004/calculate-age-given-the-birth-date-in-the-format-yyyymmdd/7091965#7091965
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = parseInt(today.getFullYear(), 10) - parseInt(birthDate.getFullYear(), 10);
   
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
   /*if ( today.getMonth() < birthDate.getMonth() ){ --age; }*/
    console.log( "age?: ", age );
    return age;
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
      v.singleDOB.value.trim(),
      v.singleSex.value.trim()
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
    const keyCode = eo.keyCode || eo.code;
    const enter = 13;
    if (keyCode != enter && keyCode != 'Enter'){ return; }
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
      if ( result === true ){ 
        v.loginCover.style.visibility = "hidden";
        m.loginActive = false;
      }
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
    if( ! m.loginActive ){
      m.menuOpen = !m.menuOpen;
      if ( m.menuOpen ){ h.rotateMenuOpen() }
      else { h.rotateMenuClosed() }
    }
  },
  /** */
  chooseInputForm( eo ){
    let nonForms = ["separator", "clearData", "logout"];
    let possibleForm = eo.target.dataset['menu']
    if ( possibleForm ){
      if ( nonForms.includes( possibleForm ) ){ 
        handleNonForms( possibleForm );
      }
      else{
        h.showDbForm(v[possibleForm]);
        m.menuOpen = false;
        h.rotateMenuClosed();
      }      
    }
    /////| internal helpers |//////
    function handleNonForms( possibleForm ){
      let nonForms = ["separator", "clearData", "logout"];
      if( possibleForm === 'separator'){
        return;
      }
      if( possibleForm === 'logout'){

        /*
        v.loginCover.css(`
          visibility: visible;
        `);
        m.loginActive = true;
        */
      }
      if ( possibleForm == 'clearData'){
        let confirmed = confirm(`Are you sure it's OK to CLEAR the Database??\n    ( Otherwise, Cancel! )`);
        if ( confirmed ){
          c.deleteAllMembers();  
        }
        else {
          v.clearDataSpan.blur();
          return; 
        }        
      }
      m.menuOpen = false;
      h.rotateMenuClosed();        
      return;      
    }
  },

  /** */
  async deleteAllMembers( eo ){
    try{
      const result = await fetch('./api/deleteAllMembers', {method: 'POST'} ).then( response => {
        if ( response.status > 299 ){ throw new Error(`Trouble deleting all members: ${response.status}` )}
        return response.text();
      });
      console.log(`Server response to deleteAllMembers:\n${result}`);
    }
    catch(error){
      console.log(`Error response to deleteAllMembers:\n${error}`);
    }   
  },

  /** */
  async callApi( eo ){
    if ( v.apiSelector.selectedIndex === 0){ return; }

    //construct API string:
    let apiOption = v.apiSelector.value.trim();
    let apiParameters = v.apiInput.value.trim();
    let apiString = `./api/${apiOption}/${apiParameters}`;
    try{
      const result = await fetch( apiString ).then( response => {
        if ( response.status > 299 ){ throw new Error(`Trouble with API request: ${response.status}` )}
        return response.text();
        /*return response.json();*/
        
      })
      console.log( result );
      
      /*v.apiResults.innerText = result;*/
      v.apiResults.innerHTML = ``;
      let preParse = JSON.parse( result );
      let jstring = JSON.stringify( [preParse].flat() );
      v.apiResults.appendChild( await h.beautifyResult( jstring ) );
      v.popupDiv.css(`
        opacity: 1;
        visibility: visible;
      `);
      return result;
    }
    catch(error){
      console.log(error);
      v.apiResults.innerText = error;
      v.popupDiv.css(`
        opacity: 1;
        visibility: visible;
      `);      
    }
  },

  /** */
  restoreDefaultFamily( eo ){
    m.eventsArray.shift();
    m.eventsArray.push( eo );
    let eventTypesArray = m.eventsArray.map( eo => eo.key );
    let properKeyCombo = eventTypesArray.includes("Shift")
      && eventTypesArray.includes("ArrowUp")
      && eventTypesArray.includes("Alt")
    if ( properKeyCombo ){
      m.eventsArray = [{},{},{}]; // clear keystrokes
      h.reloadBurnsPollerFamily();
    }
  }
  
};//////| END of c Controller Event Handlers |/////

////////////////////////////////////
/////////| initialization: |////////
////////////////////////////////////
h.IDsToView( m.IDs, v );
if ( self.location.protocol == "http:" ) {
  self.location.assign(`https://${location.host}`)
}


if ( m.loginActive ){
  v.loginCover.style.visibility = "visible";  
}
else{
  v.loginCover.style.visibility = "hidden";
}

v.passwordInput.focus();

v.createMemberBox.css(`
  visibility: visible;
`);

h.showApiOptions();

////////////////////////////////////////////
//////| Custom Query to ping the DB |///////
////////////////////////////////////////////
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
/////| Create query arguments |/////
var URL = "https://kin-keepers-neo4j.herokuapp.com/api/returnOneVariable";
var cypherquery = "MATCH (p) WHERE p.lastName = $param1  RETURN p"; 
var jsonargs = JSON.stringify({param1: "Burns"});
/////| run Custom Query |////
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
/*v.btnShowBigGraph.on('click', c.showBigGraph);*/
v.btnShowBigGraph.on('click', async eo => {
  v.apiSelector.selectedIndex = 1;
  c.callApi( eo );
});

v.passwordInput.on( 'keydown', c.login);
v.overlay.on('click', c.hideBigGraph);
v.menuCover.on('click', c.toggleMenu);
v.menu.on( 'click', eo => {
  if ( eo.target.id === 'menu'){
    m.menuOpen = false;
    h.rotateMenuClosed();
  }
});
v.menuTable.on('click', c.chooseInputForm);

v.btnApi.on( 'click', c.callApi );
v.apiInput.on( 'keyup', eo =>{
  let keyCode = eo.keyCode || eo.code;
  let enterKey = 13;
  if ( keyCode != enterKey && keyCode != 'Enter'){ return }
  c.callApi( eo );
});

self.addEventListener('resize', h.adjustMenuPage);
self.addEventListener('orientationchange', h.adjustMenuPage);
self.addEventListener('DOMContentLoaded', h.adjustMenuPage);
self.addEventListener('keydown', c.restoreDefaultFamily );

v.btnPopup.on( 'click', eo => {
  v.popupDiv.css(`
    opacity:0;
    visibility: hidden
  `);
});
