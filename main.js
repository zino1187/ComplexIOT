/*
클라이언트가 모두 응용프로그램 기반이라면, 굳이 nodejs 서버를 구축할 필요가 없으나
클라이언트가 웹브라우저 기반일 경우, websocket를 이용해야 하므로
이때는 nodejs 로 구축하자!!
왜??  Nodejs는 웹소켓과 일반소켓 모두 지원하므로 다양한 클라이언트를 처리할 수 있다.
*/
var http=require("http");
var express=require("express");
var socketio=require("socket.io");
var net=require("net");

var app=express();
var server=http.createServer(app);

app.use("/main",function(request, response){
	console.log("클라이언트가 브러우저로 접속했네요");
	response.end("hi");
});

/*html,css, 이미지 등등의 정적자원의 위치를 명시한다*/
app.use(express.static(__dirname+"/"));

server.listen(8888, function(){
	console.log("웹서버가 8888포트에서 가동중...");
});

/*---------------------------------
웹소켓은 웹서버에 의존적이므로 이미 웹서버 객체가 생성되어 있어야 한다
웹서버에 의존적이므로 별도의 포트로 존재시키지 않는다. 그냥 listen으로 접속자 기다리면 됨..
---------------------------------*/
var io=socketio.listen(server);
var socketServer=io.sockets;
var websk;

socketServer.on("connection", function(socket){
	console.log("웹소켓 클라이언트 접속 발견");
	websk=socket;

	socket.on("message", function(data){
		console.log("client message:", data.toString());

		//웹소켓으로 받은 데이터를 소켓,웹소켓 클라이언트들에게 동시에 브로드케스팅한다
		send(data.toString());
	});	
});

/*---------------------------------
소켓 서버 구축하기
---------------------------------*/
var sk;
var netServer=net.createServer(function(socket){
	console.log("소켓 클라이언트 접속 감지");
	sk=socket;

	socket.on("data", function(msg){
		//소켓클라이언트 메세지 청취
		console.log("소켓 클라이언트 메세지:", msg.toString());		
		
		//소켓으로 받은 데이터를 소켓,웹소켓 클라이언트들에게 동시에 브로드케스팅한다
		send(msg);
	});
	
	socket.on("close", function(){
		console.log("소켓 클라이언트가 나갔습니다");
	});

});

//웹소켓이던, 소켓이던 모든 메세지를 전송한다 
function send(data){
	sk.write(data.toString()+"\n"); //소켓에 출력
	websk.emit("message",data.toString()+"\n"); //웹소켓에 출력
}

netServer.listen(7777,function(){
	console.log("소켓 서버가 7777포트에서 가동중...");	
});