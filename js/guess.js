
function Guess(){

	this.httpHost = "http://whatisay.k-run.cn/";
	// this.httpHost = "http://192.168.0.150:8080/whatisay.k-run.cn/";
	this.faceNum = 0;
	this.guessListPage = 0;
	this.msgListPage = 0;
	// this.userID = this.getSearch("userID");
	this.wordID = 0;
	this.myWordID = null;
	this.correctAnswer = "";
	this.history = ["main"];

	this.$win = $(window);
	this.$doc = $(document);
    this.winW = this.$win.width();
	this.panelIndex = 0;
	this.translateLeft = 0;

	this.$page_inputBox = $("#page_inputBox");
	this.$face_panelWrapper = $("#face_panelWrapper");
	this.$face_tabWrap = $("#face_tabWrap");
	this.$face_tab = $("#face_tab");
	this.$page_faceBox = $("#page_faceBox");
	this.$correctAnswer = $("#correctAnswer");
	this.$answerTips = $("#answerTips");
	this.$pageWrapper = $(".pageWrapper");
	this.$myGuess_ownerHeader = $("#myGuess_ownerHeader");
	this.$myGuess_cont = $("#myGuess_cont");
	this.$guessList_ul = $("#guessList_ul");

	this.$guessDetail_owner_headimg = $("#guessDetail_owner_headimg");
	this.$guessDetail_owner_cont = $("#guessDetail_owner_cont");

	this.$guessDetail_submitWrapper = $("#guessDetail_submitWrapper");
	this.$guessDetail_answer = $("#guessDetail_answer");

	this.$submitAnswer_wrapper = $(".submitAnswer_wrapper");
	this.$submitAnswer = $("#submitAnswer");
	this.$submintRelease = $("#submintRelease");
	this.$submintCheckOther = $("#submintCheckOther");

	this.$guessDetail_btns = $("#guessDetail_btns");

	this.$correctAnswer_mask = $("#correctAnswer_mask");
	this.$answer_mask_cont = $("#answer_mask_cont");

	this.$guessDetail_comment_ul = $("#guessDetail_comment_ul");
	this.$commentBoxTitle = $("#commentBoxTitle");
	this.$messageTip = $("#messageTip");
	this.$messageList = $("#messageList");
	this.$messageList_page = $("#messageList_page");
}


Guess.prototype = {

	init: function(){
		var _this = this;

		if(this.getSearch("userID")){
			if(window.localStorage.guessUserID){
				this.userID = window.localStorage.guessUserID;
			}else{
				this.userID = this.getSearch("userID");
				window.localStorage.guessUserID = this.userID;
			}
		}
		else{
			if(window.localStorage.guessUserID){
				this.userID = window.localStorage.guessUserID;
			}else{
				window.location.href = "http://whatisay.k-run.cn/center/authorize.do";
			}
		}



		// 判断哪个页面
		var word = this.getSearch("myWordID");

		if(word != null){
			this.getGuessDetail(word);
			this.myWordID = word;
		}else{
			this.goPage("main");
		}

		// 加载表情
		this.loadFace([
			{
				imgName: "faceImg1",
				count: 158,
				category: "people",
				name: "表情与人物"
			},
			{
				imgName: "faceImg2",
				count: 56,
				category: "food",
				name: "食物"
			},
			{
				imgName: "faceImg3",
				count: 116,
				category: "life",
				name: "生活"
			},
			{
				imgName: "faceImg4",
				count: 34,
				category: "sport",
				name: "运动"
			},
			{
				imgName: "faceImg5",
				count: 111,
				category: "nature",
				name: "动物自然"
			},
			{
				imgName: "faceImg6",
				count: 10,
				category: "flag",
				name: "国旗"
			},
			{
				imgName: "faceImg8",
				count: 221,
				category: "sign",
				name: "符号1"
			},
			{
				imgName: "faceImg7",
				count: 130,
				category: "sign",
				name: "符号2"
			}
		]);

		// facePanel
		this.$face_panelWrapper.on("touchstart",".face_panel_inner",function(e){
			_this.changeFacePanel(e,$(this));
		});

		// 获取未读消息数
		this.getNotReadMsg();

		// 获取未读消息列表
		this.$messageTip.click(function(){
			_this.goPage("messageList");
			_this.msgListPage = 0;
			_this.getMsgList();
			$(this).hide();
		});

		// 从未读消息列表中进入详情
		this.$messageList.on("click",".messageItem",function(){
			_this.goPage("guessDetail");
			_this.getGuessDetail($(this).attr("data-id"));
		});

		// 切换表情分类
		this.$face_tabWrap.on("click",".face_tab_item",function(){
			var idx = $(".face_tab_item").index(this);

			$(".face_tab_item").removeClass("on").eq(idx).addClass("on");
			$(".face_panel").removeClass("on").eq(idx).addClass("on");
		});

		// 获取列表
		this.getGuessList();

		// 获取详情
		this.$guessList_ul.on("click",".comment_item",function(){
			_this.getGuessDetail($(this).attr("data-id"));

		});

		// 留言
		this.$submitAnswer.on("click",function(){
			_this.answerGuess();
		});


		// 调到发布页面
		this.$submintRelease.on("click",function(){
			_this.goPage("release");
		});


		// 调到列表
		this.$submintCheckOther.on("click",function(){
			_this.goPage("guessList");
		});


		_this.$correctAnswer_mask.click(function(){
			$(this).fadeOut(200);
		});

		// 查看答案
		_this.$commentBoxTitle.on("click",function(){
			if($(this).hasClass("checkAnswer")){
				_this.$correctAnswer_mask.fadeIn(200);
				_this.$answer_mask_cont.text(_this.correctAnswer);
			}
		});
	},

	loadFace: function(option){
		// option = [
		// 	{
		// 		imgName:"faceImg1",
		// 		count: 90,
		//      category: "sport"
		//      name: "运动"
		// 	}
		// ];

		var _this = this,
			sFacePanel = "",
			sFaceTab = "";

		option.forEach(function(item,index){

			var pageCount = Math.ceil(item.count/23),
				ulWidth = pageCount + "00%",
				liWidth = 1/pageCount * 100 +'%',
				isOn = "";

			if(index == 0){
				isOn = "on";
			}else{
				isOn = "";
			}

			sFacePanel += '<div class="face_panel '+ item.category +' '+ isOn +'">'+
								'<ul class="face_panel_inner clearfix" data-index="0" data-left="0" style="width:'+ ulWidth +';">'+
									'<li class="face_panel_li clearfix" style="width:'+ liWidth +'">';

			for(var i = 0, len = item.count; i < len; i++){
				var row = parseInt(i/11),
					ceil = parseInt(i%11);

				if(i%23 == 0 && i != 0){
					sFacePanel += '<div class="face_wrapper">'+
										'<span class="delete_face"></span>'+
									'</div>'+
								'</li>'+
								'<li class="face_panel_li clearfix" style="width:'+ liWidth +'">';
				}

				sFacePanel += '<div class="face_wrapper">'+
									'<span class="face '+ item.imgName +' face'+ _this.faceNum +'" data-id="'+ _this.faceNum +'" data-imgId="'+ item.imgName +'" style="background-position:'+ (-64) * ceil +'px ' + (-64) * row +'px;"></span>'+
								'</div>';

				if(i == len - 1){
					sFacePanel += '<div class="face_wrapper">'+
										'<span class="delete_face"></span>'+
									'</div>';
				}

				_this.faceNum++;
			}

			sFacePanel += '</ul>';

			// 添加label
			var sLabel = '<div class="face_panel_label">';

			for(var p = 0; p < pageCount; p++){
				if(p == 0){
					sLabel += '<span class="face_label face_label_on"></span>';
				}else{
					sLabel += '<span class="face_label"></span>';
				}
			}
			sLabel += '</div></div>';
			sFacePanel += sLabel;

			// faceTab
			sFaceTab += '<div class="face_tab_item '+ isOn +'">'+ item.name +'</div>';
			
		});

		_this.$face_panelWrapper.html(sFacePanel);
		_this.$face_tab.html(sFaceTab);
	},


	// 切换表情面板
	changeFacePanel: function(e,$this){
		e.preventDefault();

		e = e.originalEvent;

		var startX = e.touches[0].clientX,
			disX = 0,
			_this = this;

		_this.$doc.on("touchmove",function(e){
			e = e.originalEvent;

			var e = e.touches[0],
				nowX = e.clientX;

			disX = nowX - startX;

			$this.css({
				"webkitTransition":"all 0ms ease-out",
				"transition": "all 0ms ease-out",
				"webkitTransform": "translateX(" + (parseInt($this.attr("data-left")) + (disX * 0.7)) + "px)",
				"transform": "translateX(" + (parseInt($this.attr("data-left")) + (disX * 0.7)) + "px)"
			});
		});


		_this.$doc.on("touchend",function(){
			var panelCount = $this.find(".face_panel_li").length - 1;

			$this.css({
				"webkitTransform": "translateX(0px)",
				"transform": "translateX(0px)"
			});

			$this.css({
				"webkitTransition":"all 200ms ease-out",
				"transition": "all 200ms ease-out"
			});

			if(disX > 70 && $this.attr("data-index") > 0) {

				var pIndex = parseInt($this.attr("data-index"));
				pIndex--;
				$this.attr("data-index",pIndex);

				$this.css({
					"-webkit-transform": "translateX(" + (-($this.attr("data-index")) * _this.winW) + "px)",
					"transform": "translateX(" + (-($this.attr("data-index")) * _this.winW) + "px)"
				})


				var pLeft = parseInt($this.attr("data-left"));

				pLeft += _this.winW;
				$this.attr("data-left",pLeft);
			}
			else if(disX < -70 && $this.attr("data-index") < panelCount){

				var pIndex = parseInt($this.attr("data-index"));
				pIndex++;
				$this.attr("data-index",pIndex);

				$this.css({
					"-webkit-transform": "translateX(" + (-($this.attr("data-index")) * _this.winW) + "px)",
					"transform": "translateX(" + (-($this.attr("data-index")) * _this.winW) + "px)"
				});


				var pLeft = parseInt($this.attr("data-left"));

				pLeft -= _this.winW;
				$this.attr("data-left",pLeft);
			}
			else{
				$this.css({
					"webkitTransform": "translateX(" + $this.attr("data-left") + "px)",
					"transform": "translateX(" + $this.attr("data-left") + "px)"
				});
			}


			$this.next().find(".face_label").removeClass("face_label_on");
			$this.next().find(".face_label").eq($this.attr("data-index")).addClass("face_label_on");

			// 移除touchend事件的监听程序，防止下一次执行touchend事件时，多次执行touchend事件的监听程序
			_this.$doc.off("touchmove");
			_this.$doc.off("touchend");

		});
	},


	// 发表
	release: function(){
		var _this = this;

		if(this.canRelease()){
			$.post(this.httpHost + "center/submit.do",{
				userID: this.userID,
				content: this.$page_faceBox.html(),
				answer: this.$correctAnswer.val(),
				suggest: this.$answerTips.val()
			},function(data){
				data = JSON.parse(data);
				console.log(data);

				if(data.status == 1000){
					var result = data.result;

					// _this.msgTip("发布成功！");
					$(".shareBtn").trigger("click");
					_this.clearRealease();

					_this.$myGuess_ownerHeader.attr("src",result.owner.header);
					_this.$myGuess_cont.html(result.content + '<span class="f_l">(提示词:'+ result.suggest +')</span>');

					_this.goPage("myGuess");

					_this.myWordID = result.id;
					
				}else{
					_this.msgTip("发布失败！");
				}

			});
		}
	},


	// 获取猜猜的列表
	getGuessList: function(){
		var _this = this;

		$.post(this.httpHost + "center/words.do",{
			page: _this.guessListPage
		},function(data){
			data = JSON.parse(data);
			console.log(data);

			if(data.status == 1000){
				var result = data.result,
					sList = "";

				result.forEach(function(item){
					var owner = item.owner;

					sList += '<a class="comment_item clearfix" data-id="'+ item.id +'" href="#guessDetail">'+
								'<img class="comment_headImg" src="'+ owner.header +'">'+
								'<div class="comment_itemBox">'+
									'<span class="comment_itemName">'+ owner.nickname +'</span>'+
									'<div class="comment_itemCont clearfix">'+ item.content + '</div>'+
								'</div>'+
							'</a>';
				});

				if(_this.guessListPage == 0){
					_this.$guessList_ul.html(sList);
				}else{
					_this.$guessList_ul.append(sList);
				}
				
				_this.guessListPage ++;

				console.log(_this.guessListPage);
			}
		});
	},


	// 详情
	getGuessDetail: function(id){
		var _this = this;
		console.log(this.userID);

		$.post(this.httpHost + "center/detail.do",{
			userID: this.userID,
			wordID: id
		},function(data){
			data = JSON.parse(data);
			console.log(data);

			if(data.status == 1000){
				var result = data.result,
					owner = result.owner,
					comments = result.comments;

				// 如果评论过或者是自己
				if(result.iscomment == 1 || owner.id == _this.userID){
					_this.$submitAnswer_wrapper.hide();
					_this.$guessDetail_submitWrapper.hide();

					_this.$guessDetail_btns.show();
					_this.$commentBoxTitle.text("查看答案").addClass("checkAnswer");
				}else{
					_this.$submitAnswer_wrapper.show();

					_this.$guessDetail_submitWrapper.show();
					_this.$guessDetail_btns.hide();
					_this.$commentBoxTitle.text("好友答案").removeClass("checkAnswer");
				}

				_this.myWordID = result.id;


				_this.$guessDetail_owner_headimg.attr("src",owner.header);
				_this.$guessDetail_owner_cont.html(result.content + '<span class="f_l">(提示词:'+ result.suggest +')</span>');

				if(comments.length > 0){
					var sComment = "";

					comments.forEach(function(item){
						var user = item.user;

						sComment += '<li class="comment_item clearfix">'+
										'<img class="comment_headImg" src="'+ user.header +'">'+
										'<div class="comment_itemBox">'+
											'<span class="comment_itemName">'+ user.nickname +'</span>'+
											'<div class="comment_itemCont">'+ item.content +'</div>'+
										'</div>'+
									'</li>'
					});

					_this.$guessDetail_comment_ul.html(sComment);
				}else{
					_this.$guessDetail_comment_ul.html("");
				}

				_this.goPage("guessDetail");

				_this.wordID = id;
				_this.correctAnswer = result.answer;
			}

		});
	},


	// 留言
	answerGuess: function(){
		var _this = this;

		if(this.$guessDetail_answer.val() == ""){
			this.msgTip("请输入内容！");
			return;
		}

		$.post(this.httpHost + "center/comment.do",{
			userID: this.userID,
			wordID: this.wordID,
			content: this.$guessDetail_answer.val()
		},function(data){
			data = JSON.parse(data);
			console.log(data);

			_this.$guessDetail_answer.val("");

			if(data.status == 1000){
				_this.getGuessDetail(_this.wordID);

				_this.$submitAnswer_wrapper.hide();
				_this.$guessDetail_submitWrapper.hide();
				_this.$guessDetail_btns.show();
			}


			_this.$correctAnswer_mask.fadeIn(200);
			_this.$answer_mask_cont.text(_this.correctAnswer);
		});
	},


	// 获取未读消息书
	getNotReadMsg: function(){
		var _this = this;

		$.post(this.httpHost + "center/unread.do",{
			userID: this.userID
		},function(data){
			data = JSON.parse(data);
			console.log(data);

			if(data.status == 1000 && data.unread > 0){
				_this.$messageTip.text("您有" + data.unread + "条新的评论！").show();
			}else{
				_this.$messageTip.hide().text("");
			}
		});
	},


	// 获取消息列表
	getMsgList: function(){
		var _this = this;

		console.log(this.msgListPage);

		$.post(this.httpHost + "center/messages.do",{
			userID: this.userID,
			page: this.msgListPage
		},function(data){
			data = JSON.parse(data);
			console.log(data);

			if(data.status == 1000){
				var str = "",
					result = data.result;

				result.forEach(function(item){
					var user = item.source;

					str += '<a class="messageItem comment_item clearfix" href="#guessDetail" data-id="'+ item.wordID +'">'+
								'<img class="comment_headImg" src="'+ user.header +'">'+
								'<div class="comment_itemBox">'+
									'<span class="comment_itemName">'+ user.nickname +' <i>评论了您</i></span>'+
									'<div class="comment_itemCont">'+ item.content +'</div>'+
								'</div>'+
							'</a>'
				});

				if(_this.msgListPage == 0){
					_this.$messageList_page.html(str);
				}else{
					_this.$messageList_page.append(str);
				}
				
				_this.msgListPage ++;
			}else{
				_this.msgTip("没有更多历史了！");
			}
		});
	},


	// 跳转到自定页面
	goPage: function(target){
		this.$pageWrapper.removeClass("active");
		$("#"+ target).addClass("active");
	},


	// 清空内容
	clearRealease: function(){
		this.$page_faceBox.html("请选择表情符号");
		this.$page_inputBox.append('<b class="inputCursor"></b>');
		this.$correctAnswer.val("");
		this.$answerTips.val("");
	}, 


	// 检验是否可以发布
	canRelease: function(){
		if(this.$page_faceBox.html().substring(0,1) !== "<"){
			this.msgTip("请输入表情符号！");
			return false;
		}
		if(this.$correctAnswer.val() == ""){
			this.msgTip("请输入正确答案！");
			return false;
		}
		if(this.$answerTips.val() == ""){
			this.msgTip("请输答案提示，如：（猜人名）！",2200);
			return false;
		}

		return true;
	},


	// 信息提示框
	msgTip: function(text,duration){
		var dur = duration || 1800,
			$tipMsg_box = $("#tipMsg_box");

		$tipMsg_box.html(text).addClass("show");

		setTimeout(function(){
			$tipMsg_box.html("").removeClass("show");
		},dur);
	},


	// 获取search
	getSearch: function(key){

	    var sSearch = window.location.search.substring(1),
	        oSearch = {},
	        aSearch = sSearch.split("&");

	    aSearch.forEach(function(item,index){
	        var arr = item.split("=");
	        oSearch[arr[0]] = arr[1];
	    });

	    return oSearch[key];
	},

}

