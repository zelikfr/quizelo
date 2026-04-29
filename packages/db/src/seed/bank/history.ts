import { buildCuratedCategory, type CuratedFact } from "./_builder";

/* ── Easy (Argent · 1000 ELO) ─────────────────────────────────────── */
const easy: CuratedFact[] = [
  // Dates très connues (10)
  ["En quelle année est tombé le mur de Berlin ?", "When did the Berlin Wall fall?", "1989", "1989", ["1987", "1991", "1993"], ["1987", "1991", "1993"]],
  ["En quelle année a eu lieu la Révolution française ?", "When did the French Revolution begin?", "1789", "1789", ["1776", "1799", "1815"], ["1776", "1799", "1815"]],
  ["En quelle année Christophe Colomb a-t-il découvert l'Amérique ?", "When did Columbus reach America?", "1492", "1492", ["1453", "1500", "1521"], ["1453", "1500", "1521"]],
  ["En quelle année commence la Première Guerre mondiale ?", "When did WWI begin?", "1914", "1914", ["1912", "1916", "1918"], ["1912", "1916", "1918"]],
  ["En quelle année commence la Seconde Guerre mondiale ?", "When did WWII begin?", "1939", "1939", ["1936", "1941", "1945"], ["1936", "1941", "1945"]],
  ["En quelle année le premier homme a-t-il marché sur la Lune ?", "When did a human first walk on the Moon?", "1969", "1969", ["1961", "1972", "1975"], ["1961", "1972", "1975"]],
  ["En quelle année les États-Unis ont-ils déclaré leur indépendance ?", "When did the US declare independence?", "1776", "1776", ["1789", "1812", "1620"], ["1789", "1812", "1620"]],
  ["En quelle année eut lieu le sacre de Napoléon ?", "When was Napoleon crowned emperor?", "1804", "1804", ["1799", "1812", "1815"], ["1799", "1812", "1815"]],
  ["En quelle année tomba Constantinople ?", "When did Constantinople fall?", "1453", "1453", ["1204", "1492", "1517"], ["1204", "1492", "1517"]],
  ["En quelle année les attentats du 11 septembre ont-ils eu lieu ?", "When did the 9/11 attacks occur?", "2001", "2001", ["1999", "2003", "1995"], ["1999", "2003", "1995"]],
  // Personnages très connus (10)
  ["Qui a peint la Joconde ?", "Who painted the Mona Lisa?", "Léonard de Vinci", "Leonardo da Vinci", ["Michel-Ange", "Raphaël", "Botticelli"], ["Michelangelo", "Raphael", "Botticelli"]],
  ["Qui a peint la chapelle Sixtine ?", "Who painted the Sistine Chapel?", "Michel-Ange", "Michelangelo", ["Léonard de Vinci", "Raphaël", "Le Caravage"], ["Leonardo da Vinci", "Raphael", "Caravaggio"]],
  ["Qui était Cléopâtre ?", "Who was Cleopatra?", "Reine d'Égypte", "Queen of Egypt", ["Reine de Babylone", "Reine de Carthage", "Reine de Perse"], ["Queen of Babylon", "Queen of Carthage", "Queen of Persia"]],
  ["Qui était Vercingétorix ?", "Who was Vercingetorix?", "Chef gaulois", "Gaulish chieftain", ["Empereur romain", "Roi franc", "Général grec"], ["Roman emperor", "Frankish king", "Greek general"]],
  ["Qui était Jeanne d'Arc ?", "Who was Joan of Arc?", "Héroïne française", "French heroine", ["Reine d'Angleterre", "Sainte italienne", "Princesse espagnole"], ["Queen of England", "Italian saint", "Spanish princess"]],
  ["Qui était Charlemagne ?", "Who was Charlemagne?", "Empereur d'Occident", "Emperor of the West", ["Roi de Hongrie", "Empereur byzantin", "Sultan ottoman"], ["King of Hungary", "Byzantine emperor", "Ottoman sultan"]],
  ["Qui a fondé la dynastie napoléonienne ?", "Who founded the Napoleonic dynasty?", "Napoléon Bonaparte", "Napoleon Bonaparte", ["Louis XIV", "Louis XVI", "Charlemagne"], ["Louis XIV", "Louis XVI", "Charlemagne"]],
  ["Qui était Mahomet ?", "Who was Muhammad?", "Prophète de l'islam", "Prophet of Islam", ["Calife abbasside", "Sultan ottoman", "Empereur perse"], ["Abbasid caliph", "Ottoman sultan", "Persian emperor"]],
  ["Qui a écrit Hamlet ?", "Who wrote Hamlet?", "Shakespeare", "Shakespeare", ["Molière", "Cervantès", "Goethe"], ["Molière", "Cervantes", "Goethe"]],
  ["Qui était l'épouse de Louis XVI ?", "Who was Louis XVI's wife?", "Marie-Antoinette", "Marie Antoinette", ["Catherine de Médicis", "Anne d'Autriche", "Joséphine"], ["Catherine de' Medici", "Anne of Austria", "Joséphine"]],
  // Guerres (5)
  ["Quelle guerre opposa l'Allemagne à la France entre 1914 et 1918 ?", "Which war was fought between 1914 and 1918?", "Première Guerre mondiale", "World War I", ["Seconde Guerre mondiale", "Guerre de Cent Ans", "Guerre franco-prussienne"], ["World War II", "Hundred Years' War", "Franco-Prussian War"]],
  ["Quelle guerre a duré de 1939 à 1945 ?", "Which war lasted from 1939 to 1945?", "Seconde Guerre mondiale", "World War II", ["Première Guerre mondiale", "Guerre froide", "Guerre du Pacifique"], ["World War I", "Cold War", "Pacific War"]],
  ["Quelle guerre opposa l'URSS aux États-Unis sans combat direct ?", "Which standoff pitted the USSR against the US without direct combat?", "Guerre froide", "Cold War", ["Guerre de Corée", "Guerre du Vietnam", "Guerre du Golfe"], ["Korean War", "Vietnam War", "Gulf War"]],
  ["Quelle guerre opposa la France et l'Angleterre au Moyen Âge ?", "Which medieval war was fought between France and England?", "Guerre de Cent Ans", "Hundred Years' War", ["Guerre des Deux-Roses", "Guerre de Crimée", "Guerre de Trente Ans"], ["Wars of the Roses", "Crimean War", "Thirty Years' War"]],
  ["Dans quel pays s'est déroulée la Guerre de Sécession ?", "In which country was the Civil War (1861–65) fought?", "États-Unis", "United States", ["Royaume-Uni", "France", "Mexique"], ["United Kingdom", "France", "Mexico"]],
  // Civilisations / monuments (5)
  ["Quelle civilisation a construit les pyramides de Gizeh ?", "Which civilization built the Giza pyramids?", "Égyptienne", "Egyptian", ["Maya", "Babylonienne", "Romaine"], ["Maya", "Babylonian", "Roman"]],
  ["Quelle civilisation a construit le Colisée ?", "Which civilization built the Colosseum?", "Romaine", "Roman", ["Grecque", "Étrusque", "Byzantine"], ["Greek", "Etruscan", "Byzantine"]],
  ["Quelle civilisation a construit le Parthénon ?", "Which civilization built the Parthenon?", "Grecque", "Greek", ["Romaine", "Macédonienne", "Phénicienne"], ["Roman", "Macedonian", "Phoenician"]],
  ["Quelle civilisation a construit Machu Picchu ?", "Which civilization built Machu Picchu?", "Inca", "Inca", ["Maya", "Aztèque", "Olmèque"], ["Maya", "Aztec", "Olmec"]],
  ["Quelle civilisation a fondé Tenochtitlán ?", "Which civilization founded Tenochtitlán?", "Aztèque", "Aztec", ["Maya", "Inca", "Toltèque"], ["Maya", "Inca", "Toltec"]],
  // Empires (3)
  ["Quel empire fut dirigé par Auguste ?", "Which empire was ruled by Augustus?", "Romain", "Roman", ["Grec", "Byzantin", "Carthaginois"], ["Greek", "Byzantine", "Carthaginian"]],
  ["Quel empire fut fondé par Gengis Khan ?", "Which empire was founded by Genghis Khan?", "Mongol", "Mongol", ["Chinois", "Ottoman", "Perse"], ["Chinese", "Ottoman", "Persian"]],
  ["Quel empire colonial fut le plus vaste de l'histoire ?", "Which colonial empire was the largest in history?", "Britannique", "British", ["Espagnol", "Français", "Portugais"], ["Spanish", "French", "Portuguese"]],
  // Traités / événements (3)
  ["Quel traité a mis fin à la Première Guerre mondiale ?", "Which treaty ended WWI?", "Traité de Versailles", "Treaty of Versailles", ["Traité de Trianon", "Traité de Brest-Litovsk", "Traité de Saint-Germain"], ["Treaty of Trianon", "Treaty of Brest-Litovsk", "Treaty of Saint-Germain"]],
  ["Quelle bataille de 1815 mit fin aux guerres napoléoniennes ?", "Which 1815 battle ended the Napoleonic Wars?", "Waterloo", "Waterloo", ["Austerlitz", "Trafalgar", "Iéna"], ["Austerlitz", "Trafalgar", "Jena"]],
  ["Quel président américain fut assassiné en 1963 ?", "Which US president was assassinated in 1963?", "John F. Kennedy", "John F. Kennedy", ["Abraham Lincoln", "James Garfield", "William McKinley"], ["Abraham Lincoln", "James Garfield", "William McKinley"]],
  // Inventions (2)
  ["Qui a inventé l'ampoule électrique ?", "Who invented the light bulb?", "Edison", "Edison", ["Tesla", "Bell", "Marconi"], ["Tesla", "Bell", "Marconi"]],
  ["Qui a inventé le téléphone ?", "Who invented the telephone?", "Bell", "Bell", ["Edison", "Tesla", "Marconi"], ["Edison", "Tesla", "Marconi"]],
  // Révolutions / lieux (5)
  ["Quelle révolution éclata en Russie en 1917 ?", "Which revolution broke out in Russia in 1917?", "Révolution d'Octobre", "October Revolution", ["Révolution française", "Révolution culturelle", "Révolution de Velours"], ["French Revolution", "Cultural Revolution", "Velvet Revolution"]],
  ["Sur quelle île Napoléon fut-il exilé en 1815 ?", "Which island was Napoleon exiled to in 1815?", "Sainte-Hélène", "Saint Helena", ["Elbe", "Corse", "Madère"], ["Elba", "Corsica", "Madeira"]],
  ["Quelle prison fut prise le 14 juillet 1789 ?", "Which prison was stormed on 14 July 1789?", "Bastille", "Bastille", ["Tour de Londres", "Conciergerie", "Tuileries"], ["Tower of London", "Conciergerie", "Tuileries"]],
  ["Dans quelle ville a été signée l'armistice du 11 novembre 1918 ?", "Where was the 1918 armistice signed?", "Rethondes (Compiègne)", "Compiègne", ["Versailles", "Paris", "Reims"], ["Versailles", "Paris", "Reims"]],
  ["Quel pharaon est célèbre pour son tombeau intact retrouvé en 1922 ?", "Which pharaoh's intact tomb was found in 1922?", "Toutânkhamon", "Tutankhamun", ["Ramsès II", "Khéops", "Akhenaton"], ["Ramses II", "Khufu", "Akhenaten"]],
  // Misc (7)
  ["Quel reine d'Angleterre est morte en 2022 ?", "Which Queen of England died in 2022?", "Élisabeth II", "Elizabeth II", ["Victoria", "Élisabeth Ire", "Mary II"], ["Victoria", "Elizabeth I", "Mary II"]],
  ["Quel président français est mort en 1996 ?", "Which French president died in 1996?", "François Mitterrand", "François Mitterrand", ["Charles de Gaulle", "Georges Pompidou", "Jacques Chirac"], ["Charles de Gaulle", "Georges Pompidou", "Jacques Chirac"]],
  ["Quel dirigeant nazi se suicida en 1945 ?", "Which Nazi leader killed himself in 1945?", "Adolf Hitler", "Adolf Hitler", ["Heinrich Himmler", "Joseph Goebbels", "Hermann Göring"], ["Heinrich Himmler", "Joseph Goebbels", "Hermann Göring"]],
  ["Quel groupe armé a perpétré les attentats du 11 septembre ?", "Which group carried out the 9/11 attacks?", "Al-Qaïda", "Al-Qaeda", ["Hezbollah", "Daech", "Hamas"], ["Hezbollah", "ISIS", "Hamas"]],
  ["Qui a fondé le christianisme selon la tradition ?", "Who founded Christianity according to tradition?", "Jésus de Nazareth", "Jesus of Nazareth", ["Saint Paul", "Saint Pierre", "Constantin Ier"], ["Saint Paul", "Saint Peter", "Constantine I"]],
  ["Quel conflit divisa les États-Unis de 1861 à 1865 ?", "Which conflict divided the US from 1861 to 1865?", "Guerre de Sécession", "American Civil War", ["Révolution américaine", "Guerre hispano-américaine", "Guerre de 1812"], ["American Revolution", "Spanish-American War", "War of 1812"]],
  ["Quel mur sépara l'Allemagne de 1961 à 1989 ?", "Which wall divided Germany from 1961 to 1989?", "Mur de Berlin", "Berlin Wall", ["Mur de l'Atlantique", "Ligne Maginot", "Rideau de fer"], ["Atlantic Wall", "Maginot Line", "Iron Curtain"]],
];

/* ── Medium (Or · 1400 ELO) ───────────────────────────────────────── */
const medium: CuratedFact[] = [
  // Dates spécifiques (10)
  ["En quelle année eut lieu la bataille d'Hastings ?", "When was the Battle of Hastings?", "1066", "1066", ["1054", "1099", "1215"], ["1054", "1099", "1215"]],
  ["En quelle année Charlemagne fut-il couronné empereur ?", "When was Charlemagne crowned emperor?", "800", "800", ["771", "843", "962"], ["771", "843", "962"]],
  ["En quelle année fut signé l'édit de Nantes ?", "When was the Edict of Nantes signed?", "1598", "1598", ["1572", "1610", "1685"], ["1572", "1610", "1685"]],
  ["En quelle année fut révoqué l'édit de Nantes ?", "When was the Edict of Nantes revoked?", "1685", "1685", ["1598", "1715", "1648"], ["1598", "1715", "1648"]],
  ["En quelle année Lincoln fut-il assassiné ?", "When was Lincoln assassinated?", "1865", "1865", ["1860", "1872", "1881"], ["1860", "1872", "1881"]],
  ["En quelle année l'Inde obtint-elle son indépendance ?", "When did India gain independence?", "1947", "1947", ["1945", "1950", "1962"], ["1945", "1950", "1962"]],
  ["En quelle année l'Algérie obtint-elle son indépendance ?", "When did Algeria gain independence?", "1962", "1962", ["1954", "1958", "1965"], ["1954", "1958", "1965"]],
  ["En quelle année eut lieu la dissolution de l'URSS ?", "When did the USSR dissolve?", "1991", "1991", ["1989", "1993", "1985"], ["1989", "1993", "1985"]],
  ["En quelle année débuta la Première Croisade ?", "When did the First Crusade begin?", "1096", "1096", ["1066", "1187", "1204"], ["1066", "1187", "1204"]],
  ["En quelle année eut lieu la prise de la Bastille ?", "When was the Bastille stormed?", "1789", "1789", ["1776", "1792", "1799"], ["1776", "1792", "1799"]],
  // Personnages medium (10)
  ["Qui était Robespierre ?", "Who was Robespierre?", "Révolutionnaire jacobin", "Jacobin revolutionary", ["Roi de France", "Maréchal d'Empire", "Diplomate"], ["King of France", "Marshal of the Empire", "Diplomat"]],
  ["Qui était Bismarck ?", "Who was Bismarck?", "Chancelier allemand", "German chancellor", ["Empereur français", "Roi de Prusse", "Tsar de Russie"], ["French emperor", "King of Prussia", "Tsar of Russia"]],
  ["Qui était Catherine II ?", "Who was Catherine II?", "Impératrice de Russie", "Empress of Russia", ["Reine d'Angleterre", "Reine de France", "Impératrice d'Autriche"], ["Queen of England", "Queen of France", "Empress of Austria"]],
  ["Qui était Saladin ?", "Who was Saladin?", "Sultan ayyoubide", "Ayyubid sultan", ["Calife abbasside", "Sultan ottoman", "Empereur byzantin"], ["Abbasid caliph", "Ottoman sultan", "Byzantine emperor"]],
  ["Qui était Hannibal ?", "Who was Hannibal?", "Général carthaginois", "Carthaginian general", ["Empereur romain", "Pharaon", "Roi macédonien"], ["Roman emperor", "Pharaoh", "Macedonian king"]],
  ["Qui était Galilée ?", "Who was Galileo?", "Astronome italien", "Italian astronomer", ["Mathématicien grec", "Médecin arabe", "Philosophe allemand"], ["Greek mathematician", "Arab physician", "German philosopher"]],
  ["Qui était Soliman le Magnifique ?", "Who was Suleiman the Magnificent?", "Sultan ottoman", "Ottoman sultan", ["Calife abbasside", "Empereur byzantin", "Roi de Perse"], ["Abbasid caliph", "Byzantine emperor", "King of Persia"]],
  ["Qui était Mao Zedong ?", "Who was Mao Zedong?", "Dirigeant communiste chinois", "Chinese communist leader", ["Empereur de Chine", "Premier ministre vietnamien", "Dictateur coréen"], ["Emperor of China", "Vietnamese PM", "Korean dictator"]],
  ["Qui était Lénine ?", "Who was Lenin?", "Révolutionnaire bolchévique", "Bolshevik revolutionary", ["Tsar de Russie", "Anarchiste français", "Maréchal soviétique"], ["Russian tsar", "French anarchist", "Soviet marshal"]],
  ["Qui était Churchill ?", "Who was Churchill?", "Premier ministre britannique", "British prime minister", ["Roi du Royaume-Uni", "Président américain", "Maréchal soviétique"], ["UK king", "US president", "Soviet marshal"]],
  // Batailles (6)
  ["En quelle année eut lieu la bataille de Marignan ?", "When was the Battle of Marignano?", "1515", "1515", ["1494", "1525", "1559"], ["1494", "1525", "1559"]],
  ["Qui remporta la bataille de Trafalgar en 1805 ?", "Who won the Battle of Trafalgar in 1805?", "Royaume-Uni", "United Kingdom", ["France", "Espagne", "Pays-Bas"], ["France", "Spain", "Netherlands"]],
  ["En quelle année eut lieu la bataille de Stalingrad ?", "When was the Battle of Stalingrad?", "1942", "1942", ["1939", "1944", "1945"], ["1939", "1944", "1945"]],
  ["En quelle année eut lieu la bataille de Verdun ?", "When was the Battle of Verdun?", "1916", "1916", ["1914", "1917", "1918"], ["1914", "1917", "1918"]],
  ["Qui arrêta les Arabes à la bataille de Poitiers en 732 ?", "Who stopped the Arabs at Poitiers in 732?", "Charles Martel", "Charles Martel", ["Charlemagne", "Clovis", "Pépin le Bref"], ["Charlemagne", "Clovis", "Pepin the Short"]],
  ["En quelle année eut lieu la bataille de Lépante ?", "When was the Battle of Lepanto?", "1571", "1571", ["1453", "1683", "1525"], ["1453", "1683", "1525"]],
  // Traités (4)
  ["Quel traité de 1648 mit fin à la Guerre de Trente Ans ?", "Which 1648 treaty ended the Thirty Years' War?", "Westphalie", "Westphalia", ["Versailles", "Utrecht", "Aix-la-Chapelle"], ["Versailles", "Utrecht", "Aix-la-Chapelle"]],
  ["Quel traité de 1494 partagea le monde entre Espagne et Portugal ?", "Which 1494 treaty split the world between Spain and Portugal?", "Tordesillas", "Tordesillas", ["Saragosse", "Westphalie", "Madrid"], ["Zaragoza", "Westphalia", "Madrid"]],
  ["Quel traité de 1992 fonda l'Union européenne ?", "Which 1992 treaty founded the European Union?", "Maastricht", "Maastricht", ["Rome", "Lisbonne", "Nice"], ["Rome", "Lisbon", "Nice"]],
  ["Quel traité de 1814 partagea l'Europe après Napoléon ?", "Which 1814–15 congress reshaped Europe after Napoleon?", "Congrès de Vienne", "Congress of Vienna", ["Traité de Versailles", "Congrès de Berlin", "Traité de Paris"], ["Treaty of Versailles", "Congress of Berlin", "Treaty of Paris"]],
  // Guerres (5)
  ["De quand à quand a duré la Guerre de Trente Ans ?", "Span of the Thirty Years' War?", "1618-1648", "1618–1648", ["1608-1638", "1628-1658", "1648-1678"], ["1608–1638", "1628–1658", "1648–1678"]],
  ["Quelle guerre opposa la Russie à la France et au Royaume-Uni en 1853-56 ?", "Which 1853–56 war pitted Russia against France and the UK?", "Guerre de Crimée", "Crimean War", ["Guerre russo-turque", "Guerre de Sept Ans", "Guerre russo-japonaise"], ["Russo-Turkish War", "Seven Years' War", "Russo-Japanese War"]],
  ["Quelle guerre opposa Israël à ses voisins en 1967 ?", "Which 1967 war pitted Israel against its neighbours?", "Guerre des Six Jours", "Six-Day War", ["Guerre du Kippour", "Guerre du Liban", "Guerre du Sinaï"], ["Yom Kippur War", "Lebanon War", "Sinai War"]],
  ["De quand à quand a duré la Guerre de Sept Ans ?", "Span of the Seven Years' War?", "1756-1763", "1756–1763", ["1740-1748", "1763-1770", "1701-1714"], ["1740–1748", "1763–1770", "1701–1714"]],
  ["Quelle guerre opposa les États-Unis et le Vietnam du Nord ?", "Which war pitted the US against North Vietnam?", "Guerre du Vietnam", "Vietnam War", ["Guerre de Corée", "Guerre du Cambodge", "Guerre du Laos"], ["Korean War", "Cambodian War", "Laotian Civil War"]],
  // Empires / dynasties (5)
  ["Quel empire prit Constantinople en 1453 ?", "Which empire took Constantinople in 1453?", "Ottoman", "Ottoman", ["Byzantin", "Mongol", "Perse"], ["Byzantine", "Mongol", "Persian"]],
  ["Quelle dynastie russe régna jusqu'en 1917 ?", "Which Russian dynasty ruled until 1917?", "Romanov", "Romanov", ["Riourikides", "Kievienne", "Soviétique"], ["Rurikids", "Kievan", "Soviet"]],
  ["Qui fut le premier roi des Francs ?", "Who was the first King of the Franks?", "Clovis", "Clovis", ["Charlemagne", "Pépin le Bref", "Hugues Capet"], ["Charlemagne", "Pepin the Short", "Hugh Capet"]],
  ["Quelle dynastie unifia la Chine en 221 av. J.-C. ?", "Which dynasty unified China in 221 BCE?", "Qin", "Qin", ["Han", "Tang", "Ming"], ["Han", "Tang", "Ming"]],
  ["Quel fut le dernier tsar de Russie ?", "Who was the last Tsar of Russia?", "Nicolas II", "Nicholas II", ["Alexandre III", "Pierre III", "Ivan IV"], ["Alexander III", "Peter III", "Ivan IV"]],
  // Inventions / découvertes (5)
  ["Qui a inventé l'imprimerie en Europe ?", "Who invented the printing press in Europe?", "Gutenberg", "Gutenberg", ["Newton", "Galilée", "Copernic"], ["Newton", "Galileo", "Copernicus"]],
  ["Qui a découvert la pénicilline ?", "Who discovered penicillin?", "Alexander Fleming", "Alexander Fleming", ["Louis Pasteur", "Marie Curie", "Robert Koch"], ["Louis Pasteur", "Marie Curie", "Robert Koch"]],
  ["Qui a formulé la théorie de la relativité ?", "Who formulated relativity?", "Albert Einstein", "Albert Einstein", ["Isaac Newton", "Niels Bohr", "Stephen Hawking"], ["Isaac Newton", "Niels Bohr", "Stephen Hawking"]],
  ["Qui a inventé la dynamite ?", "Who invented dynamite?", "Alfred Nobel", "Alfred Nobel", ["Edison", "Tesla", "Mendeleïev"], ["Edison", "Tesla", "Mendeleev"]],
  ["Qui a découvert le radium ?", "Who discovered radium?", "Marie Curie", "Marie Curie", ["Henri Becquerel", "Ernest Rutherford", "Niels Bohr"], ["Henri Becquerel", "Ernest Rutherford", "Niels Bohr"]],
  // Misc (5)
  ["Qui a écrit Le Prince ?", "Who wrote The Prince?", "Machiavel", "Machiavelli", ["Voltaire", "Rousseau", "Hobbes"], ["Voltaire", "Rousseau", "Hobbes"]],
  ["Quel président américain abolit l'esclavage en 1865 ?", "Which US president abolished slavery in 1865?", "Abraham Lincoln", "Abraham Lincoln", ["Thomas Jefferson", "George Washington", "Theodore Roosevelt"], ["Thomas Jefferson", "George Washington", "Theodore Roosevelt"]],
  ["Quel président de Gaulle succéda en 1969 ?", "Who succeeded de Gaulle in 1969?", "Georges Pompidou", "Georges Pompidou", ["Valéry Giscard d'Estaing", "François Mitterrand", "Jacques Chirac"], ["Valéry Giscard d'Estaing", "François Mitterrand", "Jacques Chirac"]],
  ["Qui dirigea l'Inde lors de son indépendance ?", "Who led India to independence?", "Gandhi", "Gandhi", ["Nehru", "Bose", "Patel"], ["Nehru", "Bose", "Patel"]],
  ["Qui prononça le discours « I have a dream » en 1963 ?", "Who delivered the 'I have a dream' speech in 1963?", "Martin Luther King", "Martin Luther King", ["Malcolm X", "John F. Kennedy", "Rosa Parks"], ["Malcolm X", "John F. Kennedy", "Rosa Parks"]],
];

/* ── Hard (Platine · 1800 ELO) ────────────────────────────────────── */
const hard: CuratedFact[] = [
  // Dates pointues (8)
  ["En quelle année débuta le Schisme d'Orient ?", "When did the East–West Schism occur?", "1054", "1054", ["1204", "1378", "1453"], ["1204", "1378", "1453"]],
  ["En quelle année eut lieu le sac de Rome par les troupes de Charles Quint ?", "When was the Sack of Rome by Charles V's troops?", "1527", "1527", ["1453", "1571", "1648"], ["1453", "1571", "1648"]],
  ["En quelle année eut lieu le siège de Vienne par les Ottomans ?", "When did the Ottomans besiege Vienna (failed)?", "1683", "1683", ["1529", "1571", "1715"], ["1529", "1571", "1715"]],
  ["En quelle année est mort Louis XIV ?", "When did Louis XIV die?", "1715", "1715", ["1700", "1726", "1740"], ["1700", "1726", "1740"]],
  ["En quelle année fut proclamée la Première République française ?", "When was the First French Republic proclaimed?", "1792", "1792", ["1789", "1793", "1799"], ["1789", "1793", "1799"]],
  ["En quelle année eut lieu la Commune de Paris ?", "When was the Paris Commune?", "1871", "1871", ["1848", "1830", "1815"], ["1848", "1830", "1815"]],
  ["En quelle année fut signé l'édit de Milan reconnaissant le christianisme ?", "When was the Edict of Milan?", "313", "313", ["325", "380", "476"], ["325", "380", "476"]],
  ["En quelle année eut lieu la défenestration de Prague qui déclencha la Guerre de Trente Ans ?", "When was the Defenestration of Prague that triggered the Thirty Years' War?", "1618", "1618", ["1555", "1648", "1572"], ["1555", "1648", "1572"]],
  // Personnages hard (10)
  ["Qui était Cyrus le Grand ?", "Who was Cyrus the Great?", "Roi de Perse", "King of Persia", ["Empereur byzantin", "Pharaon", "Roi babylonien"], ["Byzantine emperor", "Pharaoh", "Babylonian king"]],
  ["Qui était Périclès ?", "Who was Pericles?", "Stratège athénien", "Athenian statesman", ["Roi de Sparte", "Empereur romain", "Philosophe stoïcien"], ["King of Sparta", "Roman emperor", "Stoic philosopher"]],
  ["Qui était Charles Quint ?", "Who was Charles V?", "Empereur du Saint-Empire", "Holy Roman Emperor", ["Roi d'Angleterre", "Sultan ottoman", "Pape"], ["King of England", "Ottoman sultan", "Pope"]],
  ["Qui était Henri IV de France ?", "Who was Henry IV of France?", "Roi de France et Navarre", "King of France and Navarre", ["Roi d'Angleterre", "Empereur du Saint-Empire", "Roi d'Espagne"], ["King of England", "Holy Roman Emperor", "King of Spain"]],
  ["Qui était Tamerlan ?", "Who was Tamerlane?", "Conquérant turco-mongol", "Turco-Mongol conqueror", ["Sultan ottoman", "Empereur moghol", "Khagan mongol"], ["Ottoman sultan", "Mughal emperor", "Mongol khagan"]],
  ["Qui était Mehmed II ?", "Who was Mehmed II?", "Sultan ottoman conquérant de Constantinople", "Ottoman sultan who conquered Constantinople", ["Sultan abbasside", "Empereur byzantin", "Calife omeyyade"], ["Abbasid sultan", "Byzantine emperor", "Umayyad caliph"]],
  ["Qui était Kubilai Khan ?", "Who was Kublai Khan?", "Empereur mongol fondateur de la dynastie Yuan", "Mongol emperor who founded the Yuan dynasty", ["Empereur moghol", "Sultan d'Égypte", "Khan de l'Horde d'Or"], ["Mughal emperor", "Sultan of Egypt", "Khan of the Golden Horde"]],
  ["Qui était Ivan le Terrible ?", "Who was Ivan the Terrible?", "Premier tsar de Russie", "First Tsar of Russia", ["Roi de Pologne", "Khan de Crimée", "Empereur byzantin"], ["King of Poland", "Khan of Crimea", "Byzantine emperor"]],
  ["Qui était Catherine de Médicis ?", "Who was Catherine de' Medici?", "Reine de France", "Queen of France", ["Reine d'Angleterre", "Reine d'Espagne", "Princesse italienne"], ["Queen of England", "Queen of Spain", "Italian princess"]],
  ["Qui était Frédéric II de Prusse ?", "Who was Frederick II of Prussia?", "Roi philosophe de Prusse", "Philosopher king of Prussia", ["Empereur autrichien", "Tsar de Russie", "Roi du Danemark"], ["Austrian emperor", "Tsar of Russia", "King of Denmark"]],
  // Batailles (6)
  ["En quelle année eut lieu la bataille de Cannes (Hannibal vs Rome) ?", "When was the Battle of Cannae?", "216 av. J.-C.", "216 BCE", ["218 av. J.-C.", "202 av. J.-C.", "146 av. J.-C."], ["218 BCE", "202 BCE", "146 BCE"]],
  ["En quelle année eut lieu la bataille de Salamine ?", "When was the Battle of Salamis?", "480 av. J.-C.", "480 BCE", ["490 av. J.-C.", "479 av. J.-C.", "404 av. J.-C."], ["490 BCE", "479 BCE", "404 BCE"]],
  ["En quelle année eut lieu la bataille de Bouvines ?", "When was the Battle of Bouvines?", "1214", "1214", ["1066", "1346", "1356"], ["1066", "1346", "1356"]],
  ["Qui fut capturé à la bataille de Pavie en 1525 ?", "Who was captured at the Battle of Pavia in 1525?", "François Ier", "Francis I", ["Charles Quint", "Henri II", "Charles VIII"], ["Charles V", "Henry II", "Charles VIII"]],
  ["En quelle année eut lieu la bataille d'Austerlitz ?", "When was the Battle of Austerlitz?", "1805", "1805", ["1804", "1806", "1815"], ["1804", "1806", "1815"]],
  ["En quelle année eut lieu la bataille de Solférino ?", "When was the Battle of Solferino?", "1859", "1859", ["1848", "1866", "1870"], ["1848", "1866", "1870"]],
  // Traités (5)
  ["En quelle année fut signée la paix d'Augsbourg ?", "When was the Peace of Augsburg signed?", "1555", "1555", ["1517", "1598", "1648"], ["1517", "1598", "1648"]],
  ["Quel traité de 1918 sortit la Russie de la Première Guerre mondiale ?", "Which 1918 treaty took Russia out of WWI?", "Brest-Litovsk", "Brest-Litovsk", ["Versailles", "Saint-Germain", "Trianon"], ["Versailles", "Saint-Germain", "Trianon"]],
  ["Quel traité de 1920 démantela l'Empire austro-hongrois ?", "Which 1920 treaty dismantled Austria-Hungary?", "Trianon", "Trianon", ["Saint-Germain", "Sèvres", "Versailles"], ["Saint-Germain", "Sèvres", "Versailles"]],
  ["Quel traité de 1923 redéfinit les frontières de la Turquie ?", "Which 1923 treaty redefined Turkey's borders?", "Lausanne", "Lausanne", ["Sèvres", "Trianon", "Versailles"], ["Sèvres", "Trianon", "Versailles"]],
  ["Quel concordat fut signé en 1801 entre Napoléon et le pape ?", "Which 1801 concordat was signed between Napoleon and the Pope?", "Concordat de 1801", "Concordat of 1801", ["Concordat de Worms", "Concordat de Bologne", "Concordat de Vienne"], ["Concordat of Worms", "Concordat of Bologna", "Concordat of Vienna"]],
  // Civilisations / sites (6)
  ["Quelle civilisation construisit les temples d'Angkor ?", "Which civilization built the Angkor temples?", "Khmère", "Khmer", ["Mon", "Cham", "Siamoise"], ["Mon", "Cham", "Siamese"]],
  ["Quelle civilisation a sculpté les statues de l'île de Pâques ?", "Which civilization carved the Easter Island statues?", "Rapanui", "Rapa Nui", ["Maori", "Inca", "Polynésienne de Tahiti"], ["Maori", "Inca", "Tahitian"]],
  ["Quelle civilisation a fondé Carthage ?", "Which civilization founded Carthage?", "Phénicienne", "Phoenician", ["Grecque", "Romaine", "Égyptienne"], ["Greek", "Roman", "Egyptian"]],
  ["Quelle civilisation a construit Petra ?", "Which civilization built Petra?", "Nabatéenne", "Nabatean", ["Romaine", "Byzantine", "Sassanide"], ["Roman", "Byzantine", "Sasanian"]],
  ["Quelle civilisation a tracé les lignes de Nazca ?", "Which civilization drew the Nazca Lines?", "Nazca", "Nazca", ["Inca", "Moche", "Tiwanaku"], ["Inca", "Moche", "Tiwanaku"]],
  ["Quelle civilisation a construit l'observatoire de Chichén Itzá ?", "Which civilization built the Chichén Itzá observatory?", "Maya", "Maya", ["Aztèque", "Olmèque", "Toltèque"], ["Aztec", "Olmec", "Toltec"]],
  // Guerres (5)
  ["Quelle guerre dynastique opposa Lancastre et York en Angleterre ?", "Which dynastic war pitted Lancaster against York in England?", "Guerre des Deux-Roses", "Wars of the Roses", ["Guerre de Cent Ans", "Guerre civile anglaise", "Guerre de Sept Ans"], ["Hundred Years' War", "English Civil War", "Seven Years' War"]],
  ["En quelle période eurent lieu les guerres puniques ?", "When were the Punic Wars fought?", "264-146 av. J.-C.", "264–146 BCE", ["218-202 av. J.-C.", "200-146 av. J.-C.", "146-30 av. J.-C."], ["218–202 BCE", "200–146 BCE", "146–30 BCE"]],
  ["Contre qui les Russes combattirent-ils dans la guerre de Crimée ?", "Whom did Russia fight in the Crimean War?", "France, Royaume-Uni, Empire ottoman", "France, UK, Ottoman Empire", ["Allemagne et Autriche", "Suède et Pologne", "Perse et Empire moghol"], ["Germany and Austria", "Sweden and Poland", "Persia and Mughal Empire"]],
  ["De quand à quand a duré la Guerre civile russe ?", "Span of the Russian Civil War?", "1917-1922", "1917–1922", ["1914-1918", "1905-1907", "1922-1928"], ["1914–1918", "1905–1907", "1922–1928"]],
  ["Dans quel pays se déroulèrent les guerres des Boers ?", "In which country were the Boer Wars fought?", "Afrique du Sud", "South Africa", ["Namibie", "Zimbabwe", "Mozambique"], ["Namibia", "Zimbabwe", "Mozambique"]],
  // Découvertes / événements (5)
  ["Qui réalisa la première circumnavigation du globe (1519-1522) ?", "Who completed the first circumnavigation (1519–22)?", "Magellan et Elcano", "Magellan and Elcano", ["Vasco de Gama", "Christophe Colomb", "Francis Drake"], ["Vasco da Gama", "Christopher Columbus", "Francis Drake"]],
  ["Quel événement déclencha la Première Guerre mondiale ?", "Which event triggered WWI?", "Assassinat de François-Ferdinand", "Assassination of Franz Ferdinand", ["Invasion de la Pologne", "Affaire Dreyfus", "Bataille de Tannenberg"], ["Invasion of Poland", "Dreyfus Affair", "Battle of Tannenberg"]],
  ["Quel pacte de 1939 fut signé entre l'Allemagne et l'URSS ?", "Which 1939 pact was signed by Germany and the USSR?", "Pacte germano-soviétique", "Molotov–Ribbentrop Pact", ["Pacte d'acier", "Pacte de Varsovie", "Pacte de Munich"], ["Pact of Steel", "Warsaw Pact", "Munich Agreement"]],
  ["Quelle bataille de 1492 marqua la fin de la Reconquista ?", "Which 1492 event ended the Reconquista?", "Prise de Grenade", "Fall of Granada", ["Bataille de Lépante", "Bataille de Las Navas de Tolosa", "Sac de Cordoue"], ["Battle of Lepanto", "Battle of Las Navas de Tolosa", "Sack of Córdoba"]],
  ["En quelle année se déroula la Nuit de la Saint-Barthélemy ?", "When did the St. Bartholomew's Day Massacre occur?", "1572", "1572", ["1598", "1562", "1610"], ["1598", "1562", "1610"]],
  // Empires (5)
  ["Quel empire dura de 1299 à 1922 ?", "Which empire lasted from 1299 to 1922?", "Ottoman", "Ottoman", ["Byzantin", "Mongol", "Russe"], ["Byzantine", "Mongol", "Russian"]],
  ["Quel empire fut dirigé par Akbar le Grand ?", "Which empire was ruled by Akbar the Great?", "Moghol", "Mughal", ["Ottoman", "Safavide", "Ming"], ["Ottoman", "Safavid", "Ming"]],
  ["Quelle dynastie chinoise commença en 1644 ?", "Which Chinese dynasty began in 1644?", "Qing", "Qing", ["Ming", "Yuan", "Han"], ["Ming", "Yuan", "Han"]],
  ["Quel empire byzantin tomba définitivement en 1453 ?", "Which empire fell definitively in 1453?", "Empire romain d'Orient", "Eastern Roman Empire", ["Empire bulgare", "Empire serbe", "Empire trébizonde"], ["Bulgarian Empire", "Serbian Empire", "Trapezuntine Empire"]],
  ["Quel empire fut dirigé par Akbar et Shah Jahan ?", "Which empire was ruled by Akbar and Shah Jahan?", "Moghol", "Mughal", ["Maratha", "Ottoman", "Safavide"], ["Maratha", "Ottoman", "Safavid"]],
];

/* ── Expert (Diamant · 2200 ELO) ──────────────────────────────────── */
const expert: CuratedFact[] = [
  // Dates pointues (8)
  ["En quelle année fut signé le traité de Verdun partageant l'empire carolingien ?", "When was the Treaty of Verdun signed?", "843", "843", ["800", "877", "962"], ["800", "877", "962"]],
  ["En quelle année eut lieu le concile de Nicée ?", "When was the Council of Nicaea?", "325", "325", ["313", "381", "451"], ["313", "381", "451"]],
  ["En quelle année eut lieu la chute de Carthage ?", "When did Carthage fall?", "146 av. J.-C.", "146 BCE", ["202 av. J.-C.", "264 av. J.-C.", "44 av. J.-C."], ["202 BCE", "264 BCE", "44 BCE"]],
  ["En quelle année débuta la Guerre de Succession d'Espagne ?", "When did the War of Spanish Succession begin?", "1701", "1701", ["1715", "1672", "1740"], ["1715", "1672", "1740"]],
  ["En quelle année eut lieu la bataille de Yorktown ?", "When was the Battle of Yorktown?", "1781", "1781", ["1776", "1783", "1789"], ["1776", "1783", "1789"]],
  ["En quelle année Otton Ier fut-il couronné empereur du Saint-Empire ?", "When was Otto I crowned Holy Roman Emperor?", "962", "962", ["800", "843", "1077"], ["800", "843", "1077"]],
  ["En quelle année débuta le Grand Schisme d'Occident ?", "When did the Western Schism begin?", "1378", "1378", ["1054", "1417", "1309"], ["1054", "1417", "1309"]],
  ["En quelle année commença l'expédition de Babur en Inde ?", "When did Babur's invasion of India begin?", "1526", "1526", ["1492", "1556", "1601"], ["1492", "1556", "1601"]],
  // Personnages experts (10)
  ["Qui était Hammurabi ?", "Who was Hammurabi?", "Roi de Babylone (XVIIIe s. av. J.-C.)", "King of Babylon (18th c. BCE)", ["Pharaon égyptien", "Roi assyrien", "Empereur perse"], ["Egyptian pharaoh", "Assyrian king", "Persian emperor"]],
  ["Qui était Justinien Ier ?", "Who was Justinian I?", "Empereur byzantin du VIe siècle", "6th-century Byzantine emperor", ["Empereur romain", "Roi des Ostrogoths", "Empereur sassanide"], ["Roman emperor", "Ostrogothic king", "Sasanian emperor"]],
  ["Qui était Théodora ?", "Who was Theodora?", "Impératrice byzantine, épouse de Justinien", "Byzantine empress, wife of Justinian", ["Épouse de Constantin", "Impératrice carolingienne", "Reine wisigothe"], ["Wife of Constantine", "Carolingian empress", "Visigothic queen"]],
  ["Qui était Théodoric le Grand ?", "Who was Theodoric the Great?", "Roi des Ostrogoths", "King of the Ostrogoths", ["Roi des Wisigoths", "Roi des Vandales", "Roi des Burgondes"], ["Visigothic king", "Vandal king", "Burgundian king"]],
  ["Qui était Asoka ?", "Who was Ashoka?", "Empereur Maurya bouddhiste", "Buddhist Maurya emperor", ["Roi de Magadha", "Empereur gupta", "Roi kushan"], ["King of Magadha", "Gupta emperor", "Kushan king"]],
  ["Qui était Babur ?", "Who was Babur?", "Fondateur de l'Empire moghol", "Founder of the Mughal Empire", ["Premier sultan de Delhi", "Fondateur de la dynastie safavide", "Sultan ottoman"], ["First Sultan of Delhi", "Founder of the Safavid dynasty", "Ottoman sultan"]],
  ["Qui fut le premier shogun du Japon ?", "Who was Japan's first shogun?", "Minamoto no Yoritomo", "Minamoto no Yoritomo", ["Tokugawa Ieyasu", "Oda Nobunaga", "Toyotomi Hideyoshi"], ["Tokugawa Ieyasu", "Oda Nobunaga", "Toyotomi Hideyoshi"]],
  ["Qui était Aliénor d'Aquitaine ?", "Who was Eleanor of Aquitaine?", "Reine de France puis d'Angleterre", "Queen of France then England", ["Reine d'Espagne", "Reine de Hongrie", "Reine de Sicile"], ["Queen of Spain", "Queen of Hungary", "Queen of Sicily"]],
  ["Qui fonda la dynastie achéménide ?", "Who founded the Achaemenid dynasty?", "Cyrus II", "Cyrus II", ["Darius Ier", "Xerxès Ier", "Cambyse Ier"], ["Darius I", "Xerxes I", "Cambyses I"]],
  ["Qui était Cosme l'Ancien de Médicis ?", "Who was Cosimo de' Medici (the Elder)?", "Banquier et chef de Florence", "Banker and ruler of Florence", ["Pape florentin", "Doge de Venise", "Roi de Naples"], ["Florentine pope", "Doge of Venice", "King of Naples"]],
  // Batailles (8)
  ["Où Alexandre le Grand vainquit-il Darius III en 331 av. J.-C. ?", "Where did Alexander defeat Darius III in 331 BCE?", "Gaugamèles", "Gaugamela", ["Issos", "Granique", "Marathon"], ["Issus", "Granicus", "Marathon"]],
  ["Quelle bataille de 451 stoppa Attila ?", "Which 451 battle stopped Attila?", "Champs Catalauniques", "Catalaunian Plains", ["Andrinople", "Forum Trebonii", "Strasbourg"], ["Adrianople", "Forum Trebonii", "Strasbourg"]],
  ["En quelle année eut lieu la bataille de Roncevaux ?", "When was the Battle of Roncevaux Pass?", "778", "778", ["732", "843", "800"], ["732", "843", "800"]],
  ["En quelle année eut lieu la bataille de Crécy ?", "When was the Battle of Crécy?", "1346", "1346", ["1356", "1415", "1453"], ["1356", "1415", "1453"]],
  ["En quelle année eut lieu la bataille d'Azincourt ?", "When was the Battle of Agincourt?", "1415", "1415", ["1346", "1356", "1453"], ["1346", "1356", "1453"]],
  ["En quelle année eut lieu la bataille de Mohács ?", "When was the Battle of Mohács?", "1526", "1526", ["1453", "1571", "1683"], ["1453", "1571", "1683"]],
  ["En quelle année eut lieu la bataille de Plassey ?", "When was the Battle of Plassey?", "1757", "1757", ["1707", "1763", "1789"], ["1707", "1763", "1789"]],
  ["En quelle année eut lieu la bataille de Lépante ?", "When was the Battle of Lepanto?", "1571", "1571", ["1529", "1453", "1683"], ["1529", "1453", "1683"]],
  // Traités (5)
  ["Quel traité de 1360 réorganisa le territoire après une trêve dans la Guerre de Cent Ans ?", "Which 1360 treaty paused the Hundred Years' War?", "Traité de Brétigny", "Treaty of Brétigny", ["Traité de Troyes", "Traité d'Arras", "Traité de Picquigny"], ["Treaty of Troyes", "Treaty of Arras", "Treaty of Picquigny"]],
  ["Quel concordat de 1122 régla la querelle des Investitures ?", "Which 1122 concordat settled the Investiture Controversy?", "Concordat de Worms", "Concordat of Worms", ["Édit de Milan", "Bulle d'or", "Concordat de Bologne"], ["Edict of Milan", "Golden Bull", "Concordat of Bologna"]],
  ["Quelle Bulle d'or de 1356 fixa l'élection de l'empereur du Saint-Empire ?", "Which 1356 Golden Bull set Holy Roman Emperor elections?", "Bulle d'or de Charles IV", "Charles IV's Golden Bull", ["Bulle Unam Sanctam", "Concordat de Vienne", "Constitution Sicilienne"], ["Bull Unam Sanctam", "Concordat of Vienna", "Sicilian Constitution"]],
  ["Quel traité de 1559 mit fin aux guerres d'Italie ?", "Which 1559 treaty ended the Italian Wars?", "Cateau-Cambrésis", "Cateau-Cambrésis", ["Westphalie", "Pyrénées", "Aix-la-Chapelle"], ["Westphalia", "Pyrenees", "Aix-la-Chapelle"]],
  ["Quel traité de 1748 mit fin à la Guerre de Succession d'Autriche ?", "Which 1748 treaty ended the War of Austrian Succession?", "Aix-la-Chapelle", "Aix-la-Chapelle", ["Utrecht", "Pyrénées", "Bâle"], ["Utrecht", "Pyrenees", "Basel"]],
  // Empires / dynasties (6)
  ["Quelle dynastie régna sur l'Égypte hellénistique ?", "Which dynasty ruled Hellenistic Egypt?", "Lagides (Ptolémées)", "Ptolemaic dynasty", ["Séleucides", "Antigonides", "Achéménides"], ["Seleucid", "Antigonid", "Achaemenid"]],
  ["Quelle dynastie chinoise inventa la poudre à canon ?", "Which Chinese dynasty invented gunpowder?", "Tang", "Tang", ["Han", "Ming", "Qing"], ["Han", "Ming", "Qing"]],
  ["Qui fut le premier roi mérovingien historique ?", "Who was the first historical Merovingian king?", "Childéric Ier", "Childeric I", ["Mérovée", "Clovis", "Pharamond"], ["Merovech", "Clovis", "Pharamond"]],
  ["Quel empire fut fondé par Cyrus II en 550 av. J.-C. ?", "Which empire did Cyrus II found in 550 BCE?", "Achéménide", "Achaemenid", ["Sassanide", "Parthe", "Mède"], ["Sasanian", "Parthian", "Median"]],
  ["Quelle dynastie unifia le Vietnam au XIXe siècle ?", "Which dynasty unified Vietnam in the 19th century?", "Nguyễn", "Nguyễn", ["Lê", "Trần", "Tây Sơn"], ["Lê", "Trần", "Tây Sơn"]],
  ["Quelle civilisation préhispanique précéda les Aztèques au Mexique central ?", "Which civilization preceded the Aztecs in central Mexico?", "Toltèque", "Toltec", ["Olmèque", "Maya", "Mixtèque"], ["Olmec", "Maya", "Mixtec"]],
  // Guerres / explorations (4)
  ["Quel pape déclencha la Première Croisade en 1095 ?", "Which pope launched the First Crusade in 1095?", "Urbain II", "Urban II", ["Grégoire VII", "Innocent III", "Boniface VIII"], ["Gregory VII", "Innocent III", "Boniface VIII"]],
  ["Qui découvrit le Brésil pour le Portugal en 1500 ?", "Who claimed Brazil for Portugal in 1500?", "Pedro Álvares Cabral", "Pedro Álvares Cabral", ["Vasco de Gama", "Bartolomeu Dias", "Henri le Navigateur"], ["Vasco da Gama", "Bartolomeu Dias", "Henry the Navigator"]],
  ["Qui réalisa la deuxième circumnavigation entre 1577 et 1580 ?", "Who completed the second circumnavigation (1577–80)?", "Francis Drake", "Francis Drake", ["Walter Raleigh", "James Cook", "Henry Hudson"], ["Walter Raleigh", "James Cook", "Henry Hudson"]],
  ["Quel pape excommunia Henri IV à Canossa ?", "Which pope excommunicated Henry IV at Canossa?", "Grégoire VII", "Gregory VII", ["Urbain II", "Innocent III", "Léon IX"], ["Urban II", "Innocent III", "Leo IX"]],
  // Misc expert (3)
  ["Quel codex contient les plus anciennes lois écrites mésopotamiennes ?", "Which code contains the earliest Mesopotamian written laws?", "Code de Hammurabi", "Code of Hammurabi", ["Code d'Ur-Nammu", "Code de Lipit-Ishtar", "Code des Douze Tables"], ["Code of Ur-Nammu", "Code of Lipit-Ishtar", "Twelve Tables"]],
  ["Quelle dynastie russe précéda les Romanov ?", "Which Russian dynasty preceded the Romanovs?", "Riourikides", "Rurikids", ["Glinski", "Godounov", "Kievanski"], ["Glinski", "Godunov", "Kievanski"]],
  ["Quel sultan abolit définitivement le califat ottoman en 1924 ?", "Who abolished the Ottoman caliphate in 1924?", "Mustafa Kemal", "Mustafa Kemal", ["Mehmed VI", "Abdülhamid II", "Enver Pacha"], ["Mehmed VI", "Abdulhamid II", "Enver Pasha"]],
  // Compléments expert (6)
  ["Qui fut le dernier empereur byzantin tué à la chute de Constantinople ?", "Who was the last Byzantine emperor, killed at the fall of Constantinople?", "Constantin XI", "Constantine XI", ["Jean VIII", "Manuel II", "Andronic IV"], ["John VIII", "Manuel II", "Andronikos IV"]],
  ["Quel empire perse fut détruit par les Arabes au VIIe siècle ?", "Which Persian empire was destroyed by the Arabs in the 7th century?", "Sassanide", "Sasanian", ["Achéménide", "Parthe", "Mède"], ["Achaemenid", "Parthian", "Median"]],
  ["Quelle reine d'Égypte régna avant Cléopâtre VII ?", "Which Egyptian queen reigned just before Cleopatra VII?", "Bérénice IV", "Berenice IV", ["Hatshepsout", "Néfertiti", "Arsinoé II"], ["Hatshepsut", "Nefertiti", "Arsinoe II"]],
  ["Qui fonda la dynastie omeyyade en 661 ?", "Who founded the Umayyad dynasty in 661?", "Mu'âwiya Ier", "Mu'awiya I", ["Abu Bakr", "Omar ibn al-Khattab", "Hussein ibn Ali"], ["Abu Bakr", "Umar ibn al-Khattab", "Husayn ibn Ali"]],
  ["Quel général carthaginois fut vaincu à Zama en 202 av. J.-C. ?", "Which Carthaginian general was defeated at Zama in 202 BCE?", "Hannibal", "Hannibal", ["Hamilcar Barca", "Hasdrubal", "Magon"], ["Hamilcar Barca", "Hasdrubal", "Mago"]],
  ["Qui fut le premier président de la République de Turquie en 1923 ?", "Who became the first president of the Turkish Republic in 1923?", "Mustafa Kemal Atatürk", "Mustafa Kemal Atatürk", ["İsmet İnönü", "Enver Pacha", "Talaat Pacha"], ["İsmet İnönü", "Enver Pasha", "Talaat Pasha"]],
];

export const HISTORY_QUESTIONS = buildCuratedCategory(
  "history",
  "hist",
  [easy, medium, hard, expert],
);
