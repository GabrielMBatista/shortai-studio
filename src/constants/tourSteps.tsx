import React from 'react';
import { Step } from 'react-joyride';
import { TFunction } from 'i18next';

export const getSettingsTourSteps = (t: TFunction): Step[] => [
    {
        target: 'body',
        content: t('tour.settings.welcome'),
        placement: 'center',
    },
    {
        target: '#geminiKey',
        content: (
            <div>
                {t('tour.settings.gemini')}
                <br />
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline mt-2 block">{t('tour.settings.gemini_link')}</a>
            </div>
        ),
    },
    {
        target: '#elevenLabsKey',
        content: (
            <div>
                {t('tour.settings.elevenlabs')}
                <br />
                <a href="https://elevenlabs.io/app/speech-synthesis" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline mt-2 block">{t('tour.settings.elevenlabs_link')}</a>
            </div>
        ),
    },
    {
        target: 'button[type="submit"]',
        content: t('tour.settings.save'),
    }
];
