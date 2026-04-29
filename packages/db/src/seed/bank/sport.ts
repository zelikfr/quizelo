import { buildCuratedCategory, type CuratedFact } from "./_builder";

/* ── Easy (Argent · 1000 ELO) ─────────────────────────────────────── */
const easy: CuratedFact[] = [
  // Football (12)
  ["Quel pays a remporté la Coupe du monde 1998 ?", "Who won the 1998 FIFA World Cup?", "France", "France", ["Brésil", "Italie", "Allemagne"], ["Brazil", "Italy", "Germany"]],
  ["Quel pays a remporté la Coupe du monde 2018 ?", "Who won the 2018 FIFA World Cup?", "France", "France", ["Croatie", "Belgique", "Brésil"], ["Croatia", "Belgium", "Brazil"]],
  ["Quel pays a remporté la Coupe du monde 2022 ?", "Who won the 2022 FIFA World Cup?", "Argentine", "Argentina", ["France", "Croatie", "Maroc"], ["France", "Croatia", "Morocco"]],
  ["Quel pays a remporté l'Euro 2024 ?", "Who won Euro 2024?", "Espagne", "Spain", ["Angleterre", "France", "Allemagne"], ["England", "France", "Germany"]],
  ["Combien de Ballons d'Or possède Lionel Messi en 2024 ?", "How many Ballons d'Or has Messi won by 2024?", "8", "8", ["6", "7", "9"], ["6", "7", "9"]],
  ["Combien de Ballons d'Or possède Cristiano Ronaldo ?", "How many Ballons d'Or has Cristiano Ronaldo won?", "5", "5", ["3", "4", "6"], ["3", "4", "6"]],
  ["Qui était le sélectionneur de la France en 2018 ?", "Who coached France at the 2018 World Cup?", "Didier Deschamps", "Didier Deschamps", ["Raymond Domenech", "Laurent Blanc", "Aimé Jacquet"], ["Raymond Domenech", "Laurent Blanc", "Aimé Jacquet"]],
  ["Quel club espagnol Lionel Messi a-t-il rejoint en 2004 ?", "Which Spanish club did Messi join in 2004?", "FC Barcelone", "FC Barcelona", ["Real Madrid", "Atlético Madrid", "Valence"], ["Real Madrid", "Atlético Madrid", "Valencia"]],
  ["Combien de joueurs sur le terrain dans une équipe de foot ?", "How many players on a football team on the pitch?", "11", "11", ["10", "12", "13"], ["10", "12", "13"]],
  ["Combien dure une mi-temps de foot ?", "Length of a half in football?", "45 minutes", "45 minutes", ["40 minutes", "30 minutes", "60 minutes"], ["40 minutes", "30 minutes", "60 minutes"]],
  ["Quel club anglais joue à Old Trafford ?", "Which English club plays at Old Trafford?", "Manchester United", "Manchester United", ["Liverpool", "Manchester City", "Arsenal"], ["Liverpool", "Manchester City", "Arsenal"]],
  ["Quel pays a inventé le football moderne ?", "Which country invented modern football?", "Angleterre", "England", ["Brésil", "Italie", "Espagne"], ["Brazil", "Italy", "Spain"]],
  // Tennis (5)
  ["Sur quelle surface se joue Roland-Garros ?", "On what surface is the French Open played?", "Terre battue", "Clay", ["Gazon", "Dur", "Moquette"], ["Grass", "Hard", "Carpet"]],
  ["Sur quelle surface se joue Wimbledon ?", "On what surface is Wimbledon played?", "Gazon", "Grass", ["Terre battue", "Dur", "Moquette"], ["Clay", "Hard", "Carpet"]],
  ["Sur quelle surface se joue l'US Open ?", "On what surface is the US Open played?", "Dur", "Hard", ["Gazon", "Terre battue", "Moquette"], ["Grass", "Clay", "Carpet"]],
  ["Combien de tournois du Grand Chelem en tennis ?", "How many Grand Slam tennis tournaments?", "4", "4", ["3", "5", "6"], ["3", "5", "6"]],
  ["Combien de sets gagnants pour remporter un Grand Chelem (hommes) ?", "Sets needed to win a men's Grand Slam match?", "3", "3", ["2", "4", "5"], ["2", "4", "5"]],
  // NBA (4)
  ["Combien de joueurs sur le terrain en NBA par équipe ?", "How many players on the court per NBA team?", "5", "5", ["4", "6", "7"], ["4", "6", "7"]],
  ["Combien de quart-temps dans un match NBA ?", "How many quarters in an NBA game?", "4", "4", ["2", "3", "5"], ["2", "3", "5"]],
  ["Quel joueur surnommé « His Airness » a remporté 6 titres NBA ?", "Which player nicknamed 'His Airness' won 6 NBA titles?", "Michael Jordan", "Michael Jordan", ["Kobe Bryant", "LeBron James", "Magic Johnson"], ["Kobe Bryant", "LeBron James", "Magic Johnson"]],
  ["Quel club NBA a remporté le plus de titres ?", "Which NBA team has won the most titles?", "Boston Celtics", "Boston Celtics", ["Lakers", "Bulls", "Warriors"], ["Lakers", "Bulls", "Warriors"]],
  // JO (4)
  ["Quelle ville accueille les JO d'été 2024 ?", "Host city of the 2024 Summer Olympics?", "Paris", "Paris", ["Los Angeles", "Tokyo", "Brisbane"], ["Los Angeles", "Tokyo", "Brisbane"]],
  ["Quelle ville a accueilli les JO d'été 2020 ?", "Host city of the 2020 Summer Olympics?", "Tokyo", "Tokyo", ["Pékin", "Paris", "Rio"], ["Beijing", "Paris", "Rio"]],
  ["Combien d'anneaux compte le drapeau olympique ?", "How many rings on the Olympic flag?", "5", "5", ["4", "6", "7"], ["4", "6", "7"]],
  ["Quel athlète possède le plus de médailles olympiques de l'histoire ?", "Most decorated Olympian of all time?", "Michael Phelps", "Michael Phelps", ["Usain Bolt", "Carl Lewis", "Larisa Latynina"], ["Usain Bolt", "Carl Lewis", "Larisa Latynina"]],
  // F1 (3)
  ["Combien de titres mondiaux possède Michael Schumacher ?", "How many F1 titles does Michael Schumacher have?", "7", "7", ["5", "6", "8"], ["5", "6", "8"]],
  ["Combien de titres mondiaux possède Lewis Hamilton ?", "How many F1 titles does Lewis Hamilton have?", "7", "7", ["5", "6", "8"], ["5", "6", "8"]],
  ["Quel circuit F1 historique se court à Monaco ?", "Which F1 circuit is run in Monaco?", "Monte-Carlo", "Monte Carlo", ["Spa-Francorchamps", "Silverstone", "Monza"], ["Spa-Francorchamps", "Silverstone", "Monza"]],
  // Rugby (2)
  ["Quel pays a remporté la Coupe du monde de rugby 2023 ?", "Who won the 2023 Rugby World Cup?", "Afrique du Sud", "South Africa", ["Nouvelle-Zélande", "Angleterre", "France"], ["New Zealand", "England", "France"]],
  ["Combien de joueurs en rugby à XV ?", "How many players in rugby union?", "15", "15", ["13", "11", "7"], ["13", "11", "7"]],
  // Boxe (2)
  ["Quel boxeur surnommé « The Greatest » est mort en 2016 ?", "Which boxer nicknamed 'The Greatest' died in 2016?", "Mohamed Ali", "Muhammad Ali", ["Mike Tyson", "Joe Frazier", "Floyd Mayweather"], ["Mike Tyson", "Joe Frazier", "Floyd Mayweather"]],
  ["Quel boxeur a affronté Mohamed Ali dans le « Combat du siècle » de 1971 ?", "Who fought Ali in the 1971 'Fight of the Century'?", "Joe Frazier", "Joe Frazier", ["George Foreman", "Sonny Liston", "Ken Norton"], ["George Foreman", "Sonny Liston", "Ken Norton"]],
  // Athlétisme / cyclisme (4)
  ["Quel sprinteur jamaïcain est triple champion olympique du 100m ?", "Which Jamaican sprinter won three Olympic 100m golds?", "Usain Bolt", "Usain Bolt", ["Yohan Blake", "Asafa Powell", "Justin Gatlin"], ["Yohan Blake", "Asafa Powell", "Justin Gatlin"]],
  ["Quelle distance fait un marathon ?", "How long is a marathon?", "42 km", "42 km", ["40 km", "45 km", "50 km"], ["40 km", "45 km", "50 km"]],
  ["Quelle est la course cycliste la plus prestigieuse au monde ?", "Most prestigious cycling race in the world?", "Tour de France", "Tour de France", ["Giro d'Italia", "Vuelta a España", "Paris-Roubaix"], ["Giro d'Italia", "Vuelta a España", "Paris-Roubaix"]],
  ["Combien de Tours de France a gagné Eddy Merckx ?", "How many Tour de France wins for Eddy Merckx?", "5", "5", ["4", "6", "7"], ["4", "6", "7"]],
  // Autres (4)
  ["Quel sport pratique-t-on à Wimbledon ?", "Which sport is played at Wimbledon?", "Tennis", "Tennis", ["Golf", "Cricket", "Rugby"], ["Golf", "Cricket", "Rugby"]],
  ["Combien de trous compte un parcours de golf classique ?", "How many holes on a standard golf course?", "18", "18", ["9", "16", "20"], ["9", "16", "20"]],
  ["Quel sport oppose deux équipes de 6 sur la glace ?", "Which sport pits two teams of 6 on ice?", "Hockey sur glace", "Ice hockey", ["Curling", "Patinage", "Bandy"], ["Curling", "Skating", "Bandy"]],
  ["Quel sport se joue avec une raquette et un volant ?", "Which sport uses a racket and a shuttlecock?", "Badminton", "Badminton", ["Tennis", "Squash", "Tennis de table"], ["Tennis", "Squash", "Table tennis"]],
  // Compléments easy (10)
  ["Combien de joueurs sur un terrain de basket NBA par équipe ?", "How many players on a basketball court per team?", "5", "5", ["4", "6", "7"], ["4", "6", "7"]],
  ["Combien de minutes dure un quart-temps NBA ?", "How long is an NBA quarter?", "12 minutes", "12 minutes", ["10 minutes", "15 minutes", "20 minutes"], ["10 minutes", "15 minutes", "20 minutes"]],
  ["Quel sport pratique Roger Federer ?", "Which sport does Roger Federer play?", "Tennis", "Tennis", ["Squash", "Badminton", "Tennis de table"], ["Squash", "Badminton", "Table tennis"]],
  ["Quel pays a inventé le tennis moderne ?", "Which country invented modern tennis?", "Royaume-Uni", "United Kingdom", ["France", "Italie", "États-Unis"], ["France", "Italy", "United States"]],
  ["Combien de joueurs sur un terrain de handball ?", "How many players on a handball court?", "7", "7", ["5", "6", "11"], ["5", "6", "11"]],
  ["Quel pays a inventé le judo ?", "Which country invented judo?", "Japon", "Japan", ["Chine", "Corée", "Mongolie"], ["China", "Korea", "Mongolia"]],
  ["Combien de cordes sur une raquette de tennis ?", "How many strings on a tennis racket?", "Variable (~16x19)", "Variable (~16x19)", ["8", "12", "20"], ["8", "12", "20"]],
  ["Quel sport oppose deux équipes avec une crosse et un palet sur la glace ?", "Which sport uses sticks and a puck on ice?", "Hockey sur glace", "Ice hockey", ["Curling", "Skeleton", "Patinage"], ["Curling", "Skeleton", "Skating"]],
  ["Quelle distance fait un sprint olympique court ?", "Length of the shortest Olympic sprint?", "100 mètres", "100 metres", ["50 mètres", "200 mètres", "400 mètres"], ["50 metres", "200 metres", "400 metres"]],
  ["Quel sport pratique Tony Parker ?", "Which sport does Tony Parker play?", "Basket", "Basketball", ["Football", "Tennis", "Handball"], ["Football", "Tennis", "Handball"]],
];

/* ── Medium (Or · 1400 ELO) ───────────────────────────────────────── */
const medium: CuratedFact[] = [
  // Football (12)
  ["Quel pays a remporté la Coupe du monde 1986 ?", "Who won the 1986 World Cup?", "Argentine", "Argentina", ["Brésil", "Italie", "Allemagne"], ["Brazil", "Italy", "Germany"]],
  ["Quel pays a remporté la Coupe du monde 2014 ?", "Who won the 2014 World Cup?", "Allemagne", "Germany", ["Argentine", "Pays-Bas", "Brésil"], ["Argentina", "Netherlands", "Brazil"]],
  ["Quel pays a remporté la Coupe du monde 2002 ?", "Who won the 2002 World Cup?", "Brésil", "Brazil", ["Allemagne", "Turquie", "Corée du Sud"], ["Germany", "Turkey", "South Korea"]],
  ["Combien de Coupes du monde le Brésil a-t-il remportées ?", "How many World Cups has Brazil won?", "5", "5", ["4", "6", "3"], ["4", "6", "3"]],
  ["Qui a marqué le but vainqueur en finale de Coupe du monde 1998 (1er but) ?", "Who scored France's first goal in the 1998 final?", "Zinedine Zidane", "Zinedine Zidane", ["Emmanuel Petit", "Marcel Desailly", "Lilian Thuram"], ["Emmanuel Petit", "Marcel Desailly", "Lilian Thuram"]],
  ["Quel club allemand a remporté la Ligue des champions en 2020 ?", "Which German club won the 2020 Champions League?", "Bayern Munich", "Bayern Munich", ["Borussia Dortmund", "RB Leipzig", "Schalke 04"], ["Borussia Dortmund", "RB Leipzig", "Schalke 04"]],
  ["Quel club détient le plus de Ligues des champions ?", "Which club has the most Champions League titles?", "Real Madrid", "Real Madrid", ["FC Barcelone", "Bayern Munich", "AC Milan"], ["FC Barcelona", "Bayern Munich", "AC Milan"]],
  ["Dans quel club Pelé a-t-il principalement joué ?", "Which club did Pelé mainly play for?", "Santos FC", "Santos FC", ["Cosmos de New York", "Flamengo", "Corinthians"], ["New York Cosmos", "Flamengo", "Corinthians"]],
  ["Qui est le meilleur buteur de la Coupe du monde 2018 ?", "Top scorer at the 2018 World Cup?", "Harry Kane", "Harry Kane", ["Cristiano Ronaldo", "Antoine Griezmann", "Romelu Lukaku"], ["Cristiano Ronaldo", "Antoine Griezmann", "Romelu Lukaku"]],
  ["Quel pays a accueilli la Coupe du monde 2002 ?", "Which country hosted the 2002 World Cup?", "Corée du Sud et Japon", "South Korea and Japan", ["Allemagne", "Brésil", "France"], ["Germany", "Brazil", "France"]],
  ["Quel club anglais a remporté la Premier League en 2020 ?", "Which English club won the 2020 Premier League?", "Liverpool", "Liverpool", ["Manchester City", "Manchester United", "Chelsea"], ["Manchester City", "Manchester United", "Chelsea"]],
  ["Quel pays a remporté la Copa America 2021 ?", "Who won the 2021 Copa America?", "Argentine", "Argentina", ["Brésil", "Uruguay", "Colombie"], ["Brazil", "Uruguay", "Colombia"]],
  // Tennis (6)
  ["Combien de Roland-Garros possède Rafael Nadal ?", "How many French Opens has Rafael Nadal won?", "14", "14", ["10", "12", "16"], ["10", "12", "16"]],
  ["Combien de Wimbledon possède Roger Federer ?", "How many Wimbledon titles does Roger Federer have?", "8", "8", ["6", "7", "9"], ["6", "7", "9"]],
  ["Combien de Grand Chelems en simple Serena Williams a-t-elle remportés ?", "How many singles Slams has Serena Williams won?", "23", "23", ["20", "22", "24"], ["20", "22", "24"]],
  ["Quel tournoi est le premier Grand Chelem de la saison ?", "Which Slam opens the tennis season?", "Open d'Australie", "Australian Open", ["Roland-Garros", "Wimbledon", "US Open"], ["French Open", "Wimbledon", "US Open"]],
  ["Quel joueur détient le record de Grand Chelems en simple hommes ?", "Which man holds the record for men's singles Slams?", "Novak Djokovic", "Novak Djokovic", ["Rafael Nadal", "Roger Federer", "Pete Sampras"], ["Rafael Nadal", "Roger Federer", "Pete Sampras"]],
  ["Combien de Grand Chelems Steffi Graf a-t-elle gagnés ?", "How many Slams did Steffi Graf win?", "22", "22", ["18", "20", "24"], ["18", "20", "24"]],
  // NBA / basket (5)
  ["Combien de titres NBA Bill Russell a-t-il remportés ?", "How many NBA titles did Bill Russell win?", "11", "11", ["6", "8", "9"], ["6", "8", "9"]],
  ["Quel joueur a inscrit 100 points en un match NBA en 1962 ?", "Who scored 100 points in an NBA game in 1962?", "Wilt Chamberlain", "Wilt Chamberlain", ["Bill Russell", "Kareem Abdul-Jabbar", "Michael Jordan"], ["Bill Russell", "Kareem Abdul-Jabbar", "Michael Jordan"]],
  ["Quel joueur détient le record de points en carrière NBA ?", "All-time NBA scoring leader?", "LeBron James", "LeBron James", ["Kareem Abdul-Jabbar", "Karl Malone", "Kobe Bryant"], ["Kareem Abdul-Jabbar", "Karl Malone", "Kobe Bryant"]],
  ["Combien de titres NBA Magic Johnson a-t-il remportés avec les Lakers ?", "How many NBA titles did Magic Johnson win with the Lakers?", "5", "5", ["3", "4", "6"], ["3", "4", "6"]],
  ["Quel joueur des Bulls a remporté 6 MVP des Finales ?", "Which Bulls player won 6 Finals MVP awards?", "Michael Jordan", "Michael Jordan", ["Scottie Pippen", "Dennis Rodman", "Toni Kukoč"], ["Scottie Pippen", "Dennis Rodman", "Toni Kukoč"]],
  // JO (5)
  ["Quelle ville a accueilli les JO d'été 2016 ?", "Host city of the 2016 Summer Olympics?", "Rio de Janeiro", "Rio de Janeiro", ["Pékin", "Tokyo", "Londres"], ["Beijing", "Tokyo", "London"]],
  ["Quelle ville a accueilli les JO d'hiver 2022 ?", "Host city of the 2022 Winter Olympics?", "Pékin", "Beijing", ["Pyeongchang", "Sotchi", "Vancouver"], ["Pyeongchang", "Sochi", "Vancouver"]],
  ["Combien de médailles d'or a Michael Phelps remportées en carrière ?", "How many Olympic gold medals does Michael Phelps have?", "23", "23", ["18", "20", "25"], ["18", "20", "25"]],
  ["Quel pays a remporté le plus de médailles aux JO de Tokyo 2020 ?", "Which country won the most medals at Tokyo 2020?", "États-Unis", "United States", ["Chine", "Japon", "Russie"], ["China", "Japan", "Russia"]],
  ["En quelle année les JO modernes ont-ils été relancés ?", "When were the modern Olympics revived?", "1896", "1896", ["1900", "1888", "1912"], ["1900", "1888", "1912"]],
  // F1 / cyclisme / autres (8)
  ["Quel pilote a remporté le championnat F1 2024 ?", "Who won the 2024 F1 championship?", "Max Verstappen", "Max Verstappen", ["Lewis Hamilton", "Charles Leclerc", "Lando Norris"], ["Lewis Hamilton", "Charles Leclerc", "Lando Norris"]],
  ["Combien de Tours de France Lance Armstrong avait-il remportés (avant déchéance) ?", "How many Tour de France wins by Armstrong (before stripping)?", "7", "7", ["5", "6", "8"], ["5", "6", "8"]],
  ["Combien de joueurs sur un terrain de baseball par équipe ?", "How many players on a baseball team in defense?", "9", "9", ["7", "10", "11"], ["7", "10", "11"]],
  ["Quel pays a inventé le baseball ?", "Which country invented baseball?", "États-Unis", "United States", ["Royaume-Uni", "Cuba", "Canada"], ["United Kingdom", "Cuba", "Canada"]],
  ["Quel sport pratique Tiger Woods ?", "Which sport does Tiger Woods play?", "Golf", "Golf", ["Tennis", "Cricket", "Hockey"], ["Tennis", "Cricket", "Hockey"]],
  ["Quel sport oppose deux équipes de 7 avec un ballon et un but ?", "Which 7-a-side ball-and-goal sport?", "Handball", "Handball", ["Water-polo", "Hockey", "Crosse"], ["Water polo", "Hockey", "Lacrosse"]],
  ["Combien de joueurs sur le terrain au volley-ball ?", "How many players on a volleyball court?", "6", "6", ["4", "5", "7"], ["4", "5", "7"]],
  ["Quel pays a remporté le plus de Coupes du monde de football ?", "Country with the most FIFA World Cup wins?", "Brésil", "Brazil", ["Allemagne", "Italie", "Argentine"], ["Germany", "Italy", "Argentina"]],
  // Records / autres (14)
  ["Quel record du 100m haies (femmes) appartient à Tobi Amusan ?", "Who holds the women's 100m hurdles WR (Tobi Amusan)?", "Tobi Amusan", "Tobi Amusan", ["Yordanka Donkova", "Kendra Harrison", "Sally Pearson"], ["Yordanka Donkova", "Kendra Harrison", "Sally Pearson"]],
  ["Qui détient le record du monde du 100m hommes (9.58) ?", "Men's 100m WR holder (9.58)?", "Usain Bolt", "Usain Bolt", ["Tyson Gay", "Yohan Blake", "Justin Gatlin"], ["Tyson Gay", "Yohan Blake", "Justin Gatlin"]],
  ["Qui détient le record du marathon hommes (sub-2h) ?", "Men's marathon WR holder?", "Kelvin Kiptum", "Kelvin Kiptum", ["Eliud Kipchoge", "Kenenisa Bekele", "Wilson Kipsang"], ["Eliud Kipchoge", "Kenenisa Bekele", "Wilson Kipsang"]],
  ["Quel boxeur a battu Mohamed Ali à Manille ?", "Who beat Ali in the 'Thrilla in Manila'?", "Personne — Ali a gagné", "No one — Ali won", ["Joe Frazier", "George Foreman", "Sonny Liston"], ["Joe Frazier", "George Foreman", "Sonny Liston"]],
  ["Quel sport pratique Phil Mickelson ?", "What sport does Phil Mickelson play?", "Golf", "Golf", ["Tennis", "Bowling", "Snooker"], ["Tennis", "Bowling", "Snooker"]],
  ["Quel championnat a remporté Toulouse en rugby en 2024 ?", "Which 2024 rugby title did Toulouse win?", "Top 14", "Top 14", ["Champions Cup", "Six Nations", "Pro D2"], ["Champions Cup", "Six Nations", "Pro D2"]],
  ["Quelle équipe française a gagné la Champions Cup de rugby 2024 ?", "Which French team won the 2024 Rugby Champions Cup?", "Toulouse", "Toulouse", ["La Rochelle", "Clermont", "Toulon"], ["La Rochelle", "Clermont", "Toulon"]],
  ["Quel pays a inventé le rugby ?", "Which country invented rugby?", "Angleterre", "England", ["Pays de Galles", "Irlande", "Écosse"], ["Wales", "Ireland", "Scotland"]],
  ["Combien de coureurs au départ d'un Tour de France typique ?", "Typical number of riders at Tour de France start?", "176", "176", ["150", "200", "120"], ["150", "200", "120"]],
  ["Quel sport est appelé « le roi des sports » au Brésil ?", "Which sport is 'the king' in Brazil?", "Football", "Football", ["Volley", "Basket", "Capoeira"], ["Volleyball", "Basketball", "Capoeira"]],
  ["Quel championnat est remporté chaque année à Indianapolis ?", "Which annual race is run at Indianapolis?", "Indy 500", "Indy 500", ["NASCAR Daytona", "F1 USA GP", "Formule E"], ["NASCAR Daytona", "F1 USA GP", "Formula E"]],
  ["Quel pays a remporté la Coupe Davis 2023 ?", "Who won the 2023 Davis Cup?", "Italie", "Italy", ["Australie", "Espagne", "Allemagne"], ["Australia", "Spain", "Germany"]],
  ["Quel pays détient le record de Coupes Davis ?", "Which country has the most Davis Cup titles?", "États-Unis", "United States", ["Australie", "France", "Espagne"], ["Australia", "France", "Spain"]],
  ["Quel sport voit le champion s'appelle « Yokozuna » ?", "Which sport's grand champion is called 'Yokozuna'?", "Sumo", "Sumo", ["Judo", "Karaté", "Aïkido"], ["Judo", "Karate", "Aikido"]],
];

/* ── Hard (Platine · 1800 ELO) ────────────────────────────────────── */
const hard: CuratedFact[] = [
  // Football (10)
  ["Quel pays a remporté la Coupe du monde 1958 (1ère du Brésil) ?", "Who won the 1958 World Cup (Brazil's first)?", "Brésil", "Brazil", ["Suède", "Allemagne de l'Ouest", "France"], ["Sweden", "West Germany", "France"]],
  ["Qui a marqué la « main de Dieu » en 1986 ?", "Who scored the 'Hand of God' goal in 1986?", "Diego Maradona", "Diego Maradona", ["Lionel Messi", "Mario Kempes", "Daniel Passarella"], ["Lionel Messi", "Mario Kempes", "Daniel Passarella"]],
  ["Quel club a remporté la première Coupe d'Europe des clubs champions (1956) ?", "Who won the first European Cup (1956)?", "Real Madrid", "Real Madrid", ["Stade de Reims", "Benfica", "AC Milan"], ["Stade de Reims", "Benfica", "AC Milan"]],
  ["Quel club hollandais a dominé la C1 dans les années 1970 ?", "Which Dutch club dominated the European Cup in the 70s?", "Ajax", "Ajax", ["PSV Eindhoven", "Feyenoord", "AZ Alkmaar"], ["PSV Eindhoven", "Feyenoord", "AZ Alkmaar"]],
  ["Quel attaquant brésilien fut surnommé « le Phénomène » ?", "Which Brazilian striker was nicknamed 'The Phenomenon'?", "Ronaldo (Nazário)", "Ronaldo (Nazário)", ["Romário", "Rivaldo", "Ronaldinho"], ["Romário", "Rivaldo", "Ronaldinho"]],
  ["En quelle année la France a-t-elle remporté l'Euro pour la première fois ?", "When did France first win the Euro?", "1984", "1984", ["1976", "1988", "2000"], ["1976", "1988", "2000"]],
  ["Quel club anglais a remporté la C1 en 2005 (remontada à Istanbul) ?", "Which English club won the 2005 UCL (Istanbul comeback)?", "Liverpool", "Liverpool", ["Manchester United", "Chelsea", "Arsenal"], ["Manchester United", "Chelsea", "Arsenal"]],
  ["Quel club portugais a remporté la C1 en 2004 ?", "Which Portuguese club won the 2004 UCL?", "Porto", "Porto", ["Benfica", "Sporting CP", "Boavista"], ["Benfica", "Sporting CP", "Boavista"]],
  ["Quel pays africain a atteint les demi-finales de la Coupe du monde 2022 ?", "Which African country reached the 2022 World Cup semifinals?", "Maroc", "Morocco", ["Sénégal", "Cameroun", "Ghana"], ["Senegal", "Cameroon", "Ghana"]],
  ["Combien de Ligues des champions le Real Madrid a-t-il gagnées ?", "How many UCL titles has Real Madrid won?", "15", "15", ["12", "13", "14"], ["12", "13", "14"]],
  // Tennis (6)
  ["Quel joueur a remporté un Grand Chelem calendaire en 1969 ?", "Who completed a calendar Grand Slam in 1969 (men)?", "Rod Laver", "Rod Laver", ["Don Budge", "Roy Emerson", "John Newcombe"], ["Don Budge", "Roy Emerson", "John Newcombe"]],
  ["Quelle joueuse a complété un Grand Chelem calendaire en 1988 ?", "Which woman completed a calendar Grand Slam in 1988?", "Steffi Graf", "Steffi Graf", ["Martina Navratilova", "Chris Evert", "Monica Seles"], ["Martina Navratilova", "Chris Evert", "Monica Seles"]],
  ["Combien de Roland-Garros Björn Borg a-t-il remportés ?", "How many French Opens did Björn Borg win?", "6", "6", ["4", "5", "7"], ["4", "5", "7"]],
  ["Quel joueur a battu Federer en finale de Roland-Garros 2008 ?", "Who beat Federer in the 2008 French Open final?", "Rafael Nadal", "Rafael Nadal", ["Novak Djokovic", "Andy Murray", "David Nalbandian"], ["Novak Djokovic", "Andy Murray", "David Nalbandian"]],
  ["Quel pays a remporté la Fed Cup le plus souvent ?", "Most successful country in the Fed Cup / BJK Cup?", "États-Unis", "United States", ["République tchèque", "Australie", "Russie"], ["Czech Republic", "Australia", "Russia"]],
  ["Combien de Grand Chelems Margaret Court a-t-elle remportés en simple ?", "How many singles Slams did Margaret Court win?", "24", "24", ["20", "22", "23"], ["20", "22", "23"]],
  // NBA (5)
  ["Combien de MVP de saison Michael Jordan a-t-il remportés ?", "How many regular-season MVPs did Jordan win?", "5", "5", ["3", "4", "6"], ["3", "4", "6"]],
  ["Combien de MVP a remporté Kareem Abdul-Jabbar ?", "How many MVPs did Kareem Abdul-Jabbar win?", "6", "6", ["4", "5", "7"], ["4", "5", "7"]],
  ["Quel joueur des Lakers est mort en 2020 dans un accident ?", "Which Lakers icon died in a 2020 accident?", "Kobe Bryant", "Kobe Bryant", ["Magic Johnson", "Shaquille O'Neal", "Pau Gasol"], ["Magic Johnson", "Shaquille O'Neal", "Pau Gasol"]],
  ["Quelle équipe a remporté le titre NBA en 2024 ?", "Which team won the 2024 NBA championship?", "Boston Celtics", "Boston Celtics", ["Denver Nuggets", "Dallas Mavericks", "Miami Heat"], ["Denver Nuggets", "Dallas Mavericks", "Miami Heat"]],
  ["Quel franco-allemand a été MVP NBA en 2023 et 2024 ?", "Which French-German player won MVP in 2023 and 2024?", "Joel Embiid (2023) puis Nikola Jokić (2024)", "Joel Embiid (2023) then Nikola Jokić (2024)", ["Giannis Antetokounmpo", "Luka Dončić", "Stephen Curry"], ["Giannis Antetokounmpo", "Luka Dončić", "Stephen Curry"]],
  // JO (5)
  ["Quel pays a remporté le plus de médailles d'or aux JO de Pékin 2008 ?", "Which country topped the 2008 Beijing gold-medal table?", "Chine", "China", ["États-Unis", "Russie", "Royaume-Uni"], ["United States", "Russia", "United Kingdom"]],
  ["Quel pays a accueilli les JO d'hiver 2018 ?", "Host of the 2018 Winter Olympics?", "Corée du Sud (Pyeongchang)", "South Korea (Pyeongchang)", ["Japon", "Russie", "Canada"], ["Japan", "Russia", "Canada"]],
  ["Quelle gymnaste américaine a marqué les JO 2016 ?", "Which US gymnast dominated Rio 2016?", "Simone Biles", "Simone Biles", ["Gabby Douglas", "Aly Raisman", "Laurie Hernandez"], ["Gabby Douglas", "Aly Raisman", "Laurie Hernandez"]],
  ["En quelle année les JO d'hiver de Sotchi ont-ils eu lieu ?", "Year of the Sochi Winter Olympics?", "2014", "2014", ["2010", "2012", "2018"], ["2010", "2012", "2018"]],
  ["Quel sport a fait son retour olympique à Tokyo 2020 ?", "Which sport returned to the Olympics at Tokyo 2020?", "Baseball/softball", "Baseball/softball", ["Cricket", "Squash", "Bowling"], ["Cricket", "Squash", "Bowling"]],
  // F1 (4)
  ["Quel pilote brésilien est mort à Imola en 1994 ?", "Which Brazilian F1 driver died at Imola in 1994?", "Ayrton Senna", "Ayrton Senna", ["Roland Ratzenberger", "Nelson Piquet", "Rubens Barrichello"], ["Roland Ratzenberger", "Nelson Piquet", "Rubens Barrichello"]],
  ["Combien de titres mondiaux Alain Prost a-t-il remportés ?", "How many F1 titles did Alain Prost win?", "4", "4", ["3", "5", "2"], ["3", "5", "2"]],
  ["Quel constructeur F1 italien règne historiquement à Monza ?", "Which Italian F1 maker dominates historically at Monza?", "Ferrari", "Ferrari", ["Lamborghini", "Maserati", "Alfa Romeo"], ["Lamborghini", "Maserati", "Alfa Romeo"]],
  ["Quel pilote a remporté son 1er titre F1 à 22 ans (record) ?", "Youngest F1 champion (22 years old)?", "Sebastian Vettel", "Sebastian Vettel", ["Lewis Hamilton", "Max Verstappen", "Fernando Alonso"], ["Lewis Hamilton", "Max Verstappen", "Fernando Alonso"]],
  // Cyclisme / athlétisme (4)
  ["Quel cycliste belge a remporté 5 Tours de France ?", "Which Belgian cyclist won 5 Tours de France?", "Eddy Merckx", "Eddy Merckx", ["Tom Boonen", "Philippe Gilbert", "Roger De Vlaeminck"], ["Tom Boonen", "Philippe Gilbert", "Roger De Vlaeminck"]],
  ["Quel cycliste français a remporté 5 Tours de France ?", "Which French cyclist won 5 Tours de France?", "Bernard Hinault", "Bernard Hinault", ["Jacques Anquetil", "Laurent Fignon", "Bernard Thévenet"], ["Jacques Anquetil", "Laurent Fignon", "Bernard Thévenet"]],
  ["Qui détient le record du saut en longueur (8m95) ?", "Who holds the long-jump WR (8.95m)?", "Mike Powell", "Mike Powell", ["Carl Lewis", "Bob Beamon", "Iván Pedroso"], ["Carl Lewis", "Bob Beamon", "Iván Pedroso"]],
  ["Qui détient le record du saut à la perche hommes ?", "Men's pole vault WR holder?", "Armand Duplantis", "Armand Duplantis", ["Sergueï Bubka", "Renaud Lavillenie", "Sam Kendricks"], ["Sergei Bubka", "Renaud Lavillenie", "Sam Kendricks"]],
  // Rugby / autres (8)
  ["Quel pays a remporté le plus de Coupes du monde de rugby ?", "Country with the most Rugby World Cups?", "Afrique du Sud et Nouvelle-Zélande", "South Africa and New Zealand", ["Australie", "Angleterre", "France"], ["Australia", "England", "France"]],
  ["En quelle année a été créée la Coupe du monde de rugby ?", "When was the Rugby World Cup founded?", "1987", "1987", ["1991", "1979", "1995"], ["1991", "1979", "1995"]],
  ["Quel boxeur a affronté Foreman dans le « Rumble in the Jungle » 1974 ?", "Who fought Foreman in the 1974 'Rumble in the Jungle'?", "Mohamed Ali", "Muhammad Ali", ["Joe Frazier", "Ken Norton", "Larry Holmes"], ["Joe Frazier", "Ken Norton", "Larry Holmes"]],
  ["Quelle nageuse hongroise a inventé le surnom « Iron Lady » des bassins ?", "Which Hungarian swimmer is called the 'Iron Lady'?", "Katinka Hosszú", "Katinka Hosszú", ["Krisztina Egerszegi", "Yana Klochkova", "Federica Pellegrini"], ["Krisztina Egerszegi", "Yana Klochkova", "Federica Pellegrini"]],
  ["Quel pays a inventé le judo moderne ?", "Which country invented modern judo?", "Japon", "Japan", ["Chine", "Corée", "Mongolie"], ["China", "Korea", "Mongolia"]],
  ["Qui a fondé le judo en 1882 ?", "Who founded judo in 1882?", "Jigorō Kanō", "Jigorō Kanō", ["Morihei Ueshiba", "Mas Oyama", "Gichin Funakoshi"], ["Morihei Ueshiba", "Mas Oyama", "Gichin Funakoshi"]],
  ["Quel sport oppose deux équipes glissant des pierres sur la glace ?", "Which sport involves sliding stones on ice?", "Curling", "Curling", ["Hockey", "Patinage", "Skeleton"], ["Hockey", "Skating", "Skeleton"]],
  ["Quel pays a remporté la Coupe d'Asie de football 2023 ?", "Who won the 2023 AFC Asian Cup?", "Qatar", "Qatar", ["Japon", "Arabie saoudite", "Iran"], ["Japan", "Saudi Arabia", "Iran"]],
  // Compléments hard (8)
  ["Quel pays a remporté la Coupe du monde 2010 ?", "Who won the 2010 World Cup?", "Espagne", "Spain", ["Pays-Bas", "Allemagne", "Uruguay"], ["Netherlands", "Germany", "Uruguay"]],
  ["Quel pays a remporté la Coupe du monde 2006 ?", "Who won the 2006 World Cup?", "Italie", "Italy", ["France", "Allemagne", "Brésil"], ["France", "Germany", "Brazil"]],
  ["Quel rugbyman néo-zélandais est légende du XV mondial dans les années 1995 ?", "Which NZ rugby legend rose in the 1995 RWC?", "Jonah Lomu", "Jonah Lomu", ["Dan Carter", "Richie McCaw", "Sean Fitzpatrick"], ["Dan Carter", "Richie McCaw", "Sean Fitzpatrick"]],
  ["Combien de Top 14 le Stade toulousain a-t-il remportés ?", "How many Top 14 titles has Stade Toulousain won?", "23", "23", ["18", "20", "25"], ["18", "20", "25"]],
  ["Quelle nageuse française a remporté l'or au 50m nage libre 2008 ?", "Which French swimmer won 50m free gold in 2008?", "Personne — c'est Britta Steffen (DE)", "No one — Britta Steffen (DE) won", ["Laure Manaudou", "Camille Muffat", "Charlotte Bonnet"], ["Laure Manaudou", "Camille Muffat", "Charlotte Bonnet"]],
  ["Quel cycliste a remporté Paris-Roubaix le plus de fois ?", "Most Paris-Roubaix wins?", "Roger De Vlaeminck et Tom Boonen", "Roger De Vlaeminck and Tom Boonen", ["Eddy Merckx", "Fabian Cancellara", "Sean Kelly"], ["Eddy Merckx", "Fabian Cancellara", "Sean Kelly"]],
  ["Quel boxeur ukrainien a unifié les ceintures lourds en 2024 ?", "Which Ukrainian unified heavyweight titles in 2024?", "Oleksandr Usyk", "Oleksandr Usyk", ["Vasyl Lomachenko", "Wladimir Klitschko", "Tyson Fury"], ["Vasyl Lomachenko", "Wladimir Klitschko", "Tyson Fury"]],
  ["Quel sport oppose deux équipes de 4 sur la glace avec balais et pierres ?", "Which 4-a-side sport with brooms and stones?", "Curling", "Curling", ["Hockey", "Ringuette", "Bandy"], ["Hockey", "Ringette", "Bandy"]],
];

/* ── Expert (Diamant · 2200 ELO) ──────────────────────────────────── */
const expert: CuratedFact[] = [
  // Football (10)
  ["Quel club uruguayen a remporté la première Copa Libertadores en 1960 ?", "Which Uruguayan club won the first Copa Libertadores (1960)?", "Peñarol", "Peñarol", ["Nacional", "Independiente", "River Plate"], ["Nacional", "Independiente", "River Plate"]],
  ["Quel pays a remporté la Coupe du monde 1934 ?", "Who won the 1934 World Cup?", "Italie", "Italy", ["Tchécoslovaquie", "Allemagne", "Brésil"], ["Czechoslovakia", "Germany", "Brazil"]],
  ["Quel pays a remporté la Coupe du monde 1930 (1ère édition) ?", "Who won the very first World Cup in 1930?", "Uruguay", "Uruguay", ["Argentine", "États-Unis", "Yougoslavie"], ["Argentina", "United States", "Yugoslavia"]],
  ["Quel club anglais a remporté la C1 en 1968 (1er club anglais) ?", "First English club to win the European Cup (1968)?", "Manchester United", "Manchester United", ["Liverpool", "Aston Villa", "Nottingham Forest"], ["Liverpool", "Aston Villa", "Nottingham Forest"]],
  ["Quel club de Bucarest a remporté la C1 en 1986 ?", "Which Bucharest club won the 1986 European Cup?", "Steaua Bucarest", "Steaua Bucharest", ["Dinamo Bucarest", "Rapid Bucarest", "FCSB"], ["Dinamo Bucharest", "Rapid Bucharest", "FCSB"]],
  ["Quel club français a perdu la finale de C1 en 2020 ?", "Which French club lost the 2020 UCL final?", "Paris Saint-Germain", "Paris Saint-Germain", ["Lyon", "Marseille", "Monaco"], ["Lyon", "Marseille", "Monaco"]],
  ["Qui était le premier vainqueur du Ballon d'Or en 1956 ?", "Who won the first Ballon d'Or in 1956?", "Stanley Matthews", "Stanley Matthews", ["Alfredo Di Stéfano", "Raymond Kopa", "Lev Yashine"], ["Alfredo Di Stéfano", "Raymond Kopa", "Lev Yashin"]],
  ["Qui est le seul gardien à avoir remporté le Ballon d'Or ?", "Only goalkeeper to win the Ballon d'Or?", "Lev Yachine", "Lev Yashin", ["Iker Casillas", "Gianluigi Buffon", "Manuel Neuer"], ["Iker Casillas", "Gianluigi Buffon", "Manuel Neuer"]],
  ["Quel attaquant hongrois a marqué l'histoire du Real Madrid des années 1950 ?", "Which Hungarian striker starred for 1950s Real Madrid?", "Ferenc Puskás", "Ferenc Puskás", ["Sándor Kocsis", "Nándor Hidegkuti", "Gyula Grosics"], ["Sándor Kocsis", "Nándor Hidegkuti", "Gyula Grosics"]],
  ["Quel sélectionneur allemand a remporté la Coupe du monde 2014 ?", "Which German coach won the 2014 World Cup?", "Joachim Löw", "Joachim Löw", ["Jürgen Klinsmann", "Hansi Flick", "Rudi Völler"], ["Jürgen Klinsmann", "Hansi Flick", "Rudi Völler"]],
  // Tennis (6)
  ["Quel joueur australien a remporté 12 Grand Chelems dans les années 60 ?", "Which Australian won 12 Slams in the 60s?", "Roy Emerson", "Roy Emerson", ["Ken Rosewall", "Lew Hoad", "John Newcombe"], ["Ken Rosewall", "Lew Hoad", "John Newcombe"]],
  ["Qui a remporté le Grand Chelem en double mixte plus de 10 fois ?", "Most mixed-doubles Slam wins in history?", "Margaret Court", "Margaret Court", ["Martina Navratilova", "Pam Shriver", "Billie Jean King"], ["Martina Navratilova", "Pam Shriver", "Billie Jean King"]],
  ["Quel joueur français a remporté Roland-Garros en 1983 ?", "Which Frenchman won the 1983 French Open?", "Yannick Noah", "Yannick Noah", ["Henri Leconte", "Guy Forget", "Cédric Pioline"], ["Henri Leconte", "Guy Forget", "Cédric Pioline"]],
  ["Quelle joueuse française a remporté Roland-Garros en 2000 ?", "Which Frenchwoman won the 2000 French Open?", "Mary Pierce", "Mary Pierce", ["Amélie Mauresmo", "Marion Bartoli", "Nathalie Tauziat"], ["Amélie Mauresmo", "Marion Bartoli", "Nathalie Tauziat"]],
  ["Quel joueur tchèque a remporté 8 Grand Chelems dans les années 80 ?", "Which Czech man won 8 Slams in the 80s?", "Ivan Lendl", "Ivan Lendl", ["Hana Mandlíková", "Pavel Složil", "Tomáš Šmíd"], ["Hana Mandlíková", "Pavel Složil", "Tomáš Šmíd"]],
  ["Qui a établi le record de 9 ans consécutifs n°1 ?", "Most consecutive years at world no. 1 (women)?", "Steffi Graf", "Steffi Graf", ["Martina Navratilova", "Serena Williams", "Chris Evert"], ["Martina Navratilova", "Serena Williams", "Chris Evert"]],
  // NBA / basket (5)
  ["Quel joueur a la plus longue série de matchs joués consécutifs en NBA ?", "Longest consecutive games played streak in NBA?", "A. C. Green", "A. C. Green", ["Wilt Chamberlain", "Karl Malone", "John Stockton"], ["Wilt Chamberlain", "Karl Malone", "John Stockton"]],
  ["Qui détient le record de passes décisives en carrière NBA ?", "All-time NBA assists leader?", "John Stockton", "John Stockton", ["Magic Johnson", "Chris Paul", "Steve Nash"], ["Magic Johnson", "Chris Paul", "Steve Nash"]],
  ["Quel club de l'ABA a fusionné dans la NBA en 1976 ?", "Which ABA team joined the NBA in the 1976 merger?", "Indiana Pacers", "Indiana Pacers", ["Brooklyn Nets", "San Antonio Spurs", "Denver Nuggets"], ["Brooklyn Nets", "San Antonio Spurs", "Denver Nuggets"]],
  ["Quel pivot des Lakers a remporté 4 MVP dans les années 70 ?", "Which Lakers center won 4 MVPs in the 70s?", "Kareem Abdul-Jabbar", "Kareem Abdul-Jabbar", ["Wilt Chamberlain", "Bill Russell", "Bob McAdoo"], ["Wilt Chamberlain", "Bill Russell", "Bob McAdoo"]],
  ["Quel premier joueur étranger non-américain a été MVP NBA ?", "First non-American MVP in NBA history?", "Hakeem Olajuwon", "Hakeem Olajuwon", ["Dirk Nowitzki", "Steve Nash", "Tim Duncan"], ["Dirk Nowitzki", "Steve Nash", "Tim Duncan"]],
  // JO (6)
  ["En quelle année eurent lieu les premiers JO modernes ?", "Year of the first modern Olympics?", "1896", "1896", ["1900", "1888", "1912"], ["1900", "1888", "1912"]],
  ["Quelle ville accueillit les JO de 1900 ?", "Which city hosted the 1900 Olympics?", "Paris", "Paris", ["Athènes", "Saint Louis", "Londres"], ["Athens", "Saint Louis", "London"]],
  ["Quelle ville accueillit les JO de 1936 ?", "Which city hosted the 1936 Olympics?", "Berlin", "Berlin", ["Munich", "Vienne", "Hambourg"], ["Munich", "Vienna", "Hamburg"]],
  ["Quel athlète noir américain a humilié les nazis aux JO 1936 ?", "Which Black American athlete embarrassed the Nazis at 1936?", "Jesse Owens", "Jesse Owens", ["Carl Lewis", "Eddie Tolan", "Ralph Metcalfe"], ["Carl Lewis", "Eddie Tolan", "Ralph Metcalfe"]],
  ["Quels JO d'hiver ont été annulés en 1940 et 1944 ?", "Which Winter Olympics were cancelled in 1940 and 1944?", "Sapporo et Cortina", "Sapporo and Cortina", ["Oslo et Innsbruck", "Helsinki et Genève", "Lake Placid et Squaw Valley"], ["Oslo and Innsbruck", "Helsinki and Geneva", "Lake Placid and Squaw Valley"]],
  ["Quel pays a remporté le plus de médailles d'hiver tous temps ?", "Country with the most Winter Olympic medals?", "Norvège", "Norway", ["États-Unis", "Allemagne", "URSS/Russie"], ["United States", "Germany", "USSR/Russia"]],
  // F1 (4)
  ["Quel pilote argentin a remporté 5 titres F1 dans les années 1950 ?", "Which Argentine won 5 F1 titles in the 1950s?", "Juan Manuel Fangio", "Juan Manuel Fangio", ["Carlos Reutemann", "Jose Froilán González", "Carlos Pace"], ["Carlos Reutemann", "Jose Froilán González", "Carlos Pace"]],
  ["Quel circuit F1 dispute le GP de Belgique ?", "Which F1 circuit hosts the Belgian GP?", "Spa-Francorchamps", "Spa-Francorchamps", ["Zolder", "Zandvoort", "Nivelles"], ["Zolder", "Zandvoort", "Nivelles"]],
  ["Quel pilote autrichien fut champion en 1975, 77, 84 ?", "Which Austrian won F1 titles in 1975, 77 and 84?", "Niki Lauda", "Niki Lauda", ["Jochen Rindt", "Gerhard Berger", "Helmut Marko"], ["Jochen Rindt", "Gerhard Berger", "Helmut Marko"]],
  ["Quel pilote britannique a battu Hamilton de justesse en 2008 ?", "Who narrowly beat Hamilton's 2008 rival on the last lap?", "Felipe Massa (perdu)", "Felipe Massa (lost it)", ["Kimi Räikkönen", "Fernando Alonso", "Heikki Kovalainen"], ["Kimi Räikkönen", "Fernando Alonso", "Heikki Kovalainen"]],
  // Athlétisme / divers (10)
  ["Quel athlète détient le record du 800m hommes (1'40\"91) ?", "Who holds the men's 800m WR (1:40.91)?", "David Rudisha", "David Rudisha", ["Wilson Kipketer", "Sebastian Coe", "Nijel Amos"], ["Wilson Kipketer", "Sebastian Coe", "Nijel Amos"]],
  ["Qui détient le record du 400m hommes (43.03) ?", "Men's 400m WR holder (43.03)?", "Wayde van Niekerk", "Wayde van Niekerk", ["Michael Johnson", "Kirani James", "Steven Gardiner"], ["Michael Johnson", "Kirani James", "Steven Gardiner"]],
  ["Qui détient le record du 5000m hommes (12'35\"36) ?", "Men's 5000m WR holder (12:35.36)?", "Joshua Cheptegei", "Joshua Cheptegei", ["Kenenisa Bekele", "Haile Gebrselassie", "Eliud Kipchoge"], ["Kenenisa Bekele", "Haile Gebrselassie", "Eliud Kipchoge"]],
  ["Qui détient le record du décathlon (9126 points) ?", "Decathlon WR holder (9126 pts)?", "Kevin Mayer", "Kevin Mayer", ["Ashton Eaton", "Roman Šebrle", "Daley Thompson"], ["Ashton Eaton", "Roman Šebrle", "Daley Thompson"]],
  ["Quel cycliste a remporté le Giro et le Tour la même année 1949 et 1952 ?", "Which cyclist won Giro and Tour in 1949 and 1952?", "Fausto Coppi", "Fausto Coppi", ["Gino Bartali", "Louison Bobet", "Jacques Anquetil"], ["Gino Bartali", "Louison Bobet", "Jacques Anquetil"]],
  ["Quel pays a remporté la Coupe du monde de cricket en 2023 ?", "Who won the 2023 ICC Cricket World Cup?", "Australie", "Australia", ["Inde", "Angleterre", "Nouvelle-Zélande"], ["India", "England", "New Zealand"]],
  ["Quelle équipe a remporté le Super Bowl 2024 ?", "Who won Super Bowl LVIII (2024)?", "Kansas City Chiefs", "Kansas City Chiefs", ["San Francisco 49ers", "Philadelphia Eagles", "Dallas Cowboys"], ["San Francisco 49ers", "Philadelphia Eagles", "Dallas Cowboys"]],
  ["Quel boxeur surnommé « Sugar Ray » a dominé les poids welters dans les années 80 ?", "Which 'Sugar Ray' dominated welterweight in the 1980s?", "Sugar Ray Leonard", "Sugar Ray Leonard", ["Sugar Ray Robinson", "Roberto Durán", "Marvin Hagler"], ["Sugar Ray Robinson", "Roberto Durán", "Marvin Hagler"]],
  ["Quel coureur kényan a battu la barrière des 2h au marathon (officieux) ?", "Which Kenyan ran sub-2h marathon (unofficial)?", "Eliud Kipchoge", "Eliud Kipchoge", ["Wilson Kipsang", "Kelvin Kiptum", "Kenenisa Bekele"], ["Wilson Kipsang", "Kelvin Kiptum", "Kenenisa Bekele"]],
  ["Quelle nageuse américaine a battu de nombreux records de Phelps ?", "Which American swimmer broke many of Phelps' records?", "Katie Ledecky", "Katie Ledecky", ["Missy Franklin", "Allison Schmitt", "Simone Manuel"], ["Missy Franklin", "Allison Schmitt", "Simone Manuel"]],
  // Échecs / sports d'esprit (3)
  ["Quel joueur d'échecs norvégien a été champion du monde de 2013 à 2023 ?", "Which Norwegian was world chess champion from 2013 to 2023?", "Magnus Carlsen", "Magnus Carlsen", ["Viswanathan Anand", "Vladimir Kramnik", "Levon Aronian"], ["Viswanathan Anand", "Vladimir Kramnik", "Levon Aronian"]],
  ["Quel joueur a succédé à Carlsen comme champion du monde en 2023 ?", "Who succeeded Carlsen as world champion in 2023?", "Ding Liren", "Ding Liren", ["Ian Nepomniachtchi", "Fabiano Caruana", "Hikaru Nakamura"], ["Ian Nepomniachtchi", "Fabiano Caruana", "Hikaru Nakamura"]],
  ["Quel joueur soviétique a battu Spassky en 1972 ?", "Who beat Spassky for the world title in 1972?", "Bobby Fischer", "Bobby Fischer", ["Anatoly Karpov", "Mikhail Tal", "Tigran Petrosian"], ["Anatoly Karpov", "Mikhail Tal", "Tigran Petrosian"]],
  // Compléments (6)
  ["Quel pays a inventé le snooker ?", "Which country invented snooker?", "Inde britannique", "British India", ["Royaume-Uni", "Belgique", "États-Unis"], ["United Kingdom", "Belgium", "United States"]],
  ["Quel athlète tchèque a remporté 3 médailles d'or au marathon ET 5000/10000m en 1952 ?", "Which Czech swept 5000m, 10000m and marathon in 1952?", "Emil Zátopek", "Emil Zátopek", ["Vladimír Kuc", "Lasse Virén", "Paavo Nurmi"], ["Vladimír Kuc", "Lasse Virén", "Paavo Nurmi"]],
  ["Quel pays a inventé le polo ?", "Which country invented polo?", "Perse", "Persia", ["Inde", "Mongolie", "Royaume-Uni"], ["India", "Mongolia", "United Kingdom"]],
  ["Quel pilote a remporté le Dakar le plus de fois (auto) ?", "Most Dakar Rally car wins?", "Stéphane Peterhansel", "Stéphane Peterhansel", ["Carlos Sainz", "Ari Vatanen", "Nasser Al-Attiyah"], ["Carlos Sainz", "Ari Vatanen", "Nasser Al-Attiyah"]],
  ["Quel sport joue-t-on à Twickenham ?", "Which sport is played at Twickenham?", "Rugby", "Rugby", ["Football", "Cricket", "Tennis"], ["Football", "Cricket", "Tennis"]],
  ["Quelle équipe NHL a remporté la Coupe Stanley 2024 ?", "Which NHL team won the 2024 Stanley Cup?", "Florida Panthers", "Florida Panthers", ["Edmonton Oilers", "Vegas Golden Knights", "Boston Bruins"], ["Edmonton Oilers", "Vegas Golden Knights", "Boston Bruins"]],
];

export const SPORT_QUESTIONS = buildCuratedCategory(
  "sport",
  "spo",
  [easy, medium, hard, expert],
);
