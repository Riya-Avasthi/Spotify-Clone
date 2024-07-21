console.log("Lets write Javascript !!")
let currFolder;
let currentsong = new Audio();
let songs;
async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    //console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    //show all songs in a playlist
    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0]
    songUL.innerHTML = " "
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="music.svg" alt="">
        <div class="info">
            <div> ${song.replaceAll("%20", " ")}</div>
            <div>Riya</div>
        </div>
        <div class="playnow">
            <span>Play now</span>
            <img class="invert" src="play.svg" alt="" width="32px">
        </div></li>`;
    }
    //var audio = new Audio(songs[0]);
    //audio.play();

    //attach an event listener to each song
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs;

}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/motivating/" + track)
    currentsong.src = `/${currFolder}/` + track
    if (!pause) {
        currentsong.play()
        //play.src = "play.svg"
        play.src = "play.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".sngtime").innerHTML = "00:00 / 00:00 "
}

function convertSecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    // // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    //// Pad with leading zeros if less than 10
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');

    // // Return formatted time string
    return `${paddedMinutes}:${paddedSeconds}`;

}

async function displayAlbum() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    //console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];



        if (e.href.includes("/songs")) {
            let folderC = e.href.split("/").slice(-2)[0]
            //get the meta data of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folderC}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folderC}" class="card">
          <div  class="play">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                  color="#000000" fill="black">
                  <path
                      d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                      stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
              </svg>
          </div>
          <img src="/songs/${folderC}/cover.jpg" alt="">
          <h3>${response.title}</h3>
          <p>${response.description}</p>
      </div>`
        }
    }

    //load the playlist whenever the card is clicked 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        })
    })
}

async function main() {


    //get list of all songs
    await getsongs("songs/mood");
    playMusic(songs[0])

    //display all albums on page
    displayAlbum()


    //attach an event listener to play, previous and next
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "pause.svg"
        } else {
            currentsong.pause()
            play.src = "play.svg"
        }
    })

    //listen for time update event
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".sngtime").innerHTML = `${convertSecondsToMinutes(currentsong.currentTime)}/${convertSecondsToMinutes(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })

    //add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //add event listener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //add event listener for previous and next
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    //add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100
        if (currentsong.volume > 0) {
            document.querySelector(".vol>img").src = document.querySelector(".vol>img").src.replace("mute.svg", "volume.svg")
        }
    })

    //add event to mute the voluem
    document.querySelector(".vol>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentsong.volume = .1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

}

main();