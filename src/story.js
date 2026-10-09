/* =====================================================================
   STORY: edit this file to change the chapters.
   Wording comes from Alo's published sites (aialo.io and 3d.aialo.io).
   Each chapter has 3 to 5 memories (glowing orbs, shown as museum exhibits):
   t = title, meta = placard line, p = text,
   img (optional) = photo in /assets shown on the memory card.
   music = live score style (amadinda, baganda, guitar, piano, hymn, bells, groove; see src/music.js).
   scene = the chapter's world (cranes, dance, river, houses, doors, network, pitch, stage, cathedral, journey, dawn).
   Colors are hex numbers: sky [top, horizon], ground, accent, sun.
   ===================================================================== */
export const STORY = [
  {
    name: 'Roots', kicker: 'Chapter 01 · Uganda, the Pearl of Africa',
    title: 'Oli <em>otya?</em>',
    line: 'Every story has a beginning, and mine starts in Uganda.',
    voice: 'assets/voice/oli-otya.mp3',
    caption: 'Oli otya? How are you?',
    sky: [0x1a0f2e, 0x7a3b2a], ground: 0xc4552d, accent: 0xf2b84b, sun: 0xffb45c,
    music: 'amadinda',
    scene: 'cranes',
    memories: [
      { t: 'Seven hills', meta: 'Kampala · 0.3\u00b0 N', p: 'Kampala is traditionally said to be built on seven hills. Red earth, loud markets, and the family who raised me.' },
      { t: 'Source of the Nile', meta: 'Jinja · Lake Victoria', p: 'The White Nile begins its journey north at Jinja, on Africa\u2019s largest lake. Some journeys start small and go very far.' },
      { t: 'The crowned crane', meta: 'National bird', p: 'The grey crowned crane stands on Uganda\u2019s flag and coat of arms. Watch them fly over the hills.' },
    ],
  },
  {
    name: 'A Taste of Home', kicker: 'Chapter 02 · Buganda',
    title: 'A taste of <em>home</em>',
    line: 'Food, drums and dance: the heartbeat of Buganda.',
    sky: [0x1a0a06, 0x5a2410], ground: 0xffa040, accent: 0xffc24d, sun: 0xffd28a,
    music: 'baganda',
    scene: 'dance',
    memories: [
      { t: 'Luwombo', meta: 'Buganda · since 1887', p: 'Meat or chicken steamed for hours in smoked banana leaves. First served to Kabaka Mwanga in 1887, now loved across Uganda.' },
      { t: 'Matooke & rolex', meta: 'Home cooking · street food', p: 'Steamed green bananas with a rich stew at home, and the rolex on the street: a chapati rolled with an omelette. A rolex is not a watch.' },
      { t: 'Bakisimba', meta: 'Dance of the Baganda', p: 'Drums, gourd rattles and the twelve-log amadinda xylophone while dancers move their hips in a circle and everyone claps along. It began at the royal court of Buganda.' },
    ],
  },
  {
    name: 'The Crossing', kicker: 'Chapter 03 · 2022 · Fredericksburg, Virginia',
    title: 'Twenty-three <em>hours</em>',
    line: 'Twenty-three hours later, Fredericksburg became home.',
    voice: 'assets/voice/tour-2.mp3',
    caption: 'Every story has a beginning, and mine starts in Uganda. I got on a plane with a suitcase full of hope and dreams, and twenty-three hours later, Fredericksburg became home.',
    sky: [0x07142b, 0x1d4a6b], ground: 0x2f8f9d, accent: 0x7fd1ff, sun: 0xbfe6ff,
    music: 'guitar',
    scene: 'river',
    memories: [
      { t: 'A suitcase of hope', meta: '2022 · 23 hours in the air', p: 'I got on a plane with a suitcase full of hope and dreams. Twenty-three hours later, a new life began.' },
      { t: 'Mary Washington', meta: 'B.S. Data Science · 2022\u20132026', p: 'Arrived at the University of Mary Washington to learn how to make numbers tell the truth.', img: 'assets/photos/bell-tower.jpg' },
      { t: 'A river town', meta: 'Fredericksburg · Est. 1728', p: 'Founded on the Rappahannock River, halfway between Washington and Richmond. Brick storefronts, caf\u00e9s, river views. Home.' },
    ],
  },
  {
    name: 'Hands That Build', kicker: 'Chapter 04 · Community',
    title: 'One home at a <em>time</em>',
    line: 'The least I can do is hold the door open for the next person.',
    voice: 'assets/voice/tour-7.mp3',
    caption: 'This part is so close to my heart. So many people have opened doors for me in ways I couldn\u2019t imagine. Now I try to do the same, one home at a time, with Habitat for Humanity.',
    sky: [0x1b1a0c, 0x6b5a1f], ground: 0x6fae5a, accent: 0xffd27a, sun: 0xfff0b8,
    music: 'piano',
    scene: 'houses',
    memories: [
      { t: 'Habitat for Humanity', meta: '4 builds · 3 states · 12 homes', p: 'Every spring break since 2023: four builds, three states, twelve homes. Team Lead of a 7-person crew in 2026.', img: 'assets/photos/habitat-smile.jpg' },
      { t: 'Resident Assistant', meta: 'UMW · 2023\u20132026', p: 'Three and a half years building an inclusive community for 30+ residents.' },
      { t: 'Includer', meta: 'CliftonStrengths · Top 5', p: 'Vice President of the African Student Union. I notice who is left out and make the effort to bring them in.', img: 'assets/photos/habitat-hug.jpg' },
    ],
  },
  {
    name: 'Open Doors', kicker: 'Chapter 05 · 2025',
    title: 'They took a <em>chance</em>',
    line: 'Along the way, a few places took a chance on me.',
    sky: [0x0d1622, 0x2c4a3e], ground: 0x4fbf8f, accent: 0x9ff0c6, sun: 0xd9fff0,
    music: 'guitar',
    scene: 'doors',
    memories: [
      { t: 'banduri', meta: 'Jan\u2013Apr 2025 · Healthcare AI', p: 'Led 30+ customer discovery interviews for Jade Rabbit, an AI-driven healthcare product.' },
      { t: 'Navy Federal', meta: 'Summer 2025 · Vienna, VA', p: 'Databricks and Power BI: how Active Duty members’ spending changes during PCS moves.', img: 'assets/photos/navy-federal.jpg' },
      { t: 'SyncData.ai', meta: 'Dec 2025\u2013Apr 2026', p: 'LLM evaluation and compliance automation: deterministic evidence, auditable AI.' },
    ],
  },
  {
    name: 'The Builder', kicker: 'Chapter 06 · 2026 · AI',
    title: 'A problem that wouldn’t <em>leave</em>',
    line: 'Some of my favorite work started with a problem that just wouldn’t leave me alone.',
    voice: 'assets/voice/tour-4.mp3',
    caption: 'Some of my favorite work started with a problem that just wouldn\u2019t leave me alone. ProofMode began with one question: how do you prove you wrote something yourself?',
    sky: [0x0b0620, 0x3a1670], ground: 0x6a4cff, accent: 0xb98cff, sun: 0xe2d0ff,
    music: 'piano',
    scene: 'network',
    memories: [
      { t: 'ProofMode', meta: 'FastAPI · Next.js · PostgreSQL', p: 'How do you prove you wrote something yourself? 2nd place, UMW Eagle Egg Pitch. Now a live product.', img: 'assets/proofmode.jpg' },
      { t: 'NCUR 2026', meta: 'Richmond, VA', p: 'An emergency-alerting RAG system with grounded, cited answers, presented at the National Conference on Undergraduate Research.', img: 'assets/photos/ncur.jpg' },
      { t: 'Five live assistants', meta: 'aialo.io', p: 'Aria, Scout, Luna, Rex and Vera: real AI agents for local businesses, live right now on aialo.io.' },
    ],
  },
  {
    name: 'Off the Clock', kicker: 'Chapter 07 · Just for fun',
    title: 'Off the <em>clock</em>',
    line: 'Life isn\u2019t only work. Here\u2019s what I do for fun.',
    sky: [0x04140c, 0x0f3d24], ground: 0x3fbf5f, accent: 0xc8ff7a, sun: 0xeaffd0,
    music: 'guitar',
    scene: 'pitch',
    memories: [
      { t: 'Soccer', meta: 'The beautiful game', p: 'I love soccer, on the field and on the screen.' },
      { t: 'Spider-Man', meta: 'Favourite hero · Marvel', p: 'My favourite hero: a regular kid from Queens who keeps showing up for his neighbourhood. Marvel fan for life.' },
      { t: 'Movie night', meta: 'Cars · Up · Penguins of Madagascar', p: 'A race car learning to slow down, a house lifted by balloons, and four penguins on a mission. Animated films I can watch again and again.' },
      { t: 'Action night', meta: 'The Terminator · Mission: Impossible · Men in Black', p: 'Arnold Schwarzenegger as the Terminator, Tom Cruise hanging off anything in Mission: Impossible, and Will Smith in a black suit in Men in Black.' },
    ],
  },
  {
    name: 'What Moves Me', kicker: 'Chapter 08 · Music',
    title: 'Snap to the <em>beat</em>',
    line: 'My favourite song is Billie Jean. Snap along.',
    sky: [0x120414, 0x3b0a3f], ground: 0xd94fa0, accent: 0xffd36b, sun: 0xffe9b8,
    music: 'groove',
    scene: 'stage',
    memories: [
      { t: 'Billie Jean', meta: 'Michael Jackson · 1983', p: 'My favourite song. Released in January 1983 from Thriller, it spent seven weeks at No. 1 on the Billboard Hot 100.', img: 'assets/photos/leap.jpg' },
      { t: 'The King of Pop', meta: '13 Grammy Awards', p: 'Thriller became the best-selling album of all time, and Michael Jackson was inducted into the Rock and Roll Hall of Fame twice.', img: 'assets/photos/hat-tip.jpg' },
      { t: 'The moonwalk', meta: 'Motown 25 · May 1983', p: 'His first public moonwalk came during Billie Jean on the Motown 25 TV special, watched by about 50 million people.', img: 'assets/photos/sunglasses.jpg' },
    ],
  },
  {
    name: 'Faith', kicker: 'Chapter 09 · Faith',
    title: 'Light through <em>glass</em>',
    line: 'I\u2019m Catholic. Faith goes with me, from Kampala to Fredericksburg.',
    sky: [0x070b24, 0x2a1a4a], ground: 0x8f7bd8, accent: 0xffcf6b, sun: 0xfff2cc,
    music: 'hymn',
    scene: 'cathedral',
    memories: [
      { t: 'Catholic', meta: 'Faith', p: 'Hymns, church bells and quiet prayer: part of my life on both sides of the ocean.' },
      { t: 'St. Aloysius Gonzaga', meta: 'Feast day · 21 June', p: 'The saint who shares my name, patron of young people and students. He died in Rome in 1591 after caring for plague victims.' },
      { t: 'The Uganda Martyrs', meta: 'Namugongo · 3 June', p: 'St. Charles Lwanga and companions: 22 Catholic martyrs from Uganda, canonized in 1964. Every 3 June, pilgrims gather at Namugongo.' },
    ],
  },
  {
    name: 'The Road Ahead', kicker: 'Chapter 10 · Someday',
    title: 'Where <em>next?</em>',
    line: 'Places I want to see with my own eyes.',
    sky: [0x0a1730, 0x3d6d9e], ground: 0xe07a4f, accent: 0x7fd8ff, sun: 0xffe0a8,
    music: 'guitar',
    scene: 'journey',
    memories: [
      { t: 'Spain', meta: 'On the list', p: 'Spain is on my list: the streets, the food, the football.' },
      { t: 'Italy', meta: 'Rome', p: 'Italy, and Rome, where the saint who shares my name lived and studied.' },
      { t: 'Across Europe', meta: 'One city at a time', p: 'Then across Europe, one city at a time. These chapters are still unwritten.' },
    ],
  },
  {
    name: 'One Day at a Time', kicker: 'Chapter 11 · Today',
    title: 'Still <em>learning</em>',
    line: 'Today I’m at Flatter, and I’m still learning something new every single day. Snap to begin again.',
    voice: 'assets/voice/tour-8.mp3',
    caption: 'And that\u2019s me, for now. If you\u2019d like to talk, I\u2019d really love to hear from you. Webale kujja. Thank you for coming.',
    sky: [0x10101a, 0x8a6a4a], ground: 0xe8d3b0, accent: 0xfff1d6, sun: 0xffffff,
    music: 'bells',
    scene: 'dawn',
    memories: [
      { t: 'First-generation graduate', meta: 'May 2026', p: 'B.S. Data Science, University of Mary Washington, May 2026.', img: 'assets/graduation.jpg' },
      { t: 'Flatter, Inc.', meta: 'Jul 2026 \u2013 present', p: 'Building governed, agentic AI workflows across Microsoft Azure and Azure DevOps.' },
      { t: 'Webale kujja', meta: 'Luganda · \u201cthank you for coming\u201d', p: 'Thank you for coming. If you’d like to talk, find me at aialo.io.', img: 'assets/photos/headshot.jpg', voice: 'assets/voice/webale-kujja.mp3' },
    ],
  },
];

export const LINKS = { site: 'https://aialo.io', site3d: 'https://3d.aialo.io', linkedin: 'https://www.linkedin.com/in/aloysious-kabonge', github: 'https://github.com/akabonge' };
