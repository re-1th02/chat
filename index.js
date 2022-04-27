const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const messages1 =[]
const usersToIndex = {};
numberofUsers = 0;
const IndexToName = [];
const IndexToID   = [];
const IndexToSocketID = [];

io.on('connection', (socket) => {

	socket.on('chat message', msg => {
		messages1.push(msg);
		io.emit('chat message', {nam : (msg.index<0 ? "~" : ("~"+IndexToName[msg.index])), text : msg.text});
		io.to(socket.id).emit('sent', "");
	});

	socket.on('load message', msg => {
		io.to(socket.id).emit('load message', {msglist :messages1, nam : IndexToName});
	});

	socket.on('create user', msg => {
		var ind = msg.nam + "#$#%" + msg.id;
		if(ind in usersToIndex){
			io.to(socket.id).emit('user exists', "");
		}
		else{
			usersToIndex[ind] = numberofUsers;
			IndexToName.push(msg.nam);
			IndexToID.push(msg.id);
			IndexToSocketID.push(socket.id);
			io.to(socket.id).emit('logged in', numberofUsers);
			numberofUsers++;
		}
	});

	socket.on('access user', msg => {
		var ind = msg.nam + "#$#%" + msg.id;
		if(ind in usersToIndex){
			var index = usersToIndex[ind];
			IndexToSocketID[index] = socket.id;
			io.to(socket.id).emit('logged in', index);
		}
		else{
			io.to(socket.id).emit('no user exists', "");
		}
	});

});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
