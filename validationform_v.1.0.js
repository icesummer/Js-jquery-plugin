/*
    Validationform version v.1.0.0
	By icesummer build in May 7, 2017
	For more information, please visit http://www.icesummer.top
*/
;(function($,win,undef){
	var Validationform=function(forms,settings,inited){
		var settings=$.extend({},Validationform.defaults,settings);
		settings.dataregx && $.extend(Validationform.util.dataType,settings.dataregx);
		Validationform.util.showmsg = settings.showmsg;
		var brothers=this;
		brothers.settings=settings;
		brothers.forms=forms;
		brothers.objects=[];
		
		//创建子对象时不再绑定事件;
		if(inited===true){
			return false;
		}
		forms.each(function(){
			//已经绑定事件时跳过，避免事件重复绑定;
			if(this.validform_inited=="inited"){return true;}
			this.validform_inited="inited";
			
			var $this=$(this);
			//防止表单按钮双击提交两次;
			this.validform_status="normal"; //normal | posting | posted;
			//bind the blur event;
			$this.find("[dataregx]").on("blur",function(){
				//判断是否是在提交表单操作时触发的验证请求；
				var subpost=arguments[1];
				Validationform.util.check.call(this,$this,brothers,subpost);
			});
		});
		
	}
	
	Validationform.defaults={
		tiptype:1,
		tipSweep:false,
		showAllError:false,
		ajaxPost:false
	}
	Validationform.util={
		dataType:{
			
		},
		showmsg:{
		},
		check:function(curform,brothers,subpost,bool){
			/*	
			 	curform=this_form
			 	brothers=[this_forms]
				检测单个表单元素;
				验证通过返回true，否则返回false、实时验证返回值为ajax;
				bool，传入true则只检测不显示提示信息;
			*/
			var settings=brothers.settings;
			var subpost=subpost || "";
			var inputval=Validationform.util.getValue.call(curform,$(this));
			var flag=Validationform.util.regcheck.call(curform,$(this).attr("dataregx"),inputval,$(this),bool);
			
			return flag;
		
		},
		regcheck:function(dataregx,gets,obj,dontshow){
			/*
				dataregx:dataregx;
				gets:inputvalue;
				obj:input object;
			*/
			var curform=this,
				info=null,
				passed=false,
				type=3;//default set to wrong type, 2,3,4;
			obj.data("cked","cked");//do nothing if is the first time validation triggered;
			var res=Validationform.util._regcheck(dataregx,gets,obj,curform);
			if(!dontshow){
				Validationform.util.showmsg.call(curform,obj,dataregx,res.passed,res.info);
			}
			return res.passed;
		},
		
		_regcheck:function(dataregx,gets,obj,curform){
			var curform=curform,
				info=null,
				passed=false,
				type=1;//default set to wrong type, 2,3,4;
			//dataregx有三种情况：正则，函数和直接绑定的正则;
			if(Validationform.util.isEmpty.call(obj,gets)){
				//ignore;
				if(obj.attr("ignore")==="ignore"){				
					passed=true;
				}else{
					info = obj.attr("nullmsg")||"数据不能为空~";
					passed=false;
				}
				return{
					passed:passed,
					type:type,
					info:info
				};
			// 任意通过
			}else if(dataregx=="*"){
				passed = true;
			//直接是正则;
			}else if(!Validationform.util.dataType[dataregx]){
				dataregx=obj.attr("dataregx");
				var rexp=RegExp(dataregx);
				passed=rexp.test(gets);
			//配置的正则;
			}else if(Validationform.util.isString(Validationform.util.dataType[dataregx])){
				var rexp=RegExp(Validationform.util.dataType[dataregx]);
				passed=rexp.test(gets);
			//function;
			}else if(Validationform.util.toString.call(Validationform.util.dataType[dataregx])=="[object Function]"){
				passed=Validationform.util.dataType[dataregx](gets,obj,curform,Validationform.util.dataType);
				if(passed === true){
					passed = true;
				}else{
					info= passed;
					passed=false;
				}
				type=1;
			}
			if(passed){
				info=obj.attr("sucmsg")||"";
				//规则验证通过后，还需要对绑定recheck的对象进行值比较;
				if(obj.attr("recheck")){
					var theother=curform.find("input[name='"+obj.attr("recheck")+"']:first");
					if(gets!=theother.val()){
						passed=false;
						type=3;
						info=obj.attr("errormsg")||"两次密码输入不一致~";
					}
				}
			}else{
				info=info || obj.attr("errormsg")||"N";
			}
			return{
					passed:passed,
					type:type,
					info:info
			};
			
		},
		getValue:function(obj){
			var inputval,
				curform=this;
				
			if(obj.is(":radio")){
				inputval=curform.find(":radio[name='"+obj.attr("name")+"']:checked").val();
				inputval= inputval==undefined ? "" : inputval;
			}else if(obj.is(":checkbox")){
				inputval="";
				curform.find(":checkbox[name='"+obj.attr("name")+"']:checked").each(function(){ 
					inputval +=$(this).val()+','; 
				})
				inputval= inputval==undefined ? "" : inputval;
			}else{
				inputval=obj.val();
			}
			return $.trim(inputval);
		},
		toString:Object.prototype.toString,
		isEmpty:function(val){
			return val==="" || val===$.trim(this.attr("tip"));
		},
		isString:function(val){
			return (typeof val=='string')&&val.constructor==String; 
		}
	}
	Validationform.prototype={
		dataType:Validationform.util.dataType,
		check:function(bool,selector){
			/*
				bool：传入true，只检测不显示提示信息;
			*/
			var selector=selector || "[dataregx]",
				obj=this,curform=$(obj.forms),
				flag=true,showAllError = obj.settings.showAllError;
			curform.find(selector).each(function(){
				Validationform.util.check.call(this,curform,obj,"",bool) || (flag=false);
				if(!flag&&!showAllError){
					// 跳出循环
					return false;
				}
			});
			
			return flag;
		},
	}
	$.fn.Validationform=(function(settings){
		return new Validationform(this,settings);
	});
})(jQuery,window);
