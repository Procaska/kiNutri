<?php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/vendor/autoload.php";

use source\Core\Router;

$route = $_GET["route"] ?? "/";
$method = $_SERVER["REQUEST_METHOD"];

$router = new Router();
$router->execute($route, $method);