function populateField(url, fn){
	//url='http://localhost:8080/zyzySvc/JL/getJLs';
	//alert("srcSetup: " + emID + ", " + val);
    $.ajax({
        type: "GET",
        url: url,
        data: "",
        success: function(data) {
        	console.log(data);
        	if(data != null){
    		//json=JSON.parse(data);
    		//json.forEach(function(val){
    		data.forEach(e => fn(e));
        }
        },
		error : function(jqXHR, textStatus, errorThrown) {
			alert('error: ' + textStatus + errorThrown);
		}
    });
} 

function savePoint(fn) {
		url="http://localhost:8080/zyzySvc/JL/updatePoint";
	$.ajax({
		type : 'POST',
		async: false,
		url : url,
		//contentType: 'application/json',
		contentType : 'application/text',
		//contentType: 'text/plain',
		//dataType: "json",
		dataType : "text",
		//data : '{"cat": "test1", "val": ' + $('#srcNote').val() + '}',
		data : fn(),
		success : function(data, textStatus, jqXHR) {
			//$('#srcContent').val('note created successfully');
			//alert('... here');
            //window.location = window.location.href;
            //loadPage(srcId, srcSeq);
            //location.reload();
            //window.location = thisUrl;
		},
		error : function(jqXHR, textStatus, errorThrown) {
			alert('error: ' + textStatus + errorThrown);
		}
	})
}


function updateLabels() {
tempLabelPos=[];
lSize=lavelSize/canvas.clientWidth;
  const tempV = new THREE.Vector3();  // is it needed?
  
  camera.updateMatrixWorld(true, false);  //? 
 
 /////2021.06.09 
 //remove all the labels
$('#labels').empty();

// and then add the new ones 
isLblOverlap=false;
 ptsGroups.children.forEach((child, ndx) => {
	    //const isLast = ndx === lastNdx;
	    //dumpObject(child, lines, isLast, newPrefix);
	    //console.log(child.name);
    child.children.forEach((ch, ix) => {
	    console.log(ch.name + ':' + ch.position.x + ',' + ch.position.y  + ',' + ch.position.z);
//-------------
    ch.updateWorldMatrix(true, false);
    ch.getWorldPosition(tempV);
    //Projects this vector from world space into the camera's normalized device coordinate (NDC) space
    tempV.project(camera);

    // determine if it is between camera and the body model.
    raycaster.setFromCamera(tempV, camera);

    const intersectedObjects = raycaster.intersectObjects([ch, modelObj], true);
    // We're visible if the first intersection is this object.
    const show = intersectedObjects.length && ch === intersectedObjects[0].object;
 
 
const elem = document.createElement('div');
elem.id = ch.name;
//elem.textContent = sText;
//elem.innerHTML = '<a href="javascript:getPointDetail("textDivP", "' + sText + '");">'+sText+'</a>';
elem.innerHTML = '<a href="javascript:getPointDetail(\'textDivP\', \'' + ch.name + '\');">' +ch.name + '</a>';

        ch.updateWorldMatrix(true, false);
        ch.getWorldPosition(tempV);
        tempV.project(camera);

//if this one overlaps existing one, 
for (const e of tempLabelPos){
  	console.log(ch.name, Math.abs(e[0]-tempV.x), Math.abs(e[1]-tempV.y));

   	isLblOverlap=false;
   	if((Math.abs(e[0]-tempV.x) < lSize)&&(Math.abs(e[1]-tempV.y) < lSize)){
		console.log("skip");
		isLblOverlap=true;
   		break;
   	};
}
if(!isLblOverlap){ 
   	tempLabelPos.push([tempV.x, tempV.y]);
        const x = (tempV.x * .5 + .5) * canvas.clientWidth;
        const y = (tempV.y * -.5 + .5) * canvas.clientHeight;
    console.log('coord:', x, y);
//if this label overlap others, don't show
    
        elem.style.display = '';
        // get the note coordinate

        // move the elem to that position
        //elem.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
        elem.style.transform = `translate(${x}px,${y}px)`;
        //elem.style.transform = `translate(1%, 1%) translate(${x}px,${y}px)`;
	 
        // set the zIndex for sorting
        elem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;

labelContainer.appendChild(elem);
}
//--------------
	    
   });	 
});
  
/*  for (const label of labels) {
    const {elem, noteSph, ptSph } = label;
 
    // between camera and the point, is there anything blocking?
    // First, get the normalized screen coordinate of that position
    // x and y will be in the -1 to +1 range with x = -1 being
    // on the left and y = -1 being on the bottom
    
    ptSph.updateWorldMatrix(true, false);
    ptSph.getWorldPosition(tempV);
    //Projects this vector from world space into the camera's normalized device coordinate (NDC) space
    tempV.project(camera);

    // determine if it is between camera and the body model.
    raycaster.setFromCamera(tempV, camera);
    //let   ObjLst = new THREE.Object3D();
    //ObjLst.add(ptSph);
    //ObjLst.add(modelBody);
    const intersectedObjects = raycaster.intersectObjects([ptSph, modelObj], true);
    // We're visible if the first intersection is this object.
    const show = intersectedObjects.length && ptSph === intersectedObjects[0].object;
 
    if (!show|| Math.abs(tempV.z) > 1) {  // ? ... seems alwats < 1
        elem.style.display = 'none';
    } else {
        // unhide the label
        elem.style.display = '';
        // get the note coordinate
        noteSph.updateWorldMatrix(true, false);
        noteSph.getWorldPosition(tempV);
        tempV.project(camera);
        
        const x = (tempV.x * .5 + .5) * canvas.clientWidth;
        const y = (tempV.y * -.5 + .5) * canvas.clientHeight;
	    //console.log(x, y);

        // move the elem to that position
        //elem.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
        elem.style.transform = `translate(${x}px,${y}px)`;
        //elem.style.transform = `translate(1%, 1%) translate(${x}px,${y}px)`;
	 
        // set the zIndex for sorting
        elem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
    }
  }*/
}


//2021.06.09 May not need
function createLabel(sName){
	  const elem = document.createElement('div');
	  elem.id = sName;
	  //elem.textContent = sText;
	  //elem.innerHTML = '<a href="javascript:getPointDetail("textDivP", "' + sText + '");">'+sText+'</a>';
	  elem.innerHTML = '<a href="javascript:getPointDetail(\'textDivP\', \'' + sText + '\');">' +sText + '</a>';
	  labelContainerElem.appendChild(elem);
	  // and add to lables array, also ptSph, so it can be checked by raycaster	
	  //labels.push({elem, spritePos, ptSph});
	  // TODO: to use dumy object for note locations ... maybe too heavey, but that is what I can come up for now
		let noteGeo = new THREE.SphereGeometry( 0.01, 4, 4 );
		let noteMat = new THREE.MeshBasicMaterial( {color: bc} );
		noteSph = new THREE.Mesh( noteGeo, noteMat );
		noteSph.position.set(spritePos.x, spritePos.y, spritePos.z);
		noteSph.name = sName; 
		labels.push({elem, noteSph, ptSph});
}		