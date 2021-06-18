import * as THREE from './threejs/build/three.module.js';
import {labelSize} from './JLeditorGlobals.js';

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



export {populateField};


