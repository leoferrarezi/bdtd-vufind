<?php

/**
 * Fallback de registros ausentes do Solr via oasisbr-api.
 *
 * PHP version 8
 *
 * @category BDTD
 * @package  Record
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     https://github.com/leoferrarezi/bdtd-vufind
 */

namespace Bdtd\Record\FallbackLoader;

use Laminas\Cache\Storage\StorageInterface;
use Psr\Log\LoggerAwareInterface;
use VuFind\Db\Service\ResourceServiceInterface;
use VuFind\Http\GuzzleService;
use VuFind\Log\LoggerAwareTrait;
use VuFind\Record\RecordIdUpdater;
use VuFind\RecordDriver\PluginManager as RecordDriverManager;
use VuFindSearch\Command\RetrieveCommand;
use VuFindSearch\Service;

use function is_array;

/**
 * Substitui a edição de core que o legado fazia em VuFind\Record\Loader.
 *
 * Quando um ID não existe mais no Solr:
 * 1. tenta o mecanismo padrão do VuFind (campo de IDs antigos, se configurado);
 * 2. pergunta à oasisbr-api se o ID mudou (GET {api}ids/{id} → {"target": "novo-id"})
 *    e carrega o novo ID do Solr;
 * 3. senão, busca o backup do registro removido (GET {api}records/{id} → {"record": {...}})
 *    e monta um driver a partir dele.
 *
 * Falhas da API são registradas no log e tratadas como "não encontrado" —
 * a página nunca quebra por causa da API.
 *
 * Proteções (a rota /Record/{id} é pública e cada ID inexistente chega aqui):
 * - só IDs com formato de ID da BDTD (ex.: UNITAU_dd794c…) são enviados à API;
 * - após uma falha de conexão/timeout, a API fica suspensa por alguns segundos
 *   (marca no cache de objetos do VuFind, compartilhada entre os processos PHP),
 *   para que uma API lenta não prenda um processo PHP por requisição;
 * - a URL da API precisa ser http(s).
 *
 * @category BDTD
 * @package  Record
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     https://github.com/leoferrarezi/bdtd-vufind
 */
class Solr extends \VuFind\Record\FallbackLoader\Solr implements LoggerAwareInterface
{
    use LoggerAwareTrait;

    /**
     * IDs cujo registro veio do backup da API (não devem ter o ID "atualizado").
     *
     * @var array<string, true>
     */
    protected array $backupIds = [];

    /**
     * Formato aceito de ID de registro (prefixo da fonte + hash; sem barras ou espaços).
     *
     * @var string
     */
    public const ID_PATTERN = '/^[A-Za-z0-9][\w.:-]{0,199}$/';

    /**
     * Chave, no cache de objetos, do instante até o qual a API fica suspensa.
     *
     * @var string
     */
    public const SUSPENDED_KEY = 'bdtd_oasisbr_api_suspended_until';

    /**
     * Constructor
     *
     * @param ResourceServiceInterface $resourceService Resource database service
     * @param RecordIdUpdater          $recordIdUpdater Record ID updater
     * @param Service                  $searchService   Search service
     * @param ?string                  $legacyIdField   Campo com IDs antigos (ou null)
     * @param GuzzleService            $httpService     Cliente HTTP do VuFind
     * @param RecordDriverManager      $driverManager   Gerenciador de drivers
     * @param string                   $apiUrl          URL base da oasisbr-api (vazio = desligado)
     * @param float                    $timeout         Timeout das chamadas à API (s)
     * @param ?StorageInterface        $cache           Cache de objetos (suspensão após falha)
     * @param int                      $suspendSeconds  Tempo de suspensão após falha (s)
     */
    public function __construct(
        ResourceServiceInterface $resourceService,
        RecordIdUpdater $recordIdUpdater,
        Service $searchService,
        ?string $legacyIdField,
        protected GuzzleService $httpService,
        protected RecordDriverManager $driverManager,
        protected string $apiUrl = '',
        protected float $timeout = 5.0,
        protected ?StorageInterface $cache = null,
        protected int $suspendSeconds = 60
    ) {
        parent::__construct($resourceService, $recordIdUpdater, $searchService, $legacyIdField);
        if ($this->apiUrl !== '' && !preg_match('~^https?://~i', $this->apiUrl)) {
            $this->apiUrl = ''; // só http(s); qualquer outra coisa desliga o fallback
        }
        if ($this->apiUrl !== '' && !str_ends_with($this->apiUrl, '/')) {
            $this->apiUrl .= '/';
        }
    }

    /**
     * Busca um registro ausente.
     *
     * @param string $id ID que falhou
     *
     * @return iterable
     */
    protected function fetchSingleRecord($id)
    {
        $standard = parent::fetchSingleRecord($id);
        if (
            count($standard) > 0
            || $this->apiUrl === ''
            || !preg_match(self::ID_PATTERN, (string)$id)
            || $this->isApiSuspended()
        ) {
            return $standard;
        }

        $newId = $this->apiGet('ids/' . rawurlencode($id))['target'] ?? null;
        if (is_string($newId) && $newId !== '' && $newId !== $id) {
            $command = new RetrieveCommand($this->source, $newId);
            $moved = $this->searchService->invoke($command)->getResult();
            if (count($moved) > 0) {
                return $moved;
            }
        }

        if ($this->isApiSuspended()) { // a primeira chamada falhou: não tenta a segunda
            return [];
        }
        $backup = $this->apiGet('records/' . rawurlencode($id))['record'] ?? null;
        if (is_array($backup) && $backup) {
            $backup['id'] ??= $id;
            $this->backupIds[$id] = true;
            $driver = $this->driverManager->getSolrRecord($backup);
            $driver->setSourceIdentifiers($this->source);
            $driver->setExtraDetail('bdtd_backup_record', true);
            return [$driver];
        }
        return [];
    }

    /**
     * Registros de backup mantêm o ID original: não atualizar referências no banco.
     *
     * @param \VuFind\RecordDriver\AbstractBase $record     Registro
     * @param string                            $previousId ID original
     *
     * @return void
     */
    protected function updateRecord($record, $previousId)
    {
        if (isset($this->backupIds[$previousId])) {
            return;
        }
        parent::updateRecord($record, $previousId);
    }

    /**
     * GET na oasisbr-api, devolvendo o JSON decodificado (ou [] em qualquer falha).
     *
     * @param string $path Caminho relativo à URL base
     *
     * @return array
     */
    protected function apiGet(string $path): array
    {
        try {
            $response = $this->httpService->get(
                $this->apiUrl . $path,
                [],
                $this->timeout,
                ['Accept' => 'application/json']
            );
            if ($response->getStatusCode() !== 200) {
                return [];
            }
            $data = json_decode((string)$response->getBody(), true);
            return is_array($data) ? $data : [];
        } catch (\Throwable $e) {
            $this->suspendApi();
            $this->logWarning(
                'oasisbr-api indisponível (' . $path . '), suspensa por ' . $this->suspendSeconds
                . 's: ' . $e->getMessage()
            );
            return [];
        }
    }

    /**
     * A API está suspensa por causa de uma falha recente?
     *
     * @return bool
     */
    protected function isApiSuspended(): bool
    {
        try {
            return (int)$this->cache?->getItem(self::SUSPENDED_KEY) > time();
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Suspende as chamadas à API por $suspendSeconds.
     *
     * @return void
     */
    protected function suspendApi(): void
    {
        try {
            $this->cache?->setItem(self::SUSPENDED_KEY, time() + $this->suspendSeconds);
        } catch (\Throwable $e) {
            // sem cache, cada requisição tenta de novo (comportamento anterior)
        }
    }
}
