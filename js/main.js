// Funcionalidad principal del sitio
document.addEventListener('DOMContentLoaded', function() {
    // Navegación suave
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        });
    });
    
    // Cargar el tema guardado
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const themeSwitch = document.getElementById('theme-switch');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeSwitch.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.body.classList.add('dark-mode');
        themeSwitch.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Cambiar tema
    themeSwitch.addEventListener('click', function() {
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
    });
});