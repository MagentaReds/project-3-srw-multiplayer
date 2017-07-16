$(function() {
	//global-ish variables to be used for us
	var socket = socket = io("/game", {reconnection: false});
	var gameRoom = null;
	var roomSlot = null;
	var id = null;
	var ready=false;
	// some global game variables below to help alleve server of some duties
	var attackTiles = [];
	var moveTiles = [];
	var allyTiles = [];
	var currentWeaponId;
	var currentSpiritId;
	var globalR=0;
	var globalC=0;
	var globalToR=0;
	var globalToC=0;

	var rooms=new Array(5);
	rooms[0]=new Array(2);
	rooms[1]=new Array(2);
	rooms[2]=new Array(2);
	rooms[3]=new Array(2);
	rooms[4]=new Array(2);

	//queue of messages to be displayed;
	var msgs =[];
	var msgInterval = null;
	var useFirstMessageModal = true;

	// example location of where an active unit could be
	var activeUnit = [];
	activeUnit = [5,2];

	var activePlayer = 3;
	var myId = 3;

	//Ajax call to get user id from logged in user.
	$.get("/user", function(res){
		if(res.success) {
			id=res.user._id;
			console.log(id);
			socket.emit("new player", {id:res.user._id}, function(data){
				console.log(data);
			});
		} else {
			socket.emit("new player", {id:null}, function(data){
				console.log(data);
			});
		}
	});


	jqueryMenuSetup();
	// .grid-square will handle click events and icons for units will be appended to here
	// .grid-style will handle all css coloring and blinking aspects of grid


	//Socket.io Event listeners
	//================================================
	socket.on("update rooms", function(data){
		console.log("Updating room values and display");
		rooms=data.rooms;
		updateRoomDisplay(rooms);
	});

	socket.on("update map", function(data){
		console.log("Updating map");
		buildGrid(data.map);
		writeMessage(data.msg);
		buildWeaponUi();
		buildSpiritUi();
		$("#surrender").hide();
		$("#status").hide();
		$("#endSurrender").hide();
		$("#menu").hide();
		$("#menu2").hide();
		$("#hitAwayAndHasAttackedHasMoved").hide();
		$("#hitAwayAndHasAttacked").hide();
		socket.emit("active unit", function(data){
			displayActiveTile([data.r, data.c]);
			blinkActiveTile([data.r, data.c]);
		});
	});

	socket.on("game start", function(data1){
		console.log("Game is starting");
		$("#roomDiv").hide();
		$("#gameField").toggleClass("hidden");
		$("#roomMessageDiv").append($("<p>").text("Game is starting!"));
		$("#messageDiv").text(data1.msg);
		$(".move").bind("click", moveOptions);
		buildWeaponUi();
		buildSpiritUi();
		socket.emit("active unit", function(data){
			displayActiveTile([data.r, data.c]);
			blinkActiveTile([data.r, data.c]);
		});
	});

	socket.on("room message", function(data){
		console.log(data.msg);
		writeMessage(data.msg);
	});

	socket.on("chat message", function(data){
		console.log(data.msg);
		console.log(data.msg);
		var p = $("<p>");
		p.text(data.msg);
		var chat = document.getElementById('chatDisplay');
		var shouldScroll = chat.scrollTop + chat.clientHeight === chat.scrollHeight;
		$(chat).append(p);
		if(shouldScroll)
			chat.scrollTop = chat.scrollHeight;
	});

	socket.on("get counter", function(data){
		console.log(data);
		defendOptions(data);
	});

	socket.on("update players", function(data){
		console.log(data);
		updatePlayerDisplay(data);
	});

	//Document event listeners
	//==========================================================================

	$(document).on("submit", "#chatForm", function(e){
			e.preventDefault();
			var msg = $("#chatInput").val().trim();
			socket.emit("send chat", msg);
			$("#chatInput").val("");
		});

	$(".cancelMove").on("click", function() {
		socket.emit("active unit", function(data){
			console.log([data.r,data.c]);
			socket.emit("do cancel", {r:data.r, c:data.c}, function(response){
				console.log(response);
				if(response.success) {
					$("#menu2").hide();
					// $("#menu").show();
					socket.emit("active unit", function(data){
					displayActiveTile([data.r, data.c]);
					blinkActiveTile([data.r, data.c]);
					});
				}
			});
		});
	});

	// clicking on weapon
	$(document).on("click", "div.weapon", function(event){
		var wepId = parseInt($(this).attr("data"));
		currentWeaponId = wepId;
		console.log("WEAPON ID: " + wepId);
		$("#menu").hide();
		$("#menu2").hide();
		socket.emit("active unit", function(data){
			socket.emit("get targets", {id: id, r: data.r, c: data.c, weapon: wepId}, function(response){
				displayAttackTiles(response.range);
				attackTiles = response.range;
			});
		});
		// need request from server to see what the availableAttackTiles are;
		// var availableAttackTiles = [];
		// availableAttackTiles =[response];
		// displayAttackTiles(availableAttackTiles);
		$("#cancel").show().one("click", cancelAttack);
		$("#cancel").show();
		bindEscKey(cancelAttackEsc);
	});

	$(document).on("click", "div.spiritGrant", function(event){
		var scId = parseInt($(this).attr("data"));
		console.log("SC ID: " + scId);
		currentSpiritId = scId;
		$("#menu").hide();
		$("#menu2").hide();
		socket.emit("active unit", function(data){
			socket.emit("get allies", {id: id, r: data.r, c: data.c}, function(response){
				displayAllyTiles(response.targets);
				allyTiles = response.targets;
			});
		});
		// need request from server to see what the availableAttackTiles are;
		// var availableAttackTiles = [];
		// availableAttackTiles =[response];
		// displayAttackTiles(availableAttackTiles);
		$("#cancel").show().one("click", cancelSpirit);
		//$("#cancel").show();
		bindEscKey(cancelSpiritEsc);
	});

	$(".standby").on("click", function(){
		socket.emit("active unit", function(data){
			socket.emit("do standby", {r: data.r, c: data.c}, function(response){
				console.log(response);
			})
		})
	})

	$(document).on("click", "div.statusDiv", function(event){
		socket.emit("get status", {r: globalR, c:globalC}, function(data){
			console.log(data);
			fillStatusModal(data.status);
		});
	});


	$(document).on("click", ".defenderWeaponButton", function(event){
		var defenderWepId = parseInt($(this).attr("data"));
		socket.emit("do counter", {action: "Attack", weapon: defenderWepId}, function(data){
				console.log(data);
				if (data.success) {
					console.log("Success, you attacked!");
					$("#counterMenu").hide();
				}
				else if (!data.succes) {
					console.log("You cannot attack with that weapon");
					writeMessage("You cannot attack with that weapon.");
				}
			});
	});


	$("#confirmEvade").on("click", function(){
		socket.emit("do counter", {action: "Evade", weapon: null}, function(data){
			if (data.success) {
				console.log("Success, you choose to evade!");
				$("#counterMenu").hide();
			}
			else if (!data.succes) {
				console.log("You cannot evade");
				writeMessage("You cannot evade.");
			}
		});
	});

	$("#confirmDefend").on("click", function(){
		socket.emit("do counter", {action: "Defend", weapon: null}, function(data){
			if (data.success) {
				console.log("Success, you choose to defend!");
				$("#counterMenu").hide();
			}
			else if (!data.succes) {
				console.log("You cannot defend");
				writeMessage("You cannot defend.");
			}
		});
	});

	$(document).on("click", ".confirmAttack", confirmAttack);
	$(document).on("click", ".cancelAttack", cancelAttack);

	// code for checking and displaying which tile was clicked on
	// also the UI for displaying options for clicked grid square should pop up here
	$(document).on("click", "div.grid-square", function(event) {
		var dataR = parseInt($(this).attr("data-r"));
		var dataC = parseInt($(this).attr("data-c"));
		selectTile(dataR, dataC);
	});

	$(document).on("click", ".unitBox", function(){
		var dataR = parseInt($(this).attr("data-r"));
		var dataC = parseInt($(this).attr("data-c"));
		selectTile(dataR, dataC);
	});

	$(".joinRoom").on("click", function(e){
		console.log("Trying to Join a room");
		e.preventDefault();
		var room=parseInt($(this).attr("data-room"));

		socket.emit("join room", room, function(data){
			if(data.success) {
				gameRoom=room;
				roomSlot=data.slot;
			}
			writeMessage(data.msg);
		});
	});

	$("#leaveRoom").on("click", function(e){
		console.log("Trying to leave a room");
		e.preventDefault();

		socket.emit("leave room", function(data){
			console.log("Do we get here?");
			if(data.success) {
				gameRoom=null;
				roomSlot=null;
			}
			writeMessage(data.msg);
		})
	});

	$("#ready").on("click", function(e){
		console.log("Toggling Ready");
		e.preventDefault();
		var state=$("#ready").attr("data-state");

		socket.emit("toggle ready", function(data){
			ready=data.ready;
			writeMessage(data.msg);
		});
	});


	//Start of function definitions
	//============================================
	function updateRoomDisplay(rooms) {
		var count=0;
		for(var i=0; i<rooms.length; ++i){
			for(var k=0; k<rooms[i].length; ++k) {
				if(rooms[i][k]) {
					$(`#room${i}_slot${k}`).text(rooms[i][k]);
					++count;
				} else
					$(`#room${i}_slot${k}`).text('_');
			}
			$(`#room${i}Count`).text(count);
			count=0;
		}
	}


	function enableActions(actions=-1) {
		var scrollTop = 0; // document.getElementById('mapContainer').scrollTop;
		var scrollLeft = 0; //document.getElementById('mapContainer').scrollLeft;
		var pos = $(`div.grid-square[data-r=${globalR}][data-c=${globalC}]`).offset();
		//console.log(pos.top, pos.left);
		//move menu to our grid's posiiton, adjusted by the scroll bar top/left position.
		$(".ui-menu-our").css("top", pos.top+50+scrollTop).css("left", pos.left+scrollLeft);
		//$(".ui-menu-our").position({my: "left top", at: "left bottom",of: `div.grid-square[data-r=${globalR}][data-c=${globalC}]`});

		if (actions === -1) { // hide all menus
			$("#menu").hide();
			$("#menu2").hide();
			$("#endSurrender").hide();
			$("#status").hide();
			$("#surrender").hide();
			$("#hitAwayAndHasAttackedHasMoved").hide();
			$("#hitAwayAndHasAttacked").hide();
		}
		else if (actions === 0) { // click on active unit AS active player, brings up main actions menu
			$("#menu").show();
			$("#menu2").hide();
			$("#endSurrender").hide();
			$("#status").hide();
			$("#surrender").hide();
			$("#hitAwayAndHasAttackedHasMoved").hide();
			$("#hitAwayAndHasAttacked").hide();
		}
			else if (actions === 1) { // active unit has moved and can now attack, standby or CANCEL his movement
			$("#endSurrender").hide();
			$("#status").hide();
			$("#menu").hide();
			$("#menu2").show();
			$("#surrender").hide();
			$("#hitAwayAndHasAttackedHasMoved").hide();
			$("#hitAwayAndHasAttacked").hide();
		}
		else if (actions === 2) { // active unit has hit away and has attacked, but NOT moved
			$("#hitAwayAndHasAttacked").show();
			$("#hitAwayAndHasAttackedHasMoved").hide();
			$("#menu").hide();
			$("#menu2").hide();
			$("#endSurrender").hide();
			$("#status").hide();
			$("#surrender").hide();
		}
		else if (actions === 3) { // active unit has hit away and has attack and has moved
			$("#hitAwayAndHasAttackedHasMoved").show();
			$("#hitAwayAndHasAttacked").hide();
			$("#menu").hide();
			$("#menu2").hide();
			$("#endSurrender").hide();
			$("#status").hide();
			$("#surrender").hide();
		}
		else if (actions === 4) { // get status if active player or not
			$("#status").show();
			$("#menu").hide();
			$("#menu2").hide();
			$("#endSurrender").hide();
			$("#surrender").hide();
			$("#hitAwayAndHasAttackedHasMoved").hide();
			$("#hitAwayAndHasAttacked").hide();
		}
		else if (actions === 5) { // if you click on an empty square AS an active player, can end turn or surrender
			$("#endSurrender").show();
			$("#menu").hide();
			$("#menu2").hide();
			$("#status").hide();
			$("#surrender").hide();
			$("#hitAwayAndHasAttackedHasMoved").hide();
			$("#hitAwayAndHasAttacked").hide();
		}
		else if (actions === 6) { // if you click on an empty square NOT as active player, you can only Surrender
			$("#surrender").show();
			$("#status").hide();
			$("#endSurrender").hide();
			$("#menu").hide();
			$("#menu2").hide();
			$("#hitAwayAndHasAttackedHasMoved").hide();
			$("#hitAwayAndHasAttacked").hide();
		}
	}

	function writeMessage (msg) {
		$("#messageDiv").text(msg);
		addMessage(msg);

		var roomMsg = document.getElementById('roomMessageDiv');
		var shouldScroll = roomMsg.scrollTop + roomMsg.clientHeight === roomMsg.scrollHeight;
		$(roomMsg).append($("<p>").text(msg));
		if(shouldScroll)
			roomMsg.scrollTop = roomMsg.scrollHeight;
	}

	// code that makes 900 grid-tiles with each row and column's data index stored
	function buildGrid (map) {
		$("#grid").empty();
		for (var r = 0; r < map.length; r++) {
			for (var c = 0; c < map[0].length; c++) {
				$("#grid").append(`<div class="grid-square" data-r = "${r}" data-c = "${c}"><div class="grid-style" data-r = "${r}" data-c = "${c}"></div></div>`);
				if (map[r][c]) {
					$(`#grid .grid-square[data-r=${r}][data-c=${c}]`).append(`<img src=${map[r][c]}>`);
				}
			}
			$("#grid").append("<br>");
		}
	}


	// $(`li[data-r=${5}][data-c=${5}]`).append(`<img src=assets/media/icon1.png style="margin:-15px 0px 3px -3px; height:60px;">`);
	// $(`li[data-r=${5}][data-c=${7}]`).append(`<img src=assets/media/icon1.png style="margin:-15px 0px 3px -3px; height:60px;">`);

	function displayActiveTile(locate) {
		// locates active tile where unit will be and colors in tile with green
		$(`div.grid-style[data-r=${locate[0]}][data-c=${locate[1]}]`).css('background', "#64dd17").css('opacity', "0.5");
		var scrollTop = document.getElementById('mapContainer').scrollTop;
		var scrollLeft = document.getElementById('mapContainer').scrollLeft;
		var tile = $(`div.grid-square[data-r=${locate[0]}][data-c=${locate[1]}]`);
		var offset = tile.offset();
		var pos = tile.position();
		var mapDiv = $(document.getElementById('mapContainer'));
		var height = mapDiv.scrollHeight;
		mapDiv.animate({scrollTop: pos.top+scrollTop-300, scrollLeft: pos.left+scrollLeft-400});// = pos.top - pos2.top;
		// = pos.left - pos2.left;
		// console.log("height: " + height, pos.top - pos2.top);
		console.log(pos);
		console.log(locate);
	}
	function blinkActiveTile(locate) {
		// locates active tile where unit will be and blinks tile
		// seperate function because we will want to keep coloring in active tile while not toggling the blink
		$(`div.grid-style[data-r=${locate[0]}][data-c=${locate[1]}]`).addClass('blink');
	}
	// call these functions on load
	// from server we will get an array where the active unit on current turn is located

	function displayAvailableMoveTiles(locate) {
		// locates and loops through available tiles that active unit can move to, coloring them blue and toggling the CSS blink class
		var data = {};
		data.player = id;
		socket.emit("active unit", function(data){
			socket.emit("get move", data, function(data){
				if(data.success) {
					// $("#arrayName").text(data.type);
					console.log(data.type);
					moveTiles = data.array;
					setTimeout(function(){
						for (var y = 0; y < data.array.length; y++) {
							$(`div.grid-square div.grid-style[data-r=${data.array[y][0]}][data-c=${data.array[y][1]}]`).css('background', "#2196f3").css('opacity', "0.5").addClass('blink');
							$(`div.grid-square[data-r=${data.array[y][0]}][data-c=${data.array[y][1]}]`).bind("click", moveToTile);
						}
					}, 5);
					setTimeout(function(){
						socket.emit("active unit", function(data){
							displayActiveTile([data.r, data.c]);
							blinkActiveTile([data.r, data.c]);
						});
					}, 50);
				}
				writeMessage(data.msg);
			});
		});
	}

	function hideAvailableMoveTiles(locate) {
		// function that is called by the cancel button to hide and unbind click event available move tiles
					setTimeout(function(){
						for (var y = 0; y < locate.length; y++) {
							$(`div.grid-square div.grid-style[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).css('background', "transparent").css('opacity', "1").removeClass('blink');
							$(`div.grid-square[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).unbind("click");
						}
					}, 5);
					// set time out function here so code above doesn't hide active unit green square
					setTimeout(function(){
						socket.emit("active unit", function(data){
							displayActiveTile([data.r, data.c]);
							blinkActiveTile([data.r, data.c]);
						});
					}, 50);
				}

	function moveToTile() {
		// Each available move tile from the above function will bind to this function
		// clicked tile data will need to be sent to server
		console.log("Request Move Action sent to server");
		console.log([parseInt($(this).attr("data-r")),parseInt($(this).attr("data-c"))]);
		var toR = parseInt($(this).attr("data-r"));
		var toC = parseInt($(this).attr("data-c"));
		var data = {};
		data.player = id;
		socket.emit("active unit", function(data){
			data.toR=toR;
			data.toC=toC;
			console.log(data);
			socket.emit("do move", data, function(data){
				console.log(data);
				if(data.success) {
					socket.emit("active unit", function(data){
						displayActiveTile([data.r, data.c]);
						blinkActiveTile([data.r, data.c]);
					});
				}
				writeMessage(data.msg);
				console.log(data.actions);
				$("#cancel").hide();
				enableActions(data.actions);
			});
		});
	}

	function moveOptions (e) {
		// function that will be bound to JQuery UI's menu button with the "move" label.
		// use availableMoveSpaces as argument for displayAvailableMoveTiles function and show cancel button as well as bind it to cancelMoveBeforeDoingMove function
		// will need request to server to see what the available move spaces are
		displayAvailableMoveTiles();
		$("#menu").hide();
		$("#menu2").hide();
		$("#hitAwayAndHasAttacked").hide();
		$("#status").hide();
		$("#cancel").show().one("click", cancelMoveBeforeDoingMove);
		//$("#cancel").show();
		bindEscKey(cancelMoveBeforeDoingMoveEsc);
	}

	function cancelMoveBeforeDoingMove (e) {
		// use global varaible moveTiles to pass as argument to hide move tiles so we aren't pinging back to server which tiles to hide
		hideAvailableMoveTiles(moveTiles);
		moveTiles = [];
		// hide and unbind cancel button so we don't double up on its functionality later on
		$("#cancel").hide();
		$("#cancel").unbind("click");
		$(document).off("keydown");
	}

	function cancelMoveBeforeDoingMoveEsc (e) {
		if(e.which===27) {
			// use global varaible moveTiles to pass as argument to hide move tiles so we aren't pinging back to server which tiles to hide
			hideAvailableMoveTiles(moveTiles);
			moveTiles = [];
			// hide and unbind cancel button so we don't double up on its functionality later on
			$("#cancel").hide();
			$(document).off("keydown");
		}
	}

	function cancelAttack (e) {
		hideAttackTiles(attackTiles);
		attackTiles = [];
		$("#attackConfirmModal").dialog("close");
		$("#cancel").hide();
		$("#cancel").unbind("click");
		$(document).off("keydown");
	}

	function cancelAttackEsc (e) {
		if(e.which===27) {
			$("#attackConfirmModal").dialog("close");
			hideAttackTiles(attackTiles);
			attackTiles = [];
			$(document).off("keydown");
			$("#cancel").hide();
		}
	}

	function cancelSpirit (e) {
		hideAttackTiles(allyTiles);
		allyTiles = [];
		$("#cancel").hide();
		$("#cancel").unbind("click");
		$(document).off("keydown");
		socket.emit("active unit", function(data){
			displayActiveTile([data.r, data.c]);
			blinkActiveTile([data.r, data.c]);
		});
	}

	function cancelSpiritEsc (e) {
		if(e.which===27) {
			hideAttackTiles(allyTiles);
			allyTiles = [];
			$(document).off("keydown");
			$("#cancel").hide();
			socket.emit("active unit", function(data){
				displayActiveTile([data.r, data.c]);
				blinkActiveTile([data.r, data.c]);
			});
		}
	}

	function displayAttackTiles(locate) {
		setTimeout(function(){
			for (var y = 0; y < locate.length; y++) {
				$(`div.grid-square div.grid-style[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).css('background', "#d32f2f").css('opacity', "0.5").addClass('blink');
				$(`div.grid-square[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).bind("click", attackEnemy);
			}
		}, 5);
	}

	function displayAllyTiles(locate) {
		setTimeout(function(){
			for (var y = 0; y < locate.length; y++) {
				$(`div.grid-square div.grid-style[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).css('background', "#ffeb3b").css('opacity', "0.5").addClass('blink');
				$(`div.grid-square[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).bind("click", castSpirit);
			}
		}, 5);
	}

	function hideAttackTiles(locate) {
		for (var y = 0; y < locate.length; y++) {
			$(`div.grid-square div.grid-style[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).css('background', "transparent").css('opacity', "1").removeClass('blink');
			$(`div.grid-square[data-r=${locate[y][0]}][data-c=${locate[y][1]}]`).unbind("click");
		}
	}

	function attackEnemy () {
		console.log("Request Attack Action sent to server");
		var dataToR = parseInt($(this).attr("data-r"));
		var dataToC = parseInt($(this).attr("data-c"));
		console.log(currentWeaponId);
		console.log([dataToR, dataToC]);
		socket.emit("active unit", function(data){
			socket.emit("get stats", {r:data.r, c:data.c, toR: dataToR, toC: dataToC, weapon: currentWeaponId}, function(data){
				if (data.success) {
					globalToR=dataToR;
					globalToC=dataToC;
					console.log(data);
					var modal = $("#attackConfirmModal");
					modal.find(".target").text(data.target);
					modal.find(".weapon").text(data.weapon);
					modal.find(".percent").text(data.stats[1]);
					modal.dialog("open");
				}
				else if (!data.success) {
					console.log("can't use that weapon");
					writeMessage("You cannot use that weapon!");
					console.log(data);
					cancelAttack();
				}
			});
		});
	}

	function confirmAttack(e) {
		console.log("Request Attack Action sent to server");
		var dataToR = globalToR;
		var dataToC = globalToC;
		console.log(currentWeaponId);
		console.log([dataToR, dataToC]);
		socket.emit("active unit", function(data){
			socket.emit("do attack", {r:data.r, c:data.c, toR: dataToR, toC: dataToC, weapon: currentWeaponId}, function(data){
				if (data.success) {
					console.log(data);
					currentWeaponId = null;
					$("#cancel").hide();
					$("#cancel").unbind("click");
					$(document).off("keydown");
					cancelAttack();
				}
				else if (!data.success) {
					console.log("can't use that weapon");
					writeMessage("You cannot use that weapon!");
					console.log(data);
					cancelAttack();
				}
			});
		});
	}

	function castSpirit () {
		console.log("Request Spirit Action sent to server");
		var dataToR = parseInt($(this).attr("data-r"));
		var dataToC = parseInt($(this).attr("data-c"));
		console.log(currentSpiritId);
		console.log([dataToR, dataToC]);
		socket.emit("active unit", function(data){
			socket.emit("do spirit", {r:data.r, c:data.c, toR: dataToR, toC: dataToC, spirit: currentSpiritId}, function(data){
				if (data.success) {
					console.log(data);
					currentSpiritId = null;
					$("#cancel").hide();
					$("#cancel").unbind("click");
					$(document).off("keydown");
					cancelSpirit();
					writeMessage(data.msg);
					socket.emit("active unit", function(data){
						displayActiveTile([data.r, data.c]);
						blinkActiveTile([data.r, data.c]);
					});
				}
				else if (!data.success) {
					console.log("can't cast that spirit");
					writeMessage("You cannot cast that spirit!");
					console.log(data);
					cancelSpirit();
				}
			});
		});
	}

	function buildWeaponUi () {
		// function is called at beginning of game
		// will also need to be called as soon as turn is over
		socket.emit("active unit", function(data){
			socket.emit("get weapons", {r:data.r, c:data.c}, function(wepObj){
				console.log(wepObj);
				$(".weapons").empty();
				for (var x = 0; x < wepObj.weapons.length; x++) {
					$(".weapons").append(`<li>
																	<div class = "weapon" data="${wepObj.weapons[x].id}">
																		<span class="ui-icon ui-icon-radio-on">
																		</span>
																		${wepObj.weapons[x].name}
																	</div>
																</li>`);
				}
				$("#menu").menu("refresh");
				$("#menu2").menu("refresh");
			});
		});
	}

	function buildSpiritUi () {
		// function is called at beginning of game
		// will also need to be called as soon as turn is over
		socket.emit("active unit", function(data){
			socket.emit("get spirit", {r:data.r, c:data.c}, function(res){
				console.log(res);
				$(".spirits").empty();
				for (var x = 0; x < res.spirits.length; x++) {
					$(".spirits").append(`<li>
																	<div class = "spiritGrant" data="${x}">
																		<span class="ui-icon ui-icon-radio-on">
																		</span>
																		${res.spirits[x]}
																	</div>
																</li>`);
				}
				$("#menu").menu("refresh");
			});
		});
	}

	function fillStatusModal(data)  {
		console.log("GET DATA PACKET FROM BACK END");
		$("#mechName").empty();
		$("#mechPic").empty();
		$("#healthNum").empty();
		$("#energyNum").empty();
		$("#spNum").empty();
		$("#pilotPic").empty();
		$("#pilotName").empty();
		$("#pilotStatus").empty();
		$("#pilotWill").empty();
		$("#weaponColumns").empty();
		$("#weaponData").empty();
		$("#statusModal").dialog("open");
		$("#mechName").append(data.mechName);
		var health = parseInt((data.hp / data.hpMax)*100);
		var energy = parseInt((data.en / data.enMax)*100);
		var sp = parseInt((data.sp / data.spMax)*100);
		$("#healthNum").append(`HP: ${data.hp} / ${data.hpMax}`);
		$( "#healthBar" ).progressbar({
				value: health
			});
		$("#energyNum").append(`EN: ${data.en} / ${data.enMax}`);
		$( "#energyBar" ).progressbar({
				value: energy
			});
		$("#spNum").append(`SP: ${data.sp} / ${data.spMax}`);
		$( "#spBar" ).progressbar({
				value: sp
			});
		$("#pilotName").append(data.pilotName);
		$("#pilotStatus").append(data.status.toString());
		$("#pilotWill").append(`Will: ${data.will}`);
		$("#weaponColumns").append("Weapon | Ammo | En | Dmg | Rng | Hit | Properties");
		$("#mechPic").append(`<img src=${data.mechImg}>`);
		$("#pilotPic").append(`<img src=${data.pilotImg} height=80 width=80>`);
		for (var x = 0; x < 9; x++) {
			if (data.weapons[x] == null)
				$("#weaponData").append(`[ empty weapon slot #${x+1} ]<br>`);
			else
				$("#weaponData").append(`${data.weapons[x].name} | ${data.weapons[x].curAmmo}/${data.weapons[x].maxAmmo} | ${data.weapons[x].en} | ${data.weapons[x].damage} | ${data.weapons[x].range[0]}~${data.weapons[x].range[1]} | +${data.weapons[x].hit} | ${data.weapons[x].props.toString()}<br>`);
		}
	}


	function defendOptions (data) {
		console.log(data.weapons);
		enableActions(-1);

		var weapons = $("#counterAttack .weapons");
		weapons.empty();
		var newDiv
		for (var i = 0; i < data.weapons.length; i++) {
			newDiv=$("<div>");
			newDiv.addClass("defenderWeaponButton").attr("data", i);
			if(data.stats[i][0])
				newDiv.text(`${data.weapons[i].name}, ${data.weapons[i].range}, ${data.weapons[i].damage}, ${data.stats[i][1]}`)
			else
				newDiv.append($("<del>").text(`${data.weapons[i].name}, ${data.weapons[i].range}, ${data.weapons[i].damage}, ${data.stats[i][1]}`));
			weapons.append($("<li>").append(newDiv));
		}

		var menu = $("#counterMenu");
		menu.find(".attacker").text(data.attacker);
		menu.find(".weapon").text(data.attackWeapon);
		menu.find(".hitPercent").text(data.hitPercent);
		menu.menu("refresh");
		menu.show();
	}

	function jqueryMenuSetup() {
	  $( "#menu" ).menu();
    $( "#menu2" ).menu();
    $( "#cancel" ).menu();
    $( "#status" ).menu();
    $( "#endSurrender" ).menu();
    $( "#surrender" ).menu();
    $( "#hitAwayAndHasAttacked" ).menu();
    $( "#hitAwayAndHasAttackedHasMoved" ).menu();
    $("#counterMenu").menu();
    $( "#statusModal" ).dialog({
      autoOpen: false,
      show: {
        effect: "blind",
        duration: 500
      },
      hide: {
        effect: "explode",
        duration: 1000
      },
      width: 500
    });
    $( "#defendModal" ).dialog({
      autoOpen: false,
      show: {
        effect: "blind",
        duration: 500
      },
      hide: {
        effect: "explode",
        duration: 1000
      }
    });
		$( "#attackConfirmModal" ).dialog({
      autoOpen: false,
      show: {
        effect: "blind",
        duration: 500
      },
      hide: {
        effect: "explode",
        duration: 1000
      }
    });
		$( "#messageModal_1" ).hide().position({my: "center top", at: "center top",of: "body"});
		$( "#messageModal_2" ).hide().position({my: "center top", at: "center top",of: "body"});;
		// $( "#messageModal_1" ).dialog({
    //   autoOpen: false,
		// 	draggable: false,
    //   show: {
    //     effect: "slide",
    //     duration: 200
    //   },
    //   hide: {
    //     effect: "slide",
    //     duration: 200
    //   },
		// 	position: {
		// 		my: "center top",
		// 		at: "center top",
		// 		of: "body"
		// 	}
    // });
		// $( "#messageModal_2" ).dialog({
    //   autoOpen: false,
		// 	draggable: false,
    //   show: {
    //     effect: "slide",
    //     duration: 200
    //   },
    //   hide: {
    //     effect: "slide",
    //     duration: 200
    //   },
		// 	position: {
		// 		my: "center top",
		// 		at: "center top",
		// 		of: "body"
		// 	}
    // });

		// hide our JQuery UI
		$("#menu").hide();
		$("#menu2").hide();
		$("#cancel").hide();
		$("#status").hide();
		$("#endSurrender").hide();
		$("#surrender").hide();
		$("#counterMenu").hide();
		$("#hitAwayAndHasAttackedHasMoved").hide();
		$("#hitAwayAndHasAttacked").hide();
		// toggleclass blink for all li.grid-square, otherwise when we wont to show active unit tile, all tiles will start blinking
	}

	function updatePlayerDisplay(data) {
		var div;
		var unit;
		var unitDiv;
		var namesAndStatus;
		var pilotHp;
		var pilotEn;
		var pilotSp;
		var hpLabel;
		var enLabel;
		var spLabel;
		for(var i=0; i<data.players.length; ++i){
			div=$("<div>");
			if(data.players[i].defated)
				div.addClass("defeated");
			// if(data.players[i].active)
			// 	div.addClass("active");
			div.append(`P${i+1}: ${data.players[i].name}`);
			// div.append(` Defeated: ${data.players[i].defeated}`);
			div.append($("<hr>"));
			for(var k=0; k<data.players[i].units.length; ++k){
				pilotHp = $("<div>").addClass("pilotHealthBar");
				hpLabel = $("<div>").addClass("healthLabel");
				pilotEn = $("<div>").addClass("pilotEnergyBar");
				enLabel = $("<div>").addClass("energyLabel");
				pilotSp = $("<div>").addClass("pilotSpiritBar");
				spLabel = $("<div>").addClass("spiritLabel");
				namesAndStatus = $("<div>").addClass("namesAndStatus clearfix");
				unit=data.players[i].units[k];
				unitDiv=$("<div>").addClass("unitBox").attr("data-r", unit.r).attr("data-c", unit.c);
				if(!unit.alive)
					unitDiv.addClass("dead");
				if(unit.active)
					unitDiv.addClass("active");
				namesAndStatus.append($("<p>").text(`${unit.name} (${unit.mechName})`));
				namesAndStatus.append($("<p>").text(`Status: ${unit.status.toString()}`));
				unitDiv.append(namesAndStatus);
				unitDiv.append($("<img>").attr("src", unit.pilotImg).addClass("pilotImgStyle clearfix"));
				// unitDiv.append("<br><br>");
				// unitDiv.append($("<p>").text(`HP: ${unit.hp}/${unit.hpMax}`));
				unitDiv.append(pilotHp);
				pilotHp.append(hpLabel.text(`HP: ${unit.hp}/${unit.hpMax}`));
				pilotHp.progressbar({
					value: parseInt((unit.hp / unit.hpMax)*100)
				});
				// unitDiv.append($("<p>").text(`EN: ${unit.en}/${unit.enMax}`));
				unitDiv.append(pilotEn);
				pilotEn.append(enLabel.text(`EN: ${unit.en}/${unit.enMax}`));
				pilotEn.progressbar({
					value: parseInt((unit.en / unit.enMax)*100)
				});
				// unitDiv.append($("<p>").text(`SP: ${unit.sp}/${unit.spMax}`));
				unitDiv.append(pilotSp);
				pilotSp.append(spLabel.text(`SP: ${unit.sp}/${unit.spMax}`));
				pilotSp.progressbar({
					value: parseInt((unit.sp / unit.spMax)*100)
				});
				div.append(unitDiv);
				div.append($("<hr>"));
			}
			$(`#player${i+1}`).empty().append(div);
		}

	}

	function bindEscKey(func) {
		var doc = $(document);
		doc.off("keydown");
		doc.keydown(func);
	}

	function selectTile(r,c) {
		var dataR = r;
		var dataC = c;
		globalR = dataR;
		globalC = dataC;
		socket.emit("get actions", {r: dataR,c: dataC}, function(response){
			console.log(response.actions);
			enableActions(response.actions)
		});

		$(`div.grid-square div[data-r=${dataR}][data-c=${dataC}]`).addClass("clickedTile");
		$(document).one("click", "div.grid-square, .unitBox", function(event) {
			// if next clicked tile is outside the one that was previously clicked on
			if (($(this).attr("data-r")!=dataR) || ($(this).attr("data-c")!=dataC)){
					$(`div.grid-square div[data-r=${dataR}][data-c=${dataC}]`).removeClass("clickedTile");
			}
		});
	}

	function startMessageInterval() {
		if(!msgInterval) {
			 msgInterval = 1;
			setTimeout(function() {
				displayNextMessage();
				msgInterval=setInterval(displayNextMessage, 2*1000);
			}, 200);
		}
	}

	function addMessage(msg) {
		msgs.push(msg);
		startMessageInterval();
	}

	function displayNextMessage() {
		dismissMessageModal(useFirstMessageModal ? 1 : 2);
		useFirstMessageModal = !useFirstMessageModal;
		if(msgs.length!==0) {
			var msg = msgs.splice(0,1)[0];
			fillMessageModal(useFirstMessageModal ? 1 : 2, msg);
		} else {
			clearInterval(msgInterval);
			msgInterval=null;
		}
	}

	function dismissMessageModal(num) {
		$(`#messageModal_${num}`).hide("slide");
	}

	function fillMessageModal(num, msg) {
		$(`#messageModal_${num} .msgBody`).text(msg);
		$(`#messageModal_${num}`).show("slide");
	}

});
