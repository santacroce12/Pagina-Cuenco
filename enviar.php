<?php
// Dirección de correo donde querés recibir los mensajes
$destinatario = "contacto@cuencotech.com";  // <-- CAMBIÁ esto por tu mail

// Capturar los datos del formulario
$email   = $_POST['email'];
$nombre  = isset($_POST['nombre']) ? $_POST['nombre'] : '';
$empresa = isset($_POST['nombre-empresa']) ? $_POST['nombre-empresa'] : '';
$mensaje = isset($_POST['mensaje']) ? $_POST['mensaje'] : '';

// Armar el contenido del correo
$asunto = "Nuevo mensaje desde el formulario de contacto";
$cuerpo = "Te llegó un mensaje desde tu web:\n\n";
$cuerpo .= "Nombre: $nombre\n";
$cuerpo .= "Empresa: $empresa\n";
$cuerpo .= "Email: $email\n\n";
$cuerpo .= "Mensaje:\n$mensaje\n";

// Cabeceras para que aparezca como enviado desde el mail del usuario
$cabeceras  = "From: $email\r\n";
$cabeceras .= "Reply-To: $email\r\n";
$cabeceras .= "X-Mailer: PHP/" . phpversion();

// Enviar el mail
if (mail($destinatario, $asunto, $cuerpo, $cabeceras)) {
    // Redirigir a una página de éxito o mostrar un mensaje
    echo "<script>alert('Tu mensaje fue enviado con éxito. ¡Gracias!'); window.location.href='index.html';</script>";
} else {
    echo "<script>alert('Hubo un error al enviar el mensaje. Intenta de nuevo.'); window.history.back();</script>";
}
?>
