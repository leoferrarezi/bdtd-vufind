<?php

/**
 * Campos exibidos no registro da BDTD (RecordDataFormatter).
 *
 * PHP version 8
 *
 * @category BDTD
 * @package  RecordDataFormatter
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     https://github.com/leoferrarezi/bdtd-vufind
 */

namespace Bdtd\RecordDataFormatter\Specs;

use VuFind\View\Helper\Root\RecordDataFormatter\SpecBuilder;

/**
 * Substitui o RecordDataFormatterFactory do legado. No VuFind 11 as
 * especificações ficam num plugin escolhido pelo driver
 * (Bdtd\RecordDriver\SolrDefault::getRecordDataFormatterSpecClass()).
 * Ajustes finos (ativar/desativar campos, posição) podem ser feitos sem código
 * em local/config/vufind/RecordDataFormatter/DefaultRecord.ini.
 *
 * @category BDTD
 * @package  RecordDataFormatter
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     https://github.com/leoferrarezi/bdtd-vufind
 */
class Bdtd extends \VuFind\RecordDataFormatter\Specs\DefaultRecord
{
    /**
     * Linha de pessoas (autores, orientadores, banca) com perfil Lattes.
     *
     * @param SpecBuilder $spec       Builder
     * @param string      $key        Chave/rótulo da linha
     * @param string      $method     Método do driver
     * @param string      $type       Tipo de pessoa (primary, advisor…)
     * @param string      $schema     Rótulo schema.org
     * @param callable    $label      Função de rótulo
     * @param array       $dataFields Campos extras exigidos
     *
     * @return void
     */
    protected function addPeopleLine(
        SpecBuilder $spec,
        string $key,
        string $method,
        string $type,
        string $schema,
        callable $label,
        array $dataFields = [['name' => 'profile', 'prefix' => '']]
    ): void {
        $spec->setTemplateLine(
            $key,
            $method,
            'data-authors.phtml',
            [
                'useCache' => true,
                'labelFunction' => $label,
                'context' => [
                    'type' => $type,
                    'schemaLabel' => $schema,
                    'requiredDataFields' => $dataFields,
                ],
            ]
        );
    }

    /**
     * Campos principais do registro.
     *
     * @return array
     */
    protected function getDefaultCoreSpecs(): array
    {
        $spec = new SpecBuilder();
        $roles = [['name' => 'role', 'prefix' => 'CreatorRoles::']];

        $spec->setTemplateLine('Published in', 'getContainerTitle', 'data-containerTitle.phtml');
        $spec->setLine('New Title', 'getNewerTitles', null, ['recordLink' => 'title']);
        $spec->setLine('Previous Title', 'getPreviousTitles', null, ['recordLink' => 'title']);
        $spec->setLine('Defense year', 'getPublicationDates');

        $this->addPeopleLine(
            $spec,
            'Authors',
            'getDeduplicatedAuthors',
            'primary',
            'author',
            fn ($data) => count($data['primary'] ?? []) > 1 ? 'Main Authors' : 'Main Author'
        );
        $this->addPeopleLine(
            $spec,
            'Corporate Authors',
            'getDeduplicatedAuthors',
            'corporate',
            'creator',
            fn ($data) => count($data['corporate'] ?? []) > 1 ? 'Corporate Authors' : 'Corporate Author',
            $roles
        );
        $this->addPeopleLine(
            $spec,
            'Other Authors',
            'getDeduplicatedAuthors',
            'secondary',
            'contributor',
            fn () => 'Other Authors',
            $roles
        );
        $this->addPeopleLine($spec, 'Advisors', 'getContributors', 'advisor', 'contributor', fn () => 'Advisor');
        $this->addPeopleLine($spec, 'Co-advisors', 'getContributors', 'coadvisor', 'contributor', fn () => 'Co-advisor');
        $this->addPeopleLine($spec, 'Referees', 'getContributors', 'referee', 'contributor', fn () => 'Referee');

        $spec->setLine('Format', 'getFormats', 'RecordHelper', ['helperMethod' => 'getFormatList']);
        $spec->setTemplateLine('Access type', 'getAccessType', 'access-level.phtml');
        $spec->setTemplateLine('dARK ID', 'getDarkID', 'dark-id.phtml');
        $spec->setLine('Language', 'getLanguages', null, $this->getLanguageLineSettings());
        $spec->setTemplateLine('Institution', 'getRootPublishers', 'data-publicationDetails.phtml');
        $spec->setTemplateLine('Program', 'getProgramPublishers', 'data-publicationDetails.phtml');
        $spec->setTemplateLine('Department', 'getDepartmentPublishers', 'data-publicationDetails.phtml');
        $spec->setTemplateLine('Country', 'getCountryPublishers', 'data-publicationDetails.phtml');
        $spec->setLine(
            'Edition',
            'getEdition',
            null,
            ['itemPrefix' => '<span property="bookEdition">', 'itemSuffix' => '</span>']
        );
        $spec->setTemplateLine('Series', 'getSeries', 'data-series.phtml');
        $spec->setTemplateLine('Portuguese Subjects', 'getPorSubjects', 'data-allSubjectHeadings.phtml');
        $spec->setTemplateLine('English Subjects', 'getEngSubjects', 'data-allSubjectHeadings.phtml');
        $spec->setTemplateLine('Spanish Subjects', 'getSpaSubjects', 'data-allSubjectHeadings.phtml');
        $spec->setTemplateLine('CNPq Subject', 'getCNPQSubjects', 'data-allSubjectHeadings.phtml');
        $spec->setLine('Abstract', 'getAbstractPor');
        $spec->setLine('English Abstract', 'getAbstractEng');
        $spec->setLine('Spanish Abstract', 'getAbstractSpa');
        $spec->setTemplateLine(
            'child_records',
            'getChildRecordCount',
            'data-childRecords.phtml',
            ['allowZero' => false]
        );
        $spec->setTemplateLine('Access link', true, 'data-onlineAccess.phtml');
        $spec->setTemplateLine('Related Items', 'getAllRecordLinks', 'data-allRecordLinks.phtml');
        // No legado o resumo era inserido à mão no fim da tabela (core.phtml)
        $spec->setLine('Summary', 'getSummary');
        return $spec->getArray();
    }

    /**
     * Campos da aba de descrição.
     *
     * @return array
     */
    protected function getDefaultDescriptionSpecs(): array
    {
        $spec = new SpecBuilder();
        $spec->setLine('Citation', 'getCitation');
        $spec->setLine('Summary', 'getSummary');
        $spec->setLine('Portuguese Abstract', 'getAbstractPor');
        $spec->setLine('English Abstract', 'getAbstractEng');
        $spec->setLine('Spanish Abstract', 'getAbstractSpa');
        return $spec->getArray();
    }
}
