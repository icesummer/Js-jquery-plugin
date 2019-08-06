/*
    	PageGo version v.1.0.0
	By icesummer build in July 17, 2019
	For more information, please visit https://github.com/icesummer/Js-jquery-plugin
	// 请求，组装，计算页码
	$(this).PageGo({
			page:page,//分页请参数
			param:param,// 查询参数
			elem:{searchId:'#search-div1',listId:'#list',footId:'#pagefoot'}, // 查询，数据，页码标签定位
			titles:['userstate','id'],// 数据表头,重写pageFunc时可不填
			titlesMap:{'userstate':{'1':'有效','2':'无效'}},//titles中的userstate的值1时显示有效，2显示无效
			pageFunc:function(brothers,opts,params){
				//分页请求+组装页面代码：若样式有改变，此处可重写
			},
			pageNavigate:function(brothers,opts,data){
				// 页码导航代码：默认不重写
			}
		});
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
			var pageFunc=opts.pageFunc||PageGo.util.pageFunc;
			brothers.result = pageFunc.call(brothers,brothers,opts,brothers.params);
			
			var pageNumShow=opts.pageNumShow||PageGo.util.pageNumShow;
			var pageNavigate=opts.pageNavigate||PageGo.util.pageNavigate;
			pageNumShow.call(brothers,brothers,opts);
			pageNavigate.call(brothers,brothers,opts,brothers.result);
		},
		pageFunc:function(brothers,opts,params){
			var dataHtmlId = opts.elem.listId;
			PageGo.util.noneMsg(brothers,opts,dataHtmlId,"正在获取数据，请稍候…");
			var result ={};
			$.ajax({
				url:opts.url,
				data:params,
				type:"post",
				async:false,
				dateType:'json',
				contentType:'application/x-www-form-urlencoded',
				success:function(data){
					$(dataHtmlId).html("");
					result = data.data;
					if(data.code==1&&result.list.length>0){
						PageGo.util.buildDataHtml(opts.titles,opts.titlesMap,result,dataHtmlId);
						if(addDuoxuanClick){
							addDuoxuanClick();
						}
					}else{
						if(brothers.params.pageNum>1){
							//重新查询第一页
							brothers.params.pageNum=1;
							PageGo.util.pageOne.call(brothers,brothers,brothers.settings);
						}else{
							PageGo.util.noneMsg(brothers,opts,dataHtmlId," 未查询到数据~~");
						}
					}
				},error:function(d){
					$(dataHtmlId).html("查询出错~~");
				}
			})
			return result;
		},
		buildDataHtml:function(titles,titlesMap,data,dataHtmlId){
			for(var i=0;i<data.list.length;i++){
				var _html='<tr onmouseover="onColor(this)" onmouseout="offColor(this)">';
				for(var j = 0 ;j<titles.length;j++){
					if(j==0){
						_html+='<td><input type="checkbox" name="bike" value="'+data.list[i][titles[j]]+'" class="duoxuan" /></td>';
					}else{
						var attr='';
						var attrVal='';
						var tvalue='';
						var title=titles[j];
						console.debug(title+"----------")
						if(title.indexOf(',')>0){
							tvalue+=$.trim(data.list[i][title.split(",")[0]])+'/'
							tvalue+=$.trim(data.list[i][title.split(",")[1]])+''
						}else if(title.indexOf(':state')>0&&titlesMap){
							title=title.substring(0,title.indexOf(':state'));
							tvalue=titlesMap[title][data.list[i][title]] ;
							attr='state="'+data.list[i][title]+'"';
						}else if(title.indexOf(':time')>0){
							title=title.substring(0,title.indexOf(':time'));
							tvalue=$.parseFormatTime(data.list[i][title]) ;
						}else if(title.indexOf(':button')>0&&titlesMap){
							title=title.substring(0,title.indexOf(':button'));
							var tvalue='';
							for (var g = 0; g < titlesMap[title].length; g++) {
								tvalue+='<a class="button-blue td-a-btn" href="javascript:;">';
								tvalue+='<span style="color:white;">'+titlesMap[title][g].tname+'</span>';
								tvalue+='</a>' ;
							}
						}else {
							tvalue=$.trim(data.list[i][title])
						}
						_html+='<td '+attr+' titlekey='+title+'>'+tvalue+'</td>';
					}
				}
				_html+='</tr>';
				$(dataHtmlId).append(_html);
				$(dataHtmlId).find(".td-a-btn span").click();
				
			}
		},
		noneMsg:function(brothers,opts,dataHtmlId,msg){
			$(dataHtmlId).html('<tr><td colSpan="6"><center><span style="font-size: 14px;color:red;">&nbsp;&nbsp;&nbsp;&nbsp;'+msg+'</span></center></td></tr>');
		},
		pageNumShow:function(brothers,opts){
			var data = brothers.result;
			var footId = opts.elem.footId;
			var _html = "Results per page<span style='color:#4e8bd6; padding:0px 5px;'>"+data.total+"</span>";
			$(footId+" .left").html(_html);
		},
		pageNavigate:function(brothers,opts,data){
			var footId = opts.elem.footId;
			$(footId+" .right").html('');
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
			// 跳转页面
			$(footId+" .right").find("[name='selectPage']").on('click',function(){
				brothers.params.pageNum=parseInt(this.id);
				PageGo.util.pageOne.call(brothers,brothers,brothers.settings);
			})
			// 上一页
			$(footId+" .right").find("[name='upPage']").on('click',function(){
				brothers.params.pageNum=parseInt(brothers.params.pageNum-1);
				PageGo.util.pageOne.call(brothers,brothers,brothers.settings);
			});
			// 下一页
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
			page:{pageNum:1,pageSize:10,param:{},title:[],titleMap:{},
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
		checkPage:function(pape,param){
			brothers=this;
			//(this.settings.page.pageSize);
			var params=$.extend({},this.params,pape,param);
			brothers.settings.page=pape;
			brothers.settings.param=param;
			brothers.params=params;
			PageGo.util.pageOne.call(brothers,brothers,brothers.settings);
		}
	}
	$.fn.PageGo=(function(settings){
		return new PageGo(this,settings);
	});
})(jQuery,window);
