require([], function (){

	var isMobileInit = false;
	var loadMobile = function(){
		require([atheneConfig.root_path + 'js/mobile.js'], function(mobile){
			mobile.init();
			isMobileInit = true;
		});
	}
	var isPCInit = false;
	var loadPC = function(){
		require([atheneConfig.root_path + 'js/pc.js'], function(pc){
			pc.init();
			isPCInit = true;
		});
	}

	var browser={
	    versions:function(){
	    var u = window.navigator.userAgent;
	    return {
	        trident: u.indexOf('Trident') > -1, //IE内核
	        presto: u.indexOf('Presto') > -1, //opera内核
	        webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
	        gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
	        mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
	        ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
	        android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
	        iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者安卓QQ浏览器
	        iPad: u.indexOf('iPad') > -1, //是否为iPad
	        webApp: u.indexOf('Safari') == -1 ,//是否为web应用程序，没有头部与底部
	        weixin: u.indexOf('MicroMessenger') == -1 //是否为微信浏览器
	        };
	    }()
	}

	$(window).bind("resize", function(){
		if(isMobileInit && isPCInit){
			$(window).unbind("resize");
			return;
		}
		var w = $(window).width();
		if(w >= 700){
			loadPC();
		}else{
			loadMobile();
		}
	});

	if(browser.versions.mobile === true || $(window).width() < 700){
		loadMobile();
	}else{
		loadPC();
	}

	//是否使用fancybox
	if(atheneConfig.fancybox === true){
		require([atheneConfig.root_path + 'fancybox/jquery.fancybox.js'], function(pc){
			var isFancy = $(".isFancy");
			if(isFancy.length != 0){
				var imgArr = $(".article-inner img");
				for(var i=0,len=imgArr.length;i<len;i++){
					var src = imgArr.eq(i).attr("src");
					var title = imgArr.eq(i).attr("alt");
					imgArr.eq(i).replaceWith("<a href='"+src+"' title='"+title+"' rel='fancy-group' class='fancy-ctn fancybox'><img src='"+src+"' title='"+title+"'></a>");
				}
				$(".article-inner .fancy-ctn").fancybox();
			}
		});

	}
	//是否开启动画
	if(atheneConfig.animate === true){

		require([atheneConfig.root_path + 'js/jquery.lazyload.js'], function(){
			//avatar
			$(".js-avatar").attr("src", $(".js-avatar").attr("lazy-src"));
			$(".js-avatar")[0].onload = function(){
				$(".js-avatar").addClass("show");
			}
		});

		if(atheneConfig.isHome === true){
			//content
			function showArticle(){
				$(".article").each(function(){
					if( $(this).offset().top <= $(window).scrollTop()+$(window).height() && !($(this).hasClass('show')) ) {
						$(this).removeClass("hidden").addClass("show");
						$(this).addClass("is-hiddened");
					}else{
						if(!$(this).hasClass("is-hiddened")){
							$(this).addClass("hidden");
						}
					}
				});
			}
			$(window).on('scroll', function(){
				showArticle();
			});
			showArticle();
		}

	}

	//是否新窗口打开链接
	if(atheneConfig.open_in_new == true){
		$(".article a[href]").attr("target", "_blank")
	}


	if(atheneConfig.search == true){
		// A local search script with the help of [hexo-generator-search](https://github.com/PaicHyperionDev/hexo-generator-search)
		// Copyright (C) 2015
		// Joseph Pan <http://github.com/wzpan>
		// Shuhao Mao <http://github.com/maoshuhao>
		// Edited by MOxFIVE <http://github.com/MOxFIVE>

		var inputArea = document.querySelector("#local-search-input");
		var getSearchFile = function(){
		    var path = atheneConfig.root_path + "/search.xml";
		    searchFunc(path, 'local-search-input', 'local-search-result');
		}

		inputArea.onfocus = function(){ getSearchFile() }

		var $resetButton = $("#search-form .fa-times");
		var $resultArea = $("#local-search-result");

		inputArea.oninput = function(){ $resetButton.show(); }
		resetSearch = function(){
		    $resultArea.html("");
		    document.querySelector("#search-form").reset();
		    $resetButton.hide();
		    $(".no-result").hide();
		}

		inputArea.onkeydown = function(){ if(event.keyCode==13) return false}

		$resultArea.bind("DOMNodeRemoved DOMNodeInserted", function(e) {
		    if (!$(e.target).text()) {
		        $(".no-result").show(200);
		    } else {
		      $(".no-result").hide();
		    }
		})

		var searchFunc = function(path, search_id, content_id) {
		    'use strict';
		    $.ajax({
		        url: path,
		        dataType: "xml",
		        success: function( xmlResponse ) {
		            // get the contents from search data
		            var datas = $( "entry", xmlResponse ).map(function() {
		                return {
		                    title: $( "title", this ).text(),
		                    content: $("content",this).text(),
		                    url: $( "url" , this).text()
		                };
		            }).get();
		            var $input = document.getElementById(search_id);
		            var $resultContent = document.getElementById(content_id);
		            $input.addEventListener('input', function(){
		                var str='<ul class=\"search-result-list\">';
		                var keywords = this.value.trim().toLowerCase().split(/[\s\-]+/);
		                $resultContent.innerHTML = "";
		                if (this.value.trim().length <= 0) {
		                    return;
		                }
		                // perform local searching
		                datas.forEach(function(data) {
		                    var isMatch = true;
		                    var content_index = [];
		                    var data_title = data.title.trim().toLowerCase();
		                    var data_content = data.content.trim().replace(/<[^>]+>/g,"").toLowerCase();
		                    var data_url = data.url;
		                    var index_title = -1;
		                    var index_content = -1;
		                    var first_occur = -1;
		                    // only match artiles with not empty titles and contents
		                    if(data_title != '' && data_content != '') {
		                        keywords.forEach(function(keyword, i) {
		                            index_title = data_title.indexOf(keyword);
		                            index_content = data_content.indexOf(keyword);
		                            if( index_title < 0 && index_content < 0 ){
		                                isMatch = false;
		                            } else {
		                                if (index_content < 0) {
		                                    index_content = 0;
		                                }
		                                if (i == 0) {
		                                    first_occur = index_content;
		                                }
		                            }
		                        });
		                    }
		                    // show search results
		                    if (isMatch) {
		                        str += "<li><a href='"+ data_url +"' class='search-result-title' target='_blank'>"+ "> " + data_title +"</a>";
		                        var content = data.content.trim().replace(/<[^>]+>/g,"");
		                        if (first_occur >= 0) {
		                            // cut out characters
		                            var start = first_occur - 6;
		                            var end = first_occur + 6;
		                            if(start < 0){
		                                start = 0;
		                            }
		                            if(start == 0){
		                                end = 10;
		                            }
		                            if(end > content.length){
		                                end = content.length;
		                            }
		                            var match_content = content.substr(start, end);
		                            // highlight all keywords
		                            keywords.forEach(function(keyword){
		                                var regS = new RegExp(keyword, "gi");
		                                match_content = match_content.replace(regS, "<em class=\"search-keyword\">"+keyword+"</em>");
		                            })
		                            str += "<p class=\"search-result\">" + match_content +"...</p>"
		                        }
		                    }
		                })
		                $resultContent.innerHTML = str;
		            })
		        }
		    })
		}
	}
});
