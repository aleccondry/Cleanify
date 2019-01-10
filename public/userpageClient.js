//userpage client gets user data and displays it
window.onload = function(){
  //fire line animation
  $(".line").animate({width: "80%"}, 2000);

  //get access token from url
  const urlParams = new URLSearchParams(window.location.search);
  const access = urlParams.get('u');

  pageFunction(access)

}

function checkTrack(access, playlistID, tracks, index){
  if(index < tracks.length){
    var track = tracks[index].track;
    //add track function
    function addTrack(track){
      var id = track.id;
      $.get(getURL("addtrack", access)+"&trackid="+id+"&playlistid="+playlistID, function(data){
       var divTracks = $("#tracks")[0];
       var tracksShouldChange = (divTracks.scrollHeight - divTracks.scrollTop < 220);
       var divRemove = $("#remove")[0];
       var removeShouldChange = (divRemove.scrollHeight - divRemove.scrollTop < 520);
       $("#tracks").append("<div id='track-"+id+"' class='track'>"+track.name + "<a class='btn-primary button go' id=rm-"+id+">Remove</a></div>");
       if(tracksShouldChange){
         divTracks.scrollTop = divTracks.scrollHeight;
       }
       if(removeShouldChange){
         divRemove.scrollTop = divRemove.scrollHeight;
       }
       //wait before moving on to next track to avoid internal server errors
       setTimeout(function(){checkTrack(access, playlistID, tracks, index+1)}, 100);
      })
    }

    if(track.explicit){//if track is explicit, search for clean versions on backend
      var name = track.name;
      var artist = track.artists[0].name;
      //get search with info as queries
      $.get(getURL("search", access)+"&name="+name+"&artist="+artist, function(data){
        var results = data.items;

        //loop through search results for clean match
        var cleanFound = false;
        for(var i = 0; i < results.length; i++){
          if(!results[i].explicit && trackEquals(name, results[i].name, artist, results[i].artists[0].name)){//if clean match, add to new playlist
            addTrack(results[i])
            cleanFound = true;
            break;
          }
        }
        if(!cleanFound){
          $("#remove").append("<div class='remove'>"+track.name + "</div>");
          //TODO: cool animation of removal?
          setTimeout(function(){checkTrack(access, playlistID, tracks,index+1)}, 100);
        }
      })
    }
    else{
      addTrack(track);
    }
  }
  else{
    //TODO: confirm buttons
    function toggleDisplay(){
      $("#cancel").off('click');
      $("#confirm").off('click');
      $("#go").css('display', 'block');
      $("#ui").css("display", 'none');
      $("#tracks").html("").css("display", "none");
      $("#remove").html("").css("display", "none");

      $("select").html("  <option selected disabled hidden>Choose Playlist</option><option>Using URI</option>");
      pageFunction(access)
    }
    $("#ui").css("display", "block");
    $(".track").on('mouseenter', function(){
      $("#rm-"+$(this).attr('id').split("-")[1]).show();
    }) 
    $(".track").on('mouseleave', function(){
      $("#rm-"+$(this).attr('id').split("-")[1]).hide();
    })
    $("#cancel").click(function(){
      toggleDisplay();
      $.get(getURL("remove", access)+"&id=" + playlistID, function(){
        console.log("removed playlist")
      })
    })
    $("#confirm").click(function(){
      toggleDisplay();
    })
  }
}

function getURL(program, access){
  return "http://cleanify.mooo.com/"+program + "?u="+access;
}

function trackEquals(trackName, resultName, artistName, resultArtist){
  return ((trackName.includes(resultName) || resultName.includes(trackName)) && artistName == resultArtist);
}

function pageFunction(access){
  //get playlists
  $.get(getURL("playlists", access)+"&offset=0", function(data){
    playlists = data.items; //set playlists variable to playlists received from server

    function nextPlaylists(offset){
      $.get(getURL('playlists', access)+"&offset="+offset, function(data){
        playlists = playlists.concat(data.items);
        if(data.next != null){
          nextPlaylists(offset + 20);
        }
        else{
          continueWithPlaylists(playlists);
        }
      })
    }
    function continueWithPlaylists(playlists){
      for(var i = 0; i < playlists.length; i++){
            $("select").append("<option data-playlist='"+playlists[i].id+"' data-id='"+i+"'>"+playlists[i].name+"</option>");
          }
      $("#go").click(function(){//start clean on click
        $(this).css('display', 'none').off('click');
        //find selected dropdown option
        var dropdown = document.getElementsByTagName("select")[0];
        var selected = dropdown.options[dropdown.selectedIndex];
        if (dropdown.selectedIndex = 0){
          console.log("using uri");
          var playlist_entered = document.getElementById("uri-text").value;
          var array = playlist.split(":");
          var id = array[2];
          var playlist_id = array[4];
          if (id != null || playlist_id != null){
              $.get(getURL("playlistByURI", access)+"&playlist_id="+playlist_id+"&id="+id, function(data){
                var page = data.tracks;
                var tracks = page.items;
            })
          } else {
              console.log("not valid playlist uri");
          }
        }
        //get tracks for selected playlist
        var playlist = playlists[selected.getAttribute("data-id")];
        $.get(getURL("playlist", access)+"&id="+playlist.id, function(data){
          var page = data.tracks;
          var tracks = page.items;

          //function to add tracks beyond cap of 100
          function nextTracks(offset){
            $.get(getURL('tracks', access)+"&id="+playlist.id+"&offset="+offset, function(data){//get next paging object
              var page = data;//store new paging object
              tracks = tracks.concat(page.items); //add tracks in next to original tracks array
              if(page.next!=null){ //continue to do so until there are no more next paging objects
                nextTracks(offset + 100)
              }
              else{ //if there are no more tracks, continue with creation
                cont()
              }
            });
          }

          function cont(){//make and populate new playlist
            $.get(getURL("create", access)+"&name="+playlist.name + " (Clean)", function(data){
              var playlistID = data.id;
              checkTrack(access, playlistID, tracks, 0);//begin loop through tracks
            });
            $("#tracks").show();
            $("#remove").show();
          }

          if(page.next != null){//if there are more tracks, call next tracks and begin looping pages
            nextTracks(100)
          }
          else{//otherwise continue with creation
            cont()
          }
        })
      })
    }
    if(data.next != null){
      nextPlaylists(20);
    }
    else{
      continueWithPlaylists(playlists)
    }
  });
}
