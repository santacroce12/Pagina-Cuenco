$(document).ready(function() {
    // Navbar scroll effect
    $(window).scroll(function() {
        if ($(window).scrollTop() > 50) {
            $('.navbar').addClass('navbar-scrolled');
        } else {
            $('.navbar').removeClass('navbar-scrolled');
        }
    });
    
    // Smooth scrolling for anchor links
    $('a[href*="#"]').on('click', function(e) {
        // Excluir enlaces que no son para scroll (como los de solución)
        if ($(this).attr('href').startsWith('#') && !$(this).hasClass('no-scroll')) {
            e.preventDefault();
            
            $('html, body').animate(
                {
                    scrollTop: $($(this).attr('href')).offset().top - 70,
                },
                500,
                'linear'
            );
        }
    });
    
    // Animation on scroll - Usando Intersection Observer (más eficiente)
    function initScrollAnimations() {
        // Verificar si el navegador soporta Intersection Observer
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        // Agregar clase de animación cuando el elemento es visible
                        entry.target.classList.add('animate');
                    }
                    // Nota: NO removemos la clase cuando el elemento sale del viewport
                    // Esto asegura que la animación solo se ejecute una vez
                });
            }, { 
                threshold: 0.1,
                rootMargin: '0px 0px -10% 0px' // Activar cuando el 10% del elemento está visible
            });
            
            // Observar todos los elementos que queremos animar
            document.querySelectorAll('.about-card, .solution-card, .market-item, .partner-item').forEach(function(element) {
                observer.observe(element);
            });
        } else {
            // Fallback para navegadores antiguos
            function animateElements() {
                $('.about-card, .solution-card, .market-item, .partner-item').each(function() {
                    var position = $(this).offset().top;
                    var scroll = $(window).scrollTop();
                    var windowHeight = $(window).height();
                    
                    if (scroll + windowHeight - 100 > position && !$(this).hasClass('animate')) {
                        $(this).addClass('animate');
                    }
                });
            }
            
            $(window).scroll(animateElements);
            animateElements();
        }
    }
    
    // Inicializar animaciones
    initScrollAnimations();
    
    // Redirección para soluciones
    $('.solution-card, .solution-link, .explore-btn').on('click', function(e) {
        e.stopPropagation();
        const solutionCard = $(this).closest('.solution-card');
        const solution = solutionCard.data('solution');
        
        // URLs de redirección para cada solución
        const solutionUrls = {
            'iot': 'soluciones/IoSmartCity.html',
            'movilidad': 'soluciones/movilidadYseguridad.html',
            'comunicaciones': 'soluciones/comunicacionesYconectividad.html',
            'ciberseguridad': 'soluciones/ciberseguridad.html'
        };
        
        // Redirigir a la página correspondiente
        if (solutionUrls[solution]) {
            window.location.href = solutionUrls[solution];
        }
    });
    
    // Prevenir que los enlaces de soluciones en el footer hagan scroll
    $('.footer-links a[data-solution]').on('click', function(e) {
        e.preventDefault();
        const solution = $(this).data('solution');
        
        // URLs de redirección para cada solución
        const solutionUrls = {
            'iot': 'soluciones/IoSmartCity.html',
            'movilidad': 'soluciones/movilidadYseguridad.html',
            'comunicaciones': 'soluciones/comunicacionesYconectividad.html',
            'ciberseguridad': 'soluciones/ciberseguridad.html'
        };
        
        // Redirigir a la página correspondiente
        if (solutionUrls[solution]) {
            window.location.href = solutionUrls[solution];
        }
    });
    
    // Agregar atributos data-solution a los enlaces del footer
    $('.footer-links:eq(1) a:eq(0)').attr('data-solution', 'iot');
    $('.footer-links:eq(1) a:eq(1)').attr('data-solution', 'movilidad');
    $('.footer-links:eq(1) a:eq(2)').attr('data-solution', 'comunicaciones');
    $('.footer-links:eq(1) a:eq(3)').attr('data-solution', 'ciberseguridad');

    //Redirects
    $(document).ready(function() {
    // URLs de los partners (ajusta según tus necesidades)
    const partnerUrls = {
        'Cespcolor.png': 'https://www.cesp.com.ar',
        'ccontrol.png': 'https://www.ccontrol.com',
        'dexcolor.webp': 'https://www.dexmanager.com/',
        'hanwa.png': 'https://www.hanwha-security.com',
        'net.png': 'https://www.net.com.ar',
        'orbit.png': 'https://www.orbit.com.ar',
        'rlink.png': 'https://www.r-link.com'
    };
    
    // Agregar enlaces a los partners
    $(document).ready(function() {
    // URLs de los partners (basado en los nombres de archivo actualizados)
    const partnerUrls = {
        'Cespcolor.png': 'https://www.cespi.unlp.edu.ar/',
        'ccontrol.png': 'https://www.c-control.com/es/',
        'dexcolor.webp': 'https://www.dexmanager.com/',
        'hanwavisioncolor.jpg': 'https://hanwhavisionlatam.com/',
        'net2color.webp': 'https://www.net2phone.com/es-ar/',
        'orbith-logo-blanco-1-1.png': 'https://www.orbith.com/ar/',
        'Rlinkcolor.jpg': 'http://www.rlink.com.ar/'
    };
    
    // Agregar enlaces a los partners
    $('.partner-item').each(function() {
        const img = $(this).find('img');
        const src = img.attr('src');
        
        // Extraer el nombre del archivo de la ruta
        const filename = src.split('/').pop();
        
        if (partnerUrls[filename]) {
            // Crear el enlace
            const link = $('<a>', {
                href: partnerUrls[filename],
                target: '_blank',
                rel: 'noopener noreferrer',
                css: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%'
                }
            });
            
            // Mover la imagen dentro del enlace
            link.append(img.clone());
            
            // Reemplazar el contenido del partner-item con el enlace
            $(this).html(link);
        }
    });
    
    // Asegurar que los estilos se mantengan
    $('.partner-item a').hover(function() {
        $(this).find('img').css('transform', 'scale(1.05)');
    }, function() {
        $(this).find('img').css('transform', 'scale(1)');
    });
});
});
 
});