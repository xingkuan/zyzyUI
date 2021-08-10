//import * as THREE from './threejs/build/three.module.js';

function populateField(url, fn){
	//url='http://localhost:8080/zyzySvc/JL/getJLs';
	//alert("srcSetup: " + emID + ", " + val);
    $.ajax({
        type: "GET",
        url: url,
		async: false,
        data: "",
        success: function(data) {
        	//console.log(data);
        	if(data != null){
    		//json=JSON.parse(data);
    		//json.forEach(function(val){
    		data.forEach(e => fn(e));
        }
        },
		error : function(jqXHR, textStatus, errorThrown) {
			alert('error: ' + fn + " " + textStatus + errorThrown);
		}
    });
} 

function savePointUI(fn) {
	let	url="http://localhost:8080/zyzySvc/XW/upsertPoint";
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

function updatePoint3Dcoor(modelName, jl, name, coor){
	let	url="http://localhost:8080/zyzySvc/XW/updateCoor";
	
	let obj={"model_name":modelName,
				"line_name":jl,
				"name":name,
				"coor":coor
			};
	let json= JSON.stringify(obj);
	
	$.ajax({
		type : 'POST',
		async: false,
		url : url,
		contentType : 'application/text',
		dataType : "text",
		//data : '{"cat": "test1", "val": ' + $('#srcNote').val() + '}',
		data : json,
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

function savePointContent(fn) {
	let	url="http://localhost:8080/zyzySvc/STG/srcSaveNewVersion";
	$.ajax({
		type : 'POST',
		async: false,
		url : url,
		contentType : 'application/text',
		dataType : "text",
		data : fn(),
		success : function(data, textStatus, jqXHR) {
		},
		error : function(jqXHR, textStatus, errorThrown) {
			alert('error: ' + textStatus + errorThrown);
		}
	})
}



function buildJLpath(jl){
	let url='http://localhost:8080/zyzySvc/XW/getPointsByJL/'+jl;
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



export {populateField, savePointUI, savePointContent, updatePoint3Dcoor};


