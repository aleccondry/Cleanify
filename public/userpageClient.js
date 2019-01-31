//userpage client gets user data and displays it
window.onload = function(){
  //Select change listener
  $("select").on('change', function(){
      if($(this)[0].selectedIndex == 1){
        $("#uri-text").slideDown(500)
      }
      else{
        $("#uri-text").slideUp(500)
      }
  })

  //fire line animation
  $(".line").animate({width: "80%"}, 2000);

  //get access token from url
  const urlParams = new URLSearchParams(window.location.search);
  const access = urlParams.get('u');

  pageFunction(access)

}

function checkTrack(access, playlistID, tracks, index, numAdded){
  $(".line").animate({width: (index/tracks.length * 100)+"%"}, 100);
  if(index < tracks.length){
    var track = tracks[index].track;
    //add track function
    function addTrack(track, cleaned){
      var id = track.id;
      $.get(getURL("addtrack", access)+"&trackid="+id+"&playlistid="+playlistID, function(data){
       var divTracks = $("#tracks")[0];
       var tracksShouldChange = (divTracks.scrollHeight - divTracks.scrollTop < 220);
              var cleanClass = (cleaned)?"cleaned":"";
       $("#tracks").append("<div id='track-"+numAdded+"' track='"+id+"' class='track "+cleanClass+"'>"+track.name + "<a class='btn-primary button go edit' id=edit-"+numAdded+" track='"+id+"'>Edit</a></div>");
        numAdded++;
       if(tracksShouldChange){
         divTracks.scrollTop = divTracks.scrollHeight;
       }

       //wait before moving on to next track to avoid internal server errors
       setTimeout(function(){checkTrack(access, playlistID, tracks, index+1, numAdded)}, 10);
      })
    }

    if(track.explicit){//if track is explicit, search for clean versions on backend
      var name = track.name.clean();
      var artist = track.artists[0].name;
      //get search with info as queries
      $.get(getURL("search", access)+"&name="+name+"&artist="+artist, function(data){
        var results = data.items;

        //loop through search results for clean match
        var cleanFound = false;
        function loopTracks(contains){
          for(var i = 0; i < results.length; i++){
            if(!results[i].explicit && trackEquals(contains, name, results[i].name, artist, results[i].artists[0].name)){//if clean match, add to new playlist
              addTrack(results[i], true)
              cleanFound = true;
              break;
            }
          }
        }
        loopTracks(false);//check for exact matches
        if(!cleanFound){//if none, check for tracks that include the name
          loopTracks(true);
        }
        if(!cleanFound){//if still not found, remove from playlist
          $("#remove").append("<div class='remove'>"+track.name + "</div>");
          var divRemove = $("#remove")[0];
          var removeShouldChange = (divRemove.scrollHeight - divRemove.scrollTop < 220);
          if(removeShouldChange){
             divRemove.scrollTop = divRemove.scrollHeight;
           }
          //TODO: cool animation of removal?
          setTimeout(function(){checkTrack(access, playlistID, tracks,index+1, numAdded)}, 100);
        }
      })
    }
    else{
      addTrack(track);
    }
  }
  else{
    function toggleDisplay(){
      $(".line").animate({width: "80%"}, 200);
      $('.edit').off('click');
      $("#cancel").off('click');
      $("#confirm").off('click');
      $("#labels").slideUp(500);
      $("#go").css('display', 'block');
      $("#ui").css("display", 'none');
      $("#tracks").html("").css("display", "none");
      $("#remove").html("").css("display", "none");
      $("select")[0].disabled = false;
      $("select").html("  <option selected disabled hidden>Choose Playlist</option><option>Using URI</option>");
      pageFunction(access)
    }

    //show UI
    //$(".loading").slideUp(2000);
    $("#ui").fadeIn(2000);
    $(".track").on('mouseenter', function(){
      $("#edit-"+$(this).attr('id').split("-")[1]).show();
    })
    $(".track").on('mouseleave', function(){
      $("#edit-"+$(this).attr('id').split("-")[1]).hide();
    })
    $(".edit").on('click', function(){
      var parentDiv = $(this)[0];
      var position = $(this).attr('id').replace('edit-', '');
      var id = $(this).attr('track');
      getTrack(id, function(data){
        var artistText = data.artists[0].name;
        for(var x = 1; x < data.artists.length; x++){
          artistText += ", " + data.artists[x].name;
        }
        var lineDivs = [
          {"tag": "h3", "id": "yeye", "styles": {"color": "#e2e2e2"}, "text":data.name},
          {"tag": "p", "styles": {"color": "#9a9a9a"}, "text":artistText},
          {"classes": ["modInterface"]},
          {"id": "r-"+data.id, "classes": ['btn-primary', 'button', 'go', "modBtn"], "text": "Remove", "listeners":{
            "click": function(){
              removeTrack(access, data.id, playlistID, position, function(res){
                //TODO: change ids to positions and attr to track id, update positions after removal!
                $("#track-"+position).remove();
                while($("#track-"+(parseInt(position)+1)).length){
                  position++;
                  $("#track-"+position).attr("id", "track-"+(parseInt(position)-1));
                  $("#edit-"+position).attr("id", "edit-"+(parseInt(position)-1));
                }
                $(".textModule").remove();
              })
            }
          }},
          {"id": "s-"+data.id, "classes": ['btn-primary', 'button', 'go', 'modBtn'], "text": "Search", "listeners":{
            "click": function(){
              search(data.name, data.artists[0].name, function(res){
                $(".modInterface").html("");
                $(".modInterface").append("<table class='modTrack'><tbody><th><td class='modTrackHeader'>Name</td><td class='modTrackHeader'>Artist</td><td class='modTrackHeader'>Album</td></th></tbody></table>");
                for(var item of res.items){
                  var artistText = data.artists[0].name;
                  for(var x=1;x<data.artists.length;x++){artistText+=", "+data.artists[x].name}
                  var trackDiv = "<td class='modTrackComp'>"+item.name+"</td>";
                  var artistDiv = "<td class='modTrackComp'>"+artistText+"</td>";
                  var albumDiv = "<td class='modTrackComp'>" +item.album.name+"</td>";
                  $(".modInterface").append("<table class='modTrack'><tbody><tr>"+trackDiv+artistDiv+albumDiv+"</tr></tbody></table>");
                }
              });
            }
          }}
        ]
        var module = new TextModule(lineDivs, data.id);
        $('.textModule').slideDown(500, function(){
          module.activateListeners();
        })}
      )}
    )
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
  return "http://cleanify.me/"+program + "?u="+access;
}

function trackEquals(contains, trackName, resultName, artistName, resultArtist){
  trackName = trackName.clean();
  resultName = resultName.clean();
  artistName = artistName.clean();
  resultArtist = resultArtist.clean();
  if(!contains){
    return (trackName == resultName && artistName == resultArtist)
  }
  else{
    return ((trackName.includes(resultName) || resultName.includes(trackName)) && artistName == resultArtist);
  }
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
        //$(".loading").slideDown(500);
        $("#labels").slideDown(500);
        $("select")[0].disabled = true;
        $(this).css('display', 'none').off('click');
        //$("#loading").show();
        //find selected dropdown option
        var dropdown = document.getElementsByTagName("select")[0];
        var selected = dropdown.options[dropdown.selectedIndex];
        if (dropdown.selectedIndex == 1){
          console.log("using uri");
          var playlist_entered = document.getElementById("uri-text").value;
          var array = playlist_entered.split(":");
          var id = array[2];
          var playlist_id = array[4];
          if (id != null || playlist_id != null){
              $.get(getURL("playlistByURI", access)+"&playlist_id="+playlist_id+"&id="+id, function(data){
                var page = data.tracks;
                var tracks = page.items;
                usePlaylist(page, tracks, data);

            })
          } else {
              console.log("not valid playlist uri");
          }
        }
        else{
          //get tracks for selected playlist
          var playlist = playlists[selected.getAttribute("data-id")];
          $.get(getURL("playlist", access)+"&id="+playlist.id, function(data){
            var page = data.tracks;
            var tracks = page.items;
            usePlaylist(page, tracks, data);

          })
        }
        function usePlaylist(page, tracks, playlist){
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
              checkTrack(access, playlistID, tracks, 0, 0);//begin loop through tracks
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
        }
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

function search(name, artist, callback){
  $.get(getURL('search')+'&name='+name+'&artist='+artist, function(data){callback(data)})
}

function getTrack(id, callback){
  $.get(getURL('trackById')+'&id='+id, function(data){callback(data)});
}

function removeTrack(access, id, playlistid, position, callback){
  console.log(position);
  $.get(getURL('remtrack', access)+'&trackid='+id + '&playlistid='+playlistid+'&position='+position, function(data){callback(data)})
}

String.prototype.clean = function(){
  return this.toLowerCase().replace("'", "");
}
