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
    // 'dieselpunk',
    'afrofuturism',
    'cyberpunk',
    'realistic',
    'hyper-realistic',
    'intense dramatic lighting',
    ''
];

export function getArtStyleAndFeelPart(): string {
    const artStyle = pickRandom(artStyles);
    const feel = pickRandom(feels);
    if (artStyle) {
        return feel ? `Art style: ${artStyle} with a ${feel} feel.`
            : `Art style: ${artStyle}.`;
    }

    return feel ? `Has a ${feel} feel.` : ``;
}

function pickRandom<T>(list: T[]): T {
    return list[Math.floor(Math.random() * list.length)];
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
    const artStyle = pickRandom(cuteArtStyles);
    const feel = pickRandom(cuteFeels);
    if (artStyle) {
        return feel ? `Art style: ${artStyle} with a ${feel} feel.`
            : `Art style: ${artStyle}.`;
    }

    return feel ? `Has a ${feel} feel.` : ``;
}

/* Scenarios */


const part1s = [
    'a banana',
    'a programmer',
    'a hacker',
    'a cat',
    'a dog',
    'a dolphin',
    'a cyclist',
    'a very smart VS Code user'
];

const part2s = [
    'riding a bicycle',
    'eating a sandwich',
    'coding in VS Code',
    'hacking the mainframe',
    'swimming in the ocean',
    'running a marathon',
    'eating sushi',
    'watching a performance of LCD Soundsystem'
];

const part3s = [
    'in a forest',
    'in a city',
    'in a desert',
    'in a futuristic tech company office',
    'in a cubicle',
    'in a coffee shop',
    'while simultaneously coding in VS Code',
];

export function getScenario(): string {
    return `${pickRandom(part1s)} ${pickRandom(part2s)} ${pickRandom(part3s)}.`;
}

const progressMessages = [
    'Drawing',
    'Generating image',
    'Creating art',
    'Painting',
    'Sketching',
    'Rendering',
    'Designing',
    'Illustrating',
    'Creating masterpiece',
    'Dreaming',
    'Imagining',
    'Hallucinating',
    'Making stuff up',
    'Thinking',
];

export function getProgressMessage(): string {
    return `${pickRandom(progressMessages)}\u2026`;
}