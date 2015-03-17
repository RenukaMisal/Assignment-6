var http = require('http');
var url = require('url');
var fs = require('fs');	
var jf = require('jsonfile');
var util = require('util');

var id=1;
//1.Creating an constructor of Student.
var Student=function(id,email,name,enrolledSubjects){
	this.id=id;
	this.email=email;
	this.name=name;
	this.enrolledSubjects=enrolledSubjects;
}
//creating an array/repository of students.(existing)
var students=[];

//3.a method to add new students in repository 
var createStudent=function(newStud, callback){
	students.push(newStud);
	if(students.length != 0){
		callback(null,newStud);
	}
};

//4.Update existing record by email
var updateStudentByEmail = function (email, updateStudent, callback) {
	var array=email.split("/");
	var newEmail=(array[1]);
	console.log("New email id------------------------"+newEmail);

    for (var i = 0; i < students.length; i++) {
        if (students[i].email== newEmail)
       	    students[i] = updateStudent;
    }
    if (students.length != 0)
        callback(null, updateStudent);
};

//4.parsing an request body.
var parseRequestBody =function(req,callback){	
	var body='';
	req.on(
		//if event is readable in req then checking if body is a string or an object.
		'readable' ,function(){
			var rawBody=req.read();
			if (typeof rawBody == 'string') {
                    body += rawBody;
                } 
                else 
                	if (typeof rawBody == 'object' && rawBody instanceof Buffer) {
                    body += rawBody.toString('utf8');
                	}
			}
		);
	req.on(
		//if event on req is end i.e reading of req body is done then copy all data in studData by parsing it with JSON.parse.
		'end' ,function(){
			if(body){
				var studData=JSON.parse(body);
				callback(null,studData);
			}
		}
	);
};

//5.Reading a json file.
var getStudents=function(callback){
	callback(null,students);
}

//method to make an entry in each respective sub...
var insertInSub=function(){
	var sub1=[];
	var sub2=[],sub3=[];
	var file;
	var count1,count2,count3;
	//sub1.push("{subject name":"Maths");
	for (var i = 0; i <=students.length-1 ; i++) {
		var j=0;
		
		while(j<=students[i].enrolledSubjects.length-1){
		//checking which sub is enrolled by students
		switch (students[i].enrolledSubjects[j].subjectId) {
		    case "123":
		        count1=1;
		        var score=students[i].enrolledSubjects[j].Score;
		        var obj={id:students[i].id,score:score};
		        sub1.push(obj);
		        break;
		    case "124":
		    	count2=2;
		        var score=students[i].enrolledSubjects[j].Score;
		        var obj={id:students[i].id,score:score};
		        sub2.push(obj);
		        break;
		    case "125":
		       	count3=3;
		        var score=students[i].enrolledSubjects[j].Score;
		        var obj={id:students[i].id,score:score};
		        sub3.push(obj);
		        break;
		    }
			j++;
		}
	}

	if(count1==1){
		file='./Sub1.json';
		writeJson(sub1, file);
	}
	if(count2==2){
		file='./Sub2.json';
		writeJson(sub2, file);
	}
	if(count3==3){
		file='./Sub3.json';
		writeJson(sub3, file);
	}	
};

//6.delete operation 
var deleteStudentByEmail = function (email, callback) {

	var array=email.split("/");
	var newEmail=(array[1]);

    for (var i = 0; i < students.length-1; i++) {
    	  if (students[i].email == newEmail){
            students.splice(i, 1);
        	console.log("In delete... if------");
        }
    	break;
    }
    if (students.length >= 0)
        callback(null, students);
}

//7.creating server and depending on method type of req giving a call to functions.
var server=http.createServer(function(req,res){

	req.parseURL=url.parse(req.url);
	var reqURL=req.parseURL.pathname;
	console.log(reqURL);
	var id;
	var i=1;

	if (req.method == 'POST') {
        parseRequestBody(req, function (err, newStud) {
        	var email=newStud.email;
        	var id=newStud.id;
        	var name=newStud.name;
        	var enrolledSubjects=(newStud.enrolledSubjects);

        	createStudent(new Student(id,email,name,enrolledSubjects),function(e,createdStudent){
        		res.write(JSON.stringify(students));
        		writToFile();
				res.end("Create completed");
			});
		});
	}

	//read operation
    if(req.method=="GET"){
		console.log("in get method");
		getStudents(function (err, students) {
            if (err) {
                res.write("Error");
                return;
            }
	        res.write(JSON.stringify(students));
	        res.end();
        });
	}
	
	//update operation
	if(req.method=="PUT"){
		parseRequestBody(req, function (err, updateStudent) {
            if (err) {
                res.write("Error");
                return;
            }
	        updateStudentByEmail(reqURL, updateStudent, function(e, updateStudent) {
	        	
	        	if (err) {
	            res.write(response, err);
	            return;
	        	}
	          	writToFile();
	            res.end("hello updated");
			});
        });
	}

	//delete operation
	if(req.method=="DELETE"){
		deleteStudentByEmail(reqURL, function (err, students) {
            
            if (err) {
                res.write(response, err);
                return;
            }
           	res.end("hello deleted");
		});
	}
});
server.listen(8080);
console.log("server started");

var writeJson= function(result,file){

	jf.writeFile(file, result, function(err) {
	  		console.log("NOT error"+err);
	});
};

//function to write into JSON file
var writToFile=function(){

	var file = './Student.json';
	var result = [];

	for (var i = 0; i <=students.length-1 ; i++) {
		var obj= {id:students[i].id,email:students[i].email};
		console.log(JSON.stringify(obj));
		result.push(obj);
	}
	writeJson(result,file);
	insertInSub();
}