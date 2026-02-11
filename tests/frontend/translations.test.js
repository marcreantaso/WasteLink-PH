import translations from '../../src/i18n/translations';

describe('Translations', () => {
    const requiredKeys = [
        'appName', 'home', 'scan', 'marketplace', 'earnings', 'health',
        'profile', 'save', 'cancel', 'confirm', 'back', 'next', 'done',
        'offline', 'syncing', 'welcome', 'greeting', 'logPickup',
        'materialType', 'weight', 'acceptBid', 'rejectBid', 'logout',
    ];

    test('English translations exist for all required keys', () => {
        requiredKeys.forEach((key) => {
            expect(translations.en[key]).toBeDefined();
            expect(translations.en[key]).not.toBe('');
        });
    });

    test('Tagalog translations exist for all required keys', () => {
        requiredKeys.forEach((key) => {
            expect(translations.tl[key]).toBeDefined();
            expect(translations.tl[key]).not.toBe('');
        });
    });

    test('Both languages have the same keys', () => {
        const enKeys = Object.keys(translations.en).sort();
        const tlKeys = Object.keys(translations.tl).sort();
        expect(enKeys).toEqual(tlKeys);
    });
});
