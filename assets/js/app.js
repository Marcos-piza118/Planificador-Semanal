// Inicializar jsPDF
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const addHabitForm = document.getElementById('add-habit-form');
    const habitNameInput = document.getElementById('habit-name');
    const habitTimeInput = document.getElementById('habit-time');
    const habitDescInput = document.getElementById('habit-desc');
    const habitsList = document.getElementById('habits-list');
    const notification = document.getElementById('notification');
    const weekRangeElement = document.getElementById('week-range');
    const downloadBtn = document.getElementById('download-btn');
    const downloadModal = document.getElementById('download-modal');
    const downloadPng = document.getElementById('download-png');
    const downloadPdf = document.getElementById('download-pdf');
    const themeSwitch = document.getElementById('theme-switch');
    
    // Almacenamiento de actividades
    let habits = JSON.parse(localStorage.getItem('weekly_planner_habits')) || [];
    
    // Días de la semana
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    // Inicializar la aplicación
    initApp();
    
    function initApp() {
        // Configurar la fecha y hora actual por defecto
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        habitTimeInput.value = timeString;
        
        // Establecer rango de fechas de la semana
        setWeekDates();
        
        // Cargar el tema guardado
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            themeSwitch.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.body.classList.add('dark-mode');
            themeSwitch.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        // Cargar hábitos
        renderHabits();
        
        // Event listeners
        addHabitForm.addEventListener('submit', addHabit);
        downloadBtn.addEventListener('click', showDownloadModal);
        downloadPng.addEventListener('click', downloadAsPNG);
        downloadPdf.addEventListener('click', downloadAsPDF);
        themeSwitch.addEventListener('click', toggleTheme);
        
        // Cerrar modal al hacer clic fuera
        downloadModal.addEventListener('click', function(e) {
            if (e.target === downloadModal) {
                downloadModal.style.display = 'none';
            }
        });
    }
    
    function toggleTheme() {
        const body = document.body;
        const isLightMode = body.classList.contains('light-mode');
        
        if (isLightMode) {
            // Cambiar a modo oscuro
            body.classList.remove('light-mode');
            themeSwitch.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            // Cambiar a modo claro
            body.classList.add('light-mode');
            themeSwitch.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    }
    
    function setWeekDates() {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 (Domingo) a 6 (Sábado)
        
        // Calcular el lunes de esta semana
        const monday = new Date(today);
        monday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
        
        // Calcular el domingo de esta semana
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        // Formatear y mostrar las fechas
        weekRangeElement.textContent = `Semana del ${monday.getDate()} al ${sunday.getDate()} de ${months[sunday.getMonth()]}, ${sunday.getFullYear()}`;
    }
    
    function addHabit(e) {
        e.preventDefault();
        
        const name = habitNameInput.value.trim();
        const time = habitTimeInput.value;
        const description = habitDescInput.value.trim();
        
        if (!name) {
            showNotification('Por favor ingresa un nombre para la actividad', 'error');
            return;
        }
        
        // Obtener días seleccionados
        const selectedDays = [];
        document.querySelectorAll('.days-selector input[type="checkbox"]:checked').forEach(checkbox => {
            selectedDays.push(parseInt(checkbox.value));
        });
        
        if (selectedDays.length === 0) {
            showNotification('Selecciona al menos un día para la actividad', 'error');
            return;
        }
        
        // Crear nueva actividad
        const newHabit = {
            id: Date.now(),
            name,
            time,
            description,
            days: selectedDays
        };
        
        // Agregar a la lista
        habits.push(newHabit);
        
        // Guardar en localStorage
        saveHabits();
        
        // Actualizar la vista
        renderHabits();
        
        // Mostrar notificación
        showNotification('Actividad agregada correctamente');
        
        // Resetear formulario
        habitNameInput.value = '';
        habitDescInput.value = '';
        habitNameInput.focus();
    }
    
    function deleteHabit(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
            habits = habits.filter(habit => habit.id !== id);
            saveHabits();
            renderHabits();
            showNotification('Actividad eliminada');
        }
    }
    
    function saveHabits() {
        localStorage.setItem('weekly_planner_habits', JSON.stringify(habits));
    }
    
    function renderHabits() {
        // Limpiar las columnas de días
        document.querySelectorAll('.day-column').forEach(column => {
            // Mantener el mensaje de día vacío pero oculto
            const emptyMsg = column.querySelector('.empty-day');
            if (emptyMsg) emptyMsg.style.display = 'block';
            
            // Eliminar todos los hábitos excepto el mensaje vacío
            const habitItems = column.querySelectorAll('.habit-item');
            habitItems.forEach(item => item.remove());
        });
        
        // Agregar hábitos a los días correspondientes
        habits.forEach(habit => {
            habit.days.forEach(day => {
                const dayColumn = document.querySelector(`.day-column[data-day="${day}"]`);
                
                // Ocultar mensaje de día vacío si existe
                const emptyMsg = dayColumn.querySelector('.empty-day');
                if (emptyMsg) emptyMsg.style.display = 'none';
                
                // Crear elemento de hábito
                const habitElement = document.createElement('div');
                habitElement.classList.add('habit-item');
                habitElement.innerHTML = `
                    <div class="habit-time">
                        <i class="far fa-clock"></i> ${formatTime(habit.time)}
                    </div>
                    <div class="habit-name">${habit.name}</div>
                    ${habit.description ? `<div class="habit-desc">${habit.description}</div>` : ''}
                    <div class="habit-actions">
                        <button class="btn-delete" onclick="deleteHabit(${habit.id})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                `;
                
                dayColumn.appendChild(habitElement);
            });
        });
        
        // Ordenar hábitos por hora en cada día
        document.querySelectorAll('.day-column').forEach(column => {
            const habits = Array.from(column.querySelectorAll('.habit-item'));
            
            // Ordenar por hora
            habits.sort((a, b) => {
                const timeA = a.querySelector('.habit-time').textContent;
                const timeB = b.querySelector('.habit-time').textContent;
                return timeA.localeCompare(timeB);
            });
            
            // Eliminar todos los hábitos y agregarlos ordenados
            habits.forEach(habit => habit.remove());
            habits.forEach(habit => column.appendChild(habit));
        });
    }
    
    function formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':');
        return `${hours}:${minutes}`;
    }
    
    function showNotification(message, type = 'success') {
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        notification.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
        
        if (type === 'error') {
            notification.classList.add('error');
        } else {
            notification.classList.remove('error');
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    function showDownloadModal() {
        downloadModal.style.display = 'flex';
    }
    
    function downloadAsPNG() {
        downloadModal.style.display = 'none';
        
        // Ocultar elementos que no deben aparecer en la imagen
        const elementsToHide = document.querySelectorAll('.habit-actions, .habits-form, .controls, .theme-switch');
        elementsToHide.forEach(el => el.style.display = 'none');
        
        html2canvas(document.querySelector('.calendar'), {
            scale: 2,
            backgroundColor: document.body.classList.contains('light-mode') ? '#f8f9fa' : '#121212'
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'planificacion-semanal.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // Restaurar elementos ocultos
            elementsToHide.forEach(el => el.style.display = '');
        });
    }
    
    function downloadAsPDF() {
        downloadModal.style.display = 'none';
        
        // Ocultar elementos que no deben aparecer en el PDF
        const elementsToHide = document.querySelectorAll('.habit-actions, .habits-form, .controls, .theme-switch');
        elementsToHide.forEach(el => el.style.display = 'none');
        
        html2canvas(document.querySelector('.calendar'), {
            scale: 2,
            backgroundColor: document.body.classList.contains('light-mode') ? '#f8f9fa' : '#121212'
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            // Add additional pages if needed
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            pdf.save('planificacion-semanal.pdf');
            
            // Restaurar elementos ocultos
            elementsToHide.forEach(el => el.style.display = '');
            
            showNotification('PDF generado correctamente');
        });
    }
    
    // Hacer la función deleteHabit global para que funcione en los onclick
    window.deleteHabit = deleteHabit;
});