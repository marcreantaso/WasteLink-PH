import { classifyImage, LABELS, PRICES_PER_KG } from '../../src/services/ai';

describe('AI Service', () => {
    test('classifyImage returns valid result structure', async () => {
        const result = await classifyImage('test://image.jpg');

        expect(result).toBeDefined();
        expect(result.materialType).toBeDefined();
        expect(LABELS).toContain(result.materialType);
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(100);
        expect(result.estimatedWeight).toBeGreaterThan(0);
        expect(result.estimatedPrice).toBeGreaterThan(0);
        expect(result.timestamp).toBeDefined();
    });

    test('classifyImage returns all predictions', async () => {
        const result = await classifyImage('test://image.jpg');

        expect(result.allPredictions).toHaveLength(LABELS.length);
        result.allPredictions.forEach((pred) => {
            expect(LABELS).toContain(pred.label);
            expect(pred.probability).toBeGreaterThanOrEqual(0);
        });
    });

    test('PRICES_PER_KG has all material types', () => {
        LABELS.forEach((label) => {
            expect(PRICES_PER_KG[label]).toBeDefined();
            expect(PRICES_PER_KG[label]).toBeGreaterThan(0);
        });
    });

    test('LABELS contains all 6 material types', () => {
        expect(LABELS).toEqual(['PET', 'HDPE', 'METAL', 'PAPER', 'ORGANIC', 'OTHER']);
    });
});
