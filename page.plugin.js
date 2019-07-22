/*
    page version v.1.0.0
	By icesummer build in July 17, 2019
	For more information, please visit http://www.icesummer.top
	// 请求，组装，计算页码
	$(this).PageGo({
			page:page,
			elem:{searchId:'#search-div1',listId:'#list',footId:'#pagefoot'},
			title:[],
			param:param,
			pageFunc:function(opts,param){
				//代码
			},
			pageNavigate:function(opts,data){
				// 页码导航：默认不重写
			}
		})();
	
*/
;(function($,win,undef){
	var PageGo=function(bodys,settings,inited){
		var settings=$.extend({},PageGo.defaults,settings);
		var params = $.extend({},settings.page,settings.param);
		var brothers=this;
		var $this=$(this);
		brothers.params=params;
		brothers.settings=settings;
		brothers.bodys=bodys;
		brothers.elem=settings.elem;
		PageGo.util.pageOne.call($this,brothers,settings);
	}
	
	PageGo.util={
		pageOne:function(brothers,opts){
			console.info(brothers.params);
			var data = opts.pageFunc.call(brothers,opts,brothers.params);
			brothers.result=data;
			var pageNumShow=opts.pageNumShow||PageGo.util.pageNumShow;
			var pageNavigate=opts.pageNavigate||PageGo.util.pageNavigate;
			pageNumShow.call(this,brothers,opts);
			pageNavigate.call(this,brothers,opts,data);
		},
		pageNumShow:function(brothers,opts){
			var data = brothers.result;
			var footId = opts.elem.footId;
			var _html = "Results per page<span style='color:#4e8bd6; padding:0px 5px;'>"+data.total+"</span>";
			$(footId+" .left").html(_html);
		},
		pageNavigate:function(brothers,opts,data){
			var footId = opts.elem.footId;
			var navigatepageNums = data.navigatepageNums;
			var _html = '<ul class="fy-ym">';
				for (var i = 0; i < navigatepageNums.length; i++) {
					if(i==0){
						if(data.hasPreviousPage){
							// onclick="upPage();"
							_html+='<li name="upPage" href="javascript:;" style="margin-right:5px;"><img src="/images/fy-l.png"></li>'
						}else{
							_html+='<li href="javascript:;" style="margin-right:5px;"><img src="/images/fy-l.png"></li>'
						}
					}
					if(data.pageNum==navigatepageNums[i]){
						_html+='<li class="hover-fy" id="fy1" href="javascript:;">'+navigatepageNums[i]+'</li>'
					}else{
						//onclick="selectPage(this);"
						_html+='<li name="selectPage" id="'+navigatepageNums[i]+'" href="javascript:;" >'+navigatepageNums[i]+'</li>'
					}
					if(i==navigatepageNums.length-1){
						if(data.hasNextPage){
							_html+='<li name="nextPage" href="javascript:;" style="margin-left:3px;"><img src="/images/fy-r.png"></li>'
						}else{
							_html+='<li href="javascript:;" style="margin-left:3px;"><img src="/images/fy-r.png"></li>'
						}
					}
				}
				_html+='</ul>';
			$(footId+" .right").html(_html);
			$(footId+" .right").find("[name='selectPage']").on('click',function(){
				brothers.params.pageNum=parseInt(this.id);
				PageGo.util.pageOne.call(brothers,brothers,brothers.settings);
			})
			$(footId+" .right").find("[name='upPage']").on('click',function(){
				brothers.params.pageNum=parseInt(brothers.params.pageNum-1);
				PageGo.util.pageOne.call(brothers,brothers,brothers.settings);
			});
			$(footId+" .right").find("[name='nextPage']").on('click',function(){
				brothers.params.pageNum=parseInt(brothers.params.pageNum+1);
				PageGo.util.pageOne.call(brothers,brothers,brothers.settings);
			});
		},
		toString:Object.prototype.toString,
		isEmpty:function(val){
			return val==="" || val===$.trim(this.attr("tip"));
		},
		isString:function(val){
			return (typeof val=='string')&&val.constructor==String; 
		}
	}
	PageGo.defaults={
			page:{pageNum:1,pageSize:10,param:{},
				result:{
					"list":[],
					"total":0,
					"pageNum": 1,
				    "pageSize": 10,
				    "size": 3,
				    "startRow": 1,
				    "endRow": 3,
				    "pages": 1,
				    "prePage": 0,
				    "nextPage": 0,
				    "isFirstPage": true,
				    "isLastPage": true,
				    "hasPreviousPage": false,
				    "hasNextPage": false,
				    "navigatePages": 8,
				    "navigatepageNums": [1,2,3],
				    "navigateFirstPage": 1,
				    "navigateLastPage": 1,
				    "firstPage": 1,
				    "lastPage": 1
				}
			},
			data:[],
			ajaxPost:false
		}
	PageGo.prototype={
		checkPage:function(pp,param){
			//(this.settings.page.pageSize);
			var params=$.extend({},this.params,pp,param);
			brothers=this;
			brothers.params=params;
			PageGo.util.pageOne.call(brothers,brothers,brothers.settings);
		}
	}
	$.fn.PageGo=(function(settings){
		return new PageGo(this,settings);
	});
})(jQuery,window);