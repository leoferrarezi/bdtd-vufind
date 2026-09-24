<?php

namespace Bdtd\View\Helper\Root;

use VuFind\View\Helper\Root\RecordDataFormatter\SpecBuilder;

class RecordDataFormatterFactory extends \VuFind\View\Helper\Root\RecordDataFormatterFactory
{
    public function getDefaultCoreSpecs()
    {
        //$spec = new RecordDataFormatter\SpecBuilder();
        $spec = new SpecBuilder();

        $spec->setTemplateLine(
            'Published in',
            'getContainerTitle',
            'data-containerTitle.phtml'
        );
        $spec->setLine(
            'New Title',
            'getNewerTitles',
            null,
            ['recordLink' => 'title']
        );

        // Nos dados do registro retirar o campo “nível de acesso”: https://trello.com/c/OybnzERq/37-altera%C3%A7%C3%B5es-gerais-na-p%C3%A1gina-da-bdtd

        // $spec->setTemplateLine(
        //     'Access Level',
        //     'getAccessLevel',
        //     'access-level.phtml'
        // );

        $spec->setLine(
            'Previous Title',
            'getPreviousTitles',
            null,
            ['recordLink' => 'title']
        );

        $spec->setLine(
            //'Publication Date', 'getPublicationDates');
            'Defense year',
            'getPublicationDates'
        );

        $spec->setTemplateLine(
            'Authors',
            'getDeduplicatedAuthors',
            'data-authors.phtml',
            [
                'useCache' => true,
                'labelFunction' => function ($data) {
                    return count($data['primary']) > 1
                        ? 'Main Authors' : 'Main Author';
                },
                'context' => [
                    'type' => 'primary',
                    'schemaLabel' => 'author',
                    'requiredDataFields' => [
                        ['name' => 'profile', 'prefix' => '']
                    ]
                ]
            ]
        );

        $spec->setTemplateLine(
            'Corporate Authors',
            'getDeduplicatedAuthors',
            'data-authors.phtml',
            [
                'useCache' => true,
                'labelFunction' => function ($data) {
                    return count($data['corporate']) > 1
                        ? 'Corporate Authors' : 'Corporate Author';
                },
                'context' => [
                    'type' => 'corporate',
                    'schemaLabel' => 'creator',
                    'requiredDataFields' => [
                        ['name' => 'role', 'prefix' => 'CreatorRoles::']
                    ]
                ]
            ]
        );
        $spec->setTemplateLine(
            'Other Authors',
            'getDeduplicatedAuthors',
            'data-authors.phtml',
            [
                'useCache' => true,
                'context' => [
                    'type' => 'secondary',
                    'schemaLabel' => 'contributor',
                    'requiredDataFields' => [
                        ['name' => 'role', 'prefix' => 'CreatorRoles::']
                    ]
                ],
            ]
        );

        $spec->setTemplateLine(
            'Advisors',
            'getContributors',
            'data-authors.phtml',
            [
                'useCache' => true,
                'labelFunction' => function ($data) {
                    return 'Advisor';
                },
                'context' => [
                    'type' => 'advisor',
                    'schemaLabel' => 'contributor',
                    'requiredDataFields' => [
                        ['name' => 'profile', 'prefix' => '']
                    ]
                ]
            ]
        );

        $spec->setTemplateLine(
            'Co-advisors',
            'getContributors',
            'data-authors.phtml',
            [
                'useCache' => true,
                'labelFunction' => function ($data) {
                    return 'Co-advisor';
                },
                'context' => [
                    'type' => 'coadvisor',
                    'schemaLabel' => 'contributor',
                    'requiredDataFields' => [
                        ['name' => 'profile', 'prefix' => '']
                    ]
                ]
            ]
        );

        $spec->setTemplateLine(
            'Referees',
            'getContributors',
            'data-authors.phtml',
            [
                'useCache' => true,
                'labelFunction' => function ($data) {
                    return 'Referee';
                },
                'context' => [
                    'type' => 'referee',
                    'schemaLabel' => 'contributor',
                    'requiredDataFields' => [
                        ['name' => 'profile', 'prefix' => '']
                    ]
                ]
            ]
        );


        $spec->setLine(
            'Format',
            'getFormats',
            'RecordHelper',
            ['helperMethod' => 'getFormatList']
        );

        $spec->setTemplateLine('Access type', 'getAccessType',  'access-level.phtml');

        $spec->setTemplateLine('dARK ID', 'getDarkID', 'dark-id.phtml');

        $spec->setLine('Language', 'getLanguages');

        $spec->setTemplateLine(
            //'Published', 'getRootPublishers', 'data-publicationDetails.phtml'
            'Institution',
            'getRootPublishers',
            'data-publicationDetails.phtml'
        );

        $spec->setTemplateLine(
            'Program',
            'getProgramPublishers',
            'data-publicationDetails.phtml'
        );

        $spec->setTemplateLine(
            'Department',
            'getDepartmentPublishers',
            'data-publicationDetails.phtml'
        );

        // $spec->setTemplateLine(
        // 'Área de conhecimento', 'getKnowledgeareaPublishers', 'data-publicationDetails.phtml'
        // );

        $spec->setTemplateLine(
            'Country',
            'getCountryPublishers',
            'data-publicationDetails.phtml'
        );

        /* novos campos */
        // campos retirados conforme solicitação: https://trello.com/c/XkTIQyHR/25-retirar-campos-do-formul%C3%A1rio-de-registro
        // $spec->setTemplateLine(
        //     'Program ID',
        //     'getprogramIDPublishers',
        //     'data-publicationDetails.phtml'
        // );

        // $spec->setTemplateLine(
        //     'Área de Avaliação',
        //     'getareaavaliacaoPublishers',
        //     'data-publicationDetails.phtml'
        // );

        // $spec->setTemplateLine(
        //     'Grande Área',
        //     'getgrandeareaPublishers',
        //     'data-publicationDetails.phtml'
        // );

        /* Fim novos campos */

        $spec->setLine(
            'Edition',
            'getEdition',
            null,
            ['prefix' => '<span property="bookEdition">', 'suffix' => '</span>']
        );
        $spec->setTemplateLine('Series', 'getSeries', 'data-series.phtml');

        $spec->setTemplateLine(
            'Portuguese Subjects',
            'getPorSubjects',
            'data-allSubjectHeadings.phtml'
        );

        $spec->setTemplateLine(
            'English Subjects',
            'getEngSubjects',
            'data-allSubjectHeadings.phtml'
        );

        $spec->setTemplateLine(
            'Spanish Subjects',
            'getSpaSubjects',
            'data-allSubjectHeadings.phtml'
        );

        $spec->setTemplateLine(
            'CNPq Subject',
            'getCNPQSubjects',
            'data-allSubjectHeadings.phtml'
        );

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
        $spec->setTemplateLine(
            'Related Items',
            'getAllRecordLinks',
            'data-allRecordLinks.phtml'
        );
        // $spec->setTemplateLine('Tags', true, 'data-tags.phtml');

        return $spec->getArray();
    }


    /**
     * Get default specifications for displaying data in the description tab.
     *
     * @return array
     */
    public function getDefaultDescriptionSpecs()
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
