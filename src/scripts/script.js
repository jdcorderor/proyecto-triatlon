let interval;
let currentDate;
let currentTime;
let currentSeconds;

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.href.endsWith('registration.html')) {
        const participants = JSON.parse(localStorage.getItem('participants')) || [];
        const registrationForm = document.getElementById('registration-form');
        if (registrationForm) {
            registrationForm.addEventListener('submit', (event) => {
                event.preventDefault();

                const name = document.getElementById('participant-name').value;
                const id = document.getElementById('participant-id').value;
                const municipality = document.getElementById('participant-municipality').value;
                const age = document.getElementById('participant-age').value;

                if (id.startsWith('0')) {
                    alert('Error. La cédula de identidad no puede comenzar con 0.');
                    document.getElementById('participant-id').focus();
                    document.getElementById('participant-id').select();
                    return;
                }

                const idExists = participants.some(participant => participant.id === id);
                if (idExists) {
                    alert(`Error. La cédula de identidad ${id} ya está registrada.`);
                    document.getElementById('participant-id').focus();
                    document.getElementById('participant-id').select();
                    return;
                }

                if (name && id && municipality && age) {
                    const participant = {
                        id,
                        name,
                        municipality,
                        age,
                        assistance: false,
                        progress: {
                            walk: { distance: 0.0, time: '00:00:00', start: 'N/A', end: 'N/A'},
                            swim: { distance: 0.0, time: '00:00:00', start: 'N/A', end: 'N/A'},
                            bike: { distance: 0.0, time: '00:00:00', start: 'N/A', end: 'N/A'},
                        },
                        totalDistance: 0.0,
                        totalTime: '00:00:00',
                        finished: false,
                        disqualified: false,
                    };
                    participants.push(participant);
                    localStorage.setItem('participants', JSON.stringify(participants))
                    registrationForm.reset();
                    alert('Registro exitoso.');
                    window.location.href = "../index.html"
                }
            });
        }
    }

    if (window.location.href.endsWith('participants.html')) {
        const participants = JSON.parse(localStorage.getItem('participants'));
        if (participants) {
            const tableBody = document.getElementById('participants-table-body');
            tableBody.innerHTML = '';
            participants.forEach((participant, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${participant.id}</td>
                    <td>${participant.name}</td>
                    <td>${participant.municipality}</td>
                    <td>${participant.age}</td>
                    <td>
                        <div class='button-group'>
                            <button class='edit-button' data-index='${index}'>Editar</button>
                            <button class='delete-button' data-index='${index}'>Eliminar</button>
                        </div>
                    </td>
                    <td><input type='checkbox' class='assistance' data-index='${index}' ${participant.assistance ? 'checked' : ''}></input></td>
                `;
                tableBody.appendChild(row);
            });
        }

        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = event.target.getAttribute('data-index');
                const participant = participants[index];
                localStorage.setItem('participant-to-update', JSON.stringify(participant));
                window.location.href = 'updateform.html';
            });
        });
    
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = event.target.getAttribute('data-index');
                const confirmDelete = confirm(`¿Está seguro de que desea eliminar al participante con cédula de identidad ${participants[index].id}?`);
                if (confirmDelete) {
                    participants.splice(index, 1);
                    localStorage.setItem('participants', JSON.stringify(participants));
                    alert('Participante eliminado exitosamente.');
                    location.reload();
                }
            });
        });

        document.querySelectorAll('.assistance').forEach(checkbox => {
            checkbox.addEventListener('click', (event) => {
                if (event.target.checked) {
                    const index = event.target.getAttribute('data-index');
                    participants[index].assistance = true;
                } else {
                    const index = event.target.getAttribute('data-index');
                    participants[index].assistance = false;
                }
                localStorage.setItem('participants', JSON.stringify(participants));
            });
        });

        document.getElementById('start-button').addEventListener('click', () => {
            if (!participants || participants.length === 0 || !participants.some(participant => participant.assistance)) {
                alert('El triatlón no puede iniciar sin participantes registrados y/o asistentes.')
                return;
            } else {
                window.location.href = '../views/progress.html';
            }
        });

        document.getElementById('reset-button').addEventListener('click', () => {
            if (participants && participants.length > 0) {
                const confirmReset = confirm('¿Está seguro de que desea eliminar los registros?');
                if (confirmReset) {
                    localStorage.removeItem('participants');
                    alert('Se han eliminado los registros de participantes.');
                    location.reload();
                }
            }
        });
    }

    if (window.location.href.endsWith('updateform.html')) {
        participant = JSON.parse(localStorage.getItem('participant-to-update'));

        document.getElementById('updated-participant-name').value = participant.name;
        document.getElementById('updated-participant-id').value = participant.id;
        document.getElementById('updated-participant-municipality').value = participant.municipality;
        document.getElementById('updated-participant-age').value = participant.age;

        const originalId = participant.id;
    
        document.getElementById('update-form').addEventListener('submit', (event) => {
            event.preventDefault();
            const updatedParticipant = {
                name: document.getElementById('updated-participant-name').value,
                id: document.getElementById('updated-participant-id').value,
                municipality: document.getElementById('updated-participant-municipality').value,
                age: document.getElementById('updated-participant-age').value,
            };
    
            const participants = JSON.parse(localStorage.getItem('participants')) || [];

            if (updatedParticipant.id.startsWith('0')) {
                alert('Error. La cédula de identidad no puede comenzar con 0.');
                document.getElementById('updated-participant-id').focus();
                document.getElementById('updated-participant-id').select();
                return;
            }

            if (updatedParticipant.id != originalId) {
                const idExists = participants.some(participant => participant.id === updatedParticipant.id);
                if (idExists) {
                    console.log("Hola");
                    alert(`Error. La cédula de identidad ${updatedParticipant.id} ya está registrada.`);
                    document.getElementById('updated-participant-id').focus();
                    document.getElementById('updated-participant-id').select();
                    return;
                }
            }
    
            const index = participants.findIndex(p => p.id === participant.id);
            participants[index] = updatedParticipant;
            localStorage.setItem('participants', JSON.stringify(participants));
    
            alert('Participante actualizado exitosamente.');
            localStorage.removeItem('participant-to-update');
            window.location.href = 'participants.html';
        });
    
        document.getElementById('cancel-button').addEventListener('click', () => {
            localStorage.removeItem('participant-to-update');
            window.location.href = 'participants.html';
        });
    }

    if (window.location.href.endsWith('progress.html')) {
        setDefault();
        const modal = document.getElementById('configuration-modal');
        const modalForm = document.getElementById('configuration-form');
        
        modal.style.display = 'block';

        modalForm.addEventListener('submit', (event) => {
            event.preventDefault();
            currentDate = document.getElementById('date-input').value;
            if (document.getElementById('start-hour').value.length > 2 || document.getElementById('start-minute').value.length > 2 || document.getElementById('start-second').value.length > 2) {
                alert('Por favor, ingrese una hora de inicio válida');
                return;
            }
            const startTime = `${document.getElementById('start-hour').value.padStart(2, '0')}:${document.getElementById('start-minute').value.padStart(2, '0')}:${document.getElementById('start-second').value.padStart(2, '0')}`;
            const speed = document.getElementById('speed').value;
            if (!startTime) {
                alert('Por favor, ingrese una hora de inicio válida.');
                return;
            }

            localStorage.setItem('configuration', JSON.stringify({ speed, startTime, date }));
            
            modal.style.display = 'none';

            document.getElementById('date').textContent = `FECHA: ${formatDate(currentDate)}`;
            document.getElementById('start-time').textContent = `HORA DE INICIO: ${startTime}`;
        });

        updateTable();

        document.querySelectorAll('tbody tr').forEach(row => {
            row.style.backgroundColor = 'rgb(255, 255, 255)';
        });

        startButton = document.getElementById('start-button');
        restartButton = document.getElementById('restart-button');

        restartButton.style.display = 'none';

        document.getElementById('start-button').addEventListener('click', () => {
            const configuration = JSON.parse(localStorage.getItem('configuration'));
            if (!configuration) {
                alert('Por favor, configure la velocidad y la hora de inicio antes de comenzar.');
                return;
            }

            startButton.style.display = 'none';
            restartButton.style.display = 'inline-block';

            currentTime = configuration.startTime;
            currentSeconds = timeToSeconds(configuration.startTime);

            startTriathlon(configuration.speed, configuration.startTime);
        });

        document.getElementById('restart-button').addEventListener('click', () => {
            if (restartTriathlon()) {
                location.reload();
            }
        });
    }
});

function setDefault() {
    if (interval) {
        clearInterval(interval);
    }

    const participants = JSON.parse(localStorage.getItem('participants'));
    participants.forEach(participant => {
        participant.progress = {
            walk: { distance: 0.0, time: '00:00:00', start: 'N/A', end: 'N/A' },
            swim: { distance: 0.0, time: '00:00:00', start: 'N/A', end: 'N/A' },
            bike: { distance: 0.0, time: '00:00:00', start: 'N/A', end: 'N/A' },
        };
        participant.totalDistance = 0.0;
        participant.totalTime = '00:00:00';
        participant.finished = false;
        participant.disqualified = false;
    });
    localStorage.setItem('participants', JSON.stringify(participants));

    document.getElementById('start-time').textContent = 'HORA DE INICIO:';
    document.getElementById('end-time').textContent = 'HORA DE FINALIZACIÓN:';

    updateTable();
}

function startTriathlon(speed, startTime) {
    const participants = JSON.parse(localStorage.getItem('participants'));
    participants.forEach(participant => {
        participant.progress.walk.start = startTime;
    });
    localStorage.setItem('participants', JSON.stringify(participants));
    
    interval = setInterval(() => {
        updateProgress();
        updateTable();
        validateEnd();
    }, 1000/speed);
}

function restartTriathlon() {
    const confirmRestart = confirm('¿Está seguro de que desea reiniciar el triatlón? Esto reiniciará el progreso de todos los participantes.');
    if (confirmRestart) {
        setDefault();
        alert('El triatlón ha sido reiniciado.');
        return true;
    }
    return false;
}

function updateProgress() {
    const participants = JSON.parse(localStorage.getItem('participants'));
    currentTime = incrementTime(currentTime);
    participants.forEach(participant => {
        if (!participant.disqualified && !participant.finished) {
            if (participant.progress.walk.distance < 10000) {
                updateData(participant, 'walk', 10000, 1.94);
            } else if (participant.progress.swim.distance < 10000) {
                updateData(participant, 'swim', 10000, 1.72);
            } else if (participant.progress.bike.distance < 30000) {
                updateData(participant, 'bike', 30000, 12.5);
            }
        }
    });
    localStorage.setItem('participants', JSON.stringify(participants));
}

function updateData(participant, activity, maxDistance, randomFactor) {    
    if (participant.progress[activity].start == 'N/A') {
        if (activity == 'swim') {
            participant.progress['swim'].start = participant.progress['walk'].end;
        } else if (activity == 'bike') {
            participant.progress['bike'].start = participant.progress['swim'].end;
        }
    }

    const startTime = participant.progress[activity].start;
    const startSeconds = timeToSeconds(startTime);
    const seconds = currentSeconds - startSeconds;
    participant.progress[activity].time = formatTime(seconds);

    participant.totalTime = calculateTotalTime(participant.progress);

    const distance = Math.random() * randomFactor;
    participant.progress[activity].distance += distance;

    if (participant.progress[activity].distance >= maxDistance) {
        participant.totalDistance -= (participant.progress[activity].distance - maxDistance);
        participant.progress[activity].distance = maxDistance;
        participant.progress[activity].end = currentTime;
        if (activity === 'bike') {
            participant.finished = true;
        }
    }
    
    participant.totalDistance += distance;

    // En este caso, si es 1, aumentan considerablemente las probabilidades de descalificación.
    if (distance < 0.00001) {
        participant.disqualified = true;
    }
}

function formatDistance(distance) {
    if (distance >= 1000) {
        return `${(distance / 1000).toFixed(2)} Km`;
    }
    return `${distance.toFixed(2)} m`;
}

function incrementTime(time) {
    currentSeconds += 1;
    if (time == '00:00:00' && currentSeconds > 1) {
        incrementDate();
    }
    let totalSeconds = timeToSeconds(time) + 1;
    return formatTime(totalSeconds);
}

function timeToSeconds(time) {
    const [hrs, mins, secs] = time.split(':').map(Number);
    return (hrs * 3600) + (mins * 60) + secs;
}

function formatTime(seconds) {
    if (seconds >= 86400) {
        seconds -= 86400;
    }

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function calculateTotalTime(progress) {
    let totalSeconds = 0;

    ['walk', 'swim', 'bike'].forEach(activity => {
        const timeParts = progress[activity].time.split(':').map(Number);
        totalSeconds += timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
    });

    return formatTime(totalSeconds);
}

function formatDate(date) {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
}

function incrementDate() {
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate = currentDate.toISOString().split('T')[0];
    document.getElementById('date').textContent = `${document.getElementById('date').textContent} - ${formatDate(currentDate)}`;
}

function updateTable() {
    const participants = JSON.parse(localStorage.getItem('participants'));

    participants.sort((a, b) => {
        if (a.assistance !== b.assistance) {
            return (a.assistance === true) ? -1 : 1;
        }
        if (a.disqualified === b.disqualified) {
            if (a.disqualified) {
                return b.totalDistance - a.totalDistance;
            } else {
                const aSpeed = a.totalDistance / (timeToSeconds(a.totalTime) || 1); 
                const bSpeed = b.totalDistance / (timeToSeconds(b.totalTime) || 1);
                return bSpeed - aSpeed;
            }
        }
        return a.disqualified - b.disqualified;
    });

    const tableBody = document.getElementById('progress-table-body');
    tableBody.innerHTML = '';
    participants.forEach((participant, index) => {
        if (participant.assistance) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${participant.id}</td>
                <td>${participant.name}</td>
                <td>${participant.municipality}</td>
                <td>${participant.age}</td>
                <td>${participant.progress.walk.start}</td>
                <td>${participant.progress.walk.end}</td>
                <td>${formatDistance(participant.progress.walk.distance)}</td>
                <td>${participant.progress.walk.time}</td>
                <td>${participant.progress.swim.start}</td>
                <td>${participant.progress.swim.end}</td>
                <td>${formatDistance(participant.progress.swim.distance)}</td>
                <td>${participant.progress.swim.time}</td>
                <td>${participant.progress.bike.start}</td>
                <td>${participant.progress.bike.end}</td>
                <td>${formatDistance(participant.progress.bike.distance)}</td>
                <td>${participant.progress.bike.time}</td>
                <td>${formatDistance(participant.totalDistance)}</td>
                <td>${participant.totalTime}</td>
                <td>${participant.finished ? participant.progress.bike.end : 'N/A'}</td>
                <td>${participant.disqualified ? 'Descalificado' : participant.finished ? 'Finalizado' : 'En progreso'}</td>
            `;

            if (participant.disqualified) {
                row.style.backgroundColor = 'rgb(255, 99, 71)'; 
            }

            if (participant.finished) {
                if (index === 0) {
                    row.style.backgroundColor = 'gold';
                } else if (index === 1) {
                    row.style.backgroundColor = 'silver';
                } else if (index === 2) {
                    row.style.backgroundColor = '#cd7f32';
                } else {
                    row.style.backgroundColor = '#90EE90';
                }
            }

            tableBody.appendChild(row);
        }
    });
}              

function validateEnd() {
    const participants = JSON.parse(localStorage.getItem('participants'));
    const allFinished = participants.every(participant => participant.finished || participant.disqualified || !participant.assistance);
    if (allFinished) {
        clearInterval(interval);
        document.getElementById('end-time').textContent = `HORA DE FINALIZACIÓN: ${currentTime}`;
    }
}