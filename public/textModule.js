class TextModule { 
  constructor(parentDiv, divs, buttonObjects){
    var html = "";
    for(var i = 0; i < divs.length; i++){
      var div = divs[i];
      var tag = div.tag || "div";
      var id = div.id || "";
      var keys = Object.keys(div.styles);
      var styles = "";if(div.styles){for(var x=0;x<keys.length;x++){styles+=keys[x] + ":" + div.styles[keys[x]]+";"}}
      var classes = "";if(div.classes){for(var x=0;x<div.classes.length;x++){classes+=div.classes[x] + " ";}}
      var string = "<"+tag + " id='"+id+"' class='"+classes+"' style='"+styles+"'>"+div.text+"'</"+tag+">";
      html += string;
    }
    this.element = document.createElement('div');
    this.element.innerHTML = html;
    this.element.classList.add('textModule');
    parentDiv.appendChild(this.element);
  }

}
