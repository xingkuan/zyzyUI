import * as THREE from './threejs/build/three.module.js';
import { OrbitControls } from './threejs/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './threejs/examples/jsm/loaders/GLTFLoader.js';
import { TransformControls } from "./threejs/examples/jsm/controls/TransformControls.js";
//import { RoughnessMipmapper } from './threejs/examples/jsm/utils/RoughnessMipmapper.js';
/*     scene
 *       |
 *     jlObjs, gltf.scene
 *       |
 *     modelObj,  ptsGroups                  
 *                    |
 *        ptsGroups['tempPtrGrp'], ptsGroups['手少阴心经'], ...
 *                                       |
 *                     Groups['P_手少阴心经'], Groups['L_手少阴心经'] or Groups['PS_手少阴心经']
 *                            |                        |                        |
 *                         THREE.Mesh ...      THREE.CatmullRomCurve3 ,,,    THREE.Points ...
 */

var scene, camera, renderer, canvas, // raycaster,
	orbitCtrl, //transformControl, 
	labelSize, labelContainer//, labels
	;
var isEditor=true;
var updatedPoints={};

// JL objects group. human model, Jingluo and Xuwei are added to this group.
var jlObjs = new THREE.Object3D(); 
jlObjs.name='jingluo Objs';

//keep the model object variable for easy reference. It is added to jlObjs
var modelObj;

//All objects (JL line, particles sys(for simulating flow of energy), XueWeis'') of the same JingLuo 
//are grouped into a group of the corresponding JL name, which are all children to ptsGroups 
var ptsGroups = new THREE.Group(); 
ptsGroups.name='ptr Groups';
//example lines['bla'] = new THREE.Group();
jlObjs.add(ptsGroups);


//try use 2D HTML div for labeling (instead of Sprite)
//2021.08.25 But the performance is really bad when multiple Jinglups are loaded. 
function initPointLabels(elemID, isE){
	//const labelContainer = document.querySelector('#labels');
	labelContainer = document.querySelector(elemID);
	//labelContainer = $(elemID);
	//labels = [];
	isEditor=isE;
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
	//labelSize=lblSize/canvas.clientWidth;
	labelSize=lblSize;
	
  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 30;
  const far = 50;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);
  camera.zoom = 0.5;
  //camera.updateProjectionMatrix();

  //cameraOrtho = new THREE.OrthographicCamera( - 600 * aspect, 600 * aspect, 600, - 600, 0.01, 30000 );
  //currentCamera = cameraPersp;
				
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
  //raycaster=setupRaycaster(e);

	
//	function onDocumentTouchStart( e ) {
//		onMouseDown(e);
//	}
	//// object picking  
}

//*** NDC, normalized device coordinates: the x, y, z coordinates range over [-1,1] *** 
// (left, top) = (-1,-1), (right, top) = (1, -1)
//           (middle, middle) = (0,0)
// (left, bottom) = (-1,1), (right, top) = (1, 1)
//the z coordinate in NDC: Since we've projected from 3D to 2D, aren't all the z values the same? 
//Actually, the projection process retains the information about how far the point is by retaining 
//the z coordinate. The view plane (the near plane) corresponds to an NDC z coordinate of -1, 
//and the far plane to an NDC z coordinate of +1.

function getRaycaster(){
    let raycaster = new THREE.Raycaster();
	//raycaster.setFromCamera(mouse,camera);
	raycaster.linePrecision = 0.05;  //two big value can cause "lines" always in the raycaster intersection.
	raycaster.params.Points.threshold = 0.05;
	//the normalize mouse coord
/*	let mouse = new THREE.Vector2();
	let rect = renderer.domElement.getBoundingClientRect();
	mouse.x = ( ( e.clientX - rect.left ) / ( rect.right - rect.left ) ) * 2 - 1;
	mouse.y = - ( ( e.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
	
	raycaster.setFromCamera(mouse,camera);
*/	
	return raycaster;
}

function resetWorkEnv(){
	canvas.removeEventListener('click', edNone);
	canvas.removeEventListener('click', edNew);
//	canvas.removeEventListener('pointerup', edSticky);
//	canvas.removeEventListener('pointerup', edFree);
//canvas.removeEventListener( 'pointerdown', onPointerDownS );
canvas.removeEventListener( 'pointermove', onPointerMove );

//canvas.removeEventListener( 'pointerdown', onPointerDownF );
//canvas.removeEventListener( 'pointerdown', onPointerMoveF );

window.removeEventListener( 'keydown', keydownHandler );
window.removeEventListener( 'keyup', keyupHandler );
	
$("#labels").off('click', '*');			

	
	$("#saveModifiedPts").hide();
	updatedPoints={};
	
	let ctl = getTransformControler();
	scene.remove(ctl);
	
	clearAllJLs();
}

function setupClickHandler(mode){
	//let xx=getEventListeners(canvas);
	[edNone,edNew].forEach(i=>{
		canvas.removeEventListener('pointerup',i);	
	});
	
	switch(mode){
		case "none":
			canvas.addEventListener('click', edNone);  // 'pointerup', 'click', pointerdown
			break;
		case "new":
			canvas.addEventListener('click', edNew);  //pointerdown, or 'pointerup', 'click'
			break;
		case "modifier":
			/* The flow: 1. "mousedown" on a label, bind the XueWei to th transformController (not really necessart!)
			 * 			 2. redraw XW and line while moving.
			 *			 3. add the XW to the updatedList
			 */ 
			$("#labels").on('click', "*", this, selectXWViaLabel);   // 1.
			canvas.addEventListener( 'pointermove', onPointerMove );   // 2.  ...
//			canvas.addEventListener( 'pointerdown', onPointerDown );  //  3...pointerdown, click?
			canvas.addEventListener('click', edNone);  // 'pointerup', 'click'
			//canvas.addEventListener( 'pointerup', onPointerUpS );
			//canvas.addEventListener( 'click', pointCameraOnClick );
			window.addEventListener( 'keydown', keydownHandler ); 
			window.addEventListener( 'keyup', keyupHandler ); 
			break;
		default:
			alert("invalid modifier")
  }
}

var stickyMod=-1;
function keydownHandler(e){
	let ctl = getTransformControler();
//console.log(stickyMod);
	switch ( e.keyCode ) {
		case 27: // escape
			ctl.detach();
			render();
			break;
		case 81: // Q
			ctl.setSpace( control.space === 'local' ? 'world' : 'local' );
			break;
		case 83: // S, entering "Sticky" mode
//		console.log("S");
			stickyMod=1;
			break;
		case 65: // A, entering "Free" mode
		console.log("A");
			stickyMod=0;
			break;
		case 16: // Shift
			ctl.setTranslationSnap( 100 );
			ctl.setRotationSnap( THREE.MathUtils.degToRad( 15 ) );
			ctl.setScaleSnap( 0.25 );
			break;
		case 87: // W
			ctl.setMode( 'translate' );
			break;
		case 69: // E
			ctl.setMode( 'rotate' );
			break;
		case 82: // R
			ctl.setMode( 'scale' );
			break;
//		case 67: // C
//			const position = currentCamera.position.clone();
//			currentCamera = currentCamera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
//			currentCamera.position.copy( position );
//			orbit.object = currentCamera;
//			ctl.camera = currentCamera;
//			currentCamera.lookAt( orbit.target.x, orbit.target.y, orbit.target.z );
//			onWindowResize();
//			break;
		case 86: // V
			const randomFoV = Math.random() + 0.1;
			const randomZoom = Math.random() + 0.1;
			cameraPersp.fov = randomFoV * 160;
			cameraOrtho.bottom = - randomFoV * 500;
			cameraOrtho.top = randomFoV * 500;
			cameraPersp.zoom = randomZoom * 5;
			cameraOrtho.zoom = randomZoom * 5;
			onWindowResize();
			break;
		case 187:
		case 107: // +, =, num+
			ctl.setSize( ctl.size + 0.1 );
			break;
		case 189:
		case 109: // -, _, num-
			ctl.setSize( Math.max( ctl.size - 0.1, 0.1 ) );
			break;
		case 88: // X
			ctl.showX = ! ctl.showX;
			break;
		case 89: // Y
			ctl.showY = ! ctl.showY;
			break;
		case 90: // Z
			ctl.showZ = ! ctl.showZ;
			break;
		case 32: // Spacebar
			ctl.enabled = ! ctl.enabled;
			break;
	}	
}
function keyupHandler(e){
	let ctl = getTransformControler();
	switch ( e.keyCode ) {
		case 16: // Shift
			ctl.setTranslationSnap( null );
			ctl.setRotationSnap( null );
			ctl.setScaleSnap( null );
			break;
		case 83: // S, exit "Sticky" mode
//		console.log("-S");
			stickyMod=-1;
			break;
		case 65: // A, exit "Free" mode
		console.log("-A");
			stickyMod=-1;
			break;
	}
}
function edNone(e){
	e.preventDefault();   
	if(e.altKey)
		pointCameraOnClick(e);
}
function edNew(e){     //""mouseup" events not working, because of the OrbitControls!
	e.preventDefault();
	if(e.shiftKey)  //add XW
		addPointOnClick(e);
	else if(e.altKey){  //point camera
		pointCameraOnClick(e);
	}  //the rest: let OrbitControl move the camera	
}

function selectXWViaLabel(e){
	//alert('clicked ' + e.currentTarget.id);
	let [xwName, t] = e.currentTarget.id.split('_');	

	let obj= jlObjs.getObjectByName( xwName); 
	let transformControl=getTransformControler();
	transformControl.attach(obj); 
	render();
}


function onPointerMove( e ) {
	e.preventDefault();
	if(e.altlKey){  //point camera
		pointCameraOnClick(e);
//	}else if(e.shiftKey){  //move the 3D obj (via TransformContrl)
	}else {		//modifying xw point
		let transformControl =getTransformControler();
		let obj = transformControl.object;
		if(!obj)   //no object is selected;
			return;

		if(stickyMod==1){  //move the 3D obj (via TransformContrl)
		console.log("sticky mod");	
			let [pos, facing]=mouseIntersectOn3DObj([modelObj], e);
			if(pos){
				//updatePtr(obj, child.point, child.face.normal);
				console.log("update display", pos, facing);
				obj.position.set(pos.x, pos.y, pos.z);
				obj.facing=facing;
				updateAffectedLines(facing);
			}
		}else if(stickyMod==0){ //handled by transformCtrl
		console.log("free mod");
		}  
	}
	render();
	//orbitContrl alsp handles camara pan
}

function getTransformControler(){
	//let canvas = renderer.domElement;
	let obj=scene.getObjectByName("transformCtrl");
	if (!obj){
		let transformControl = new TransformControls( camera, canvas );
		transformControl.name='transformCtrl';
		transformControl.setSize(0.5);
		transformControl.addEventListener( 'change', render );
		transformControl.addEventListener( 'dragging-changed', function ( event ) {
			orbitCtrl.enabled = ! event.value;       //so orbitCtrl and transformCtrl will not interfere
		} );
		transformControl.addEventListener( 'objectChange', function () {
			updateAffectedLines();  //show we pass transformControl as a parameter? For "free modi", "facing" is irrelivent. so no need
							// in trying to pass it to the funcition.
		} );
		scene.add( transformControl );
	}
	return obj;
}
	
//when a point is modified, we update the display, and save it 
// to an array of modifiedPoints
function updateAffectedLines(facing=null) {
	//2021.08.09:prototype
	//2021.09.01, improving TODO: A point can be on multiple lines. Anything need to be done?
	let ptr=scene.getObjectByName("transformCtrl").object;
	let name=ptr.name;
	//let jlLine = ptsGroups.getObjectByName('L_足厥阴肝经');	
	let grp = ptr.parent;
	let [t,jlName] = grp.name.split('_');	
	
	//add to updatedPoints
	updatedPoints[jlName+'_'+name]=[ptr.position, facing]; 	
	//and show the save button
	$("#saveModifiedPts").show();
	//and updateLine('足厥阴肝经', '{r:100, g:100, b:100}');
	//updateLine(jlName, 0xFF0000);   //2021.09.01: why hard coded color here?
	updateLine(jlName);   //2021.09.11
}

function mouseIntersectOn3DObj(objs, mouseEvent){   //[modelObj]
		let raycaster=getRaycaster();
	
		//let mouse = getNormalizedMousePos(e);
		let mouse = new THREE.Vector2();
		let rect = renderer.domElement.getBoundingClientRect();
		mouse.x = ( ( mouseEvent.clientX - rect.left ) / ( rect.right - rect.left ) ) * 2 - 1;
		mouse.y = - ( ( mouseEvent.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
		//return mouse;	
		raycaster.setFromCamera(mouse,camera);
	
		let ptrPos, ptrFacing;
		//prepareRaycaster(e);
		//let intersects = raycaster.intersectObjects(jlObjs.children, true);
		let intersects = raycaster.intersectObjects(objs, true);  //target only the model
//		let intersects = raycaster.intersectObjects([modelObj], true);  //target only the model
		//console.log("intersected " + intersects.length);
		if(intersects.length > 0){ 
			let child = intersects[0];   //point at the facing object		
			//let rawName = child.object.name;

			ptrPos=child.point;
			ptrFacing=child.face.normal;
		}
	return [ptrPos, ptrFacing];
}
function pointCameraOnClick( e ) {
	let [pos, facing]=mouseIntersectOn3DObj([modelObj], e);
	if(pos){
		//orbitCtrl.target.set(child.point.x,child.point.y,child.point.z);
		orbitCtrl.target.set(pos.x,pos.y,pos.x);
		orbitCtrl.update();
	}   	
}

function addPointOnClick( e ) {
	if($('#jlName').text()==''){
		alert("Please select a JingLuo first.");
		return;
	}
	e.preventDefault();

	let [pos, facing]=mouseIntersectOn3DObj([modelObj], e);
		addTempPtr(pos, facing); 

		$("#uiLine").text($("#jlName").text());  
		$("#container").attr('disabled','disabled');
		$("#ptrX").text(pos.x);
		$("#ptrY").text(pos.y);
		$("#ptrZ").text(pos.z);

		$("#fcnX").text(facing.x);
		$("#fcnY").text(facing.y);
		$("#fcnZ").text(facing.z);

		$("#uiPoint").val("");
		$("#editDialog").dialog( "open" );
}	
function addTempPtr(co, facing){
	let grpName="tempPtrGrp";
	if(ptsGroups.getObjectByName(grpName) == null){  
		ptsGroups[grpName] = new THREE.Group();
		ptsGroups[grpName].name=grpName;
		ptsGroups.add(ptsGroups[grpName]);   //remember to add to ptsGroups, which is in scene
	}
	
	let tmpPtrGrp=ptsGroups.getObjectByName(grpName);
	tmpPtrGrp.clear();
	let pt=create3DPoint("tempPtr", co, facing, {color: 0xff0000});
	tmpPtrGrp.add(pt);

	render();
}

function create3DPoint(name, co, facing, ptColor){
	let ptSph;
	// the point spot
	let ptGeo = new THREE.SphereGeometry( 0.04, 4, 4 );
	let ptMat = new THREE.MeshBasicMaterial({color:ptColor} );
	ptSph = new THREE.Mesh( ptGeo, ptMat );
	ptSph.position.set(co['x'], co['y'], co['z']);
	// ...
	ptSph.name = name; 
	ptSph.facing=facing;
	//scene.add( ptSph );   // to be displayed as 3D obj
//2021.08.25: DEVL, use Sprite as label
//faster, but can't make it good enough.
//	createLabel(ptSph);  
	return ptSph;
}
//////////////////////// 2021.08.25 
//   https://threejsfundamentals.org/threejs/lessons/threejs-billboards.html
function createLabel(pt) {
  const name=pt.name, labelWidth=40, size=10;
  const canvas = makeLabelCanvas(labelWidth, size, name);
  const texture = new THREE.CanvasTexture(canvas);
  // because our canvas is likely not a power of 2
  // in both dimensions set the filtering appropriately.
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
	opacity: 0.8,
// color:0xff00ff,//设置精灵矩形区域颜色
//  rotation:Math.PI/4,//旋转精灵对象45度，弧度值

  });
  const label = new THREE.Sprite(spriteMaterial);
  //label.position.set(pt.position.x, pt.position.y, pt.position.z);  That is: take the parent coordinate
  label.scale.set(0.3, 0.3, 1); //// 只需要设置x、y两个分量就可以. image width?
  pt.add(label);

  function makeLabelCanvas(baseWidth, size, name){
    const borderSize = 1;
    const ctx = document.createElement('canvas').getContext('2d');
    const font =  `${size}px bold sans-serif`;
    ctx.font = font;
    // measure how long the name will be
    const textWidth = ctx.measureText(name).width;
    const doubleBorderSize = borderSize * 2;
    const width = baseWidth + doubleBorderSize;
    const height = size + doubleBorderSize;
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // need to set font again after resizing canvas
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, width, height);

    // scale to fit but don't stretch
    const scaleFactor = Math.min(1, baseWidth / textWidth);
    ctx.translate(width / 2, height / 2);
    ctx.scale(scaleFactor, 1);
    ctx.fillStyle = 'white';  
    ctx.fillText(name, 0, 0);

    return ctx.canvas;
  }
}

function render() {
	camera.aspect = canvas.clientWidth / canvas.clientHeight;
	camera.updateProjectionMatrix();

//camDist = camera.position.distanceTo( orbitCtrl.target );
//$("#curvLen").html("camers dist: "+ camDist);


    renderer.render(scene, camera);
	//2021.08.25 DEVL: try to use Sprite as label for better performance
	//but too ugly
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
		
		updateAllParticleSys();
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
function removeSubGroupOfJL(jlName, sub){
	let parent = ptsGroups.getObjectByName(jlName, true);
	let subGrp = ptsGroups.getObjectByName(sub+jlName, true);
	parent.remove(subGrp);
}
function getSubGroupOfJL(jlName, sub, color=null){
	var parent = ptsGroups.getObjectByName(jlName, true);
	if(!parent){
		parent = new THREE.Group();
		parent.name=jlName;
		parent.jlColor=color;  //2021.09.11: used in updateLine()
		ptsGroups.add(parent);   //remember to add to ptsGroups, which is in scene
	}
	var subGrp = ptsGroups.getObjectByName(sub+jlName, true);
	if(!subGrp){
		subGrp = new THREE.Group();
		subGrp.name=sub+jlName;
		parent.add(subGrp);   //remember to add to ptsGroups, which is in scene
	}
	return subGrp;
}
function createPointsOfJL(lName, ptrGrp, colr){
	var pGrp = getSubGroupOfJL(lName, 'P_', colr);
	ptrGrp.forEach((lst, i)=>{
		createPtsOfSubLine(lst, pGrp, i);
		});
	function createPtsOfSubLine(lst, grp, i){
	lst.forEach((p,j)=>{
		if(i>0 && j==0){  //subLine's first point is always shared '
			//find that point, 
			let tmp=pGrp.getObjectByName(p[0]);
			tmp.jlSubLine=tmp.jlSubLine+","+i;
		}else{
			let [xwName, seq, co, facing, isXW]=p;
			//let pt=create3DPoint(xwName +" "+seq, co, {color: 0xff0000});
			//let pt=create3DPoint(xwName, co, {color: new THREE.Color(color.r, color.g, color.b)});
			let pt=create3DPoint(xwName, co, facing, colr);
			pt.jlSubLine=i;
			pt.jlPtrSeq=seq;
			if(!isEditor && pt.name.startsWith('x'))
				pt.visible=false;
			//ptsGroups[lName].add(pt);
			grp.add(pt);
		}
	});
	}
}

function createLinesOfJL(jlName, ptrGrp, color){
	//ptrLst:  [ [ptr1, ptr2, ..], [ptr4, ptr5, ...], ... ]
	//console.log('show JL');
	let grpL = getSubGroupOfJL(jlName, 'L_', color);
	var colr=color;
	
	ptrGrp.forEach((p,i)=>{
		createSubLine(jlName, i, p);
	});
	function createSubLine(name, n, subLinePtrs){
		let points=[];
		let tmp;
		subLinePtrs.forEach((p,i)=>{
			let [xwName, seq, co, facing, isXW]=p;
			//if(isXW)
				tmp=new THREE.Vector3(co['x'], co['y'], co['z']);
				points.push(tmp);
		});
		createCurve(points, new THREE.Vector3(0,0,0), name+n);
	}
	function createCurve(ptsLst, loc, nm){
		let curve = new THREE.CatmullRomCurve3(ptsLst, false);  
		//curve.curveType = "centripetal";
		//curve.closed = false;
		const ps = curve.getPoints(100);  //get 100 aliquots
		const geometry = new THREE.BufferGeometry().setFromPoints(ps);  //2021.08.13: why not "curve"?
		const material = new THREE.LineBasicMaterial({
			color: colr,
			//color: new THREE.Vector4(color.r, color.g, color.b, 0.5),
			linewidth: 2,
			transparent: true, opacity: 0.5 ,
		});
		let curveObject = new THREE.Line(geometry, material);
		//curveObject.position.set(pts.position.x,pts.position.y,pts.position.z);
		curveObject.position.set(loc.x, loc.y, loc.z);
		//curveObject.name=lname;
		curveObject.name=nm;
		//DOING 2021.07.14 ]can i just add to
		//jlObjs.add(curveObject);
		//ptsGroups[nm].add(curveObject) ;
		grpL.add(curveObject) ;
	}		
}
//2021.08.09:prototype of build JL Line from points in scene. The idea is that it can 
//be updated automatically when the points is changed. No! that probably would not work!
//function createLinesOfJLv2(jlName, color){
function updateLine(jlName){
	//get the points from memory
	let pGrp = getSubGroupOfJL(jlName, 'P_');
	let color=pGrp.parent.jlColor;
	let subGrp = [];
	pGrp.children.forEach(p=>{       //for each points
		//based on p.jlSubLine, build a list of pts for each line:
		//console.log(p.name, p.jlSubLine, p.jlPtrSeq);
		let sl = String(p.jlSubLine).split(',');
		sl.forEach(i=>{
			//console.log(i);
			getGrp(parseInt(i)).push([p.name, p.jlPtrSeq, p.position, true]); //	[e["name"], e["seq"], e['coor'], e['isxw']
		});
	}) ;
	//removeSubGroupOfJL('足厥阴肝经', 'L_');
	//createLinesOfJL('足厥阴肝经', subGrp, {r:0,g:250,b:0});
	removeSubGroupOfJL(jlName, 'L_');
	//createLinesOfJL(jlName, subGrp, {r:0,g:250,b:0});
	//createLinesOfJL(jlName, subGrp, 0xFF0000);  //TODO
	createLinesOfJL(jlName, subGrp, color);  //TODO
	
	function getGrp(i){
		let grp=subGrp[i];
		if(!grp){
			subGrp[i]=[];
			grp=subGrp[i];
		}
		return grp;
	}
}

function createParticleSysOfJL(jlName, pGrps, color, size){
	let pathLen="length: "   ;  //for dev info only

	let grpPS = getSubGroupOfJL(jlName, 'PS_', color);
	var colr=color;

	pGrps.forEach((p,i)=>{
		createSubParticleSys(p, i);
	});
	$("#curvLen").html(pathLen);

	function createSubParticleSys(pLst, num) {
		let points=[];
		pLst.forEach((p,i)=>{
			let [xwName, seq, co, isXW]=p;
			//if(isXW)
				points.push(new THREE.Vector3(co['x'], co['y'], co['z']));
		});

		let curve = new THREE.CatmullRomCurve3(points, false);  
		//curve.curveType = "centripetal"; curve.closed = false;
		
		//TODO20210716: may use length to decide how many points
		let len=curve.getLength();
		let pointPace=0.1;
		pathLen = pathLen + len.toString() + ", "
		//$("#curvLen").html("length:"+len);
		let numPts=Math.ceil(len/pointPace);       //25;
		
		const ps = curve.getSpacedPoints(numPts);   //20210715: TODO: number of points may better be a parameter.

		let pArray=[], cArray=[], sArray=[], idArray=[], i=0.0;
		ps.forEach(p=> {
            pArray.push(p.x,p.y,p.z);
			//cArray.push( color.r, color.g, color.b, 0.5 );  //20210719: Let's make color uniform'
			sArray.push( size );    //Different point can have different size
			idArray.push (i);       //create sequence id; to be used for animate flowing by verying blrightness of partices
			i += 1.0;
        } );
		createParticleSys(jlName+'_'+num,   
            		pArray,  
            	//	cArray, 
            		sArray,
					idArray);	
	}
	function createParticleSys(lName, pArray, /*cArray,*/ sArray, idArray ){
	//let  uniforms = {    
	//		texture: { value: new THREE.TextureLoader().load( "particle.png" ) },
	//		del: 	 { type: "f", value: 0.9 }
	//};
		let parMaterial = new THREE.ShaderMaterial( {
			extensions: {
				derivatives: "#extension GL_OES_standar_derivatives:enable"
			},
			uniforms: {    //uniforms,
			  //  col: {type: 'vec3', value: new THREE.Color(0x00ff00)},  //red
			    col: {type: 'vec3', value: new THREE.Color(colr)},  //red
			    tick: { type: 'f', value: 2. },
			    cycles: { type: 'f', value: 4. },   //light every 4th point, and cycle through to simulate flowing.
				resulution:{value: new THREE.Vector4()},
			},
	 		//vertexShader: document.getElementById( 'pvshader' ).textContent,
			//fragmentShader: document.getElementById( 'pfshader' ).textContent,
	 		vertexShader: document.getElementById( 'vertexShader' ).textContent,  
			fragmentShader: document.getElementById( 'fragmentShader' ).textContent, 
	      //  blending: THREE.AdditiveBlending,
	        //depthWrite: false,  //?
	        //
	        //So first of all, what is depth test? Suppose if you are to draw 2 identical shapes directly in front of you but of different distance to you. In real life, you expect to only see the shape that is closer to you, correct?
			//Well if you were to try to do this without a depth test, you will only get the desired effect half the time: if the distant object is drawn before the closer object, no problem, same as real life; but if the closer object is drawn before the distance object, oh-oh, the distant object is visible when it should be not. Problematic.
			//Depth test is a tool built in today's GPUs to allow to get the desired draw output regardless of the order which the objects are drawn. 
	        //
	        transparent: true,  // so it can show throug even if it is under the skin.
	        vertexColors: true
		} );

//const parMaterial = new THREE.PointsMaterial( { color: 0x888888 } );

		let parGeo = new THREE.BufferGeometry();
		//for each point, set the properties, and pass to GSLS script
	    parGeo.setAttribute( 'position', new THREE.Float32BufferAttribute(pArray,3) );
	    //parGeo.setAttribute( 'positionN', new THREE.Float32BufferAttribute([0,0,0],3) );
	    //parGeo.setAttribute( 'color', new THREE.Float32BufferAttribute(cArray,3 ));   //20210719: All points have same color, from uniform.
	    parGeo.setAttribute( 'size', new THREE.Float32BufferAttribute(sArray,1 ) );  
	    parGeo.setAttribute( 'id', new THREE.Float32BufferAttribute(idArray,1 ) );  
	    
	    let parSys = new THREE.Points( parGeo, parMaterial );
	    parSys.name=lName;
	    //parSys.position.set(pts.position.x,pts.position.y,pts.position.z);
	    parSys.sortParticles = false;
	    parSys.dynamic = true;

		//ptsGroups[jlName].add(parSys) 
		grpPS.add(parSys) 
	}
}    
//var parSys;
function updateAllParticleSys(){ 
	ptsGroups.children.forEach(jl=>{
		//let pSys=lSys.getObjectByProperty("type", "Points");  //each JL has only one particle sys.
		//updateParticleSys(pSys);
		jl.children.forEach(jlSub=>{
			if(jlSub.name.startsWith("PS")){
				jlSub.children.forEach(ps=>{
					updateParticleSys(ps);
				});
			}
		});
	});
	function updateParticleSys(ps){
		let del = ps.material.uniforms.tick.value;
		if (del==3.){
			del=0.;
		}else{
			del=(del+1.);
		}
		ps.material.uniforms.tick.value = del;
		ps.needsUpdate = true;
	}
}

function clearJL(name){
	//if (ptsGroups[name])
	//	ptsGroups[name].clear();
	let obj=ptsGroups.getObjectByName(name, true);
	ptsGroups.remove(obj);
}

function clearAllJLs(){
	ptsGroups.clear();
}



function updateLabels() {
	var tempLabelPos=[];
	var tempV = new THREE.Vector3();  

	let pArr=[[],[]];
	let lblNormSizeX=labelSize/canvas.clientWidth;
	let lblNormSizeY=labelSize/canvas.clientHeight;

	camera.updateMatrixWorld(true, false);  //?

	//2021.08.31: try to scale the size of point 	 
	let camDist = camera.position.distanceTo( orbitCtrl.target );
	let scaleOfPtr = camDist/10.;
	$("#curvLen").html("camers dist: "+ camDist);
	
	var rect = renderer.domElement.getBoundingClientRect();
 
	 //remove all the labels
	$('#labels').empty();    //TODO: should use labelContainer
	// and then add back with the new coordinations 
	let isLblOverlap=false;
	//TODO 2021.08.16: need further optiomization: 
	//Any way to eliminate invisible points without using raycaster?
	let visiblePtrs = getVisiblePointsByFacing(0.2);
	if(isEditor){
		visiblePtrs.forEach((ch, ix)=>{
			ch.scale.set(scaleOfPtr,scaleOfPtr,scaleOfPtr);
/*			ch.updateWorldMatrix(true, false);
			ch.getWorldPosition(tempV);

	 		//convert normalized screen coor t CSS coor
			let x=Math.ceil((1.0+tempV.x)/lblNormSizeX);
			let y=Math.ceil((1.0+tempV.y)/lblNormSizeY);
			//console.log(ch.name, x, y);
			//the range will be 0 to 2 ?
			if(!pArr[x])
				pArr[x]=[];	
			const x2D = (tempV.x * .5 + .5) * canvas.clientWidth +rect.left;
			const y2D = (tempV.y * -.5 + .5) * canvas.clientHeight+rect.top;			
			pArr[x][y]=[ ch.name, ch.jlPtrSeq, x2D, y2D]; */
			let co = get2DcoorInView(ch);
			let x=Math.ceil(co.x/labelSize);
			let y=Math.ceil(co.y/labelSize);
			if(!pArr[x])
				pArr[x]=[];	
			pArr[x][y]=[ ch.name, ch.jlPtrSeq, co.x+rect.left, co.y+rect.top]; 
		});
	}else{   //viewer
		visiblePtrs.forEach((ch, ix)=>{
			if(!ch.name.startsWith('x')){   //display only real point; not the assiting ones
				let co = get2DcoorInView(ch);
				let x=Math.ceil(co.x/labelSize);
				let y=Math.ceil(co.y/labelSize);
			//console.log(x,y);
				if(!pArr[x])
					pArr[x]=[];	
				pArr[x][y]=[ ch.name, ch.jlPtrSeq, co.x+rect.left, co.y+rect.top]; 
			}	
		});
	}

	createAndAddLbls(pArr);


	function createAndAddLbls(arrOfPts){
		arrOfPts.forEach(row=>{  //row
			row.forEach(col=>{
				let [name, seq, x, y]=col;
				//console.log(name);
				const elem = document.createElement('div');
				elem.id = name+"_"+seq;
				const tt = isEditor?name+"_"+seq:name;

				if(isEditor){
					elem.innerHTML = tt;
				}else{
					elem.innerHTML = '<a href="http://localhost/html/text/textEdit_h.html?sid=3&sname=' + tt + '" target="details">' + tt + '</a>';
				}
		        elem.style.display = '';
		        // move the elem to that position
		        elem.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
		        elem.style.transform = `translate(${x}px,${y}px)`;
		        //elem.style.transform = `translate(1%, 1%) translate(${x}px,${y}px)`;
					 
		        // set the zIndex for sorting
		        elem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
				
				labelContainer.appendChild(elem);
			});
		});
	}
}

function getVisiblePointsByFacing(minVisibleDot){
	var visiblePtrs=[];
	//const minVisibleDot = 0.5;
	var dot;
	var tempV = new THREE.Vector3();     //not clean neither

	var cameraPosition = new THREE.Vector3();     //not clean neither
	camera.getWorldPosition(cameraPosition);
	var cameraDir=new THREE.Vector3();

	ptsGroups.children.forEach(jl=>{       //each JingLuo
		jl.children.forEach(g =>{          //P, SL, PS ...
			if(g.name.startsWith('P_')){    // ... the group of points
				let pts = g.children;
				pts.forEach((ch, i)=>{             //each point
					cameraDir.subVectors(cameraPosition, ch.position);
					//console.log(cameraDir);
					cameraDir=cameraDir.normalize();

					//let ptrFacing=ch.facing;
				    // get the dot product of camera relative direction to this position
				    // on the globe with the direction from the camera to that point.
				    // 1 = facing directly towards the camera
				    // 0 = exactly on tangent of the sphere from the camera
				    // < 0 = facing away
				    dot = cameraDir.dot(ch.facing);

					if(dot > minVisibleDot){  // facing camera enough
						ch.updateWorldMatrix(true, false);
						ch.getWorldPosition(tempV);  //Projects this vector from world space 
											//into the camera's normalized device coordinate (NDC) space
						tempV.project(camera);  //get the normalized screen coordinatie of the pos
					//console.log(tempV);	
		    			if ( tempV.x >= -1 && tempV.x <= 1 &&    // that is, in the view frame
				 			tempV.y >= -1 && tempV.y <= 1 ){
		      				visiblePtrs.push(ch);
						}
					}
				});
			}  
		});
	});

	return visiblePtrs;
}

function get2DcoorInView(obj){
	var tempV = new THREE.Vector3();
	obj.updateWorldMatrix(true, false);
	obj.getWorldPosition(tempV);
	tempV.project(camera);  //get the normalized screen coordinatie of the pos

//	//convert normalized screen coor t CSS coor
//	let x=Math.ceil((1.0+tempV.x)/lblNormSizeX);
//	let y=Math.ceil((1.0+tempV.y)/lblNormSizeY);
	//console.log(ch.name, x, y);
	//the range will be 0 to 2 ?
//	const x2D = (tempV.x * .5 + .5) * canvas.clientWidth +rect.left;
//	const y2D = (tempV.y * -.5 + .5) * canvas.clientHeight+rect.top;
	let x2D = (tempV.x * .5 + .5) * canvas.clientWidth;
	let y2D = (tempV.y * -.5 + .5) * canvas.clientHeight;

	return new THREE.Vector2(x2D, y2D);
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

function onWindowResize() {
/*	const aspect = window.innerWidth / window.innerHeight;

	cameraPersp.aspect = aspect;
	cameraPersp.updateProjectionMatrix();

	cameraOrtho.left = cameraOrtho.bottom * aspect;
	cameraOrtho.right = cameraOrtho.top * aspect;
	cameraOrtho.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	render();
*/
}


export {labelSize,
updatedPoints,
 renderer, init3D, loadGLTF, render,
createPointsOfJL, createLinesOfJL,createParticleSysOfJL,
clearAllJLs, clearJL,
updateAllParticleSys,
//setupFreeModifier, removeFreeModifier, 
//setupStickModifier, removeStickModifier,
//removeNewPointEditor, 
setupClickHandler,
initPointLabels, startAnimation, stopAnimation,
resetWorkEnv
};
//export {canvas, camera, scene, renderer, CameraCtrl, labelSize, initGlobalVars};
