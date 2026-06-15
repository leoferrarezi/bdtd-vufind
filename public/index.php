<?php

/**
 * ANTIBOT JS CHALLENGE - OASISBR / IBICT
 * Bloqueia scrapers e bots que não processam JavaScript.
 * Ajustado para permitir chamadas de API (Shiny/R/AJAX).
 */


$cookieName  = 'OasisbrVerify';
$cookieValue = 'verified_human';
$userAgent   = $_SERVER['HTTP_USER_AGENT'] ?? '';
$requestUri  = $_SERVER['REQUEST_URI'] ?? '';

// 1. Definir exceções
$isAllowed = false;

// Lista de bots legítimos e ferramentas de integração (Shiny usa libcurl/R)
$allowedAgents = ['Googlebot', 'Bingbot', 'libcurl', 'RStudio', 'Shiny'];

foreach ($allowedAgents as $agent) {
    if (stripos($userAgent, $agent) !== false) {
        $isAllowed = true;
        break;
    }
}

// Verifica se é uma requisição para a API do VuFind (Ex: /vufind/api/v1/...)
if (strpos($requestUri, '/api/') !== false) {
    $isAllowed = true;
}

// Verifica se é AJAX
if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
    $isAllowed = true;
}

// Verifica se a requisição espera um JSON (comum em APIS)
$headers = getallheaders();
if (isset($headers['Accept']) && strpos($headers['Accept'], 'application/json') !== false) {
    $isAllowed = true;
}

// 2. Iniciar o desafio apenas se necessário
if (!isset($_COOKIE[$cookieName]) && !$isAllowed) {
    ?>
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <title>Verificando conexão | Oasisbr</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding-top: 100px; background: #f8f9fa; color: #333; }
            .container { max-width: 500px; margin: 0 auto; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .loader { border: 4px solid #f3f3f3; border-top: 4px solid #0056b3; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 30px auto; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            h2 { font-size: 1.2rem; margin-bottom: 10px; }
            p { color: #666; font-size: 0.9rem; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Verificando seu navegador...</h2>
            <p>Aguarde um momento enquanto validamos sua conexão com o Oasisbr.</p>
            <div class="loader"></div>
        </div>
        <script>
            (function() {
                var expires = new Date();
                expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000));
                document.cookie = "<?php echo $cookieName; ?>=<?php echo $cookieValue; ?>; expires=" + expires.toUTCString() + "; path=/; SameSite=Lax";
                
                setTimeout(function(){
                    window.location.reload();
                }, 800);
            })();
        </script>
    </body>
    </html>
    <?php
    exit;
}


// 3. Se chegou aqui, o acesso é legítimo. Carrega o VuFind.
// (O restante do código original do index.php continua abaixo)

// If the profiler is enabled, set it up now:
$vufindProfiler = getenv('VUFIND_PROFILER_XHPROF');
if (!empty($vufindProfiler)) {
    if (extension_loaded('tideways_xhprof')) {
        tideways_xhprof_enable();

        // Handle final profiling details, if necessary:
        register_shutdown_function(function () use ($vufindProfiler) {
            $xhprofData = tideways_xhprof_disable();
            $xhprofRunId = uniqid();
            $suffix = 'vufind';
            $dir = ini_get('xhprof.output_dir');
            if (empty($dir)) {
                $dir = sys_get_temp_dir();
            }
            file_put_contents(
                "$dir/$xhprofRunId.$suffix.xhprof", serialize($xhprofData)
            );
            $url = "$vufindProfiler?run=$xhprofRunId&source=$suffix";
            echo "<a href='$url'>Profiler output</a>";
        });
    }
}

// Define path to application directory
defined('APPLICATION_PATH')
    || define(
        'APPLICATION_PATH',
        (getenv('VUFIND_APPLICATION_PATH') ? getenv('VUFIND_APPLICATION_PATH')
            : dirname(__DIR__))
    );

// Define application environment
defined('APPLICATION_ENV')
    || define(
        'APPLICATION_ENV',
        (getenv('VUFIND_ENV') ? getenv('VUFIND_ENV') : 'production')
    );

// Define default search backend identifier
defined('DEFAULT_SEARCH_BACKEND') || define('DEFAULT_SEARCH_BACKEND', 'Solr');

// Define path to local override directory
defined('LOCAL_OVERRIDE_DIR')
    || define(
        'LOCAL_OVERRIDE_DIR',
        (getenv('VUFIND_LOCAL_DIR') ? getenv('VUFIND_LOCAL_DIR') : '')
    );

// Define path to cache directory
defined('LOCAL_CACHE_DIR')
    || define(
        'LOCAL_CACHE_DIR',
        (getenv('VUFIND_CACHE_DIR')
            ? getenv('VUFIND_CACHE_DIR')
            : (strlen(LOCAL_OVERRIDE_DIR) > 0 ? LOCAL_OVERRIDE_DIR . '/cache' : ''))
    );

// Save original working directory in case we need to remember our context, then
// switch to the application directory for convenience:
define('ORIGINAL_WORKING_DIRECTORY', getcwd());
chdir(APPLICATION_PATH);

// Ensure vendor/ is on include_path; some PEAR components may not load correctly
// otherwise (i.e. File_MARC may cause a "Cannot redeclare class" error by pulling
// from the shared PEAR directory instead of the local copy):
$pathParts = [];
$pathParts[] = APPLICATION_PATH . '/vendor';
$pathParts[] = get_include_path();
set_include_path(implode(PATH_SEPARATOR, $pathParts));

// Composer autoloading
if (file_exists('vendor/autoload.php')) {
    $loader = include 'vendor/autoload.php';
}

if (!class_exists('Laminas\Loader\AutoloaderFactory')) {
    throw new RuntimeException('Unable to load Laminas autoloader.');
}

// Run the application!
$app = Laminas\Mvc\Application::init(require 'config/application.config.php');
if (PHP_SAPI === 'cli') {
    return $app->getServiceManager()
        ->get(\VuFindConsole\ConsoleRunner::class)->run();
} else {
    $app->run();
}
