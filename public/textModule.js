class TextModule { 
  constructor(divs, data){
    this.data = data;
    this.divs = divs;
    var html = "";
    for(var i = 0; i < divs.length; i++){
      var div = divs[i];
      var tag = div.tag || "div";
      var id = div.id || "";
      var text = div.text || "";
      var styles = "";if(div.styles){for(var key in div.styles){styles+=key + ":" + div.styles[key]+";"}}
      var classes = "";if(div.classes){for(var x=0;x<div.classes.length;x++){classes+=div.classes[x] + " ";}}
      var string = "<"+tag + " id='"+id+"' class='"+classes+"' style='"+styles+"'>"+text+"</"+tag+">";
      html += string;
    }
    this.element = document.createElement('div');
    this.element.innerHTML = html;
    this.element.classList.add('textModule');
    $("body").append(this.element)
      
   
  }

  activateListeners(){
    $("#intro").on('click', function(){$('.textModule').remove(); $("#intro").off('click')})

    for(var i = 0; i< this.divs.length; i++){
      var div = this.divs[i];
      if(div.listeners){
        for(var listener in div.listeners){
          $("#"+div.id).on(listener,div.listeners[listener]);
        }
      }
    } 
  }

}
