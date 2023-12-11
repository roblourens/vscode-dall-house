const artStyles = [
    'pixel art',
    'oil painting',
    'watercolor painting',
    'abstract painting',
    'digital painting',
    '3d rendering',
    'political cartoon',
    'modern comic book',
    'classic comic book',
    'photo',
    'collage',
    'charcoal sketch',
    'tilt-shift photography',
    'psychedlic art',
    'ukiyo-e',
    'butter sculpture on display',
    'legos',
    '',
];

const feels = [
    'vaporwave',
    // 'post-apocalyptic',
    'sci-fi',
    'steampunk',
    'memphis group',
    'optimistic',
    // 'gloomy',
    'utopian',
    'dieselpunk',
    'afrofuturism',
    'cyberpunk',
    'realistic',
    'hyper-realistic',
    ''
];

export function getArtStyleAndFeelPart(): string {
    const artStyle = artStyles[Math.floor(Math.random() * artStyles.length)];
    const feel = feels[Math.floor(Math.random() * feels.length)];
    if (artStyle) {
        return feel ? `Art style: ${artStyle} with a ${feel} feel.`
            : `Art style: ${artStyle}.`;
    }

    return feel ? `Has a ${feel} feel.` : ``;
}

const cuteArtStyles = [
    'cartoon',
    'comic book',
    'anime',
    'chibi',
    'kawaii',
    'pixel art',
    'oil painting',
    'watercolor painting',
    'digital painting',
    '3d rendering',
    'photo',
    'psychedlic art',
    ''
];

const cuteFeels = [
    'sci-fi',
    'optimistic',
    'utopian',
    'realistic',
    'hyper-realistic',
    'cute',
    ''
];

export function getCuteArtStyleAndFeelPart(): string {
    const artStyle = cuteArtStyles[Math.floor(Math.random() * cuteArtStyles.length)];
    const feel = cuteFeels[Math.floor(Math.random() * feels.length)];
    if (artStyle) {
        return feel ? `Art style: ${artStyle} with a ${feel} feel.`
            : `Art style: ${artStyle}.`;
    }

    return feel ? `Has a ${feel} feel.` : ``;
}