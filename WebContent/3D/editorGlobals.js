import * as THREE from './threejs/build/three.module.js';
import { OrbitControls } from './threejs/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './threejs/examples/jsm/loaders/GLTFLoader.js';
import { TransformControls } from "./threejs/examples/jsm/controls/TransformControls.js";
//import { RoughnessMipmapper } from './threejs/examples/jsm/utils/RoughnessMipmapper.js';

var scene, camera, renderer, canvas, raycaster, orbitCtrl, transformControl, labelSize,
	labelContainer, labels;

// JL objects group. human model, Jingluo and Xuwei are added to this group.
var jlObjs = new THREE.Object3D(); 
jlObjs.name='jingluo Objs';

//group points by line name 
var ptsGroups = new THREE.Group(); //('ptr grp by JL');  //THREE.Object3D();   //{};  //   new Map();
ptsGroups.name='ptr Groups';
//example lines['bla'] = new THREE.Group();
jlObjs.add(ptsGroups);

//particle systems for simulating flow.
var ptrObjs = new THREE.Object3D();  
ptrObjs.name='xxx';

//try use 2D HTML div for labeling (instead of Sprite) 
function initPointLabels(elemID){
	//const labelContainer = document.querySelector('#labels');
	labelContainer = document.querySelector(elemID);
	labels = [];
}


/*
function initGlobalVars(){
	const canvas = document.querySelector('#c');
	const labelSize=30/canvas.clientWidth; 
}*/


function init3D(id, lblSize) {
  const c = document.querySelector(id);
//renderer = new THREE.WebGLRenderer( { antialias: true } );
 renderer = new THREE.WebGLRenderer({canvas: c});
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
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
	  orbitCtrl.maxAzimuthAngle = Math.PI * (100 / 180);
	orbitCtrl.damping = 0.2;
	  //2021.06.10 animate only upon change events
orbitCtrl.addEventListener( 'change', render );
	  
	  orbitCtrl.update();
  }

  // the ground
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
  //add the jingluo object to the scene
  scene.add(jlObjs);
//2021.06.17 enable it later.  scene.add(ptrObjs);

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
  
  //mark a spot on selection (raycaster interception)
//2021.06.17 Doesn't seem to do anything 
/*
  var geometry = new THREE.SphereBufferGeometry( 0.02 );
  var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
  interceptMark = new THREE.Mesh( geometry, material );
    interceptMark.visible = false;
    scene.add( interceptMark );
*/
  // setup raycaster for interacting with interested object.
  // ... raycaster and 2D mouse events
  {
    raycaster = new THREE.Raycaster();
	
	raycaster.linePrecision = 0.03;  //two big value can cause "lines" always in the raycaster intersection.
	raycaster.params.Points.threshold = 0.03;
//	mouse = new THREE.Vector2();
	//mouse = new THREE.Vector3();

/*	if to add feature for moving a pointer:
    But that can be achieved simply by update a point!
   $("#c").mousedown(e=>{    
		e.preventDefault();
			mouseDownX=e.clientX;
			mouseDownY=e.clientY;
	});
*/
	
	
	function onDocumentTouchStart( e ) {
		/* 2021.05.21 make no sense ?!
		e.preventDefault();
		e.clientX = e.touches[0].clinetX;
		e.clientY = e.touches[0].clinetY;  */
		console.log("in onDocumentTouchStart");
		onMouseDown(e);
	}
	//// object picking  
  }
}

function setupPointEditor(){
	//document.addEventListener( 'click', onMouseDown, false );
	//renderer.domElement.addEventListener("click", onclick, true);
	//$("#c").on( 'click', onMouseDown);  This one works!  //response to click only if it is inside the 3D view div
	//$("#c").mousedown(e=>{    //Try. Because I need use roght mouse down event as well.
	//$("#c").mouseup(e=>{    
	//canvas.addEventListener('click', (e)=>{   
	canvas.addEventListener('pointerup', (e)=>{     //""mouseup" events not working, because of the OrbitControls!
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
	}, false);
	//2021.05.21 seems make no sense !  document.addEventListener( 'touchstart', onDocumentTouchStart, false );   //for touch screen devices

	//supporting functions
	//------------
	function pointCameraOnClick( e ) {
		e.preventDefault();
	
		//normalize mouse coord
		let mouse = new THREE.Vector2();
		let rect = renderer.domElement.getBoundingClientRect();
	
		mouse.x = ( ( e.clientX - rect.left ) / ( rect.width - rect.left ) ) * 2 - 1;
		mouse.y = - ( ( e.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
	
		raycaster.setFromCamera(mouse,camera);
		
		let intersects = raycaster.intersectObjects(jlObjs.children, true);
			
		console.log("intersected " + intersects.length);
			
		if(intersects.length > 0){ 
			let child = intersects[0];		
			let rawName = child.object.name;
			console.log("... " + rawName +":("+child.point.x+","+child.point.y+","+child.point.z+")");
	//camera.lookAt(new THREE.Vector3(child.point.x,child.point.y,child.point.z));
	//camera.lookAt(new THREE.Vector3(10,10,10));
	orbitCtrl.target.set(0, 0, 0);
	orbitCtrl.target.set(child.point.x,child.point.y,child.point.z);
	orbitCtrl.update();
		}
	}
	
	function addPointOnClick( e ) {
		e.preventDefault();
	
		//the normalized mouse coord
		let mouse = new THREE.Vector2();
	
		// (left, top) = (-1,-1), (right, top) = (1, -1)
		//           (middle, middle) = (0,0)
		// (left, bottom) = (-1,1), (right, top) = (1, 1)
	//2021.05.22: for the purpose of development only ...
	$("#mouseCoScreen").html("mouse(screen):"+e.clientX+","+e.clientY);	
		let rect = renderer.domElement.getBoundingClientRect();
	$("#renderRect").html("rect:"+rect.left+","+rect.top+","+rect.right+","+rect.bottom);	
		mouse.x = ( ( e.clientX - rect.left ) / ( rect.width - rect.left ) ) * 2 - 1;
		mouse.y = - ( ( e.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
	$("#mouseCoNorm").html("mouse(rect):"+mouse.y+","+mouse.y);	
		// ??? [2019.04.23] how about z? no effect !?  
		//mouse.z = camera.position.z; 
		//mouse.z = 0.5;
		//   mouse.unproject( camera );   
		//   mouse.normalize();
	$("#cameraCo").html("camera:"+camera.position.x+','+camera.position.y+','+camera.position.z);	        
		//detect the selected 3D pointer 
		raycaster.setFromCamera(mouse,camera);
		let intersects = raycaster.intersectObjects(jlObjs.children, true);
		console.log("intersected " + intersects.length);
		//intersects.forEach((child, ndx) => {  //Respond to the first only. Otherwise, 
		//									  //the "line" seems will have a lot ...
	let intersectObjs="objs:<br>";
	$("#intersectObjs").html(intersectObjs);
		if(intersects.length > 0){ 
			let child = intersects[0];		
			let rawName = child.object.name;
			console.log("... " + rawName);
	intersectObjs=intersectObjs+rawName+":("+child.point.x+","+child.point.y+","+child.point.z+")";
	$("#intersectObjs").html(intersectObjs);
	$("#container").attr('disabled','disabled');
	$("#ptrX").text(child.point.x);
	$("#ptrY").text(child.point.y);
	$("#ptrZ").text(child.point.z);
	$("#editDialog").dialog( "open" );
			console.log(child.point);
			addPointToJLObjs("lName", 'pName', child.point); //and the popup handler will persist.
		}
	}	
}
//2021.05.23 
function addPointToJLObjs(lName, sName, x,y,z){
	//If the point group for this JingLuo not created yet, create it. 
	if(ptsGroups[lName] == null){
		console.log(ptsGroups);
		ptsGroups[lName] = new THREE.Group();
		ptsGroups[lName].name=lName;
		ptsGroups.add(ptsGroups[lName]);   //remember to add to ptsGroups, which is in scene
		console.log(ptsGroups);
	}

	//console.log("point co:", ptPos);
	let ptSph;
	{  // the point spot
		let ptGeo = new THREE.SphereGeometry( 0.04, 4, 4 );
		let ptMat = new THREE.MeshBasicMaterial( {color: 0x0000ff} );
		ptSph = new THREE.Mesh( ptGeo, ptMat );
		ptSph.position.set(x, y, z);
		// ...
		ptSph.name = sName; 
	}
	//scene.add( ptSph );   // to be displayed as 3D obj
	ptsGroups[lName].add(ptSph);
}

function createPoints(lName, ptrLst){
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
		let [xwName, seq, co, isXW]=p;
		if(isXW){
			let ptSph;
			// the point spot
			let ptGeo = new THREE.SphereGeometry( 0.04, 4, 4 );
			let ptMat = new THREE.MeshBasicMaterial( {color: 0x0000ff} );
			ptSph = new THREE.Mesh( ptGeo, ptMat );
			ptSph.position.set(co['x'], co['y'], co['z']);
			// ...
			ptSph.name = xwName + seq; 
			//scene.add( ptSph );   // to be displayed as 3D obj
			ptsGroups[lName].add(ptSph);
		}
	});
}



function render() {
	camera.aspect = canvas.clientWidth / canvas.clientHeight;
	camera.updateProjectionMatrix();

    renderer.render(scene, camera);
	updateLabels();
}

function animateJLeditor() {
	render();
	requestAnimationFrame( animate );
}

//const roughnessMipmapper = new RoughnessMipmapper( renderer );
function loadGLTF(gltfName){
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(gltfName, 
		(gltf) => {
/*			//???
			gltf.scene.traverse( function ( child ) {
								if ( child.isMesh ) {
									roughnessMipmapper.generateMipmaps( child.material );
								}
							} );
*/							
let root=gltf.scene;
    	  console.log(root.name);
      	  //console.log(dumpObject(root).join('\n'));
       	  //console.log(dumpObject(scene).join('\n'));
      	  scene.add(gltf.scene); 

      let modelObj = scene.getObjectByName("asian_female_teen", true);
//2021.05.22 DEVEL: so users can interactively contribute ... 
//Originally, it is not added to jlObjs because these functions are performed in Blender.
jlObjs.add(modelObj);
//jlObjs.add(ptsGroups); //2021.06.17 moved for clarity
      //console.log(dumpObject(scene).join('\n'));

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



//(lname, lnColor, ptColor){
/*function createJL(jlName){
	//console.log('show JL');
	let points=[];
	let jlPtrs = jlObjs.getObjectByName( jlName );
	jlPtrs.children.forEach((e,i)=>{
		points.push(e.position);
	});
	createCurve(points, new THREE.Vector3(0,0,0), jlName);
	
	
	function createCurve(ptsLst, loc, nm){
		let curve = new THREE.CatmullRomCurve3(ptsLst, false);  
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
		let curveObject = new THREE.Line(geometry, material);
		//curveObject.position.set(pts.position.x,pts.position.y,pts.position.z);
		curveObject.position.set(loc.x, loc.y, loc.z);
		//curveObject.name=lname;
		curveObject.name=nm;
		jlObjs.add(curveObject);
	}		
}*/
function createJL(jlName, ptrLst){
	//console.log('show JL');
	if(ptrLst.length>1){
		let points=[];
		ptrLst.forEach((p,i)=>{
			let [xwName, seq, co, isXW]=p;
			if(isXW)
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
			color: 0x00ff00,
			//color: lnColor,
			linewidth: 2,
			transparent: true, opacity: 0.8 ,
		});
		let curveObject = new THREE.Line(geometry, material);
		//curveObject.position.set(pts.position.x,pts.position.y,pts.position.z);
		curveObject.position.set(loc.x, loc.y, loc.z);
		//curveObject.name=lname;
		curveObject.name=nm;
		jlObjs.add(curveObject);
	}		
}


function updateLabels() {
	let tempLabelPos=[];
	let tempV = new THREE.Vector3();  // is it needed?
	//let canvas = renderer.domElement;

	camera.updateMatrixWorld(true, false);  //? 
 
	 //remove all the labels
	$('#labels').empty();

	// and then add the new ones 
	let isLblOverlap=false;
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

	      let modelObj = scene.getObjectByName("asian_female_teen", true);
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
			  	//console.log(ch.name, Math.abs(e[0]-tempV.x), Math.abs(e[1]-tempV.y));
			
			   	isLblOverlap=false;
			   	if((Math.abs(e[0]-tempV.x) < labelSize)&&(Math.abs(e[1]-tempV.y) < labelSize)){
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
}


//2021.06.15--------------
function removeTransformControler(){
	scene.remove(transformControl);
}
//https://threejs.org/examples/webgl_geometry_spline_editor.html
function addTransformControler(jl){
	//let canvas = renderer.domElement;
	var jlName = jl;
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
	const pointer = new THREE.Vector2();
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
		let jlPtrs = jlObjs.getObjectByName( jlName );
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
	
	function addPoint() {
		splinePointsLength ++;
	
		positions.push( addSplineObject().position );
		updateSplineOutline();
	}
	
	function removePoint() {
		if ( splinePointsLength <= 4 ) {
			return;
		}
	
		const point = splineHelperObjects.pop();
		splinePointsLength --;
		positions.pop();
	
		if ( transformControl.object === point ) 
			transformControl.detach();
			
		scene.remove( point );
	
		updateSplineOutline();
	}
	
	function updateSplineOutline() {
		for ( const k in splines ) {
			const spline = splines[ k ];
	
			const splineMesh = spline.mesh;
			const position = splineMesh.geometry.attributes.position;
	
			for ( let i = 0; i < ARC_SEGMENTS; i ++ ) {
				const t = i / ( ARC_SEGMENTS - 1 );
				spline.getPoint( t, point );
				position.setXYZ( i, point.x, point.y, point.z );
			}
	
			position.needsUpdate = true;
		}
	}
}

export {labelSize, renderer, init3D, loadGLTF, render,createPoints, createJL, 
addTransformControler, removeTransformControler, setupPointEditor,
initPointLabels, animateJLeditor};
//export {canvas, camera, scene, renderer, CameraCtrl, labelSize, initGlobalVars};
