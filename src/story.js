/* =====================================================================
   STORY: edit this file to change the chapters.
   Wording comes from Alo's published sites (aialo.io and 3d.aialo.io).
   Each chapter has 3 to 5 memories (glowing orbs, shown as museum exhibits):
   t = title, meta = placard line, p = text,
   img (optional) = photo in /assets; marquee (optional) = film titles drawn as an original
   cinema-marquee picture; links = [label, url] pairs shown under the placard; art: 'soccer' = an original soccer-ball picture (see src/art.js).
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
      { t: 'Seven hills', meta: 'Kampala · 0.3\u00b0 N', p: 'Kampala is traditionally said to be built on seven hills. Red earth, loud markets, and the family who raised me.', links: [['Kampala', 'https://en.wikipedia.org/wiki/Kampala']] },
      { t: 'Source of the Nile', meta: 'Jinja · Lake Victoria', p: 'The White Nile begins its journey north at Jinja, on Africa\u2019s largest lake. Some journeys start small and go very far.', links: [['Jinja', 'https://en.wikipedia.org/wiki/Jinja,_Uganda'], ['Lake Victoria', 'https://en.wikipedia.org/wiki/Lake_Victoria']] },
      { t: 'The crowned crane', meta: 'National bird', p: 'The grey crowned crane stands on Uganda\u2019s flag and coat of arms. Watch them fly over the hills.', links: [['Grey crowned crane', 'https://en.wikipedia.org/wiki/Grey_crowned_crane'], ['Explore Uganda', 'https://exploreuganda.com/']] },
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
      { t: 'Luwombo', meta: 'Buganda · since 1887', p: 'Meat or chicken steamed for hours in smoked banana leaves. First served to Kabaka Mwanga in 1887, now loved across Uganda.', links: [['Luwombo', 'https://en.wikipedia.org/wiki/Luwombo']] },
      { t: 'Matooke & rolex', meta: 'Home cooking · street food', p: 'Steamed green bananas with a rich stew at home, and the rolex on the street: a chapati rolled with an omelette. A rolex is not a watch.', links: [['Matooke', 'https://en.wikipedia.org/wiki/Matooke'], ['Rolex (food)', 'https://en.wikipedia.org/wiki/Rolex_(food)']] },
      { t: 'Bakisimba', meta: 'Dance of the Baganda', p: 'Drums, gourd rattles and the twelve-log amadinda xylophone while dancers move their hips in a circle and everyone claps along. It began at the royal court of Buganda.', links: [['Bakisimba', 'https://en.wikipedia.org/wiki/Bakisimba'], ['Amadinda', 'https://en.wikipedia.org/wiki/Amadinda']] },
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
      { t: 'Mary Washington', meta: 'B.S. Data Science · 2022\u20132026', p: 'Arrived at the University of Mary Washington to learn how to make numbers tell the truth.', img: 'assets/photos/bell-tower.jpg', links: [['University of Mary Washington', 'https://www.umw.edu/']] },
      { t: 'A river town', meta: 'Fredericksburg · Est. 1728', p: 'Founded on the Rappahannock River, halfway between Washington and Richmond. Brick storefronts, caf\u00e9s, river views. Home.', links: [['Fredericksburg', 'https://en.wikipedia.org/wiki/Fredericksburg,_Virginia']] },
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
      { t: 'Habitat for Humanity', meta: '4 builds · 3 states · 12 homes', p: 'Every spring break since 2023: four builds, three states, twelve homes. Team Lead of a 7-person crew in 2026.', img: 'assets/photos/habitat-smile.jpg', links: [['Habitat for Humanity', 'https://www.habitat.org/']] },
      { t: 'Resident Assistant', meta: 'UMW · 2023\u20132026', p: 'Three and a half years building an inclusive community for 30+ residents.' },
      { t: 'Includer', meta: 'CliftonStrengths · Top 5', p: 'Vice President of the African Student Union. I notice who is left out and make the effort to bring them in.', img: 'assets/photos/habitat-hug.jpg', links: [['CliftonStrengths', 'https://www.gallup.com/cliftonstrengths/']] },
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
      { t: 'Navy Federal', meta: 'Summer 2025 · Vienna, VA', p: 'Databricks and Power BI: how Active Duty members’ spending changes during PCS moves.', img: 'assets/photos/navy-federal.jpg', links: [['Navy Federal Credit Union', 'https://www.navyfederal.org/']] },
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
      { t: 'ProofMode', meta: 'FastAPI · Next.js · PostgreSQL', p: 'How do you prove you wrote something yourself? 2nd place, UMW Eagle Egg Pitch. Now a live product.', img: 'assets/proofmode.jpg', links: [['ProofMode app', 'https://app.proofmode.co'], ['Code on GitHub', 'https://github.com/akabonge/proofmode']] },
      { t: 'NCUR 2026', meta: 'Richmond, VA', p: 'An emergency-alerting RAG system with grounded, cited answers, presented at the National Conference on Undergraduate Research.', img: 'assets/photos/ncur.jpg', links: [['Project on GitHub', 'https://github.com/UMW-Projects/CPSC491Spring2026']] },
      { t: 'Five live assistants', meta: 'aialo.io', p: 'Aria, Scout, Luna, Rex and Vera: real AI agents for local businesses, live right now on aialo.io.', links: [['aialo.io', 'https://aialo.io']] },
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
      { t: 'Soccer', meta: 'The beautiful game', p: 'I love soccer, on the field and on the screen.', art: 'soccer', links: [['FIFA', 'https://www.fifa.com/']] },
      { t: 'Spider-Man', meta: 'Favourite hero · Marvel', p: 'My favourite hero: a regular kid from Queens who keeps showing up for his neighbourhood. Marvel fan for life.', marquee: ['Spider-Man', 'Favourite hero'], links: [['Spider-Man at Marvel', 'https://www.marvel.com/characters/spider-man-peter-parker']] },
      { t: 'Movie night', meta: 'Cars · Up · Penguins of Madagascar', p: 'A race car learning to slow down, a house lifted by balloons, and four penguins on a mission. Animated films I can watch again and again.', marquee: ['Cars \u00b7 2006', 'Up \u00b7 2009', 'Penguins of Madagascar \u00b7 2014'], links: [['Cars', 'https://en.wikipedia.org/wiki/Cars_(film)'], ['Up', 'https://en.wikipedia.org/wiki/Up_(2009_film)'], ['Penguins of Madagascar', 'https://en.wikipedia.org/wiki/Penguins_of_Madagascar']] },
      { t: 'Action night', meta: 'The Terminator · Mission: Impossible · Men in Black', p: 'Arnold Schwarzenegger as the Terminator, Tom Cruise hanging off anything in Mission: Impossible, and Will Smith in a black suit in Men in Black.', marquee: ['The Terminator \u00b7 1984', 'Mission: Impossible \u00b7 1996', 'Men in Black \u00b7 1997'], links: [['The Terminator', 'https://en.wikipedia.org/wiki/The_Terminator'], ['Mission: Impossible', 'https://en.wikipedia.org/wiki/Mission:_Impossible_(film_series)'], ['Men in Black', 'https://en.wikipedia.org/wiki/Men_in_Black_(1997_film)']] },
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
      { t: 'Billie Jean', meta: 'Michael Jackson · 1983', p: 'My favourite song. Released in January 1983 from Thriller, it spent seven weeks at No. 1 on the Billboard Hot 100.', img: 'assets/photos/leap.jpg', links: [['Billie Jean', 'https://en.wikipedia.org/wiki/Billie_Jean']] },
      { t: 'The King of Pop', meta: '13 Grammy Awards', p: 'Thriller became the best-selling album of all time, and Michael Jackson was inducted into the Rock and Roll Hall of Fame twice.', img: 'assets/photos/hat-tip.jpg', links: [['Michael Jackson', 'https://www.michaeljackson.com/'], ['Thriller', 'https://en.wikipedia.org/wiki/Thriller_(album)']] },
      { t: 'The moonwalk', meta: 'Motown 25 · May 1983', p: 'His first public moonwalk came during Billie Jean on the Motown 25 TV special, watched by about 50 million people.', img: 'assets/photos/sunglasses.jpg', links: [['Motown 25', 'https://en.wikipedia.org/wiki/Motown_25:_Yesterday,_Today,_Forever']] },
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
      { t: 'Catholic', meta: 'Faith', p: 'Hymns, church bells and quiet prayer: part of my life on both sides of the ocean.', links: [['Vatican', 'https://www.vatican.va/']] },
      { t: 'St. Aloysius Gonzaga', meta: 'Feast day · 21 June · portrait, 16th\u201317th c. (public domain)', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Aloysius_Gonzaga_child.jpg', p: 'The saint who shares my name, patron of young people and students. He died in Rome in 1591 after caring for plague victims.', links: [['St. Aloysius Gonzaga', 'https://en.wikipedia.org/wiki/Aloysius_Gonzaga']] },
      { t: 'The Uganda Martyrs', meta: 'Namugongo · 3 June', p: 'St. Charles Lwanga and companions: 22 Catholic martyrs from Uganda, canonized in 1964. Every 3 June, pilgrims gather at Namugongo.', links: [['Uganda Martyrs', 'https://en.wikipedia.org/wiki/Uganda_Martyrs']] },
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
      { t: 'Spain', meta: 'On the list', p: 'Spain is on my list: the streets, the food, the football.', links: [['Spain travel', 'https://www.spain.info/en/']] },
      { t: 'Italy', meta: 'Rome', p: 'Italy, and Rome, where the saint who shares my name lived and studied.', links: [['Italy travel', 'https://www.italia.it/en'], ['Rome', 'https://en.wikipedia.org/wiki/Rome']] },
      { t: 'Across Europe', meta: 'One city at a time', p: 'Then across Europe, one city at a time. These chapters are still unwritten.', links: [['Visit Europe', 'https://visiteurope.com/']] },
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
      { t: 'First-generation graduate', meta: 'May 2026', p: 'B.S. Data Science, University of Mary Washington, May 2026.', img: 'assets/graduation.jpg', links: [['UMW', 'https://www.umw.edu/']] },
      { t: 'Flatter, Inc.', meta: 'Jul 2026 \u2013 present', p: 'Building governed, agentic AI workflows across Microsoft Azure and Azure DevOps.' },
      { t: 'Webale kujja', meta: 'Luganda · \u201cthank you for coming\u201d', p: 'Thank you for coming. If you’d like to talk, find me at aialo.io.', img: 'assets/photos/headshot.jpg', voice: 'assets/voice/webale-kujja.mp3', links: [['aialo.io', 'https://aialo.io'], ['LinkedIn', 'https://www.linkedin.com/in/aloysious-kabonge'], ['GitHub', 'https://github.com/akabonge']] },
    ],
  },
];

export const LINKS = { site: 'https://aialo.io', site3d: 'https://3d.aialo.io', linkedin: 'https://www.linkedin.com/in/aloysious-kabonge', github: 'https://github.com/akabonge' };
