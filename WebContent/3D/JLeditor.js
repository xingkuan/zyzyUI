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

function buildJLpath(jl){
url='http://localhost:8080/zyzySvc/JL/getPointsByJL/'+jl;
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

//(lname, lnColor, ptColor){
function showJL(){
console.log('show JL');
ptsGroups.children.forEach((e,i)=>{
console.log(e, i);
lName=e.name;
points=[];
	e.children.forEach((p, n)=>{
		console.log(p.name);
		points.push(p.position);
	});
	
	if(lName!='lName')
		DrawLine(points, new THREE.Vector3(0,0,0), lName);
});

/*    if((preSegName=="")||(ptrName[1] == preSegName)){
       	points.push(child.position);   
    }else{
       	DrawLine(points, pts.position, lname+preSegName);
       	//clean up the array and start for a new segment:
       	points=[];
       	preSegName="";
       	points.push(child.position);
    };
    
    preSegName=ptrName[1];
    
    //the last segment in the least.
	DrawLine(points, pts.position, lname+preSegName);
*/

	
	function DrawLine(ptsLst, loc, nm){
		curve = new THREE.CatmullRomCurve3(ptsLst, false);  
		//curve.curveType = "centripetal";
		//curve.closed = false;
		const ps = curve.getPoints(100);  //get 100 aliquots
		const geometry = new THREE.BufferGeometry().setFromPoints(ps);  //2021.08.13: why not "curve"?
		const material = new THREE.LineBasicMaterial({
			color: 0x00ff00,
			//color: lnColor,
			linewidth: 2,
			transparent: true, opacity: 0.8 ,
		});
		curveObject = new THREE.Line(geometry, material);
		//curveObject.position.set(pts.position.x,pts.position.y,pts.position.z);
		curveObject.position.set(loc.x, loc.y, loc.z);
		//curveObject.name=lname;
		curveObject.name=nm;
		jlObjs.add(curveObject);
	}		

}