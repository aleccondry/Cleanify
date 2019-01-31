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
    var xbutton = "<div id='xbutton' class='btn btn-primary btn-lg' style='font-size: 100%;position: relative;padding: 4px 10px 4px 10px;display: inline;left: 45%;top: 10px;text-align: center;''>X</div>"
    this.element = document.createElement('div');
    this.element.innerHTML = html;
    this.element.innerHTML += xbutton;
    this.element.classList.add('textModule');
    $("body").append(this.element)


  }

  activateListeners(){
    $("#intro #xbutton").on('click', function(){
      $(".textModule").slideUp(500, function(){$(this).remove();})
      $("#intro #xbutton").off('click')
    })

    for(var i = 0; i< this.divs.length; i++){
      var div = this.divs[i];
      if(div.listeners){
        for(var listener in div.listeners){
          $("#"+div.id).on(listener,div.listeners[listener]);
        }
      }
    }
  }
  
  static removeTrack(position){
    var removed = position;
    while($("#track-"+(parseInt(position)+1)).length){
      position++;
      $("#track-"+position).attr("id", "track-"+(parseInt(position)-1));
      $("#edit-"+position).attr("id", "edit-"+(parseInt(position)-1));
    }
    $(".textModule").slideUp(500, function(){
      $(this).remove();
      $("#track-"+removed).fadeOut(300, function(){$(this).remove();});
    })
  }
}
