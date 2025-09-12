<?php
// Cambiá tu correo por el que quieras recibir los mensajes
$destinatario = "contacto@cuencotech.com";

// Captura de datos del formulario
$email   = $_POST['email'];
$nombre  = isset($_POST['nombre']) ? $_POST['nombre'] : '';
$empresa = isset($_POST['nombre-empresa']) ? $_POST['nombre-empresa'] : '';
$mensaje = isset($_POST['mensaje']) ? $_POST['mensaje'] : '';

// Armar el correo
$asunto = "Nuevo mensaje desde tu web";
$cuerpo = "Recibiste un mensaje desde tu web:\n\n";
$cuerpo .= "Nombre: $nombre\n";
$cuerpo .= "Empresa: $empresa\n";
$cuerpo .= "Email: $email\n\n";
$cuerpo .= "Mensaje:\n$mensaje\n";

// Cabeceras
$cabeceras  = "From: $email\r\n";
$cabeceras .= "Reply-To: $email\r\n";
$cabeceras .= "X-Mailer: PHP/" . phpversion();

// Enviar mail
if (mail($destinatario, $asunto, $cuerpo, $cabeceras)) {
    // Mensaje de éxito en modal o alerta
    echo "<script>alert('Tu mensaje fue enviado con éxito. ¡Gracias!'); window.location.href='index.html';</script>";
} else {
    echo "<script>alert('Hubo un error al enviar el mensaje. Intenta de nuevo.'); window.history.back();</script>";
}
?>
