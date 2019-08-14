<?php
$recepient = "leocarrey99@gmail.com";
$sitename = "grass.com.ua";
$pagetitle = "Новая заявка с сайта \"$sitename\"";
if (isset($_POST["name"]) && isset($_POST["phone"]) && isset($_POST["email"])){
    $name = trim($_POST["name"]);
    $phone = trim($_POST["phone"]);
    $email = trim($_POST["email"]);
    $message = "Имя: $name \nТелефон: $phone \nEmail: $email";
    
}

mail($recepient, $pagetitle, $message, "Content-type: text/plain; charset=\"utf-8\"\n From: $recepient");
?>