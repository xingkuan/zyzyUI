import * as THREE from './threejs/build/three.module.js';
import { OrbitControls } from './threejs/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './threejs/examples/jsm/loaders/GLTFLoader.js';
import { TransformControls } from "./threejs/examples/jsm/controls/TransformControls.js";
//import { RoughnessMipmapper } from './threejs/examples/jsm/utils/RoughnessMipmapper.js';

var scene, camera, renderer, canvas, raycaster, orbitCtrl, transformControl, labelSize,
	labelContainer, labels,
	activeJL;

// JL objects group. human model, Jingluo and Xuwei are added to this group.
var jlObjs = new THREE.Object3D(); 
jlObjs.name='jingluo Objs';

//keep the model object variable for easy reference. it is added to jlObjs
var modelObj;

//group points by line name 
var ptsGroups = new THREE.Group(); //('ptr grp by JL');  //THREE.Object3D();   //{};  //   new Map();
ptsGroups.name='ptr Groups';
//example lines['bla'] = new THREE.Group();
jlObjs.add(ptsGroups);

//particle systems for simulating flow.
var ptrObjs = new THREE.Object3D();  
ptrObjs.name='particles';

//try use 2D HTML div for labeling (instead of Sprite) 
function initPointLabels(elemID){
	//const labelContainer = document.querySelector('#labels');
	labelContainer = document.querySelector(elemID);
	//labelContainer = $(elemID);
	labels = [];
}



function init3D(id, lblSize) {
	const c = document.querySelector(id);
	//const c = $(id);
	//renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer = new THREE.WebGLRenderer({canvas: c});
	renderer.setPixelRatio( window.devicePixelRatio );
console.log("width:"+c.clientWidth);	
	//renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setSize( c.clientWidth, c.clientHeight );
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1;
	renderer.outputEncoding = THREE.sRGBEncoding;
 
	canvas = renderer.domElement;
	labelSize=lblSize/canvas.clientWidth;

  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 30;
  const far = 50;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);
  camera.zoom = 0.5;
  //camera.updateProjectionMatrix();
  scene = new THREE.Scene();
  scene.background = new THREE.Color('black');

  //setup lignts
  {
    const skyColor = 0xB1E1FF;  // light blue
    const groundColor = 0xB97A20;  // brownish orange
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
	light.name="Hemi light";
    scene.add(light);
  }
  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5, 10, 2);
	light.name="dir light";
    scene.add(light);
    scene.add(light.target);
  }

  // setup camera control
  {
	  //CameraCtrl = new OrbitControls(camera, canvas);  //2021.06.17: not working in 129?
	  orbitCtrl = new OrbitControls(camera, renderer.domElement);
	  orbitCtrl.target.set(0, 5, 0);
	  //trying ...
	  orbitCtrl.enableRotate = true;
	  orbitCtrl.enableZoom = true;
	  orbitCtrl.enablePan = false;
	  orbitCtrl.enableKeys = true;
	  //CameraCtrl.minPolarAngle = Math.PI/2;
	  //CameraCtrl.maxPolarAngle = Math.PI/2; //Math.PI;
	  // left and right rotation range
	  orbitCtrl.minAzimuthAngle = -Math.PI * (100 / 180);
	 // orbitCtrl.maxAzimuthAngle = Math.PI * (100 / 180);
	orbitCtrl.damping = 0.2;
	  //2021.06.10 animate only upon change events
	orbitCtrl.addEventListener( 'change', render );
	  
	orbitCtrl.update();
  }

/*2021.08.02 Remove it in order to be able to add 涌泉	
  // the ground. will very likely removed![TODO 20210710]
  {
	  const planeSize = 40;
	  const loader = new THREE.TextureLoader();
	  const texture = loader.load('checker.png');
	  texture.wrapS = THREE.RepeatWrapping;
	  texture.wrapT = THREE.RepeatWrapping;
	  texture.magFilter = THREE.NearestFilter;
	  const repeats = planeSize / 2;
	  texture.repeat.set(repeats, repeats);
	
	  const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
	  const planeMat = new THREE.MeshPhongMaterial({
	    map: texture,
	    side: THREE.DoubleSide,
	  });
	  const mesh = new THREE.Mesh(planeGeo, planeMat);
	  mesh.rotation.x = Math.PI * -.5;
	  mesh.name="ground";
	  scene.add(mesh);
  }
*/
  //add the jingluo object to the scene
  scene.add(jlObjs);

  //testing transparency
  /*{
  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( { 
	  color: 0x00ff00,
	   opacity: 0.8,
	   side: THREE.SingleSide,
	   //depthWrite: false,   // [2019.04.13] Don't understand it. But 
	   //depthTest: false,    // it seems make it a ghost that can go through ...
	   transparent: false,
	  } );
  var cube = new THREE.Mesh( geometry, material );
  cube.position.set(1,3,0);
  scene.add( cube ); 
  }*/
  
  // ... raycaster and 2D mouse events
  {
    raycaster = new THREE.Raycaster();
	//raycaster.setFromCamera(mouse,camera);
	raycaster.linePrecision = 0.03;  //two big value can cause "lines" always in the raycaster intersection.
	raycaster.params.Points.threshold = 0.03;
	
	
	function onDocumentTouchStart( e ) {
		onMouseDown(e);
	}
	//// object picking  
  }
}

function removeNewPointEditor(){
	canvas.removeEventListener('pointerup', edNew);
}
//function setupNewPointEditor(){
function setupClickHandler(mode){
	//let xx=getEventListeners(canvas);
	[edNone,edNew, edSticky, edFree].forEach(i=>{
		canvas.removeEventListener('pointerup',i);	
	});
	
	switch(mode){
		case "none":
			canvas.addEventListener('pointerup', edNone);
			break;
		case "new":
			canvas.addEventListener('pointerup', edNew);
			break;
		case "sticky modifier":
			canvas.addEventListener('pointerup', edSticky);
			break;
		case "free modifier":
			canvas.addEventListener('pointerup', edFree);
			alert("TODO: free ...");
			break;
		default:
			alert("invalid modifier")
  }
}
function edNone(e){     //""mouseup" events not working, because of the OrbitControls!
	e.preventDefault();   
	//console.log("mouse event in "+id+ ": " + e.which + " or button " + e.button); 
	switch (e.which){
		case 1: 
			break;
		case 2:
			pointCameraOnClick(e);
			break;
		case 3:
			break;
		default:
			alert("a strange mouse event");
		e.preventDefault();
	}
}
function edNew(e){     //""mouseup" events not working, because of the OrbitControls!
	e.preventDefault();   
	//console.log("mouse event in "+id+ ": " + e.which + " or button " + e.button); 
	switch (e.which){
		case 1: 
			break;
		case 2:
			pointCameraOnClick(e);
			break;
		case 3:
			addPointOnClick(e);
			break;
		default:
			alert("a strange mouse event");
		e.preventDefault();
	}
}
function edSticky(e){     //""mouseup" events not working, because of the OrbitControls!
	e.preventDefault();   
	//console.log("mouse event in "+id+ ": " + e.which + " or button " + e.button); 
	switch (e.which){
		case 1: 
			break;
		case 2:
			pointCameraOnClick(e);
			break;
		case 3:
			stickyModifier(e);
			break;
		default:
			alert("a strange mouse event");
		e.preventDefault();
	}
}
function edFree(e){     //""mouseup" events not working, because of the OrbitControls!
	e.preventDefault();   
	//console.log("mouse event in "+id+ ": " + e.which + " or button " + e.button); 
	switch (e.which){
		case 1: 
			break;
		case 2:
			pointCameraOnClick(e);
			break;
		case 3:
			freeModifier(e);
			break;
		default:
			alert("a strange mouse event");
		e.preventDefault();
	}
}
function stickyModifier(e){
	alert("TODO: sticky ...");
}
function freeModifier(e){
	alert("TODO: free ...");
}

function prepareRaycaster(e){
	//the normalize mouse coord
	let mouse = new THREE.Vector2();
	// (left, top) = (-1,-1), (right, top) = (1, -1)
	//           (middle, middle) = (0,0)
	// (left, bottom) = (-1,1), (right, top) = (1, 1)
	let rect = renderer.domElement.getBoundingClientRect();
	mouse.x = ( ( e.clientX - rect.left ) / ( rect.right - rect.left ) ) * 2 - 1;
	mouse.y = - ( ( e.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
	
	raycaster.setFromCamera(mouse,camera);
}
function pointCameraOnClick( e ) {
	e.preventDefault();
	prepareRaycaster(e);
	//let intersects = raycaster.intersectObjects(jlObjs.children, true);
	let intersects = raycaster.intersectObjects([modelObj], true);  //target only the model
	//console.log("intersected " + intersects.length);
	if(intersects.length > 0){ 
		let child = intersects[0];   //point at the facing object		
		let rawName = child.object.name;
		//console.log("... " + rawName +":("+child.point.x+","+child.point.y+","+child.point.z+")");
		//camera.lookAt(new THREE.Vector3(child.point.x,child.point.y,child.point.z));
		//camera.lookAt(new THREE.Vector3(10,10,10));
		orbitCtrl.target.set(child.point.x,child.point.y,child.point.z);
		orbitCtrl.update();
	}
}
function addPointOnClick( e ) {
	if($('#jlName').text()==''){
		alert("Please select a JingLuo first.");
		return;
	}
	e.preventDefault();
	prepareRaycaster(e);
	//let intersects = raycaster.intersectObjects(jlObjs.children, true);
	let intersects = raycaster.intersectObjects([modelObj], true);
	if(intersects.length > 0){ 
		let child = intersects[0];
		//add a temp point to the scene, and make it visible; 
		//But its name are to be supplied/and saved later.
		addTempPtr(child.point); 

		$("#uiLine").text($("#jlName").text());  
		$("#container").attr('disabled','disabled');
		$("#ptrX").text(child.point.x);
		$("#ptrY").text(child.point.y);
		$("#ptrZ").text(child.point.z);

		$("#uiPoint").val("");
		$("#editDialog").dialog( "open" );
	}
}	
function addTempPtr(co){
	let grpName="tempPtrGrp";
	if(ptsGroups.getObjectByName(grpName) == null){  
		ptsGroups[grpName] = new THREE.Group();
		ptsGroups[grpName].name=grpName;
		ptsGroups.add(ptsGroups[grpName]);   //remember to add to ptsGroups, which is in scene
	}
	
	let tmpPtrGrp=ptsGroups.getObjectByName(grpName);
	tmpPtrGrp.clear();
	let pt=create3DPoint("tempPtr", co, {color: 0xff0000});
	tmpPtrGrp.add(pt);

	render();
}

function create3DPoint(name, co, ptColor){
	let ptSph;
	// the point spot
	let ptGeo = new THREE.SphereGeometry( 0.04, 4, 4 );
	let ptMat = new THREE.MeshBasicMaterial( ptColor );
	ptSph = new THREE.Mesh( ptGeo, ptMat );
	ptSph.position.set(co['x'], co['y'], co['z']);
	// ...
	ptSph.name = name; 
	//scene.add( ptSph );   // to be displayed as 3D obj
	return ptSph;
}

function render() {
	camera.aspect = canvas.clientWidth / canvas.clientHeight;
	camera.updateProjectionMatrix();

    renderer.render(scene, camera);
	updateLabels();
}

var animationId;
var fps = 2;
var interval = 1000/fps;
var now;
var then = Date.now();
var delta;
function startAnimation() {
	now = Date.now();
	delta = now - then;
//console.log(delta);
	if (delta > interval) {
		then = now;
		
		updateParticles();
		render();
	}
	animationId=requestAnimationFrame( startAnimation );
}
function stopAnimation() {
	cancelAnimationFrame(animationId);
}

//const roughnessMipmapper = new RoughnessMipmapper( renderer );
function loadGLTF(gltfName, modelName){
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(gltfName, (gltf) => {
/*			//???
			gltf.scene.traverse( function 	( child ) {
								if ( child.isMesh ) {
									roughnessMipmapper.generateMipmaps( child.material );
								}
							} );
*/							
		let root=gltf.scene;
    	console.log(root.name);
      	//console.log(dumpObject(root).join('\n'));
       	//console.log(dumpObject(scene).join('\n'));
      	scene.add(gltf.scene);  //TODO 20210710: seem repeat what is coming?? 

		//let modelObj = scene.getObjectByName("asian_female_teen", true);
		modelObj = scene.getObjectByName(modelName, true);
		jlObjs.add(modelObj);

	  // compute the box that contains all the stuff
	  // from root and below
	  const box = new THREE.Box3().setFromObject(root);
	
	  const boxSize = box.getSize(new THREE.Vector3()).length();
	  const boxCenter = box.getCenter(new THREE.Vector3());
	
	  // set the camera to frame the box
	  frameArea(boxSize * 0.5, boxSize, boxCenter, camera);

      initModelCtrl();   //leave it here for now, because I don't know how to synchronously load model
	  // update the Trackball controls to handle the new size
      orbitCtrl.maxDistance = boxSize * 10;
	  orbitCtrl.target.copy(boxCenter);
	  orbitCtrl.update();
    });
    //2021.06.10: becaue I disabled animation...
    render(e=>{d=new Date();return d.getTime();});
}


function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.Math.degToRad(camera.fov * .5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = (new THREE.Vector3())
        .subVectors(camera.position, boxCenter)
        .multiply(new THREE.Vector3(1, 0, 1))
        .normalize();

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;

    camera.updateProjectionMatrix();

    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}

/////////////model controler
function initModelCtrl(){
	//const modelCtrl = new dat.GUI;
	const modelCtrl = new dat.GUI({ autoPlace: false });
	//gui.domElement.id = 'gui';
	document.getElementById('modelCtrl').appendChild(modelCtrl.domElement);
	modelCtrl.close();
	const folder = modelCtrl.addFolder("Test");
	folder.open();
	//test.add(obj.scale, 'x', 0,3).name("X").listen();
	var leftArm = scene.getObjectByName( "Teen_rig_forearmL", true);
	//var leftArm = scene.getObjectByName( "Teen_rig_IK_armL", true);
	//var leftArm = scene.getObjectByName( "Teen_rig_chest", true);
	folder.add(leftArm.rotation, 'x', 0,3).name("X").listen();
}


function dumpVec3(v3, precision = 3) {
	return `${v3.x.toFixed(precision)}, ${v3.y.toFixed(precision)}, ${v3.z.toFixed(precision)}`;
}
  
function dumpObject(obj, lines = [], isLast = true, prefix = '') {
    const localPrefix = isLast ? '└─' : '├─';
	lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);

	const dataPrefix = obj.children.length
	     ? (isLast ? '  │ ' : '│ │ ')
	     : (isLast ? '    ' : '│   ');
	lines.push(`${prefix}${dataPrefix}  pos: ${dumpVec3(obj.position)}`);
	lines.push(`${prefix}${dataPrefix}  rot: ${dumpVec3(obj.rotation)}`);
	lines.push(`${prefix}${dataPrefix}  scl: ${dumpVec3(obj.scale)}`);
	  
	const newPrefix = prefix + (isLast ? '  ' : '│ ');
	const lastNdx = obj.children.length - 1;
	obj.children.forEach((child, ndx) => {
	    const isLast = ndx === lastNdx;
	    dumpObject(child, lines, isLast, newPrefix);
	});
	return lines;
}

function createPointsOfJL(lName, ptrLst, color){
	////If the point group for this JingLuo not created yet, create it. 
	//if(ptsGroups[lName] == null){
	//	console.log(ptsGroups);
		ptsGroups[lName] = new THREE.Group();
		ptsGroups[lName].name=lName;
		ptsGroups.add(ptsGroups[lName]);   //remember to add to ptsGroups, which is in scene
	//	console.log(ptsGroups);
	//}

	//console.log("point co:", ptPos);
	ptrLst.forEach(p=>{
		createPtsOfSubLine(p);
		});
	function createPtsOfSubLine(plst){
	plst.forEach(p=>{
		let [xwName, seq, co, isXW]=p;
		//let pt=create3DPoint(xwName +" "+seq, co, {color: 0x0000ff});
		let pt=create3DPoint(xwName +" "+seq, co, {color: new THREE.Vector4(color.r, color.g, color.b, 0.5)});
		ptsGroups[lName].add(pt);
			//}
	});
	}
}

function createLinesOfJL(jlName, ptrGrp, color){
	//ptrLst:  [ [ptr1, ptr2, ..], [ptr4, ptr5, ...], ... ]
	//console.log('show JL');
	ptrGrp.forEach((p,i)=>{
		createSubLine(p);
	});
	function createSubLine(subLinePtrs){
		let points=[];
		subLinePtrs.forEach((p,i)=>{
			let [xwName, seq, co, isXW]=p;
			//if(isXW)
				points.push(new THREE.Vector3(co['x'], co['y'], co['z']));
		});
		createCurve(points, new THREE.Vector3(0,0,0), jlName);
	}
	function createCurve(ptsLst, loc, nm){
		let curve = new THREE.CatmullRomCurve3(ptsLst, false);  
		//curve.curveType = "centripetal";
		//curve.closed = false;
		const ps = curve.getPoints(100);  //get 100 aliquots
		const geometry = new THREE.BufferGeometry().setFromPoints(ps);  //2021.08.13: why not "curve"?
		const material = new THREE.LineBasicMaterial({
			//color: 0x00ff00,
			color: new THREE.Vector4(color.r, color.g, color.b, 0.5),
			linewidth: 2,
			transparent: true, opacity: 0.8 ,
		});
		let curveObject = new THREE.Line(geometry, material);
		//curveObject.position.set(pts.position.x,pts.position.y,pts.position.z);
		curveObject.position.set(loc.x, loc.y, loc.z);
		//curveObject.name=lname;
		curveObject.name=nm;
		//DOING 2021.07.14 ]can i just add to
		//jlObjs.add(curveObject);
		ptsGroups[nm].add(curveObject) ;
	}		
}

function createParticlesOfJL(jlName, ptrGrps, color, size){
	let pathLen="length: "
	if(ptrGrps.length>0){
		ptrGrps.forEach((p,i)=>{
			createSubParticles(p);
		});
	}
	$("#curvLen").html(pathLen);

	function createSubParticles(pLst) {
		let points=[];
		pLst.forEach((p,i)=>{
			let [xwName, seq, co, isXW]=p;
			//if(isXW)
				points.push(new THREE.Vector3(co['x'], co['y'], co['z']));
		});

		let curve = new THREE.CatmullRomCurve3(points, false);  
		//curve.curveType = "centripetal";
		//curve.closed = false;
		
		//TODO20210716: may use length to decide how many points
		let len=curve.getLength();
		pathLen = pathLen + len.toString() + ", "
		//$("#curvLen").html("length:"+len);
		let numPts=25;
		
		const ps = curve.getSpacedPoints(numPts);   //20210715: TODO: number of points may better be a parameter.

		let pArray=[], cArray=[], sArray=[], idArray=[], i=0.0;
		ps.forEach(p=> {
            pArray.push(p.x,p.y,p.z);
			//cArray.push( color.r, color.g, color.b, 0.5 );  //20210719: Let's make color uniform'
			sArray.push( size );    //Different point can have different size
			idArray.push (i);       //create sequence id; to be used for animate flowing by verying blrightness of partices
			i += 1.0;
        } );
		drawParticles(jlName,   
            		pArray,  
            		cArray, 
            		sArray,
					idArray);	
	}
	function drawParticles(lName, pArray, cArray, sArray, idArray ){
	//let  uniforms = {    
	//		texture: { value: new THREE.TextureLoader().load( "particle.png" ) },
	//		del: 	 { type: "f", value: 0.9 }
	//};
		let parMaterial = new THREE.ShaderMaterial( {
			extensions: {
				derivatives: "#extension GL_OES_standar_derivatives:enable"
			},
			uniforms: {    //uniforms,
			    color: {type: 'vec4', value: new THREE.Vector4(color.r, color.g, color.b, 0.5)},
			    tick: { type: 'f', value: 2. },
			    cycles: { type: 'f', value: 4. },   //light every 4th point, and cycle through to simulate flowing.
				resulution:{value: new THREE.Vector4()},
			},
	 		//vertexShader: document.getElementById( 'pvshader' ).textContent,
			//fragmentShader: document.getElementById( 'pfshader' ).textContent,
	 		vertexShader: document.getElementById( 'vertexShader' ).textContent,  
			fragmentShader: document.getElementById( 'fragmentShader' ).textContent, 
	        blending: THREE.AdditiveBlending,
	        //depthWrite: false,  //?
	        //
	        //So first of all, what is depth test? Suppose if you are to draw 2 identical shapes directly in front of you but of different distance to you. In real life, you expect to only see the shape that is closer to you, correct?
			//Well if you were to try to do this without a depth test, you will only get the desired effect half the time: if the distant object is drawn before the closer object, no problem, same as real life; but if the closer object is drawn before the distance object, oh-oh, the distant object is visible when it should be not. Problematic.
			//Depth test is a tool built in today's GPUs to allow to get the desired draw output regardless of the order which the objects are drawn. 
	        //
	        //transparent: true,  // so it can show throug even if it is under the skin.
	        //vertexColors: true
		} );

//const parMaterial = new THREE.PointsMaterial( { color: 0x888888 } );

		let parGeo = new THREE.BufferGeometry();
		//for each point, set the properties, and pass to GSLS script
	    parGeo.setAttribute( 'position', new THREE.Float32BufferAttribute(pArray,3) );
	    //parGeo.setAttribute( 'positionN', new THREE.Float32BufferAttribute([0,0,0],3) );
	    //parGeo.setAttribute( 'color', new THREE.Float32BufferAttribute(cArray,3 ));   //20210719: All points have same color, from uniform.
	    parGeo.setAttribute( 'size', new THREE.Float32BufferAttribute(sArray,1 ) );  
	    parGeo.setAttribute( 'id', new THREE.Float32BufferAttribute(idArray,1 ) );  
	    
	    /*let */parSys = new THREE.Points( parGeo, parMaterial );
	    parSys.name=lName;
	    //parSys.position.set(pts.position.x,pts.position.y,pts.position.z);
	    parSys.sortParticles = false;
	    parSys.dynamic = true;
	    //ptrObjs.add(parSys);
		ptsGroups[lName].add(parSys) 
		//scene.add(parSys) 
	}
}    
var parSys;
function updateParticles(){ 
/*	if (del==3.){
		del=0.;
	}else{
		del=(del+1.);
	}
	*/
	/*ptrObjs.children.forEach((child, ndx) => {
		child.material.uniforms.del.value=del * 0.3;
		child.needsUpdate = true;
	})*/
	//ptsGroups[lName].add(parSys)
	ptsGroups.children.forEach(e=>{
		let pSys=e.getObjectByProperty("type", "Points");  //each JL has only one particle sys.
		let del = pSys.material.uniforms.tick.value;
		if (del==3.){
			del=0.;
		}else{
			del=(del+1.);
		}
		pSys.material.uniforms.tick.value = del;
		pSys.needsUpdate = true;
	});
	
	//parSys.needsUpdate = true;
}

function clearGroup(name){
	//if (ptsGroups[name])
	//	ptsGroups[name].clear();
	ptsGroups.clear();
}

function updateLabels() {
	let tempLabelPos=[];
	let tempV = new THREE.Vector3();  

	camera.updateMatrixWorld(true, false);  //? 
 
	 //remove all the labels
	$('#labels').empty();

	let rect = renderer.domElement.getBoundingClientRect();
	
	// and then add the new ones 
	let isLblOverlap=false;
	ptsGroups.children.forEach((child, ndx) => {
	    //const isLast = ndx === lastNdx;
	    //dumpObject(child, lines, isLast, newPrefix);
	    //console.log(child.name);
	    child.children.forEach((ch, ix) => {
		    //console.log(ch.name + ':' + ch.position.x + ',' + ch.position.y  + ',' + ch.position.z);
			//-------------
		    ch.updateWorldMatrix(true, false);
		    ch.getWorldPosition(tempV);
		    //Projects this vector from world space into the camera's normalized device coordinate (NDC) space
		    tempV.project(camera);
		
		    // determine if it is between camera and the body model.
		    raycaster.setFromCamera(tempV, camera);
	        //let modelObj = scene.getObjectByName("asian_female_teen", true);
    		const intersectedObjects = raycaster.intersectObjects([ch, modelObj], true);
    		// This object is visible only if it is the first.
    		const show = intersectedObjects.length && ch === intersectedObjects[0].object;

			if(show){
				//if this one overlaps existing one, 
				for (const e of tempLabelPos){
				  	//console.log(ch.name, Math.abs(e[0]-tempV.x), Math.abs(e[1]-tempV.y));
				
				   	isLblOverlap=false;
				   	if((Math.abs(e[0]-tempV.x) < labelSize)&&(Math.abs(e[1]-tempV.y) < labelSize)){
						//console.log("skip");
						isLblOverlap=true;
				   		break;
				   	};
				}
				//create and show it only if not overlaped
				if(!isLblOverlap){ 
				   	tempLabelPos.push([tempV.x, tempV.y]);
			        const x = (tempV.x * .5 + .5) * canvas.clientWidth +rect.left;
			        const y = (tempV.y * -.5 + .5) * canvas.clientHeight+rect.top;
				    //console.log('coord:', x, y);
				    
					//create an HTML element for it 
					const elem = document.createElement('div');
					elem.id = ch.name;
					//elem.textContent = sText;
					//elem.innerHTML = '<a href="javascript:getPointDetail("textDivP", "' + sText + '");">'+sText+'</a>';
					elem.innerHTML = '<a href="javascript:getPointDetail(\'textDivP\', \'' + ch.name + '\');">' +ch.name + '</a>';
	
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
			}
		});	 
	});
}
//2021.07.12--------------
function removeStickModifier(){
	console.log("TODO ...");
	//scene.remove(transformControl);
}
//https://threejs.org/examples/webgl_geometry_spline_editor.html
function setupStickModifier(){
	console.log("TODO ...");
}
//2021.06.15--------------
function removeFreeModifier(){
	scene.remove(transformControl);
}
//https://threejs.org/examples/webgl_geometry_spline_editor.html
function setupFreeModifier(){
	//let canvas = renderer.domElement;
	transformControl = new TransformControls( camera, canvas );
	transformControl.setSize(0.5);
	transformControl.addEventListener( 'change', render );
	transformControl.addEventListener( 'dragging-changed', function ( event ) {
			orbitCtrl.enabled = ! event.value;
		} );
	transformControl.addEventListener( 'objectChange', function () {
			updateSplineOutline();
		} );
	scene.add( transformControl );

	//const splineHelperObjects = [];
	//const pointer = new THREE.Vector2();
	const onUpPosition = new THREE.Vector2();
	const onDownPosition = new THREE.Vector2();
				
	canvas.addEventListener( 'pointerdown', onPointerDown );
	canvas.addEventListener( 'pointerup', onPointerUp );
	canvas.addEventListener( 'pointermove', onPointerMove );
	
	function onPointerDown( event ) {
		onDownPosition.x = event.clientX;
		onDownPosition.y = event.clientY;
	}
	
	function onPointerUp() {
		onUpPosition.x = event.clientX;
		onUpPosition.y = event.clientY;
	
		if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) 
			transformControl.detach();
	}
	
	function onPointerMove( event ) {
		let mouse = new THREE.Vector2();
	
		let rect = renderer.domElement.getBoundingClientRect();
	
		mouse.x = ( ( event.clientX - rect.left ) / ( rect.width - rect.left ) ) * 2 - 1;
		mouse.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
	
		raycaster.setFromCamera(mouse,camera);
		let jlPtrs = jlObjs.getObjectByName( activeJL );
//TODO: 20210710  need to limit only to the needed objects!  
		let intersects = raycaster.intersectObjects(jlPtrs.children, true);
	
	//console.log("onPointerMove(), points: " + ptsGroups.children);
	//console.log("onPointerMove(), intersects: " + intersects.length);
		if ( intersects.length > 0 ) {
			const object = intersects[ 0 ].object;
	
			if ( object !== transformControl.object ) {
				transformControl.attach( object );
			}
		}
		/*else{
			transformControl.detach();
		}*/
	}
}
	
/*2021.06.16  This is certainly not doing anything !!!
function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
}
*/

export {labelSize, renderer, init3D, loadGLTF, render,
createPointsOfJL, createLinesOfJL,createParticlesOfJL,
clearGroup, updateParticles,
setupFreeModifier, removeFreeModifier, 
setupStickModifier, removeStickModifier,
removeNewPointEditor, 
setupClickHandler,
initPointLabels, startAnimation, stopAnimation};
//export {canvas, camera, scene, renderer, CameraCtrl, labelSize, initGlobalVars};
