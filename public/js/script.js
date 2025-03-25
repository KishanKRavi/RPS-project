function createGame() {
    const playerName = document.getElementById("name").value.trim().toUpperCase();
    if (!playerName) {
        alert("Please enter your name!");
        return;
    }
    const randomRoomId = Math.floor(1000 + Math.random() * 9000);
    window.location.href = `/game/${randomRoomId}?name=${encodeURIComponent(playerName)}`;
}

function joinGame() {
    const playerName = document.getElementById("name").value.trim().toUpperCase();
    if (!playerName) {
        alert("Please enter your name!");
        return;
    }
    window.location.href = `/joinRoom?name=${encodeURIComponent(playerName)}`;
}

function joinGames() {
    const urlParams = new URLSearchParams(window.location.search);
    const playerName = urlParams.get("name");
    const roomId = document.getElementById('roomId').value;
    window.location.href = `/game/${roomId}?name=${encodeURIComponent(playerName)}`;
}

//overlay script
const showOverlayButtons = document.querySelectorAll(".showOverlay");
const closeOverlayBtn = document.getElementById("closeOverlay");
const indexPage = document.getElementById("indexPage");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");

function showOverlay(event) {
    const title = event.target.getAttribute("title");
    const content = event.target.getAttribute("content");
    overlayTitle.textContent = title;
    overlayText.innerHTML  = content.replace(/\n/g, "<br>");
    overlay.classList.add("show");
}

showOverlayButtons.forEach(button => {
    button.addEventListener("click", showOverlay);
});

// Close overlay function
closeOverlayBtn.addEventListener("click", () => {;
    overlay.classList.remove("show");
});

function playNow(){
    window.location.href="/playnow";
}

function goBack() {
    window.history.back();
}

//in game menu
const menuOverlay = document.querySelector(".menuOverlay");
const menuButton = document.querySelector(".inGameMenu");

// Function to toggle menu visibility
function showMenu() {
    menuOverlay.classList.toggle("show"); // Toggle the 'show' class
}

// Close menu if clicked outside
document.addEventListener("click", (event) => {
    if (!menuOverlay.contains(event.target) && !menuButton.contains(event.target)) {
        menuOverlay.classList.remove("show");
    }
});
