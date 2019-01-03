//userpage client gets user data and displays it
window.onload = function(){
  console.log("onload running")
  $.get("http://cleanify.mooo.com/playlists", function(data){
    console.log("success: " + data.items[0].name);
    var playlists = data.items;
    for(var i = 0; i < playlists.length; i++){
      $("select").append("<option data-playlist='"+playlists[i].id+"'>"+playlists[i].name+"</option>");
    }
    $("#go").click("on", function(){
      var dropdown = document.getElementsByTagName("select")[0];
      var selected = dropdown.options[dropdown.selectedIndex];
      $.get("http://cleanify.mooo.com/clean?id="+selected.getAttribute("data-playlist"), function(data){

      });
    })
  });
}
