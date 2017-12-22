$(function(){
     // var keys = {
     //    spa:[],
     //    staticPage:[]
     // }
     var x = null;
     var url = 'static/output.json' //全部
     let result = null
     var chartLoading = null;
     $("#condition-select span").on('click',function(){

        x=null;
       $("#reset").click()

        $(this).addClass('active').siblings().removeClass('active')
        var txt = $(this).text()
        $(".type").text(txt)
        
        
        $.ajax({
          type:"GET", 
          url:url,
          beforeSend:function(){
             chartLoading = $("#chart1").myLoading({
               msg: '请稍后',
               mask: false,
               img:true,
             });
              chartLoading.init();
          },
          success:function(res){
             switch(txt)
            {
            case '全部':
              result = res
              break;
            case 'VUE':             
             result = res.filter(function(v,i){
                return contains(v.schedule.technology,"vue")
             })
              break;
            case 'Jquery':             
             result = res.filter(function(v,i){
                return contains(v.schedule.technology,"jquery")
             })
              break;
             case 'mobile':            
             result = res.filter(function(v,i){
                return v.base.mobile === true
             })
              break;
            default:           
            }
            console.log('result',result)
            getInitData(result)
            chartLoading.destroy()

          }
        })

        // $.getJSON(url,function(res){
        //     switch(txt)
        //     {
        //     case '全部':
        //       result = res
        //       break;
        //     case 'VUE':
        //      // 执行代码块 2
        //      result = res.filter(function(v,i){
        //         return contains(v.schedule.technology,"vue")
        //      })
        //       break;
        //     case 'Jquery':
        //      // 执行代码块 2
        //      result = res.filter(function(v,i){
        //         return contains(v.schedule.technology,"jquery")
        //      })
        //       break;
        //      case 'mobile':
        //      // 执行代码块 2
        //      result = res.filter(function(v,i){
        //         return v.base.mobile === true
        //      })
        //       break;
        //     default:
        //       //n 与 case 1 和 case 2 不同时执行的代码
        //     }
        //     console.log('result',result)
        //     getInitData(result)

        // })
     })
     $("#condition-select span")[0].click()
     

     //重置按钮
     $("#reset").on('click',function(){
        $(".pre-label input").each(function(i,v){
           $(v).attr({'style':'color:#000','disabled':false}).val("")
        })
        $("#result").text("")
     })

})

function getInitData(res){

  // $.getJSON(url,function(res){
     var projectName = []; //项目名称
     var pageNum = []; //总页面数
     var timeRange = []; //时间周期
     var peopleNum = []; //人数
     var urlArr = []
     var html = ''
     res.forEach(function(v,i,a){
        if(v.base.name !== '部门内部研发' && 
          
           v.schedule.pages && v.schedule.pages!=="" && 
           v.schedule.actualStartTime && v.schedule.actualStartTime!=='未定' && v.schedule.actualStartTime!=='' &&
           v.schedule.actualEndTime && v.schedule.actualEndTime!==''&&
           v.schedule.actualEndTime!=='未定' &&
           v.resources.average){
             projectName.push(v.base.name)

             //let proUrl = v.base.url?v.base.url:"javascript:void(0)" 

             if(v.base.url){
                if(v.base.mobile){
                  proUrl = "http://192.168.1.6:8124/phoneView.html?url="+v.base.url
                }
                else{
                  proUrl = v.base.url
                }
             }
             else{
                proUrl = "javascript:void(0)" 
             }


             html = html + '<li><a href='+proUrl+' target="_blank">' + v.base.name + '</a></li>'


             pageNum.push(v.schedule.pages)
            
             timeRange.push(getDays(v.schedule.actualStartTime,v.schedule.actualEndTime))
            
             // if(v.resources.affiliate[0]=="")
             //    peopleNum.push(1)
             // else{
             //    peopleNum.push(v.resources.affiliate.length+1)
             // }
             peopleNum.push(v.resources.average)
             urlArr.push(proUrl)
        }
        
        
       
     })
     console.log('有效项目名称',projectName)
     console.log('有效项目页数',pageNum)
     console.log('有效项目周期',timeRange)
     console.log('有效项目人员',peopleNum)

     $("#selectedPro").html(html)

     var calcRTNum = calcRT(timeRange,peopleNum)
   
     x = getX(pageNum,timeRange,peopleNum).x
     var xArr = getX(pageNum,timeRange,peopleNum).xArr
     console.log('getX.xArr',xArr)
     console.log('getX.x',x)
     chart1(projectName,pageNum,timeRange,peopleNum,calcRTNum,xArr,urlArr)
     //var notInput = ''
     $("#pageCont,#timeRange,#personCont").change(function(v){

        let pageVal = $("#pageCont").val()
        let timeRange = $("#timeRange").val()
        let personCont = $("#personCont").val()

        if(isNaN(pageVal) || isNaN(timeRange) ||isNaN(personCont)){
          alert('请输入数字')
          $("#reset").click()
          return 
        }

          console.log('pageVal',pageVal)
          console.log('timeRange',timeRange)
          console.log('personCont',personCont)
          console.log('x',x)
        getResult(pageVal,timeRange,personCont,x)
     
     })



     // console.log('calcRTNum',calcRTNum)
     // console.log('name',projectName)
     // console.log('pageNum',pageNum)
     // console.log('timeRange',timeRange)
     // console.log('peopleNum',peopleNum)

  // })
}

//求两端时间之间的天数
function getDays(strDateStart,strDateEnd){
   var strSeparator = "-"; //日期分隔符
   var oDate1;
   var oDate2;
   var iDays;
   oDate1= strDateStart.split(strSeparator);
   oDate2= strDateEnd.split(strSeparator);
   var strDateS = new Date(oDate1[0], oDate1[1]-1, oDate1[2]);
   var strDateE = new Date(oDate2[0], oDate2[1]-1, oDate2[2]);
   //把相差的毫秒数转换为天数 
   iDays = parseInt(Math.abs(strDateS - strDateE ) / 1000 / 60 / 60 /24)
   return iDays ;
}

//计算人天
function calcRT(timeRange,peopleNum){
    var s = timeRange.map(function(v,i){
        return v*peopleNum[i]
    })
    return s
}

function chart1(projectName,pageNum,timeRange,peopleNum,calcRTNum,xArr,urlArr){
    var myChart = echarts.init(document.getElementById('chart1'));
    myChart.setOption({
    backgroundColor:"#fff",
    grid:{
        top:"100",
        bottom:"100",
        left:'50',
        right:'50'
    },
    title: {
        text: '',
        left:"center"
    },
    "tooltip": {
        "trigger": "axis"
    },
    "legend": {
        "data": ["页面数","开发周期","人员","人天"],
        top:"50"
    },
    "xAxis": [
        {
          "type": "category",
          "data": projectName,
          "axisPointer": {
            "type": "shadow"
          },
          'triggerEvent':true,
          "axisLabel": {
            rotate:45,
            interval:0,
            margin:15,
            formatter: '{value}'
            ,
            textStyle:{
                color:'#6783c4'
            }
        },
        }
    ],
    "yAxis": [
        {
          "type": "value",
          "name": "",
          "min": 0,
        
          "interval": 50
        },
        {
          "type": "value",
          "name": "效率值",
          "min": 0,
      
       
          splitLine: {
            show: false,
        },  
        axisTick: {
            show: false
        },
        }
    ],
    color:["#fd707c","#6ba8f3","#32cfaa","#7d87bd","#ffa200"],
    "series": [
        {
          "name": "页面数",
          "type": "bar",
          'barCategoryGap':'100%',
          'barWidth':'10', 
          "data": pageNum
        },
        {
          "name": "开发周期",
          "type": "bar",
          'barWidth':'10', 
          "data": timeRange
        },
        {
          "name": "人员",
          "type": "bar",
          'barWidth':'10', 
          "data": peopleNum
        },
        {
          "name": "人天",
          "type": "bar",
          'barWidth':'10', 
          "data": calcRTNum
        },
        {
          "name": "效率值",
          "type": "line",
          "data": xArr,
            "yAxisIndex": 1,
        },
        
    ]
})
    console.log('projectName',projectName)
    myChart.on('click',function(e){
        var url = ''
        var name = ''
        //如果点击的是X轴
        if(e.componentType == "xAxis"){  
            name = e.value 
        }
        else{
          name = e.name
        }
        var index = projectName.indexOf(name)
        console.log(index)
        url = urlArr[index]
        
        if(url && url!=='javascript:void(0)'){
          window.open(url)
        }
       
    })

    echartsResize(myChart)
}



//计算项目系数 = 每个项目的页面数/每项时间周期 / 每项人员数
//计算得出一个包含所有项目系数的数组 取平均值


function getX(pageArr,timeArr,peopleArr){
  let xArr = [],sum=0

  pageArr.forEach(function(v,i,a){
     xArr.push((pageArr[i]/timeArr[i])/peopleArr[i])     
  }) 
  xArr.forEach(function(v,i,a){
    sum += v
  })

  var x = (sum/xArr.length).toFixed(2);

  var xArr100 = xArr.map(function(v,i){
     return (v*100).toFixed(2)
  }) 
  console.log('函数内x',x)
  console.log('函数内xArr',xArr)
  return {
    xArr:xArr100,
    x:x
  };
}


function getResult(pageVal,timeVal,peopleVal,x){


  var argumentsNull = 0;
  for(var i=0; i< arguments.length ; i++){
    if(arguments[i]==="" || arguments[i]===null || arguments[i]==='undefined'){
      argumentsNull++
    }
  }
  console.log('argumentsNull个数: ' + argumentsNull)
  if(argumentsNull>=2){
    console.log('参数少于2个')
    return
  }

  // if(argumentsNull===0){
  //   console.log('参数为4个,已经计算过一次了')
    
  //   $("input").each(function(i,v){
  //      if($(v).attr('disabled')){
  //        $(v).attr('disabled',false).val("")
  //      }
  //   })
  //   //$("#result").text('')
  //   //return
  // }
  var pageRes,timeRes,peopRes
  if(!pageVal){
    pageRes = (timeVal * peopleVal) * x
    // $("#result").text('项目周期：' + timeVal + '   项目人数：'+peopleVal+'大约能完成 '+ pageRes+ '页')
    $("#pageCont").attr({"style":"color:red","disabled":"disabled"}).val(pageRes.toFixed(2))

    $("")

    //return pageRes
  }

  if(!timeVal){
    timeRes = (pageVal/peopleVal)/x
    // $("#result").text('项目页数：' + pageVal + '项目人数：'+peopleVal+'大约需要项目周期 '+ Math.ceil(timeRes)+ '天')
    $("#timeRange").attr({"style":"color:red","disabled":"disabled"}).val((timeRes).toFixed(2))
    //return timeRes
  }

  if(!peopleVal){
    peopRes = (pageVal/timeVal)/x
    // $("#result").text('项目页数：' + pageVal + '项目周期：'+timeVal+'大约需要前端人员 '+ Math.ceil(peopRes)+ '人')
    $("#personCont").attr({"style":"color:red","disabled":"disabled"}).val((peopRes).toFixed(2))
    //return peopRes
  }
  //计算过了 设置所有输入框不能更改
  $(".pre-label input").each(function(i,v){
         $(v).attr('disabled',"disabled")
  })

}

//判断数组是否包含某个元素
function contains(arr, obj) {  
    var arrLowerCase = arr.map(function(v,i){
       return v.toLowerCase()
    })
    var i = arr.length;  
    while (i--) {  
        if (arrLowerCase[i] === obj.toLowerCase() ) {  
            return true;  
        }  
    }  
    return false;  
} 

//echarts随浏览器变化样式重置
function echartsResize(obj) {
  window.addEventListener("resize", function () {
    var time = null;
    clearTimeout(time);
    time = setTimeout(function () {
      obj.resize();
    }, 100);
  });
}


(function($) {
    $.fn.extend({
        myLoading: function(config) {
            var defaults = {
                msg: '数据加载中,请稍后',
                mask:true,
                img:true,
                callback:function(){
                    alert(1)
                }
            };

            var config = $.extend(defaults, config);
        
            this.init = function() {
                this.destroy(false);
                var loadDiv = $("<div class='loadDiv'>" + config.msg + "</div>");
                this.css("position", "relative");
                this.append(loadDiv);

                if(config.mask){                   
                    var mask = $("<div class='mask'></div>");
                    this.append(mask);
                }

                if(config.img){                   
                    var img = $("<div class='loader-inner line-scale'>"+
                                     "<div></div>"+
                                     "<div></div>"+
                                     "<div></div>"+
                                     "<div></div>"+
                                     "<div></div>"+
                              "</div>");
                    this.find('.loadDiv').append(img);
                }
                else{
                    var img = $("<div class='loadingGif'><img src='../img/loading2.gif' width='80' /></div>");
                    this.find('.loadDiv').append(img);
                }
                              
            }          


            this.destroy = function(flag) {
                if(flag)
                {
                     config.callback()
                }               
                $(this).children('.loadDiv').hide();
                $(this).children(".mask").hide()
            }
            return this;
        }
    });
})(window.jQuery);
