import express from 'express';                  /* express 설정 */
import socketio from "socket.io";               /* socket.io 설정 - 채팅 기능 구현 시 사용 */
import http from "http";                        /* http 설정 - 채팅서버 오픈용 */
import {createConnection} from "typeorm";       /* DB Connection 설정 */
import router from './router';                  /* api 호출을 위한 Router 파일 import */

let app = express();
let server = http.createServer(app);
let io = require('socket.io')(server);

// 기본적으로 body-parser는 내장되어있지만 json 파싱을 위해 설정 추가
app.use(express.json());

// 미디어 타입 파싱 목적으로 아래 코드를 추가해줘야 한다.
app.use(express.urlencoded({
    extended: true
}));

// root path 설정
app.use('/', router);

// upload file path 설정
app.use('/uploads', express.static('uploads'));

// // 채팅 path 설정
// app.post('/chatRoom', function(req, res) {
//     res.sendFile(__dirname + '/index.html');
// });

// 채팅 관련 설정
io.sockets.on('connection', socket => {
    console.log('Socket Connected : ' + socket.id);
    
    // 채팅방 입장
    socket.on('enter', (data) => {
        const chatData = JSON.parse(data);
        const chat_no = chatData.roomNumber;
        const user_no = chatData.username;

        socket.join(chat_no);
        console.log(`[user_no : ${user_no}] entered [Room Number : ${chat_no}]`);
    });

    // 메시지 수신
    socket.on('newMessage', (data) => {
        const chatData = JSON.parse(data);
        console.log(`[Room Number ${chatData.chat_no}] ${chatData.user_no} : ${chatData.content}`);
        socket.broadcast.to(`${chatData.chat_no}`).emit('update', JSON.stringify(chatData));
    })    

    // 채팅방 퇴장
    socket.on('left', (data) => {
        const chatData = JSON.parse(data);
        const chat_no = chatData.roomNumber;
        const user_no = chatData.username;

        socket.leave(chat_no);
        console.log(`[user_no : ${user_no}] left [Room Number : ${chat_no}]`);
    });

    // socket 연결 해제
    socket.on('forceDisconnect', function() {
        socket.disconnect();
    })
    
    socket.on('disconnect', () => {
        console.log('Socket Disconnected : ' + socket.id);
    });
});


createConnection().then(connection => {
    // DB Connection 연결 설정 및 8080포트로 서버가 오픈되었음을 콘솔에서 확인
    app.listen(8080, () => {
        console.log('RestAPI Server is listening 8080');
    });

    // 8081포트로 채팅서버가 오픈되었음을 콘솔에서 확인
    server.listen(8081, () => {
        console.log('SocketIO Server is listening 8081');
    });
});