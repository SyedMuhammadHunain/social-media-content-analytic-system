// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Preset Animated GIFs & Categories

export interface PresetGif {
  id: string;
  label: string;
  category: string;
  tags: string[];
  url: string;
}

export const PRESET_GIFS: PresetGif[] = [
  {
    id: 'gif-celebration',
    label: 'Celebration',
    category: 'Party',
    tags: ['celebrate', 'party', 'confetti', 'cheer', 'yay'],
    url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
  },
  {
    id: 'gif-dance',
    label: 'Dancing',
    category: 'Dance',
    tags: ['dance', 'carlton', 'groove', 'happy', 'fun'],
    url: 'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif',
  },
  {
    id: 'gif-applause',
    label: 'Applause',
    category: 'Clap',
    tags: ['applause', 'clap', 'clapping', 'bravo', 'great'],
    url: 'https://media.giphy.com/media/l3q2XhfQ8oCkm1Ts4/giphy.gif',
  },
  {
    id: 'gif-mindblown',
    label: 'Mind Blown',
    category: 'Mind Blown',
    tags: ['mind blown', 'wow', 'galaxy', 'amazing', 'shock'],
    url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
  },
  {
    id: 'gif-fire',
    label: 'Fire',
    category: 'Fire',
    tags: ['fire', 'lit', 'flame', 'hot', 'elmo'],
    url: 'https://media.giphy.com/media/nrXif9YExO9EI/giphy.gif',
  },
  {
    id: 'gif-shocked',
    label: 'Shocked',
    category: 'Shock',
    tags: ['shocked', 'omg', 'what', 'gasp', 'surprised'],
    url: 'https://media.giphy.com/media/tfUW8mhiFk8NlRezUS/giphy.gif',
  },
  {
    id: 'gif-laughing',
    label: 'Laughing',
    category: 'Laugh',
    tags: ['laugh', 'lol', 'haha', 'funny', 'rofl'],
    url: 'https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif',
  },
  {
    id: 'gif-thumbsup',
    label: 'Thumbs Up',
    category: 'Thumbs Up',
    tags: ['thumbs up', 'good', 'approved', 'yes', 'ok'],
    url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif',
  },
  {
    id: 'gif-cat',
    label: 'Cat Typing',
    category: 'Cat',
    tags: ['cat', 'typing', 'work', 'busy', 'fast'],
    url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
  },
  {
    id: 'gif-nod',
    label: 'Agreement',
    category: 'Agree',
    tags: ['agree', 'nod', 'yes', 'nodding', 'respect'],
    url: 'https://media.giphy.com/media/NEvPzZ8bd1V4Y/giphy.gif',
  },
  {
    id: 'gif-popcorn',
    label: 'Popcorn',
    category: 'Drama',
    tags: ['popcorn', 'drama', 'watching', 'eating', 'tea'],
    url: 'https://media.giphy.com/media/GLbiGvv9qrpny/giphy.gif',
  },
  {
    id: 'gif-confused',
    label: 'Confused',
    category: 'Confused',
    tags: ['confused', 'where', 'lost', 'travolta', 'huh'],
    url: 'https://media.giphy.com/media/g01ZnwAUvutuK8GIQn/giphy.gif',
  },
];

export const GIF_CATEGORIES = ['ALL', 'Party', 'Clap', 'Dance', 'Fire', 'Laugh', 'Mind Blown', 'Cat', 'Thumbs Up'];
