import { buildCuratedCategory, type CuratedFact } from "./_builder";

/* ── Easy (Argent · 1000 ELO) ─────────────────────────────────────── */
const easy: CuratedFact[] = [
  // Records mondiaux (10)
  ["Quel est le plus petit pays du monde ?", "Smallest country in the world?", "Vatican", "Vatican City", ["Monaco", "Saint-Marin", "Liechtenstein"], ["Monaco", "San Marino", "Liechtenstein"]],
  ["Quel est le pays le plus peuplé du monde ?", "Most populous country in the world?", "Inde", "India", ["Chine", "États-Unis", "Indonésie"], ["China", "United States", "Indonesia"]],
  ["Quel est le plus long fleuve du monde ?", "Longest river in the world?", "Nil", "Nile", ["Amazone", "Mississippi", "Yangzi"], ["Amazon", "Mississippi", "Yangtze"]],
  ["Quel est le plus haut sommet du monde ?", "Highest mountain in the world?", "Everest", "Everest", ["K2", "Kangchenjunga", "Lhotse"], ["K2", "Kangchenjunga", "Lhotse"]],
  ["Quel est le plus grand désert du monde ?", "Largest desert in the world?", "Antarctique", "Antarctic", ["Sahara", "Arctique", "Gobi"], ["Sahara", "Arctic", "Gobi"]],
  ["Quelle est la mer la plus salée du monde ?", "Saltiest sea in the world?", "Mer Morte", "Dead Sea", ["Mer Rouge", "Mer Caspienne", "Mer Baltique"], ["Red Sea", "Caspian Sea", "Baltic Sea"]],
  ["Quelle est la chute d'eau la plus haute du monde ?", "Tallest waterfall in the world?", "Salto Angel", "Angel Falls", ["Niagara", "Iguazu", "Victoria"], ["Niagara", "Iguazu", "Victoria"]],
  ["Quel est le plus grand archipel du monde ?", "Largest archipelago in the world?", "Indonésie", "Indonesia", ["Philippines", "Japon", "Polynésie française"], ["Philippines", "Japan", "French Polynesia"]],
  ["Quel est le plus grand pays par superficie ?", "Largest country by area?", "Russie", "Russia", ["Canada", "Chine", "États-Unis"], ["Canada", "China", "United States"]],
  ["Quel est le pays le plus visité au monde ?", "Most visited country in the world?", "France", "France", ["Espagne", "États-Unis", "Italie"], ["Spain", "United States", "Italy"]],
  // Animaux (10)
  ["Quel est l'animal terrestre le plus rapide ?", "Fastest land animal?", "Guépard", "Cheetah", ["Lion", "Antilope", "Lévrier"], ["Lion", "Antelope", "Greyhound"]],
  ["Quel est l'oiseau le plus rapide en piqué ?", "Fastest bird in a dive?", "Faucon pèlerin", "Peregrine falcon", ["Aigle royal", "Albatros", "Condor"], ["Golden eagle", "Albatross", "Condor"]],
  ["Quel est le plus grand mammifère du monde ?", "Largest mammal in the world?", "Baleine bleue", "Blue whale", ["Cachalot", "Éléphant d'Afrique", "Baleine grise"], ["Sperm whale", "African elephant", "Gray whale"]],
  ["Quel mammifère est le seul à voler véritablement ?", "Only mammal that truly flies?", "Chauve-souris", "Bat", ["Écureuil volant", "Pétaure", "Galéopithèque"], ["Flying squirrel", "Sugar glider", "Colugo"]],
  ["Quel mammifère pond des œufs ?", "Which mammal lays eggs?", "Ornithorynque", "Platypus", ["Échidné australien", "Tatou", "Hérisson"], ["Australian echidna", "Armadillo", "Hedgehog"]],
  ["Quel est le plus petit oiseau du monde ?", "Smallest bird in the world?", "Colibri d'Elena", "Bee hummingbird", ["Roitelet", "Mésange", "Moineau"], ["Wren", "Tit", "Sparrow"]],
  ["Combien de cœurs a une pieuvre ?", "How many hearts does an octopus have?", "3", "3", ["1", "2", "4"], ["1", "2", "4"]],
  ["Combien d'estomacs a une vache ?", "How many stomach chambers does a cow have?", "4", "4", ["1", "2", "3"], ["1", "2", "3"]],
  ["Quel animal est célèbre pour sa mémoire ?", "Which animal is famous for its memory?", "Éléphant", "Elephant", ["Dauphin", "Pieuvre", "Corbeau"], ["Dolphin", "Octopus", "Crow"]],
  ["Quel oiseau ne vole pas et vit en Antarctique ?", "Flightless bird that lives in Antarctica?", "Manchot", "Penguin", ["Autruche", "Émeu", "Kiwi"], ["Ostrich", "Emu", "Kiwi"]],
  // Drapeaux (5)
  ["Quel pays a un drapeau avec une feuille d'érable ?", "Country with a maple leaf flag?", "Canada", "Canada", ["États-Unis", "Australie", "Nouvelle-Zélande"], ["United States", "Australia", "New Zealand"]],
  ["Quel pays a un drapeau avec un soleil rouge ?", "Country with a red sun flag?", "Japon", "Japan", ["Chine", "Corée du Sud", "Vietnam"], ["China", "South Korea", "Vietnam"]],
  ["Quel pays a un drapeau avec une étoile de David ?", "Country with a Star of David flag?", "Israël", "Israel", ["Liban", "Jordanie", "Maroc"], ["Lebanon", "Jordan", "Morocco"]],
  ["Quel pays a un drapeau avec un cèdre ?", "Country with a cedar tree on its flag?", "Liban", "Lebanon", ["Maroc", "Algérie", "Tunisie"], ["Morocco", "Algeria", "Tunisia"]],
  ["Quel pays a le drapeau encore en usage le plus ancien ?", "Oldest flag still in use?", "Danemark", "Denmark", ["Royaume-Uni", "Pays-Bas", "Suède"], ["United Kingdom", "Netherlands", "Sweden"]],
  // Mythologie (5)
  ["Qui est le roi des dieux dans la mythologie grecque ?", "King of the gods in Greek myth?", "Zeus", "Zeus", ["Apollon", "Poséidon", "Cronos"], ["Apollo", "Poseidon", "Cronus"]],
  ["Qui est le roi des dieux dans la mythologie romaine ?", "King of the gods in Roman myth?", "Jupiter", "Jupiter", ["Mars", "Saturne", "Neptune"], ["Mars", "Saturn", "Neptune"]],
  ["Qui est le roi des dieux dans la mythologie nordique ?", "King of the gods in Norse myth?", "Odin", "Odin", ["Thor", "Loki", "Tyr"], ["Thor", "Loki", "Tyr"]],
  ["Qui est le dieu grec de la mer ?", "Greek god of the sea?", "Poséidon", "Poseidon", ["Zeus", "Hadès", "Apollon"], ["Zeus", "Hades", "Apollo"]],
  ["Qui est le dieu nordique du tonnerre ?", "Norse god of thunder?", "Thor", "Thor", ["Odin", "Loki", "Heimdall"], ["Odin", "Loki", "Heimdall"]],
  // Cuisine (5)
  ["De quel pays est originaire la pizza ?", "Country of origin of pizza?", "Italie", "Italy", ["France", "Espagne", "Grèce"], ["France", "Spain", "Greece"]],
  ["De quel pays est originaire le sushi ?", "Country of origin of sushi?", "Japon", "Japan", ["Chine", "Corée du Sud", "Vietnam"], ["China", "South Korea", "Vietnam"]],
  ["De quel pays est originaire le champagne ?", "Country of origin of champagne?", "France", "France", ["Italie", "Espagne", "Allemagne"], ["Italy", "Spain", "Germany"]],
  ["De quel pays est originaire le tacos moderne ?", "Country of origin of the modern taco?", "Mexique", "Mexico", ["Espagne", "États-Unis", "Cuba"], ["Spain", "United States", "Cuba"]],
  ["De quel pays est originaire le whisky écossais ?", "Country of origin of Scotch whisky?", "Écosse", "Scotland", ["Irlande", "États-Unis", "Pays de Galles"], ["Ireland", "United States", "Wales"]],
  // Surnoms de villes (5)
  ["Quelle ville est appelée la cité éternelle ?", "Which city is the Eternal City?", "Rome", "Rome", ["Athènes", "Jérusalem", "Istanbul"], ["Athens", "Jerusalem", "Istanbul"]],
  ["Quelle ville est appelée la Big Apple ?", "Which city is the Big Apple?", "New York", "New York", ["Los Angeles", "Boston", "Chicago"], ["Los Angeles", "Boston", "Chicago"]],
  ["Quelle ville est appelée la Cité des Anges ?", "Which city is the City of Angels?", "Los Angeles", "Los Angeles", ["Las Vegas", "Miami", "San Francisco"], ["Las Vegas", "Miami", "San Francisco"]],
  ["Quelle ville est appelée la Ville Lumière ?", "Which city is called the City of Light?", "Paris", "Paris", ["Lyon", "Bruxelles", "Genève"], ["Lyon", "Brussels", "Geneva"]],
  ["Quelle ville chinoise abrite la Cité interdite ?", "Which Chinese city contains the Forbidden City?", "Pékin", "Beijing", ["Shanghai", "Xi'an", "Hong Kong"], ["Shanghai", "Xi'an", "Hong Kong"]],
  // Monuments (5)
  ["Dans quelle ville se trouve la Tour Eiffel ?", "Which city has the Eiffel Tower?", "Paris", "Paris", ["Lyon", "Bordeaux", "Marseille"], ["Lyon", "Bordeaux", "Marseille"]],
  ["Dans quelle ville se trouve la Statue de la Liberté ?", "Which city has the Statue of Liberty?", "New York", "New York", ["Boston", "Washington", "Chicago"], ["Boston", "Washington", "Chicago"]],
  ["Dans quelle ville se trouve Big Ben ?", "Which city has Big Ben?", "Londres", "London", ["Édimbourg", "Manchester", "Dublin"], ["Edinburgh", "Manchester", "Dublin"]],
  ["Dans quel pays se trouve le Taj Mahal ?", "Which country has the Taj Mahal?", "Inde", "India", ["Pakistan", "Bangladesh", "Iran"], ["Pakistan", "Bangladesh", "Iran"]],
  ["Dans quel pays se trouve la Tour de Pise ?", "Which country has the Leaning Tower of Pisa?", "Italie", "Italy", ["France", "Espagne", "Grèce"], ["France", "Spain", "Greece"]],
  // Compléments easy (5)
  ["De quelle couleur est l'herbe en général ?", "What color is grass typically?", "Vert", "Green", ["Bleu", "Rouge", "Jaune"], ["Blue", "Red", "Yellow"]],
  ["Combien y a-t-il de jours dans une semaine ?", "How many days in a week?", "7", "7", ["5", "6", "8"], ["5", "6", "8"]],
  ["Combien y a-t-il de mois dans une année ?", "How many months in a year?", "12", "12", ["10", "11", "13"], ["10", "11", "13"]],
  ["Combien de saisons compte une année ?", "How many seasons in a year?", "4", "4", ["2", "3", "5"], ["2", "3", "5"]],
  ["De quelle couleur est typiquement un bus londonien ?", "What is the typical color of a London bus?", "Rouge", "Red", ["Jaune", "Vert", "Noir"], ["Yellow", "Green", "Black"]],
];

/* ── Medium (Or · 1400 ELO) ───────────────────────────────────────── */
const medium: CuratedFact[] = [
  // Records (10)
  ["Quel est le plus petit océan du monde ?", "Smallest ocean in the world?", "Arctique", "Arctic", ["Atlantique", "Indien", "Austral"], ["Atlantic", "Indian", "Southern"]],
  ["Quelle est la fosse marine la plus profonde ?", "Deepest oceanic trench?", "Mariannes", "Mariana Trench", ["Tonga", "Java", "Kouriles"], ["Tonga", "Java", "Kuril"]],
  ["Quel est le plus grand lac du monde ?", "Largest lake in the world?", "Mer Caspienne", "Caspian Sea", ["Lac Supérieur", "Lac Victoria", "Lac Baïkal"], ["Lake Superior", "Lake Victoria", "Lake Baikal"]],
  ["Quel est le plus haut bâtiment du monde ?", "Tallest building in the world?", "Burj Khalifa", "Burj Khalifa", ["Tour Shanghai", "Tour de Tokyo", "One World Trade Center"], ["Shanghai Tower", "Tokyo Tower", "One World Trade Center"]],
  ["Quel est le plus long pont au monde ?", "Longest bridge in the world?", "Danyang-Kunshan", "Danyang-Kunshan Grand Bridge", ["Akashi Kaikyō", "Golden Gate", "Pont du Bosphore"], ["Akashi Kaikyō", "Golden Gate", "Bosphorus Bridge"]],
  ["Quelle est la plus grande forêt tropicale du monde ?", "Largest rainforest in the world?", "Amazonie", "Amazon", ["Bassin du Congo", "Bornéo", "Nouvelle-Guinée"], ["Congo Basin", "Borneo", "New Guinea"]],
  ["Quel est le plus grand cratère d'impact connu ?", "Largest known impact crater?", "Vredefort", "Vredefort", ["Sudbury", "Chicxulub", "Popigai"], ["Sudbury", "Chicxulub", "Popigai"]],
  ["Quel est le plus long mur du monde ?", "Longest wall in the world?", "Grande Muraille de Chine", "Great Wall of China", ["Mur d'Hadrien", "Limes germain", "Mur de Berlin"], ["Hadrian's Wall", "Germanic Limes", "Berlin Wall"]],
  ["Quelle est la plus longue ligne de métro automatique ?", "Longest fully automated metro line?", "Métro de Singapour", "Singapore MRT", ["Métro de Dubaï", "Métro de Vancouver", "Métro de Copenhague"], ["Dubai Metro", "Vancouver SkyTrain", "Copenhagen Metro"]],
  ["Quel pays compte le plus de pyramides ?", "Country with the most pyramids?", "Soudan", "Sudan", ["Égypte", "Mexique", "Pérou"], ["Egypt", "Mexico", "Peru"]],
  // Animaux (8)
  ["Quel est le plus grand poisson du monde ?", "Largest fish in the world?", "Requin-baleine", "Whale shark", ["Requin pèlerin", "Espadon", "Mola mola"], ["Basking shark", "Swordfish", "Mola mola"]],
  ["Quel est le plus grand reptile du monde ?", "Largest reptile in the world?", "Crocodile marin", "Saltwater crocodile", ["Crocodile du Nil", "Anaconda vert", "Tortue luth"], ["Nile crocodile", "Green anaconda", "Leatherback turtle"]],
  ["Quel est le plus grand singe ?", "Largest ape in the world?", "Gorille", "Gorilla", ["Orang-outan", "Chimpanzé", "Bonobo"], ["Orangutan", "Chimpanzee", "Bonobo"]],
  ["Quel est le plus grand serpent au monde ?", "Largest snake in the world?", "Anaconda vert", "Green anaconda", ["Python réticulé", "Boa constrictor", "Cobra royal"], ["Reticulated python", "Boa constrictor", "King cobra"]],
  ["Combien de pattes peut avoir un mille-pattes selon les espèces ?", "How many legs can a millipede have (depending on species)?", "Variable (40 à 750)", "Variable (40 to 750)", ["1000 fixes", "Toujours 100", "Toujours 200"], ["Always 1000", "Always 100", "Always 200"]],
  ["Quel animal est connu pour son extrême paresse ?", "Which animal is known for extreme laziness?", "Paresseux", "Sloth", ["Tatou", "Tortue", "Koala"], ["Armadillo", "Tortoise", "Koala"]],
  ["Combien d'yeux composés possède une mouche ?", "How many compound eyes does a fly have?", "2", "2", ["4", "5", "8"], ["4", "5", "8"]],
  ["Quelle est la durée de vie typique d'un éléphant d'Afrique ?", "Typical lifespan of an African elephant?", "60-70 ans", "60-70 years", ["20-30 ans", "100 ans", "150 ans"], ["20-30 years", "100 years", "150 years"]],
  // Drapeaux (5)
  ["Quel pays a un drapeau avec un dragon ?", "Country with a dragon on its flag?", "Bhoutan", "Bhutan", ["Chine", "Pays de Galles", "Vietnam"], ["China", "Wales", "Vietnam"]],
  ["Quel pays a un drapeau avec une croix du Sud ?", "Country whose flag features the Southern Cross?", "Australie", "Australia", ["Nouvelle-Zélande", "Brésil", "Toutes ces options"], ["New Zealand", "Brazil", "All of the above"]],
  ["Combien d'étoiles compte le drapeau américain ?", "How many stars on the US flag?", "50", "50", ["48", "52", "13"], ["48", "52", "13"]],
  ["Combien d'étoiles compte le drapeau européen ?", "How many stars on the EU flag?", "12", "12", ["15", "27", "28"], ["15", "27", "28"]],
  ["Quel pays africain a un AK-47 sur son drapeau ?", "Which African country has an AK-47 on its flag?", "Mozambique", "Mozambique", ["Zimbabwe", "Angola", "Tanzanie"], ["Zimbabwe", "Angola", "Tanzania"]],
  // Mythologie / religion (4)
  ["Qui est le dieu grec des enfers ?", "Greek god of the underworld?", "Hadès", "Hades", ["Apollon", "Hermès", "Cronos"], ["Apollo", "Hermes", "Cronus"]],
  ["Qui est le messager des dieux dans la mythologie grecque ?", "Messenger of the gods in Greek myth?", "Hermès", "Hermes", ["Iris", "Apollon", "Pan"], ["Iris", "Apollo", "Pan"]],
  ["Combien d'apôtres avait Jésus selon la tradition ?", "How many apostles did Jesus have?", "12", "12", ["10", "11", "13"], ["10", "11", "13"]],
  ["Combien y a-t-il de piliers de l'islam ?", "How many pillars of Islam?", "5", "5", ["3", "7", "10"], ["3", "7", "10"]],
  // Cuisine (5)
  ["De quel pays est originaire le couscous ?", "Country of origin of couscous?", "Maghreb (Maroc)", "Maghreb (Morocco)", ["Algérie seule", "Tunisie seule", "Égypte"], ["Algeria only", "Tunisia only", "Egypt"]],
  ["De quel pays est originaire la paella ?", "Country of origin of paella?", "Espagne", "Spain", ["Portugal", "Italie", "France"], ["Portugal", "Italy", "France"]],
  ["De quel pays est originaire le curry ?", "Country of origin of curry?", "Inde", "India", ["Thaïlande", "Sri Lanka", "Indonésie"], ["Thailand", "Sri Lanka", "Indonesia"]],
  ["De quel pays est originaire la fondue au fromage ?", "Country of origin of cheese fondue?", "Suisse", "Switzerland", ["France", "Italie", "Autriche"], ["France", "Italy", "Austria"]],
  ["De quel pays est originaire le kebab ?", "Country of origin of kebab?", "Turquie", "Turkey", ["Grèce", "Liban", "Iran"], ["Greece", "Lebanon", "Iran"]],
  // Surnoms (5)
  ["Quelle ville indienne est appelée la Cité dorée ?", "Which Indian city is the Golden City?", "Jaisalmer", "Jaisalmer", ["Jaipur", "Udaipur", "Jodhpur"], ["Jaipur", "Udaipur", "Jodhpur"]],
  ["Quelle ville italienne est appelée la cité des canaux ?", "Which Italian city is the city of canals?", "Venise", "Venice", ["Florence", "Vérone", "Padoue"], ["Florence", "Verona", "Padua"]],
  ["Quelle ville brésilienne est célèbre pour son carnaval ?", "Which Brazilian city is famous for Carnival?", "Rio de Janeiro", "Rio de Janeiro", ["São Paulo", "Salvador", "Recife"], ["São Paulo", "Salvador", "Recife"]],
  ["Quelle ville italienne abrite le berceau du violon ?", "Which Italian city is the violin's birthplace?", "Crémone", "Cremona", ["Milan", "Florence", "Padoue"], ["Milan", "Florence", "Padua"]],
  ["Quelle ville est la capitale économique du Maroc ?", "Economic capital of Morocco?", "Casablanca", "Casablanca", ["Rabat", "Marrakech", "Tanger"], ["Rabat", "Marrakesh", "Tangier"]],
  // Monuments (5)
  ["Dans quelle ville se trouve l'Acropole ?", "Which city contains the Acropolis?", "Athènes", "Athens", ["Rome", "Istanbul", "Le Caire"], ["Rome", "Istanbul", "Cairo"]],
  ["Dans quelle ville se trouve le Christ Rédempteur ?", "Which city has Christ the Redeemer?", "Rio de Janeiro", "Rio de Janeiro", ["São Paulo", "Buenos Aires", "Lima"], ["São Paulo", "Buenos Aires", "Lima"]],
  ["Dans quel pays se trouve le Sphinx ?", "Which country has the Great Sphinx?", "Égypte", "Egypt", ["Soudan", "Iraq", "Mexique"], ["Sudan", "Iraq", "Mexico"]],
  ["Sur quelle île se trouvent les statues Moaï ?", "Which island has the Moai statues?", "Île de Pâques", "Easter Island", ["Tahiti", "Pitcairn", "Fidji"], ["Tahiti", "Pitcairn", "Fiji"]],
  ["Dans quel pays se trouve Pétra ?", "Which country has Petra?", "Jordanie", "Jordan", ["Liban", "Syrie", "Israël"], ["Lebanon", "Syria", "Israel"]],
  // Devises (5)
  ["Quel pays utilise le yen ?", "Which country uses the yen?", "Japon", "Japan", ["Corée du Sud", "Chine", "Vietnam"], ["South Korea", "China", "Vietnam"]],
  ["Quel pays utilise la livre sterling ?", "Which country uses the pound sterling?", "Royaume-Uni", "United Kingdom", ["Irlande", "Australie", "Canada"], ["Ireland", "Australia", "Canada"]],
  ["Quel pays utilise le yuan ?", "Which country uses the yuan?", "Chine", "China", ["Japon", "Corée du Sud", "Vietnam"], ["Japan", "South Korea", "Vietnam"]],
  ["Quel pays utilise la roupie ?", "Which country uses the rupee?", "Inde", "India", ["Pakistan", "Sri Lanka", "Plusieurs pays"], ["Pakistan", "Sri Lanka", "Multiple countries"]],
  ["Quel pays utilise le real ?", "Which country uses the real?", "Brésil", "Brazil", ["Argentine", "Portugal", "Mexique"], ["Argentina", "Portugal", "Mexico"]],
  // Misc (3)
  ["Quel est le numéro d'urgence européen ?", "Which is the European emergency number?", "112", "112", ["911", "999", "100"], ["911", "999", "100"]],
  ["De quelle couleur est un panneau stop ?", "What color is a stop sign?", "Rouge", "Red", ["Jaune", "Bleu", "Vert"], ["Yellow", "Blue", "Green"]],
  ["De quelle couleur est un taxi à New York ?", "What color is a New York taxi?", "Jaune", "Yellow", ["Rouge", "Noir", "Blanc"], ["Red", "Black", "White"]],
];

/* ── Hard (Platine · 1800 ELO) ────────────────────────────────────── */
const hard: CuratedFact[] = [
  // Records pointus (10)
  ["Quel est le plus jeune pays officiellement reconnu ?", "Youngest officially recognized country?", "Soudan du Sud", "South Sudan", ["Kosovo", "Monténégro", "Timor oriental"], ["Kosovo", "Montenegro", "East Timor"]],
  ["Quelle république revendique la plus longue continuité depuis 301 ?", "Which republic claims continuity since 301?", "Saint-Marin", "San Marino", ["Vatican", "Andorre", "Suisse"], ["Vatican", "Andorra", "Switzerland"]],
  ["Quelle est la plus longue frontière mondiale entre deux pays ?", "Longest border between two countries?", "Canada–États-Unis", "Canada–United States", ["Russie–Chine", "Brésil–Bolivie", "Mongolie–Russie"], ["Russia–China", "Brazil–Bolivia", "Mongolia–Russia"]],
  ["Quel est le réseau de métro le plus long au monde ?", "Longest metro system in the world?", "Métro de Shanghai", "Shanghai Metro", ["Métro de Pékin", "Métro de Londres", "Métro de New York"], ["Beijing Subway", "London Underground", "New York Subway"]],
  ["Quelle est la plus profonde mine au monde ?", "Deepest mine in the world?", "Mponeng", "Mponeng", ["TauTona", "Western Deep", "Kola"], ["TauTona", "Western Deep", "Kola"]],
  ["Quelle est la plus grande mosquée au monde ?", "Largest mosque in the world?", "Masjid al-Haram", "Masjid al-Haram", ["Masjid al-Nabawi", "Faisal Mosque", "Sheikh Zayed Mosque"], ["Masjid al-Nabawi", "Faisal Mosque", "Sheikh Zayed Mosque"]],
  ["Quelle église chrétienne est la plus grande du monde par superficie ?", "Largest church in the world by area?", "Saint-Pierre du Vatican", "St. Peter's Basilica (Vatican)", ["Saint-Paul (Londres)", "Notre-Dame (Paris)", "Sagrada Família"], ["St. Paul's (London)", "Notre-Dame (Paris)", "Sagrada Família"]],
  ["Quel est le sommet le plus haut d'Europe (occidentale) ?", "Highest peak in Western Europe?", "Mont Blanc", "Mont Blanc", ["Mont Cervin", "Aiguille du Midi", "Mont Rose"], ["Matterhorn", "Aiguille du Midi", "Monte Rosa"]],
  ["Quel est le plus haut barrage hydroélectrique au monde ?", "Tallest hydropower dam in the world?", "Jinping-I (Chine)", "Jinping-I (China)", ["Hoover Dam", "Itaipu", "Trois-Gorges"], ["Hoover Dam", "Itaipu", "Three Gorges"]],
  ["Quelle est la plus longue ligne aérienne commerciale ?", "Longest commercial flight in the world?", "Singapour – New York", "Singapore – New York", ["Auckland – Doha", "Sydney – Londres direct", "Dubaï – Auckland"], ["Auckland – Doha", "Sydney – London direct", "Dubai – Auckland"]],
  // Animaux (8)
  ["Quel est le poisson le plus rapide ?", "Fastest fish in the ocean?", "Voilier (Sailfish)", "Sailfish", ["Espadon", "Mako", "Thon rouge"], ["Swordfish", "Mako", "Bluefin tuna"]],
  ["Combien d'années peut vivre une tortue géante ?", "How long can a giant tortoise live?", "Plus de 150 ans", "Over 150 years", ["20 ans", "60 ans", "300 ans en moyenne"], ["20 years", "60 years", "300 years on average"]],
  ["Quel mammifère vit le plus longtemps sans poils ?", "Which hairless mammal lives unusually long?", "Rat-taupe nu", "Naked mole-rat", ["Rat ordinaire", "Hippopotame", "Rhinocéros"], ["Common rat", "Hippopotamus", "Rhinoceros"]],
  ["Quel animal forme les colonies les plus grandes (jusqu'à plusieurs millions) ?", "Which animals form colonies with millions of members?", "Fourmis", "Ants", ["Abeilles", "Termites", "Tous les précédents"], ["Bees", "Termites", "All of the above"]],
  ["Combien de chromosomes possède un chien domestique ?", "How many chromosomes does a domestic dog have?", "78", "78", ["46", "64", "92"], ["46", "64", "92"]],
  ["Quel est le plus gros oiseau vivant (poids) ?", "Heaviest living bird?", "Autruche", "Ostrich", ["Émeu", "Casoar", "Albatros hurleur"], ["Emu", "Cassowary", "Wandering albatross"]],
  ["Quel est le plus petit mammifère vivant ?", "Smallest living mammal?", "Musaraigne étrusque", "Etruscan shrew", ["Souris pygmée", "Chauve-souris bourdon", "Loir nain"], ["Pygmy mouse", "Bumblebee bat", "Pygmy dormouse"]],
  ["Quel oiseau peut voler à reculons ?", "Which bird can fly backwards?", "Colibri", "Hummingbird", ["Faucon", "Engoulevent", "Albatros"], ["Falcon", "Nightjar", "Albatross"]],
  // Drapeaux (5)
  ["Quels deux pays ont un drapeau quasi-carré ?", "Which two countries have a near-square flag?", "Suisse et Vatican", "Switzerland and Vatican City", ["Italie et Saint-Marin", "Andorre et Monaco", "Liechtenstein et Saint-Marin"], ["Italy and San Marino", "Andorra and Monaco", "Liechtenstein and San Marino"]],
  ["Quel pays a le drapeau avec le plus de couleurs distinctes ?", "Which country has the most-color flag?", "Belize (12 couleurs)", "Belize (12 colors)", ["Afrique du Sud", "Mauritius", "Seychelles"], ["South Africa", "Mauritius", "Seychelles"]],
  ["Quel drapeau combine étoile et croissant rouge sur fond rouge ?", "Which flag has a red crescent and star on red?", "Turquie", "Turkey", ["Tunisie", "Pakistan", "Algérie"], ["Tunisia", "Pakistan", "Algeria"]],
  ["Quel pays balkanique a un aigle bicéphale sur son drapeau ?", "Which Balkan country has a double-headed eagle on its flag?", "Albanie", "Albania", ["Serbie", "Monténégro", "Macédoine du Nord"], ["Serbia", "Montenegro", "North Macedonia"]],
  ["Quel pays asiatique arbore la roue d'Ashoka sur son drapeau ?", "Which Asian country shows the Ashoka Chakra on its flag?", "Inde", "India", ["Sri Lanka", "Népal", "Bhoutan"], ["Sri Lanka", "Nepal", "Bhutan"]],
  // Mythologie / religion (5)
  ["Qui est le dieu solaire principal de l'Égypte antique ?", "Main solar deity of ancient Egypt?", "Râ", "Ra", ["Horus", "Osiris", "Anubis"], ["Horus", "Osiris", "Anubis"]],
  ["Qui est le dieu hindou à tête d'éléphant ?", "Which Hindu deity has an elephant head?", "Ganesh", "Ganesha", ["Shiva", "Krishna", "Brahma"], ["Shiva", "Krishna", "Brahma"]],
  ["Combien d'évangiles canoniques compte le Nouveau Testament ?", "How many canonical gospels in the New Testament?", "4", "4", ["3", "7", "12"], ["3", "7", "12"]],
  ["Qui est le fondateur du bouddhisme ?", "Who founded Buddhism?", "Siddhartha Gautama", "Siddhartha Gautama", ["Lao Tseu", "Confucius", "Mahavira"], ["Lao Tzu", "Confucius", "Mahavira"]],
  ["Combien d'Olympiens compte la mythologie grecque ?", "How many Olympians in Greek myth?", "12", "12", ["7", "10", "9"], ["7", "10", "9"]],
  // Cuisine (5)
  ["De quelle ville italienne est originaire le pesto ?", "Which Italian city originates pesto?", "Gênes", "Genoa", ["Naples", "Rome", "Milan"], ["Naples", "Rome", "Milan"]],
  ["De quelle ville française est originaire la bouillabaisse ?", "Which French city originates bouillabaisse?", "Marseille", "Marseille", ["Nice", "Bordeaux", "Toulon"], ["Nice", "Bordeaux", "Toulon"]],
  ["De quel pays est originaire le kimchi ?", "Country of origin of kimchi?", "Corée", "Korea", ["Japon", "Chine", "Vietnam"], ["Japan", "China", "Vietnam"]],
  ["De quel pays est originaire la saucisse de Francfort ?", "Country of origin of Frankfurter sausage?", "Allemagne", "Germany", ["Autriche", "République tchèque", "Pologne"], ["Austria", "Czech Republic", "Poland"]],
  ["Quelle région du Caucase est l'origine du kéfir ?", "Which Caucasus region originated kefir?", "Caucase", "Caucasus", ["Anatolie", "Asie centrale", "Mongolie"], ["Anatolia", "Central Asia", "Mongolia"]],
  // Surnoms / cultures (5)
  ["Quelle ville belge est appelée la Venise du Nord ?", "Which Belgian city is the 'Venice of the North'?", "Bruges", "Bruges", ["Bruxelles", "Anvers", "Gand"], ["Brussels", "Antwerp", "Ghent"]],
  ["Quelle ville française est appelée la cité phocéenne ?", "Which French city is the 'Phocean city'?", "Marseille", "Marseille", ["Nice", "Toulon", "Aix-en-Provence"], ["Nice", "Toulon", "Aix-en-Provence"]],
  ["Quelle ville américaine est appelée la Cité du vent ?", "Which US city is the 'Windy City'?", "Chicago", "Chicago", ["New York", "Boston", "Detroit"], ["New York", "Boston", "Detroit"]],
  ["Quelle capitale est appelée la Mecque du cinéma indien ?", "Which city is the Mecca of Indian cinema?", "Bombay (Bollywood)", "Mumbai (Bollywood)", ["Hyderabad", "Chennai", "Bangalore"], ["Hyderabad", "Chennai", "Bangalore"]],
  ["Quelle ville italienne est appelée la cité des arts ?", "Which Italian city is the 'city of arts'?", "Florence", "Florence", ["Rome", "Venise", "Milan"], ["Rome", "Venice", "Milan"]],
  // Devises pointues (5)
  ["Quel pays nordique utilise la couronne danoise ?", "Which Nordic country uses the Danish krone?", "Danemark", "Denmark", ["Norvège", "Suède", "Islande"], ["Norway", "Sweden", "Iceland"]],
  ["Quel pays utilise le forint ?", "Which country uses the forint?", "Hongrie", "Hungary", ["Roumanie", "Tchéquie", "Pologne"], ["Romania", "Czechia", "Poland"]],
  ["Quel pays utilise le złoty ?", "Which country uses the złoty?", "Pologne", "Poland", ["Hongrie", "Slovaquie", "Tchéquie"], ["Hungary", "Slovakia", "Czechia"]],
  ["Quel pays utilise le riyal saoudien ?", "Which country uses the Saudi riyal?", "Arabie saoudite", "Saudi Arabia", ["Iran", "Qatar", "Émirats arabes unis"], ["Iran", "Qatar", "United Arab Emirates"]],
  ["Quel pays utilise la couronne suédoise ?", "Which country uses the Swedish krona?", "Suède", "Sweden", ["Norvège", "Finlande", "Danemark"], ["Norway", "Finland", "Denmark"]],
  // Records / dates (7)
  ["Qui détient le record de longévité humaine confirmé ?", "Confirmed longest-lived human?", "Jeanne Calment (122 ans)", "Jeanne Calment (122)", ["Sarah Knauss (119)", "Lucy Hannah (117)", "Kane Tanaka (119)"], ["Sarah Knauss (119)", "Lucy Hannah (117)", "Kane Tanaka (119)"]],
  ["Quel premier être vivant a été envoyé en orbite ?", "Which first creature was sent to orbit?", "Laïka (chien)", "Laika (dog)", ["Ham (chimpanzé)", "Felix le chat", "Albert (singe)"], ["Ham (chimp)", "Felix the cat", "Albert (monkey)"]],
  ["Qui fut le premier homme dans l'espace ?", "Who was the first man in space?", "Yuri Gagarine", "Yuri Gagarin", ["Alan Shepard", "Neil Armstrong", "Guerman Titov"], ["Alan Shepard", "Neil Armstrong", "Gherman Titov"]],
  ["Quelle première femme est allée dans l'espace ?", "First woman in space?", "Valentina Terechkova", "Valentina Tereshkova", ["Sally Ride", "Svetlana Savitskaïa", "Mae Jemison"], ["Sally Ride", "Svetlana Savitskaya", "Mae Jemison"]],
  ["Quelle plus haute vague surfée a été enregistrée ?", "What is the tallest surfed wave on record?", "~26 m (Garrett McNamara)", "~26 m (Garrett McNamara)", ["~12 m", "~50 m", "~5 m"], ["~12 m", "~50 m", "~5 m"]],
  ["Quel premier livre imprimé majeur a Gutenberg produit ?", "Which major first book did Gutenberg print?", "Bible de Gutenberg", "Gutenberg Bible", ["Sutra du Diamant", "Don Quichotte", "Pseautier de Mayence"], ["Diamond Sutra", "Don Quixote", "Mainz Psalter"]],
  ["Quel pays sans armée notable est associé à un volcan célèbre ?", "Which famously demilitarized country has notable volcanoes?", "Costa Rica", "Costa Rica", ["Panama", "Salvador", "Honduras"], ["Panama", "El Salvador", "Honduras"]],
];

/* ── Expert (Diamant · 2200 ELO) ──────────────────────────────────── */
const expert: CuratedFact[] = [
  // Records insolites (10)
  ["Quelle est la plus longue rivière souterraine connue ?", "Longest known underground river?", "Sistema Sac Actun (Mexique)", "Sistema Sac Actun (Mexico)", ["Puerto Princesa", "Phong Nha", "Optymistychna"], ["Puerto Princesa", "Phong Nha", "Optymistychna"]],
  ["Quel est le plus grand cratère volcanique sur Terre ?", "Largest volcanic caldera on Earth?", "Toba (Sumatra)", "Toba (Sumatra)", ["Yellowstone", "Aira (Japon)", "Long Valley"], ["Yellowstone", "Aira (Japan)", "Long Valley"]],
  ["Quel est le plus grand canyon mondial (par profondeur cumulée) ?", "Largest canyon by total depth?", "Yarlung Tsangpo (Tibet)", "Yarlung Tsangpo (Tibet)", ["Grand Canyon", "Colca", "Fish River"], ["Grand Canyon", "Colca", "Fish River"]],
  ["Quelle est la plus longue grotte connue ?", "Longest known cave system?", "Mammoth Cave (USA)", "Mammoth Cave (USA)", ["Sistema Sac Actun", "Optymistychna", "Jewel Cave"], ["Sistema Sac Actun", "Optymistychna", "Jewel Cave"]],
  ["Quel pays a la plus forte densité de population au monde ?", "Country with the highest population density?", "Monaco", "Monaco", ["Singapour", "Bangladesh", "Vatican"], ["Singapore", "Bangladesh", "Vatican"]],
  ["Quel pays a la plus faible densité de population mondiale ?", "Country with the lowest population density?", "Mongolie", "Mongolia", ["Namibie", "Australie", "Islande"], ["Namibia", "Australia", "Iceland"]],
  ["Quel col routier au Ladakh est l'un des plus hauts au monde ?", "Which Ladakh road pass is among the world's highest?", "Khardung La", "Khardung La", ["Marsimik La", "Umling La", "Taglang La"], ["Marsimik La", "Umling La", "Taglang La"]],
  ["Quel est le plus grand désert chaud du monde ?", "Largest hot desert in the world?", "Sahara", "Sahara", ["Arabique", "Australien", "Kalahari"], ["Arabian", "Australian", "Kalahari"]],
  ["Quelle est la température la plus élevée jamais enregistrée à la surface ?", "Highest surface temperature ever recorded?", "56.7 °C (Death Valley, 1913)", "56.7 °C (Death Valley, 1913)", ["50 °C", "60 °C", "70 °C"], ["50 °C", "60 °C", "70 °C"]],
  ["Quelle est la température la plus basse jamais enregistrée naturellement ?", "Lowest natural temperature ever recorded?", "-89.2 °C (Vostok, 1983)", "-89.2 °C (Vostok, 1983)", ["-70 °C", "-100 °C", "-50 °C"], ["-70 °C", "-100 °C", "-50 °C"]],
  // Animaux (8)
  ["Quel animal est considéré biologiquement immortel ?", "Which animal is considered biologically immortal?", "Turritopsis dohrnii (méduse)", "Turritopsis dohrnii (jellyfish)", ["Hydra", "Tortue géante", "Homard"], ["Hydra", "Giant tortoise", "Lobster"]],
  ["Quelle araignée australienne est la plus venimeuse au monde ?", "Most venomous spider (Australia)?", "Atrax robustus (Sydney funnel-web)", "Atrax robustus (Sydney funnel-web)", ["Mygale Goliath", "Veuve noire", "Recluse brune"], ["Goliath birdeater", "Black widow", "Brown recluse"]],
  ["Quel poisson tropical est considéré le plus venimeux ?", "Most venomous fish (tropical)?", "Poisson-pierre", "Stonefish", ["Poisson-globe", "Murène", "Vive"], ["Pufferfish", "Moray eel", "Weever"]],
  ["Quelle tortue géante a vécu plus de 190 ans (Sainte-Hélène) ?", "Which giant tortoise has lived 190+ years (Saint Helena)?", "Jonathan", "Jonathan", ["Harriet", "Lonesome George", "Adwaita"], ["Harriet", "Lonesome George", "Adwaita"]],
  ["Quel poisson abyssal vit aux profondeurs ~8000 m ?", "Which deep-sea fish lives at ~8,000 m?", "Snailfish (Mariana)", "Mariana snailfish", ["Anguille des grands fonds", "Poisson des Hadès", "Limace de mer"], ["Deep-sea eel", "Hadal eelpout", "Sea slug"]],
  ["Quel oiseau aquatique parcourt le plus long trajet migratoire ?", "Which seabird makes the longest migration?", "Sterne arctique", "Arctic tern", ["Albatros hurleur", "Bécasseau maubèche", "Mouette tridactyle"], ["Wandering albatross", "Red knot", "Black-legged kittiwake"]],
  ["Quel ver marin tubicole vit à proximité des sources hydrothermales ?", "Which tube worm lives at hydrothermal vents?", "Riftia pachyptila", "Riftia pachyptila", ["Bobbit", "Pompéi worm", "Spirobranchus"], ["Bobbit worm", "Pompeii worm", "Spirobranchus"]],
  ["Quelle souris africaine peut régénérer sa peau ?", "Which African mouse can regenerate skin?", "Souris épineuse africaine", "African spiny mouse", ["Souris des moissons", "Mulot sylvestre", "Souris à pattes blanches"], ["Harvest mouse", "Wood mouse", "White-footed mouse"]],
  // Drapeaux pointus (5)
  ["Combien de dents porte le drapeau du Bahreïn ?", "How many points on Bahrain's flag?", "5", "5", ["6", "7", "9"], ["6", "7", "9"]],
  ["Quel drapeau présente un lion brandissant une épée et 4 feuilles ?", "Which flag depicts a lion holding a sword and 4 leaves?", "Sri Lanka", "Sri Lanka", ["Inde", "Maldives", "Birmanie"], ["India", "Maldives", "Myanmar"]],
  ["Quel pays montre des étoiles, montagnes et figures sur son drapeau ?", "Which flag shows stars, mountains and figures?", "Belize", "Belize", ["Équateur", "Guatemala", "Costa Rica"], ["Ecuador", "Guatemala", "Costa Rica"]],
  ["Quel drapeau possède le plus ancien design encore en usage ?", "Which flag has the oldest design still in use?", "Danemark", "Denmark", ["Royaume-Uni", "Pays-Bas", "Suède"], ["United Kingdom", "Netherlands", "Sweden"]],
  ["Quel pays africain présente une étoile noire sur fond rouge-jaune-vert ?", "Which African flag has a black star on red-yellow-green?", "Ghana", "Ghana", ["Sénégal", "Mali", "Cameroun"], ["Senegal", "Mali", "Cameroon"]],
  // Mythologie / religion (5)
  ["Quelle épopée sumérienne raconte la quête de l'immortalité ?", "Which Sumerian epic tells of an immortality quest?", "Épopée de Gilgamesh", "Epic of Gilgamesh", ["Enuma Elish", "Atrahasis", "Mahabharata"], ["Enuma Elish", "Atrahasis", "Mahabharata"]],
  ["Quel récit babylonien raconte la création du monde ?", "Which Babylonian myth tells the creation?", "Enuma Elish", "Enuma Elish", ["Gilgamesh", "Atrahasis", "Inanna"], ["Gilgamesh", "Atrahasis", "Inanna"]],
  ["Qui fonda le zoroastrisme ?", "Who founded Zoroastrianism?", "Zarathoustra", "Zoroaster", ["Mani", "Ahura Mazda", "Cyrus le Grand"], ["Mani", "Ahura Mazda", "Cyrus the Great"]],
  ["Qui est le serpent à plumes des Aztèques ?", "Who is the Aztec feathered serpent?", "Quetzalcóatl", "Quetzalcoatl", ["Tezcatlipoca", "Huitzilopochtli", "Tláloc"], ["Tezcatlipoca", "Huitzilopochtli", "Tlaloc"]],
  ["Quel personnage central du Mahabharata reçoit la Bhagavad-Gita ?", "Which central character of the Mahabharata receives the Bhagavad Gita?", "Arjuna", "Arjuna", ["Krishna", "Bhima", "Yudhishthira"], ["Krishna", "Bhima", "Yudhishthira"]],
  // Cuisine pointue (5)
  ["De quel pays est originaire le café arabica ?", "Country of origin of Arabica coffee?", "Éthiopie", "Ethiopia", ["Yémen", "Brésil", "Colombie"], ["Yemen", "Brazil", "Colombia"]],
  ["Quelle truffe blanche prestigieuse vient d'Italie ?", "Which prestigious white truffle hails from Italy?", "Truffe blanche d'Alba", "Alba white truffle", ["Truffe noire du Périgord", "Truffe d'été", "Truffe musquée"], ["Périgord black truffle", "Summer truffle", "Musk truffle"]],
  ["Quelle plante mésoaméricaine est l'origine du chocolat ?", "Which Mesoamerican plant gave us chocolate?", "Cacaoyer", "Cacao tree", ["Café", "Vanille", "Maïs"], ["Coffee", "Vanilla", "Maize"]],
  ["Quel pays revendique l'origine des nouilles ramen modernes ?", "Which country claims modern ramen?", "Japon (style chinois importé)", "Japan (Chinese-style)", ["Chine seule", "Corée du Sud", "Vietnam"], ["China alone", "South Korea", "Vietnam"]],
  ["Quel mot étymologique russe signifie « petite eau » et désigne une boisson ?", "Which Russian word meaning 'little water' names a drink?", "Vodka", "Vodka", ["Kvas", "Medovukha", "Samogon"], ["Kvass", "Medovukha", "Samogon"]],
  // Surnoms / villes (5)
  ["Quelle ville est appelée la Sérénissime ?", "Which city is the 'Serenissima'?", "Venise", "Venice", ["Milan", "Florence", "Naples"], ["Milan", "Florence", "Naples"]],
  ["Quelle ville indienne est la cité sainte hindoue par excellence ?", "Which Indian city is the foremost Hindu holy city?", "Varanasi", "Varanasi", ["Allahabad", "Haridwar", "Mathura"], ["Allahabad", "Haridwar", "Mathura"]],
  ["Quelle ville de l'Équateur est appelée la « Lumière de l'Amérique » ?", "Which Ecuadorian city is the 'Light of America'?", "Quito", "Quito", ["Guayaquil", "Cuenca", "Loja"], ["Guayaquil", "Cuenca", "Loja"]],
  ["Quelle ville chilienne est appelée la perle du Pacifique ?", "Which Chilean city is the 'Pearl of the Pacific'?", "Valparaíso", "Valparaíso", ["Antofagasta", "Iquique", "La Serena"], ["Antofagasta", "Iquique", "La Serena"]],
  // Devises pointues (5)
  ["Quel pays utilise le tugrik ?", "Which country uses the tugrik?", "Mongolie", "Mongolia", ["Kazakhstan", "Kirghizistan", "Tadjikistan"], ["Kazakhstan", "Kyrgyzstan", "Tajikistan"]],
  ["Quels pays utilisent le kwacha ?", "Which countries use the kwacha?", "Zambie et Malawi", "Zambia and Malawi", ["Mozambique", "Botswana", "Namibie"], ["Mozambique", "Botswana", "Namibia"]],
  ["Quel pays utilise le quetzal ?", "Which country uses the quetzal?", "Guatemala", "Guatemala", ["Honduras", "Belize", "Salvador"], ["Honduras", "Belize", "El Salvador"]],
  ["Quel pays utilise le lempira ?", "Which country uses the lempira?", "Honduras", "Honduras", ["Nicaragua", "Costa Rica", "Salvador"], ["Nicaragua", "Costa Rica", "El Salvador"]],
  ["Quel pays insulaire des Caraïbes utilise le florin ?", "Which Caribbean island uses the florin?", "Aruba", "Aruba", ["Curaçao", "Trinité-et-Tobago", "Sainte-Lucie"], ["Curaçao", "Trinidad and Tobago", "Saint Lucia"]],
  // Records / dates (12)
  ["Qui a piloté le premier vol motorisé en 1903 ?", "Who piloted the first powered flight in 1903?", "Orville Wright", "Orville Wright", ["Wilbur Wright", "Glenn Curtiss", "Charles Lindbergh"], ["Wilbur Wright", "Glenn Curtiss", "Charles Lindbergh"]],
  ["Quel ouragan a battu un record de vents en 2015 ?", "Which 2015 hurricane set a wind-speed record?", "Patricia", "Patricia", ["Wilma", "Maria", "Irma"], ["Wilma", "Maria", "Irma"]],
  ["Quelle ville est l'une des plus anciennes habitées en continu ?", "Which city is among the oldest continuously inhabited?", "Damas", "Damascus", ["Le Caire", "Athènes", "Rome"], ["Cairo", "Athens", "Rome"]],
  ["Quel arbre clonal de l'Utah est l'organisme le plus ancien et lourd ?", "Which Utah clonal tree is the oldest, heaviest organism?", "Pando (peuplier faux-tremble)", "Pando (quaking aspen)", ["Sequoia", "Pinus longaeva", "Yew tree"], ["Sequoia", "Pinus longaeva", "Yew tree"]],
  ["Quelle pyramide a la plus grande base au monde ?", "Which pyramid has the largest base?", "Cholula (Mexique)", "Cholula (Mexico)", ["Khéops", "Saqqarah", "Tikal"], ["Khufu", "Saqqara", "Tikal"]],
  ["Quel monarque historique a régné le plus longtemps tout court ?", "Which historical monarch reigned longest overall?", "Louis XIV (72 ans)", "Louis XIV (72 years)", ["Bhumibol (70 ans)", "Élisabeth II", "Néron"], ["Bhumibol (70 yrs)", "Elizabeth II", "Nero"]],
  ["Quel volcan grec a explosé vers 1600 av. J.-C. (Santorin) ?", "Which Greek volcano erupted ~1600 BCE (Santorini)?", "Théra (Santorin)", "Thera (Santorini)", ["Vésuve", "Etna", "Stromboli"], ["Vesuvius", "Etna", "Stromboli"]],
  ["Quelle première ascension de l'Everest a été réalisée en 1953 ?", "Who first summited Everest in 1953?", "Hillary et Tensing Norgay", "Hillary and Tenzing Norgay", ["Mallory et Irvine (1924, contesté)", "Reinhold Messner", "Eric Shipton"], ["Mallory and Irvine (1924, disputed)", "Reinhold Messner", "Eric Shipton"]],
];

export const FUN_QUESTIONS = buildCuratedCategory(
  "fun",
  "fun",
  [easy, medium, hard, expert],
);
