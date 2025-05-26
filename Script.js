document.addEventListener('DOMContentLoaded', () => {
    const raceTrack = document.querySelector('.race-track');
    const startButton = document.getElementById('startButton');
    const resultsList = document.getElementById('resultsList');
    const nameInputsDiv = document.querySelector('.name-inputs');

    const MARBLE_COUNT = 10;
    const RACE_DURATION_MS = 60000; // Aiming for ~1 minute
    const FRAME_RATE_MS = 50; // Update every 50ms (20 FPS)

    let marbles = [];
    let raceInterval;
    let startTime;
    let raceInProgress = false;
    let finishedMarbles = [];
    let marbleNames = []; // Array to store marble names

    function createNameInputs() {
        for (let i = 0; i < MARBLE_COUNT; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Marble ${i + 1} Name`;
            input.id = `marbleName${i}`;
            // Pre-fill with a default name for convenience
            input.value = `Player ${i + 1}`;
            nameInputsDiv.appendChild(input);
        }
    }

    function getMarbleNames() {
        marbleNames = [];
        for (let i = 0; i < MARBLE_COUNT; i++) {
            const input = document.getElementById(`marbleName${i}`);
            // Use input value, or a generic name if empty/whitespace
            marbleNames.push(input.value.trim() || `Marble ${i + 1}`);
        }
    }

    function createMarbles() {
        raceTrack.innerHTML = ''; // Clear any existing marbles
        marbles = [];
        finishedMarbles = [];
        resultsList.innerHTML = '';
        getMarbleNames(); // Get names from input fields before creating marbles

        for (let i = 0; i < MARBLE_COUNT; i++) {
            const marbleLane = document.createElement('div');
            marbleLane.classList.add('marble-lane');

            const marbleDiv = document.createElement('div');
            marbleDiv.classList.add('marble');
            marbleDiv.dataset.name = marbleNames[i]; // Use name from input
            marbleDiv.dataset.position = 0;
            marbleDiv.style.left = '0%';
            marbleDiv.innerHTML = `<span class="marble-label">${marbleNames[i]}</span>`; // Display full name

            marbleLane.appendChild(marbleDiv);
            raceTrack.appendChild(marbleLane);
            marbles.push({
                element: marbleDiv,
                name: marbleNames[i],
                position: 0, // 0 to 100%
                finished: false,
                finishTime: null,
                // Initial speed, average around 0.083% per frame for ~60s race
                currentSpeed: Math.random() * 0.03 + 0.07 // Range: 0.07 to 0.10 % per frame
            });
        }
        startButton.disabled = false;
        startButton.textContent = "Start Race!";
    }

    function startRace() {
        if (raceInProgress) return;

        raceInProgress = true;
        startButton.disabled = true;
        startButton.textContent = "Racing...";
        resultsList.innerHTML = '';
        finishedMarbles = [];
        startTime = Date.now();

        marbles.forEach(marble => {
            marble.position = 0;
            marble.element.style.left = '0%';
            marble.finished = false;
            marble.finishTime = null;
            // Re-randomize initial speed for a new race
            marble.currentSpeed = Math.random() * 0.03 + 0.07;
        });

        raceInterval = setInterval(updateRace, FRAME_RATE_MS);
    }

    function updateRace() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;

        marbles.forEach(marble => {
            if (!marble.finished) {
                // Apply small random acceleration/deceleration
                // Adjust 0.005 for how much speed changes per frame. Smaller = smoother/less erratic.
                marble.currentSpeed += (Math.random() - 0.5) * 0.055;

                // Clamp speed to reasonable min/max values for a 1-minute race
                // These values (0.05 to 0.15) mean 0.05% to 0.15% of the track per frame
                // Avg: 0.1% * 20 fps = 2% per sec. 100% / 2% = 50 seconds.
                // Adjust these min/max values to fine-tune overall race duration.
                marble.currentSpeed = Math.max(0.02, Math.min(0.32, marble.currentSpeed));

                marble.position += marble.currentSpeed;

                marble.element.style.left = `${marble.position}%`;

                if (marble.position >= 100) {
                    marble.finished = true;
                    marble.finishTime = elapsedTime;
                    finishedMarbles.push(marble);
                    // Ensure the marble is fully at the end, accounting for its width (60px)
                    marble.element.style.left = 'calc(100% - 60px)';
                }
            }
        });

        if (finishedMarbles.length === MARBLE_COUNT) {
            endRace();
        }
    }

    function endRace() {
        clearInterval(raceInterval);
        raceInProgress = false;
        startButton.disabled = false;
        startButton.textContent = "Race Again!";

        // Sort finished marbles by finish time
        finishedMarbles.sort((a, b) => a.finishTime - b.finishTime);

        displayResults();
    }

    function displayResults() {
        resultsList.innerHTML = '';
        finishedMarbles.forEach((marble, index) => {
            const listItem = document.createElement('li');
            const timeInSeconds = (marble.finishTime / 1000).toFixed(2);
            listItem.innerHTML = `<span>${index + 1}. ${marble.name}</span><span>${timeInSeconds}s</span>`;
            if (index === 0) {
                listItem.classList.add('winner');
            }
            resultsList.appendChild(listItem);
        });
    }

    createNameInputs(); // Create input fields on page load

    startButton.addEventListener('click', () => {
        if (!raceInProgress) {
            createMarbles(); // Recreate marbles with potentially new names
            startRace();
        }
    });
});


