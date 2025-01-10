// @/lib/personas/utils/modelFactory.js

import { defaultCapabilities, defaultAllowed, visionAllowed, providerDefaults } from '../defaults';

export const createModelConfig = (config) => {
    const providerConfig = providerDefaults[config.provider];

    return {
        type: 'text',
        showOnModelSelection: true,
        isPro: config.isPro ?? false,
        isNew: config.isNew ?? false,
        speed: config.speed ?? 'Fast',
        price_group: config.price_group ?? "fair",
        rating: config.rating ?? 4.5,
        ...providerConfig,
        ...config,
        capabilities: {
            ...defaultCapabilities,
            ...config.capabilities,
        },
        allowed: config.hasVision ? visionAllowed : {
            ...defaultAllowed,
            ...config.allowed,
        },
        metadata: {
            usageLimit: config.usageLimit ?? 5000,
            createdAt: config.createdAt ?? '2024-01-01',
            updatedAt: config.updatedAt ?? '2024-01-01',
            apiEndpoint: config.apiEndpoint,
            ...config.metadata,
        },
        features: {
            suitableFor: config.features?.suitableFor ?? ['Data Analysis', 'General Queries'],
            bestFor: config.features?.bestFor ?? ['Interactive Assistance', 'General Tasks'],
            specificFeatures: config.features?.specificFeatures ?? ['Customization'],
        },
    };
};