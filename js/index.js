
window.addEventListener('load', function() {
  	FastClick.attach(document.body);
}, false);



$(function(){
	$("#loader").fadeOut(300);

	var guess = new Guess();
	guess.init();

	// 浏览器返回事件
	window.onhashchange = function(){
		console.log(window.location.hash);
		if(!window.location.hash){
			guess.goPage("main");
		}else{
			guess.goPage(window.location.hash.substring(1));
		}
		
	}


	var defaultTitle = "你懂我心吗？",
		defaultLink = "http://whatisay.k-run.cn/",
		defaultDesc = "快来猜猜猜吧，看我说了啥~~";

	/**
	 * 微信认证
	 */
	$.post("http://wxtoken.k-run.cn/generate",{
		url: location.href.split('#')[0]
	},function(data){

		data = JSON.parse(data);
	
		wx.config({
			debug : false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
			appId : 'wx4c166202e798d4cc',  // 必填，公众号的唯一标识
			timestamp : data.timestamp,  // 必填，生成签名的时间戳
			nonceStr : data.noncestr,   // 必填，生成签名的随机串
			signature : data.signature, // 必填，签名，见附录1
			jsApiList : [ 'checkJsApi', 'chooseWXPay', 'getLocation', 'onMenuShareTimeline', 'onMenuShareAppMessage' ]
		// 必填，需要使用的JS接口列表，所有JS接口列表见附录2
		});
	});


	wx.ready(function(){
		setInterval(function(){

			// 分享到朋友圈 配置
			wx.onMenuShareTimeline({
			    title: defaultTitle, // 分享标题
			    link: defaultLink + "?myWordID=" + guess.myWordID, // 分享链接
			    imgUrl: guess.httpHost + "logo.jpg" // 分享图标
			});

			// 分享给朋友 配置
			wx.onMenuShareAppMessage({
			    title: defaultTitle, // 分享标题
			    desc: defaultDesc, // 分享描述
			    link: defaultLink + "?myWordID=" + guess.myWordID, // 分享链接
			    imgUrl: guess.httpHost + "logo.jpg"  // 分享图标
			});
		},500);
	});




	// 输入表情符号，获取焦点
	var $page_inputBox = $("#page_inputBox"),
		$page_faceBox = $("#page_faceBox");

	$page_inputBox.click(function(e){
		e.stopPropagation();

		if(!$(this).hasClass("focus")){
			$(this).addClass("focus");
		}

		if($page_faceBox.html() == "请选择表情符号"){
			$page_inputBox.addClass("empty");
		}else{
			$page_inputBox.removeClass("empty");
		}
	});

	// 输入表情符号，失去焦点
	$(document).on("click",function(){
		$page_inputBox.removeClass("focus");
	});


	// 阻止默认事件
	// .on("touchmove",function(e){
	// 	e.preventDefault();
	// });

	var $page_faceWrapper = $("#page_faceWrapper");

	// 添加表情
	$page_faceWrapper.on("click",".face_wrapper",function(e){
		e.stopPropagation();

		if(!$page_inputBox.hasClass("focus")){
			return;
		}

		var $this = $(this).find(".face"),
			faceId = $this.attr("data-id"),
			imgId = $this.attr("data-imgId"),
			faceStyle = $this.attr("style");

		if($page_inputBox.hasClass("empty")){
			$page_faceBox.html('<div class="face_wrapper">'+
									'<span class="face '+ imgId +' face'+ faceId +'" data-id="'+ faceId +'" style="'+ faceStyle +'"></span>'+
								'</div>');
			$page_inputBox.removeClass("empty").find(".inputCursor").remove();
		}else{
			$page_faceBox.append('<div class="face_wrapper">'+
									'<span class="face '+ imgId +' face'+ faceId +'" data-id="'+ faceId +'" style="'+ faceStyle +'"></span>'+
								'</div>');
		}

		$page_faceBox.find(".face_wrapper .inputCursor").remove();
		$page_faceBox.find(".face_wrapper:last-child").append('<b class="inputCursor"></b>');
		
	// 删除表情
	}).on("click",".delete_face",function(e){
		e.stopPropagation();

		if(!$page_inputBox.hasClass("focus")){
			return;
		}

		$page_faceBox.find(".face_wrapper:last-child").remove();

		if($page_faceBox.html() == ""){
			$page_faceBox.text("请选择表情符号");
			$page_inputBox.addClass("empty").append('<b class="inputCursor"></b>');
		}else{
			$page_faceBox.find(".face_wrapper:last-child").append('<b class="inputCursor"></b>');
		}

	}).on("touchstart",".face_wrapper",function(){
		$(this).addClass("pressed");
	}).on("touchstart",function(){

		$(".face_wrapper").removeClass("pressed");
		
	// 阻止冒泡到 document
	}).on("click",function(e){
		e.stopPropagation();
	});


	// 发布
	$("#releaseBtn").click(function(){
		guess.release();
	});


	// 输入框获取焦点，隐藏表情面板
	$(".page_input").on("focus",function(){
		$page_faceWrapper.hide()
	}).on("blur",function(){
		$page_faceWrapper.show();
	});


	// 分享提示
	$(".shareBtn").click(function(){
		$("#shareMask").fadeIn("200");
	});

	$("#shareMask").click(function(){
		$(this).fadeOut(200);
	});


	// 再发一条
	$(".releaseAgain").click(function(){
		guess.goPage("release");
	});


	// 查看别人的
	$(".checkOthers").click(function(){
		guess.goPage("guessList");
		// guess.guessListPage = 0;
		// guess.getGuessList();
	});


	$("#guessList_ul").on("touchstart",".comment_item",function(){
		$(this).addClass("pressed");
	}).on("touchend",".comment_item",function(){
		$(this).removeClass("pressed");
	});


	$(".main_release").click(function(){
		guess.goPage("release");
	});

	$(".main_check").click(function(){
		guess.goPage("guessList");
	});

	$(".guessList_more").click(function(){
		guess.getGuessList();
	});

	$(".messageList_more").click(function(){
		guess.getMsgList();
	});

});