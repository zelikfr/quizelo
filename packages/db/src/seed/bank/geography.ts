import { buildCuratedCategory, type CuratedFact } from "./_builder";

/* ── Easy (Argent · 1000 ELO) ─────────────────────────────────────── */
const easy: CuratedFact[] = [
  // Capitales (10)
  ["Quelle est la capitale de la France ?", "Capital of France?", "Paris", "Paris", ["Lyon", "Marseille", "Bordeaux"], ["Lyon", "Marseille", "Bordeaux"]],
  ["Quelle est la capitale de l'Allemagne ?", "Capital of Germany?", "Berlin", "Berlin", ["Munich", "Hambourg", "Francfort"], ["Munich", "Hamburg", "Frankfurt"]],
  ["Quelle est la capitale de l'Italie ?", "Capital of Italy?", "Rome", "Rome", ["Milan", "Venise", "Florence"], ["Milan", "Venice", "Florence"]],
  ["Quelle est la capitale de l'Espagne ?", "Capital of Spain?", "Madrid", "Madrid", ["Barcelone", "Séville", "Valence"], ["Barcelona", "Seville", "Valencia"]],
  ["Quelle est la capitale du Royaume-Uni ?", "Capital of the United Kingdom?", "Londres", "London", ["Manchester", "Édimbourg", "Liverpool"], ["Manchester", "Edinburgh", "Liverpool"]],
  ["Quelle est la capitale des États-Unis ?", "Capital of the United States?", "Washington", "Washington", ["New York", "Los Angeles", "Chicago"], ["New York", "Los Angeles", "Chicago"]],
  ["Quelle est la capitale de la Russie ?", "Capital of Russia?", "Moscou", "Moscow", ["Saint-Pétersbourg", "Kazan", "Sotchi"], ["Saint Petersburg", "Kazan", "Sochi"]],
  ["Quelle est la capitale du Japon ?", "Capital of Japan?", "Tokyo", "Tokyo", ["Osaka", "Kyoto", "Nagoya"], ["Osaka", "Kyoto", "Nagoya"]],
  ["Quelle est la capitale du Brésil ?", "Capital of Brazil?", "Brasilia", "Brasilia", ["Rio de Janeiro", "São Paulo", "Salvador"], ["Rio de Janeiro", "São Paulo", "Salvador"]],
  ["Quelle est la capitale de l'Australie ?", "Capital of Australia?", "Canberra", "Canberra", ["Sydney", "Melbourne", "Perth"], ["Sydney", "Melbourne", "Perth"]],
  // Continents (5)
  ["Sur quel continent se trouve l'Égypte ?", "On which continent is Egypt?", "Afrique", "Africa", ["Asie", "Europe", "Amérique du Sud"], ["Asia", "Europe", "South America"]],
  ["Sur quel continent se trouve le Japon ?", "On which continent is Japan?", "Asie", "Asia", ["Europe", "Océanie", "Afrique"], ["Europe", "Oceania", "Africa"]],
  ["Sur quel continent se trouve l'Allemagne ?", "On which continent is Germany?", "Europe", "Europe", ["Asie", "Afrique", "Amérique du Nord"], ["Asia", "Africa", "North America"]],
  ["Sur quel continent se trouve le Brésil ?", "On which continent is Brazil?", "Amérique du Sud", "South America", ["Amérique du Nord", "Afrique", "Océanie"], ["North America", "Africa", "Oceania"]],
  ["Sur quel continent se trouve l'Australie ?", "On which continent is Australia?", "Océanie", "Oceania", ["Asie", "Afrique", "Amérique du Sud"], ["Asia", "Africa", "South America"]],
  // Villes → pays (5)
  ["Dans quel pays se trouve Marseille ?", "In which country is Marseille?", "France", "France", ["Italie", "Espagne", "Belgique"], ["Italy", "Spain", "Belgium"]],
  ["Dans quel pays se trouve Munich ?", "In which country is Munich?", "Allemagne", "Germany", ["Autriche", "Suisse", "Pologne"], ["Austria", "Switzerland", "Poland"]],
  ["Dans quel pays se trouve Barcelone ?", "In which country is Barcelona?", "Espagne", "Spain", ["Italie", "Portugal", "France"], ["Italy", "Portugal", "France"]],
  ["Dans quel pays se trouve Sydney ?", "In which country is Sydney?", "Australie", "Australia", ["Nouvelle-Zélande", "États-Unis", "Royaume-Uni"], ["New Zealand", "United States", "United Kingdom"]],
  ["Dans quel pays se trouvent les pyramides de Gizeh ?", "In which country are the Giza pyramids?", "Égypte", "Egypt", ["Soudan", "Mexique", "Pérou"], ["Sudan", "Mexico", "Peru"]],
  // Fleuves (5)
  ["Quel fleuve traverse Paris ?", "Which river runs through Paris?", "Seine", "Seine", ["Loire", "Rhône", "Garonne"], ["Loire", "Rhône", "Garonne"]],
  ["Quel fleuve traverse Londres ?", "Which river runs through London?", "Tamise", "Thames", ["Tyne", "Severn", "Mersey"], ["Tyne", "Severn", "Mersey"]],
  ["Quel fleuve traverse Rome ?", "Which river runs through Rome?", "Tibre", "Tiber", ["Pô", "Arno", "Adige"], ["Po", "Arno", "Adige"]],
  ["Quel est le plus long fleuve du monde ?", "Longest river in the world?", "Nil", "Nile", ["Amazone", "Mississippi", "Yangzi"], ["Amazon", "Mississippi", "Yangtze"]],
  ["Quel est le plus grand fleuve d'Amérique du Sud ?", "Largest river in South America?", "Amazone", "Amazon", ["Orénoque", "Paraná", "Magdalena"], ["Orinoco", "Paraná", "Magdalena"]],
  // Sommets / chaînes (4)
  ["Quel est le plus haut sommet du monde ?", "Highest mountain in the world?", "Everest", "Everest", ["K2", "Kilimandjaro", "Mont Blanc"], ["K2", "Kilimanjaro", "Mont Blanc"]],
  ["Quel est le plus haut sommet d'Afrique ?", "Highest mountain in Africa?", "Kilimandjaro", "Kilimanjaro", ["Mont Kenya", "Mont Cameroun", "Atlas"], ["Mount Kenya", "Mount Cameroon", "Atlas"]],
  ["Sur quelle chaîne se trouve le mont Blanc ?", "Which range contains Mont Blanc?", "Alpes", "Alps", ["Pyrénées", "Vosges", "Jura"], ["Pyrenees", "Vosges", "Jura"]],
  ["Quelle chaîne sépare la France de l'Espagne ?", "Which range separates France from Spain?", "Pyrénées", "Pyrenees", ["Alpes", "Vosges", "Jura"], ["Alps", "Vosges", "Jura"]],
  // Océans / mers (4)
  ["Quel est le plus grand océan du monde ?", "Largest ocean in the world?", "Pacifique", "Pacific", ["Atlantique", "Indien", "Arctique"], ["Atlantic", "Indian", "Arctic"]],
  ["Quel océan borde la France à l'ouest ?", "Which ocean borders France to the west?", "Atlantique", "Atlantic", ["Pacifique", "Indien", "Arctique"], ["Pacific", "Indian", "Arctic"]],
  ["Quelle mer borde la France au sud ?", "Which sea borders France to the south?", "Méditerranée", "Mediterranean", ["Mer du Nord", "Mer Baltique", "Mer Noire"], ["North Sea", "Baltic Sea", "Black Sea"]],
  ["Quel océan borde le Japon ?", "Which ocean borders Japan?", "Pacifique", "Pacific", ["Atlantique", "Indien", "Arctique"], ["Atlantic", "Indian", "Arctic"]],
  // Records (5)
  ["Quel est le plus grand pays par superficie ?", "Largest country by area?", "Russie", "Russia", ["Canada", "Chine", "États-Unis"], ["Canada", "China", "United States"]],
  ["Quel est le plus petit pays du monde ?", "Smallest country in the world?", "Vatican", "Vatican City", ["Monaco", "Saint-Marin", "Liechtenstein"], ["Monaco", "San Marino", "Liechtenstein"]],
  ["Quel est le pays le plus peuplé du monde ?", "Most populous country in the world?", "Inde", "India", ["Chine", "États-Unis", "Indonésie"], ["China", "United States", "Indonesia"]],
  ["Quel est le plus grand désert chaud du monde ?", "Largest hot desert in the world?", "Sahara", "Sahara", ["Gobi", "Kalahari", "Atacama"], ["Gobi", "Kalahari", "Atacama"]],
  ["Quel est le plus grand lac d'Afrique ?", "Largest lake in Africa?", "Lac Victoria", "Lake Victoria", ["Lac Tanganyika", "Lac Tchad", "Lac Malawi"], ["Lake Tanganyika", "Lake Chad", "Lake Malawi"]],
  // Monuments (5)
  ["Dans quelle ville se trouve la tour Eiffel ?", "Which city has the Eiffel Tower?", "Paris", "Paris", ["Lyon", "Marseille", "Bordeaux"], ["Lyon", "Marseille", "Bordeaux"]],
  ["Dans quelle ville se trouve le Colisée ?", "Which city has the Colosseum?", "Rome", "Rome", ["Milan", "Florence", "Naples"], ["Milan", "Florence", "Naples"]],
  ["Dans quelle ville se trouve la Statue de la Liberté ?", "Which city has the Statue of Liberty?", "New York", "New York", ["Boston", "Washington", "Chicago"], ["Boston", "Washington", "Chicago"]],
  ["Dans quel pays se trouve la Grande Muraille ?", "Which country has the Great Wall?", "Chine", "China", ["Japon", "Corée du Sud", "Mongolie"], ["Japan", "South Korea", "Mongolia"]],
  ["Dans quelle ville se trouve la basilique Saint-Pierre ?", "Which city has St. Peter's Basilica?", "Rome", "Rome", ["Florence", "Milan", "Athènes"], ["Florence", "Milan", "Athens"]],
  // Détroits / canaux (3)
  ["Quel détroit sépare l'Espagne du Maroc ?", "Which strait separates Spain from Morocco?", "Gibraltar", "Gibraltar", ["Bosphore", "Magellan", "Hormuz"], ["Bosphorus", "Magellan", "Hormuz"]],
  ["Quel canal relie l'Atlantique au Pacifique ?", "Which canal connects the Atlantic to the Pacific?", "Canal de Panama", "Panama Canal", ["Canal de Suez", "Canal de Corinthe", "Canal de Kiel"], ["Suez Canal", "Corinth Canal", "Kiel Canal"]],
  ["Quel canal relie la Méditerranée à la mer Rouge ?", "Which canal links the Mediterranean to the Red Sea?", "Canal de Suez", "Suez Canal", ["Canal de Panama", "Canal de Corinthe", "Bosphore"], ["Panama Canal", "Corinth Canal", "Bosphorus"]],
  // Iles / autres (4)
  ["Dans quel pays se trouve la Corse ?", "Which country does Corsica belong to?", "France", "France", ["Italie", "Espagne", "Grèce"], ["Italy", "Spain", "Greece"]],
  ["Dans quel pays se trouve la Sicile ?", "Which country does Sicily belong to?", "Italie", "Italy", ["Grèce", "Malte", "Tunisie"], ["Greece", "Malta", "Tunisia"]],
  ["Quelle chaîne traverse l'Amérique du Sud du nord au sud ?", "Which range runs north-south through South America?", "Andes", "Andes", ["Rocheuses", "Appalaches", "Sierra Madre"], ["Rockies", "Appalachians", "Sierra Madre"]],
  ["Quelle chute d'eau sépare le Canada des États-Unis ?", "Which falls lie on the Canada–US border?", "Niagara", "Niagara", ["Iguazu", "Victoria", "Angel"], ["Iguazu", "Victoria", "Angel"]],
];

/* ── Medium (Or · 1400 ELO) ───────────────────────────────────────── */
const medium: CuratedFact[] = [
  // Capitales moins évidentes (10)
  ["Quelle est la capitale de la Mongolie ?", "Capital of Mongolia?", "Oulan-Bator", "Ulaanbaatar", ["Erdenet", "Darkhan", "Choibalsan"], ["Erdenet", "Darkhan", "Choibalsan"]],
  ["Quelle est la capitale du Vietnam ?", "Capital of Vietnam?", "Hanoï", "Hanoi", ["Hô-Chi-Minh-Ville", "Da Nang", "Hué"], ["Ho Chi Minh City", "Da Nang", "Hue"]],
  ["Quelle est la capitale du Kazakhstan ?", "Capital of Kazakhstan?", "Astana", "Astana", ["Almaty", "Shymkent", "Karaganda"], ["Almaty", "Shymkent", "Karaganda"]],
  ["Quelle est la capitale de l'Iran ?", "Capital of Iran?", "Téhéran", "Tehran", ["Ispahan", "Chiraz", "Mashhad"], ["Isfahan", "Shiraz", "Mashhad"]],
  ["Quelle est la capitale administrative de l'Afrique du Sud ?", "Administrative capital of South Africa?", "Pretoria", "Pretoria", ["Le Cap", "Johannesburg", "Durban"], ["Cape Town", "Johannesburg", "Durban"]],
  ["Quelle est la capitale du Nigeria ?", "Capital of Nigeria?", "Abuja", "Abuja", ["Lagos", "Kano", "Ibadan"], ["Lagos", "Kano", "Ibadan"]],
  ["Quelle est la capitale de la Norvège ?", "Capital of Norway?", "Oslo", "Oslo", ["Bergen", "Trondheim", "Stavanger"], ["Bergen", "Trondheim", "Stavanger"]],
  ["Quelle est la capitale de la Hongrie ?", "Capital of Hungary?", "Budapest", "Budapest", ["Debrecen", "Szeged", "Pécs"], ["Debrecen", "Szeged", "Pécs"]],
  ["Quelle est la capitale du Kenya ?", "Capital of Kenya?", "Nairobi", "Nairobi", ["Mombasa", "Kisumu", "Nakuru"], ["Mombasa", "Kisumu", "Nakuru"]],
  ["Quelle est la capitale du Pakistan ?", "Capital of Pakistan?", "Islamabad", "Islamabad", ["Karachi", "Lahore", "Peshawar"], ["Karachi", "Lahore", "Peshawar"]],
  // Villes → pays (5)
  ["Dans quel pays se trouve Saint-Pétersbourg ?", "In which country is Saint Petersburg?", "Russie", "Russia", ["Ukraine", "Biélorussie", "Estonie"], ["Ukraine", "Belarus", "Estonia"]],
  ["Dans quel pays se trouve Le Cap ?", "In which country is Cape Town?", "Afrique du Sud", "South Africa", ["Namibie", "Botswana", "Zimbabwe"], ["Namibia", "Botswana", "Zimbabwe"]],
  ["Dans quel pays se trouve Mumbai ?", "In which country is Mumbai?", "Inde", "India", ["Pakistan", "Bangladesh", "Sri Lanka"], ["Pakistan", "Bangladesh", "Sri Lanka"]],
  ["Dans quel pays se trouve Casablanca ?", "In which country is Casablanca?", "Maroc", "Morocco", ["Algérie", "Tunisie", "Mauritanie"], ["Algeria", "Tunisia", "Mauritania"]],
  ["Dans quel pays se trouve Machu Picchu ?", "In which country is Machu Picchu?", "Pérou", "Peru", ["Bolivie", "Équateur", "Chili"], ["Bolivia", "Ecuador", "Chile"]],
  // Fleuves (6)
  ["Quel fleuve traverse Bagdad ?", "Which river runs through Baghdad?", "Tigre", "Tigris", ["Euphrate", "Jourdain", "Nil"], ["Euphrates", "Jordan", "Nile"]],
  ["Quel fleuve traverse Vienne ?", "Which river runs through Vienna?", "Danube", "Danube", ["Rhin", "Elbe", "Pô"], ["Rhine", "Elbe", "Po"]],
  ["Quel fleuve traverse Berlin ?", "Which river runs through Berlin?", "Spree", "Spree", ["Rhin", "Elbe", "Danube"], ["Rhine", "Elbe", "Danube"]],
  ["Quel fleuve traverse New York ?", "Which river runs through New York?", "Hudson", "Hudson", ["Delaware", "Potomac", "Susquehanna"], ["Delaware", "Potomac", "Susquehanna"]],
  ["Quel fleuve sépare le Mexique des États-Unis ?", "Which river separates Mexico from the US?", "Rio Grande", "Rio Grande", ["Mississippi", "Colorado", "Pecos"], ["Mississippi", "Colorado", "Pecos"]],
  ["Sur quel fleuve se trouve le barrage des Trois-Gorges ?", "Which river hosts the Three Gorges Dam?", "Yangzi Jiang", "Yangtze", ["Mékong", "Fleuve Jaune", "Brahmapoutre"], ["Mekong", "Yellow River", "Brahmaputra"]],
  // Sommets (4)
  ["Quel est le plus haut sommet d'Amérique du Sud ?", "Highest mountain in South America?", "Aconcagua", "Aconcagua", ["Chimborazo", "Huascarán", "Illimani"], ["Chimborazo", "Huascarán", "Illimani"]],
  ["Quel est le plus haut sommet d'Amérique du Nord ?", "Highest mountain in North America?", "Denali", "Denali", ["Mont Logan", "Pic Orizaba", "Mont Elbert"], ["Mount Logan", "Pico de Orizaba", "Mount Elbert"]],
  ["Quel est le plus haut sommet d'Europe ?", "Highest mountain in Europe?", "Mont Elbrouz", "Mount Elbrus", ["Mont Blanc", "Mont Cervin", "Mont Rose"], ["Mont Blanc", "Matterhorn", "Monte Rosa"]],
  ["Sur quelle chaîne se trouve l'Annapurna ?", "Which range contains Annapurna?", "Himalaya", "Himalayas", ["Karakoram", "Hindou Kouch", "Pamir"], ["Karakoram", "Hindu Kush", "Pamir"]],
  // Lacs (4)
  ["Quel est le lac le plus profond du monde ?", "Deepest lake in the world?", "Baïkal", "Baikal", ["Tanganyika", "Caspienne", "Supérieur"], ["Tanganyika", "Caspian", "Superior"]],
  ["Quel est le plus grand lac du monde ?", "Largest lake in the world?", "Mer Caspienne", "Caspian Sea", ["Lac Supérieur", "Lac Victoria", "Lac Baïkal"], ["Lake Superior", "Lake Victoria", "Lake Baikal"]],
  ["Quel lac borde la France et la Suisse ?", "Which lake lies between France and Switzerland?", "Lac Léman", "Lake Geneva", ["Lac de Constance", "Lac Majeur", "Lac de Côme"], ["Lake Constance", "Lake Maggiore", "Lake Como"]],
  ["Quel est le plus grand lac d'Amérique du Nord ?", "Largest lake in North America?", "Lac Supérieur", "Lake Superior", ["Lac Michigan", "Lac Huron", "Grand Lac des Esclaves"], ["Lake Michigan", "Lake Huron", "Great Slave Lake"]],
  // Mers / océans (4)
  ["Quelle est la mer la plus salée du monde ?", "Saltiest sea in the world?", "Mer Morte", "Dead Sea", ["Mer Rouge", "Mer Caspienne", "Mer Baltique"], ["Red Sea", "Caspian Sea", "Baltic Sea"]],
  ["Quel océan borde l'Inde au sud ?", "Which ocean borders India to the south?", "Indien", "Indian", ["Pacifique", "Atlantique", "Arctique"], ["Pacific", "Atlantic", "Arctic"]],
  ["Quelle mer sépare la Turquie de l'Ukraine ?", "Which sea lies between Turkey and Ukraine?", "Mer Noire", "Black Sea", ["Mer Égée", "Mer Caspienne", "Mer Adriatique"], ["Aegean Sea", "Caspian Sea", "Adriatic Sea"]],
  ["Quelle mer borde la Suède et la Finlande ?", "Which sea borders Sweden and Finland?", "Mer Baltique", "Baltic Sea", ["Mer du Nord", "Mer de Norvège", "Mer Blanche"], ["North Sea", "Norwegian Sea", "White Sea"]],
  // Déserts (3)
  ["Dans quels pays se trouve le désert de Gobi ?", "Which countries contain the Gobi Desert?", "Mongolie et Chine", "Mongolia and China", ["Russie et Mongolie", "Chine et Inde", "Iran et Pakistan"], ["Russia and Mongolia", "China and India", "Iran and Pakistan"]],
  ["Dans quel pays se trouve le désert d'Atacama ?", "Which country contains the Atacama Desert?", "Chili", "Chile", ["Pérou", "Bolivie", "Argentine"], ["Peru", "Bolivia", "Argentina"]],
  ["Quel est le plus grand désert du monde ?", "Largest desert in the world?", "Antarctique", "Antarctic", ["Sahara", "Arctique", "Gobi"], ["Sahara", "Arctic", "Gobi"]],
  // Chaînes / déserts (3)
  ["Quelle chaîne traverse le Maroc et l'Algérie ?", "Which range crosses Morocco and Algeria?", "Atlas", "Atlas", ["Rif", "Pyrénées", "Hoggar"], ["Rif", "Pyrenees", "Hoggar"]],
  ["Quelle chaîne traverse l'Italie du nord au sud ?", "Which range runs north-south through Italy?", "Apennins", "Apennines", ["Alpes", "Dolomites", "Pyrénées"], ["Alps", "Dolomites", "Pyrenees"]],
  ["Quelle chaîne sépare l'Europe de l'Asie ?", "Which range separates Europe from Asia?", "Oural", "Urals", ["Caucase", "Carpates", "Balkans"], ["Caucasus", "Carpathians", "Balkans"]],
  // Records / divers (5)
  ["Quel pays a le plus de fuseaux horaires ?", "Country with the most time zones?", "France", "France", ["Russie", "États-Unis", "Chine"], ["Russia", "United States", "China"]],
  ["Quel pays compte le plus de pyramides ?", "Country with the most pyramids?", "Soudan", "Sudan", ["Égypte", "Mexique", "Pérou"], ["Egypt", "Mexico", "Peru"]],
  ["Quel pays compte le plus de lacs au monde ?", "Country with the most lakes?", "Canada", "Canada", ["Russie", "Finlande", "Suède"], ["Russia", "Finland", "Sweden"]],
  ["Quel pays a la plus longue frontière avec un seul autre pays ?", "Country with the longest single-country border?", "Canada", "Canada", ["Russie", "États-Unis", "Mongolie"], ["Russia", "United States", "Mongolia"]],
  ["Quel pays est totalement enclavé en Italie ?", "Which country is fully enclaved by Italy?", "Saint-Marin", "San Marino", ["Liechtenstein", "Monaco", "Andorre"], ["Liechtenstein", "Monaco", "Andorra"]],
  // Volcans / phénomènes (3)
  ["Quel volcan détruisit Pompéi ?", "Which volcano destroyed Pompeii?", "Vésuve", "Vesuvius", ["Etna", "Stromboli", "Vulcano"], ["Etna", "Stromboli", "Vulcano"]],
  ["Dans quel pays se trouve le mont Fuji ?", "Which country has Mount Fuji?", "Japon", "Japan", ["Chine", "Corée du Sud", "Vietnam"], ["China", "South Korea", "Vietnam"]],
  ["Sur quelle île se trouve l'Etna ?", "Which island has Mount Etna?", "Sicile", "Sicily", ["Corse", "Sardaigne", "Crète"], ["Corsica", "Sardinia", "Crete"]],
  // Compléments medium
  ["Quel fleuve marque la frontière entre la France et l'Allemagne ?", "Which river marks the France–Germany border?", "Rhin", "Rhine", ["Moselle", "Sarre", "Meuse"], ["Moselle", "Saar", "Meuse"]],
  ["Quel est le pays le plus peuplé d'Afrique ?", "Most populous country in Africa?", "Nigeria", "Nigeria", ["Éthiopie", "Égypte", "Afrique du Sud"], ["Ethiopia", "Egypt", "South Africa"]],
  ["Dans quel océan se trouvent les Maldives ?", "Which ocean contains the Maldives?", "Indien", "Indian", ["Pacifique", "Atlantique", "Arctique"], ["Pacific", "Atlantic", "Arctic"]],
];

/* ── Hard (Platine · 1800 ELO) ────────────────────────────────────── */
const hard: CuratedFact[] = [
  // Capitales spécialisées (8)
  ["Quelle est la capitale du Bhoutan ?", "Capital of Bhutan?", "Thimphou", "Thimphu", ["Paro", "Punakha", "Wangdue"], ["Paro", "Punakha", "Wangdue"]],
  ["Quelle est la capitale de la Lituanie ?", "Capital of Lithuania?", "Vilnius", "Vilnius", ["Kaunas", "Klaipėda", "Šiauliai"], ["Kaunas", "Klaipėda", "Šiauliai"]],
  ["Quelle est la capitale de la Lettonie ?", "Capital of Latvia?", "Riga", "Riga", ["Daugavpils", "Liepāja", "Jelgava"], ["Daugavpils", "Liepāja", "Jelgava"]],
  ["Quelle est la capitale de l'Estonie ?", "Capital of Estonia?", "Tallinn", "Tallinn", ["Tartu", "Narva", "Pärnu"], ["Tartu", "Narva", "Pärnu"]],
  ["Quelle est la capitale du Burkina Faso ?", "Capital of Burkina Faso?", "Ouagadougou", "Ouagadougou", ["Bobo-Dioulasso", "Koudougou", "Banfora"], ["Bobo-Dioulasso", "Koudougou", "Banfora"]],
  ["Quelle est la capitale du Tadjikistan ?", "Capital of Tajikistan?", "Douchanbé", "Dushanbe", ["Khoudjand", "Kulob", "Tursunzoda"], ["Khujand", "Kulob", "Tursunzoda"]],
  ["Quelle est la capitale de Madagascar ?", "Capital of Madagascar?", "Antananarivo", "Antananarivo", ["Toamasina", "Antsirabe", "Fianarantsoa"], ["Toamasina", "Antsirabe", "Fianarantsoa"]],
  ["Quelle est la capitale du Honduras ?", "Capital of Honduras?", "Tegucigalpa", "Tegucigalpa", ["San Pedro Sula", "La Ceiba", "Choluteca"], ["San Pedro Sula", "La Ceiba", "Choluteca"]],
  // Villes → pays (4)
  ["Dans quel pays se trouve Reykjavik ?", "In which country is Reykjavik?", "Islande", "Iceland", ["Norvège", "Groenland", "Féroé"], ["Norway", "Greenland", "Faroe Islands"]],
  ["Dans quel pays se trouve Yangon ?", "In which country is Yangon?", "Myanmar", "Myanmar", ["Thaïlande", "Cambodge", "Bangladesh"], ["Thailand", "Cambodia", "Bangladesh"]],
  ["Dans quel pays se trouve Quito ?", "In which country is Quito?", "Équateur", "Ecuador", ["Pérou", "Colombie", "Bolivie"], ["Peru", "Colombia", "Bolivia"]],
  ["Dans quel pays se trouve Asunción ?", "In which country is Asunción?", "Paraguay", "Paraguay", ["Uruguay", "Argentine", "Bolivie"], ["Uruguay", "Argentina", "Bolivia"]],
  // Fleuves (5)
  ["Quel est le plus long fleuve d'Europe ?", "Longest river in Europe?", "Volga", "Volga", ["Danube", "Rhin", "Don"], ["Danube", "Rhine", "Don"]],
  ["Quel fleuve forme les chutes Victoria ?", "Which river forms Victoria Falls?", "Zambèze", "Zambezi", ["Limpopo", "Congo", "Niger"], ["Limpopo", "Congo", "Niger"]],
  ["Quel fleuve traverse 6 pays d'Asie du Sud-Est ?", "Which river crosses 6 Southeast Asian countries?", "Mékong", "Mekong", ["Irrawaddy", "Salween", "Brahmapoutre"], ["Irrawaddy", "Salween", "Brahmaputra"]],
  ["Dans quel pays coule l'Indus ?", "In which country does the Indus flow?", "Pakistan", "Pakistan", ["Inde", "Afghanistan", "Bangladesh"], ["India", "Afghanistan", "Bangladesh"]],
  ["Quel fleuve sibérien se jette dans l'Arctique ?", "Which Siberian river empties into the Arctic?", "Ienisseï", "Yenisei", ["Gange", "Mékong", "Amour"], ["Ganges", "Mekong", "Amur"]],
  // Sommets (4)
  ["Quel est le plus haut sommet de l'Antarctique ?", "Highest mountain in Antarctica?", "Mont Vinson", "Mount Vinson", ["Mont Erebus", "Mont Sidley", "Mont Markham"], ["Mount Erebus", "Mount Sidley", "Mount Markham"]],
  ["Quel est le plus haut sommet d'Océanie ?", "Highest mountain in Oceania?", "Puncak Jaya", "Puncak Jaya", ["Mont Cook", "Mont Wilhelm", "Mont Kosciuszko"], ["Mount Cook", "Mount Wilhelm", "Mount Kosciuszko"]],
  ["Le K2 se situe à la frontière de quels pays ?", "K2 lies on the border of which countries?", "Pakistan et Chine", "Pakistan and China", ["Inde et Pakistan", "Népal et Chine", "Inde et Chine"], ["India and Pakistan", "Nepal and China", "India and China"]],
  ["Le mont Cook est dans quel pays ?", "Mount Cook is in which country?", "Nouvelle-Zélande", "New Zealand", ["Australie", "Canada", "Chili"], ["Australia", "Canada", "Chile"]],
  // Chaînes (3)
  ["Quelle chaîne sépare la Russie de la Géorgie ?", "Which range separates Russia from Georgia?", "Caucase", "Caucasus", ["Oural", "Carpates", "Pamir"], ["Urals", "Carpathians", "Pamir"]],
  ["Quelle chaîne traverse l'Afghanistan ?", "Which range crosses Afghanistan?", "Hindou Kouch", "Hindu Kush", ["Pamir", "Karakoram", "Tian Shan"], ["Pamir", "Karakoram", "Tian Shan"]],
  ["Quelle chaîne longe la côte est de l'Afrique du Sud ?", "Which range lines South Africa's east coast?", "Drakensberg", "Drakensberg", ["Rwenzori", "Atlas", "Aberdare"], ["Rwenzori", "Atlas", "Aberdare"]],
  // Lacs (3)
  ["Le lac Tonle Sap est dans quel pays ?", "Tonle Sap lake is in which country?", "Cambodge", "Cambodia", ["Vietnam", "Laos", "Thaïlande"], ["Vietnam", "Laos", "Thailand"]],
  ["Le lac Maracaibo est dans quel pays ?", "Lake Maracaibo is in which country?", "Venezuela", "Venezuela", ["Colombie", "Pérou", "Brésil"], ["Colombia", "Peru", "Brazil"]],
  ["Quelle est la mer entre le Kazakhstan et l'Ouzbékistan ?", "Sea between Kazakhstan and Uzbekistan?", "Mer d'Aral", "Aral Sea", ["Mer Caspienne", "Mer Noire", "Lac Balkhach"], ["Caspian Sea", "Black Sea", "Lake Balkhash"]],
  // Détroits (5)
  ["Le détroit de Béring sépare la Russie de quel territoire ?", "Bering Strait separates Russia from?", "Alaska", "Alaska", ["Japon", "Groenland", "Canada"], ["Japan", "Greenland", "Canada"]],
  ["Le détroit de Magellan sépare l'Argentine de quel pays ?", "Strait of Magellan lies between Argentina and?", "Chili", "Chile", ["Pérou", "Bolivie", "Antarctique"], ["Peru", "Bolivia", "Antarctica"]],
  ["Le détroit d'Ormuz sépare l'Iran et quel autre pays ?", "Strait of Hormuz lies between Iran and?", "Oman", "Oman", ["Émirats arabes unis", "Yémen", "Arabie saoudite"], ["United Arab Emirates", "Yemen", "Saudi Arabia"]],
  ["Le détroit de Malacca sépare la Malaisie de quelle île ?", "Strait of Malacca separates Malaysia from?", "Sumatra", "Sumatra", ["Bornéo", "Java", "Sulawesi"], ["Borneo", "Java", "Sulawesi"]],
  ["Le détroit de Bonifacio sépare la Corse de quelle île ?", "Strait of Bonifacio separates Corsica from?", "Sardaigne", "Sardinia", ["Sicile", "Crète", "Malte"], ["Sicily", "Crete", "Malta"]],
  // Iles / archipels (4)
  ["Quelle est la plus grande île du monde ?", "Largest island in the world?", "Groenland", "Greenland", ["Nouvelle-Guinée", "Bornéo", "Madagascar"], ["New Guinea", "Borneo", "Madagascar"]],
  ["Quel est le plus grand archipel du monde ?", "Largest archipelago in the world?", "Indonésie", "Indonesia", ["Philippines", "Japon", "Caraïbes"], ["Philippines", "Japan", "Caribbean"]],
  ["Trois pays se partagent l'île de Bornéo : lesquels ?", "Three countries share Borneo: which ones?", "Indonésie, Malaisie, Brunei", "Indonesia, Malaysia, Brunei", ["Indonésie, Philippines, Brunei", "Malaisie, Brunei, Singapour", "Indonésie, Malaisie, Vietnam"], ["Indonesia, Philippines, Brunei", "Malaysia, Brunei, Singapore", "Indonesia, Malaysia, Vietnam"]],
  ["Dans quelle mer se trouve Chypre ?", "Which sea contains Cyprus?", "Méditerranée", "Mediterranean", ["Mer Égée", "Mer Noire", "Mer Rouge"], ["Aegean Sea", "Black Sea", "Red Sea"]],
  // Volcans (3)
  ["Sur quelle île se situe le Krakatoa ?", "Which island has Krakatoa?", "Indonésie", "Indonesia", ["Philippines", "Japon", "Hawaï"], ["Philippines", "Japan", "Hawaii"]],
  ["Dans quel pays se trouve le mont Saint Helens ?", "Which country has Mount St. Helens?", "États-Unis", "United States", ["Canada", "Mexique", "Chili"], ["Canada", "Mexico", "Chile"]],
  ["Quel volcan est entré en éruption en 2010 paralysant le ciel européen ?", "Which volcano paralyzed European airspace in 2010?", "Eyjafjallajökull", "Eyjafjallajökull", ["Hekla", "Vésuve", "Etna"], ["Hekla", "Vesuvius", "Etna"]],
  // Records / divers (8)
  ["Quel est l'immeuble le plus haut du monde ?", "Tallest building in the world?", "Burj Khalifa", "Burj Khalifa", ["Tour Shanghai", "Tour de Tokyo", "Empire State Building"], ["Shanghai Tower", "Tokyo Tower", "Empire State Building"]],
  ["Quelle est la fosse marine la plus profonde ?", "Deepest oceanic trench?", "Mariannes", "Mariana", ["Tonga", "Kouriles", "Java"], ["Tonga", "Kuril", "Java"]],
  ["Quelle est la chute d'eau à pic la plus haute du monde ?", "World's tallest single-drop waterfall?", "Salto Angel", "Angel Falls", ["Iguazu", "Niagara", "Tugela"], ["Iguazu", "Niagara", "Tugela"]],
  ["Quel pays africain est totalement enclavé dans l'Afrique du Sud ?", "Which African country is enclaved within South Africa?", "Lesotho", "Lesotho", ["Eswatini", "Botswana", "Namibie"], ["Eswatini", "Botswana", "Namibia"]],
  ["Quel pays a deux capitales officielles dont Pretoria ?", "Which country has two capitals incl. Pretoria?", "Afrique du Sud", "South Africa", ["Bolivie", "Pays-Bas", "Sri Lanka"], ["Bolivia", "Netherlands", "Sri Lanka"]],
  ["Quel désert est le plus grand d'Asie ?", "Largest desert in Asia?", "Gobi", "Gobi", ["Karakoum", "Taklamakan", "Thar"], ["Karakum", "Taklamakan", "Thar"]],
  ["Dans quel pays se trouve le désert de Thar ?", "Which countries contain the Thar Desert?", "Inde et Pakistan", "India and Pakistan", ["Iran et Irak", "Inde et Bangladesh", "Pakistan et Afghanistan"], ["Iran and Iraq", "India and Bangladesh", "Pakistan and Afghanistan"]],
  ["Quel pays a la plus longue côte du monde ?", "Country with the longest coastline?", "Canada", "Canada", ["Russie", "Indonésie", "Australie"], ["Russia", "Indonesia", "Australia"]],
  // Compléments hard
  ["Quel canal traverse l'isthme grec à Corinthe ?", "Which canal cuts the Greek isthmus at Corinth?", "Canal de Corinthe", "Corinth Canal", ["Canal de Suez", "Canal de Panama", "Canal de Kiel"], ["Suez Canal", "Panama Canal", "Kiel Canal"]],
  ["Quel détroit sépare la Sicile de l'Italie continentale ?", "Which strait separates Sicily from mainland Italy?", "Détroit de Messine", "Strait of Messina", ["Détroit d'Otrante", "Canal de Sicile", "Détroit de Bonifacio"], ["Strait of Otranto", "Sicily Channel", "Strait of Bonifacio"]],
  ["Le mont Sinaï se trouve dans quel pays ?", "Mount Sinai is in which country?", "Égypte", "Egypt", ["Israël", "Jordanie", "Arabie saoudite"], ["Israel", "Jordan", "Saudi Arabia"]],
];

/* ── Expert (Diamant · 2200 ELO) ──────────────────────────────────── */
const expert: CuratedFact[] = [
  // Capitales pointues (8)
  ["Quelle est la capitale des Comores ?", "Capital of the Comoros?", "Moroni", "Moroni", ["Mutsamudu", "Fomboni", "Mitsamiouli"], ["Mutsamudu", "Fomboni", "Mitsamiouli"]],
  ["Quelle est la capitale de Tuvalu ?", "Capital of Tuvalu?", "Funafuti", "Funafuti", ["Vaiaku", "Nukufetau", "Niutao"], ["Vaiaku", "Nukufetau", "Niutao"]],
  ["Quelle est la capitale des Palaos ?", "Capital of Palau?", "Ngerulmud", "Ngerulmud", ["Koror", "Melekeok", "Airai"], ["Koror", "Melekeok", "Airai"]],
  ["Quelle est la capitale de Brunei ?", "Capital of Brunei?", "Bandar Seri Begawan", "Bandar Seri Begawan", ["Tutong", "Kuala Belait", "Seria"], ["Tutong", "Kuala Belait", "Seria"]],
  ["Quelle est la capitale du Vanuatu ?", "Capital of Vanuatu?", "Port-Vila", "Port Vila", ["Luganville", "Norsup", "Lakatoro"], ["Luganville", "Norsup", "Lakatoro"]],
  ["Quelle est la capitale du Cap-Vert ?", "Capital of Cape Verde?", "Praia", "Praia", ["Mindelo", "Santa Maria", "Espargos"], ["Mindelo", "Santa Maria", "Espargos"]],
  ["Quelle est la capitale de l'Érythrée ?", "Capital of Eritrea?", "Asmara", "Asmara", ["Massaoua", "Keren", "Mendefera"], ["Massawa", "Keren", "Mendefera"]],
  ["Quelle est la capitale du Soudan du Sud ?", "Capital of South Sudan?", "Djouba", "Juba", ["Wau", "Malakal", "Yei"], ["Wau", "Malakal", "Yei"]],
  // Villes / lieux pointus (4)
  ["Sur quelle île se trouve l'observatoire du Mauna Kea ?", "Which island hosts the Mauna Kea observatory?", "Hawaï (Big Island)", "Hawaii (Big Island)", ["Maui", "Oahu", "Kauai"], ["Maui", "Oahu", "Kauai"]],
  ["Dans quel archipel se trouve l'île de Pâques ?", "Which territory contains Easter Island?", "Chili", "Chile", ["Pérou", "Polynésie française", "Équateur"], ["Peru", "French Polynesia", "Ecuador"]],
  ["Dans quel pays se trouvent les Galápagos ?", "Which country owns the Galápagos?", "Équateur", "Ecuador", ["Pérou", "Chili", "Colombie"], ["Peru", "Chile", "Colombia"]],
  ["Dans quelle ville se trouve Stonehenge ?", "Which area contains Stonehenge?", "Wiltshire (Angleterre)", "Wiltshire (England)", ["Cornouailles", "Yorkshire", "Pays de Galles"], ["Cornwall", "Yorkshire", "Wales"]],
  // Fleuves (4)
  ["Quel est le plus long fleuve souterrain reconnu ?", "Longest known underground river?", "Sistema Sac Actun", "Sistema Sac Actun", ["Puerto Princesa", "Phong Nha", "Optymistychna"], ["Puerto Princesa", "Phong Nha", "Optymistychna"]],
  ["Quel fleuve russe se jette à l'embouchure la plus septentrionale ?", "Which Russian river has the northernmost mouth?", "Léna", "Lena", ["Ob", "Ienisseï", "Amour"], ["Ob", "Yenisei", "Amur"]],
  ["Le fleuve Niger se jette dans quel golfe ?", "The Niger River empties into which gulf?", "Golfe de Guinée", "Gulf of Guinea", ["Golfe d'Aden", "Golfe Persique", "Golfe du Bengale"], ["Gulf of Aden", "Persian Gulf", "Bay of Bengal"]],
  ["Le Brahmapoutre prend sa source dans quelle région ?", "Where does the Brahmaputra originate?", "Tibet", "Tibet", ["Cachemire", "Bhoutan", "Yunnan"], ["Kashmir", "Bhutan", "Yunnan"]],
  // Sommets / volcans (5)
  ["Quel est le plus haut volcan actif du monde ?", "Highest active volcano in the world?", "Ojos del Salado", "Ojos del Salado", ["Cotopaxi", "Llullaillaco", "Mauna Loa"], ["Cotopaxi", "Llullaillaco", "Mauna Loa"]],
  ["Quel est le volcan le plus volumineux du monde ?", "Most voluminous volcano in the world?", "Mauna Loa", "Mauna Loa", ["Etna", "Tambora", "Kilimandjaro"], ["Etna", "Tambora", "Kilimanjaro"]],
  ["Le volcan Sakurajima se trouve dans quel pays ?", "Sakurajima volcano is in which country?", "Japon", "Japan", ["Indonésie", "Philippines", "Russie"], ["Indonesia", "Philippines", "Russia"]],
  ["Quel est le sommet le plus haut du Caucase ?", "Highest peak in the Caucasus?", "Mont Elbrouz", "Mount Elbrus", ["Kazbek", "Chkhara", "Dykh-Tau"], ["Kazbek", "Shkhara", "Dykh-Tau"]],
  ["Quel est le plus haut sommet du Canada ?", "Highest mountain in Canada?", "Mont Logan", "Mount Logan", ["Mont Saint-Élie", "Mont Lucania", "Mont King"], ["Mount Saint Elias", "Mount Lucania", "Mount King"]],
  // Lacs / mers (4)
  ["Quel lac sous-glaciaire se trouve sous l'Antarctique ?", "Which subglacial lake lies beneath Antarctica?", "Lac Vostok", "Lake Vostok", ["Lac Whillans", "Lac Ellsworth", "Lac CECs"], ["Lake Whillans", "Lake Ellsworth", "Lake CECs"]],
  ["Quel est le plus haut lac navigable au monde ?", "World's highest navigable lake?", "Titicaca", "Titicaca", ["Namtso", "Tahoe", "Issyk-Koul"], ["Namtso", "Tahoe", "Issyk-Kul"]],
  ["Le lac Issyk-Koul se trouve dans quel pays ?", "Lake Issyk-Kul is in which country?", "Kirghizistan", "Kyrgyzstan", ["Kazakhstan", "Tadjikistan", "Ouzbékistan"], ["Kazakhstan", "Tajikistan", "Uzbekistan"]],
  ["Le lac Eyre se trouve dans quel pays ?", "Lake Eyre is in which country?", "Australie", "Australia", ["Nouvelle-Zélande", "Indonésie", "Papouasie"], ["New Zealand", "Indonesia", "Papua New Guinea"]],
  // Détroits / passages (4)
  ["Le détroit de Bab-el-Mandeb sépare le Yémen de quel pays ?", "Bab-el-Mandeb separates Yemen from?", "Djibouti", "Djibouti", ["Somalie", "Érythrée", "Arabie saoudite"], ["Somalia", "Eritrea", "Saudi Arabia"]],
  ["Le détroit de Bass sépare l'Australie de quelle île ?", "Bass Strait separates Australia from?", "Tasmanie", "Tasmania", ["Nouvelle-Zélande", "Nouvelle-Calédonie", "Java"], ["New Zealand", "New Caledonia", "Java"]],
  ["Le détroit de Cook sépare quelles îles néo-zélandaises ?", "Cook Strait separates which New Zealand islands?", "Île du Nord et île du Sud", "North and South Islands", ["Stewart et île du Sud", "Île du Nord et Stewart", "Chatham et île du Nord"], ["Stewart and South", "North and Stewart", "Chatham and North"]],
  ["Le passage du Nord-Ouest relie l'Atlantique à quel autre océan ?", "The Northwest Passage connects the Atlantic to?", "Pacifique", "Pacific", ["Indien", "Arctique", "Austral"], ["Indian", "Arctic", "Southern"]],
  // Iles (4)
  ["Quel territoire est l'île habitée la plus reculée du monde ?", "Most remote inhabited island in the world?", "Tristan da Cunha", "Tristan da Cunha", ["Île de Pâques", "Îles Pitcairn", "Sainte-Hélène"], ["Easter Island", "Pitcairn Islands", "Saint Helena"]],
  ["L'archipel du Spitzberg appartient à quel pays ?", "Which country owns Svalbard?", "Norvège", "Norway", ["Russie", "Islande", "Danemark"], ["Russia", "Iceland", "Denmark"]],
  ["Quel archipel britannique habité se trouve au milieu du Pacifique Sud ?", "Which inhabited British archipelago lies in the middle of the South Pacific?", "Îles Pitcairn", "Pitcairn Islands", ["Îles Cook", "Niue", "Norfolk"], ["Cook Islands", "Niue", "Norfolk Island"]],
  ["Quelle est la deuxième plus grande île du monde ?", "Second largest island in the world?", "Nouvelle-Guinée", "New Guinea", ["Bornéo", "Madagascar", "Sumatra"], ["Borneo", "Madagascar", "Sumatra"]],
  // Records / divers (9)
  ["Quel est le plus grand cratère d'impact sur Terre ?", "Largest impact crater on Earth?", "Vredefort", "Vredefort", ["Sudbury", "Chicxulub", "Popigai"], ["Sudbury", "Chicxulub", "Popigai"]],
  ["Quel pays abrite la deuxième plus grande forêt tropicale du monde ?", "Which country hosts the second-largest tropical rainforest?", "République démocratique du Congo", "Democratic Republic of the Congo", ["Indonésie", "Pérou", "Colombie"], ["Indonesia", "Peru", "Colombia"]],
  ["Quel est le plus grand pays sans accès à la mer ?", "Largest landlocked country?", "Kazakhstan", "Kazakhstan", ["Mongolie", "Bolivie", "Tchad"], ["Mongolia", "Bolivia", "Chad"]],
  ["Quel pays-archipel est traversé à la fois par l'équateur et la ligne de changement de date ?", "Which island nation straddles both the equator and the International Date Line?", "Kiribati", "Kiribati", ["Tuvalu", "Fidji", "Samoa"], ["Tuvalu", "Fiji", "Samoa"]],
  ["Le cap des Aiguilles se trouve dans quel pays ?", "Cape Agulhas is in which country?", "Afrique du Sud", "South Africa", ["Maroc", "Sénégal", "Namibie"], ["Morocco", "Senegal", "Namibia"]],
  ["Le cap Horn appartient à quel pays ?", "Which country owns Cape Horn?", "Chili", "Chile", ["Argentine", "Pérou", "Antarctique"], ["Argentina", "Peru", "Antarctica"]],
  ["Le cap Nord se trouve dans quel pays ?", "Cape North is in which country?", "Norvège", "Norway", ["Islande", "Russie", "Suède"], ["Iceland", "Russia", "Sweden"]],
  ["Quel est le désert le plus ancien du monde ?", "Oldest desert in the world?", "Namib", "Namib", ["Sahara", "Atacama", "Gobi"], ["Sahara", "Atacama", "Gobi"]],
  ["Quel chemin de fer atteint la plus haute altitude ?", "Highest railway in the world?", "Qinghai-Tibet", "Qinghai-Tibet", ["Trans-Andin", "Pérou Central", "Trans-Sibérien"], ["Trans-Andean", "Central Peru", "Trans-Siberian"]],
  // Coordonnées / climat (3)
  ["Quel pays est traversé par l'équateur en Amérique du Sud ?", "Which South American country sits on the equator?", "Équateur", "Ecuador", ["Colombie", "Pérou", "Brésil"], ["Colombia", "Peru", "Brazil"]],
  ["Quel pays africain est intégralement situé sous l'équateur ?", "Which African country lies entirely south of the equator?", "Zambie", "Zambia", ["Kenya", "Ouganda", "Soudan du Sud"], ["Kenya", "Uganda", "South Sudan"]],
  ["Le Tropique du Cancer passe par quel pays africain ?", "Which African country is crossed by the Tropic of Cancer?", "Algérie", "Algeria", ["Sénégal", "Soudan", "Kenya"], ["Senegal", "Sudan", "Kenya"]],
  // Fleuves / autres (3)
  ["Quel est le plus grand parc national d'Afrique ?", "Largest national park in Africa?", "Namib-Naukluft", "Namib-Naukluft", ["Kruger", "Serengeti", "Étosha"], ["Kruger", "Serengeti", "Etosha"]],
  ["Quel pays compte le plus de volcans actifs ?", "Country with the most active volcanoes?", "Indonésie", "Indonesia", ["Japon", "États-Unis", "Russie"], ["Japan", "United States", "Russia"]],
  ["Quel territoire est le moins densément peuplé au monde ?", "Least densely populated territory in the world?", "Groenland", "Greenland", ["Mongolie", "Namibie", "Australie"], ["Mongolia", "Namibia", "Australia"]],
  // Compléments expert
  ["Quelle est la 5e plus grande île du monde ?", "Fifth largest island in the world?", "Île de Baffin", "Baffin Island", ["Sumatra", "Honshu", "Grande-Bretagne"], ["Sumatra", "Honshu", "Great Britain"]],
  ["Quel pays compte le plus de glaciers en dehors des pôles ?", "Country with the most glaciers outside the poles?", "Pakistan", "Pakistan", ["Népal", "Argentine", "Chili"], ["Nepal", "Argentina", "Chile"]],
];

export const GEOGRAPHY_QUESTIONS = buildCuratedCategory(
  "geography",
  "geo",
  [easy, medium, hard, expert],
);
