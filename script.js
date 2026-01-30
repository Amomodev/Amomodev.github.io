/**
 * JU 2026 Interactive Map Logic
 * Handles stand generation, data management, search, and quiz logic
 * Data source: JU_plan_2025.pdf
 */

// --- Translations ---
const typeTranslations = {
    "social": "Social",
    "international": "International",
    "vie-etudiante": "Vie Étudiante",
    "artisanat": "Artisanat",
    "agriculture": "Agriculture",
    "science": "Sciences",
    "tech": "Technologie / IUT",
    "forces": "Armée / Sécurité",
    "law": "Droit / Admin",
    "economics": "Économie / Gestion",
    "arts": "Arts / Lettres",
    "sante": "Santé",
    "other": "Autre"
};

console.log('JU 2026 Map App Initializing...');

// --- Data extracted from JU_plan_2025.pdf ---
// Organization: Category -> [IDs...] Institution
const standDataRaw = [
    // --- ESPACE ORIENTATION ET RÉUSSITE (Purple/Social) ---
    { ids: [1], name: "Espace Orientation et Réussite", desc: "Noria, Parcoursup, IDIP", type: "social", tags: ["orientation"] },
    { ids: [5], name: "Mission égalité filles-garçons", desc: "", type: "social", tags: ["social"] },

    // --- ESPACE INTERNATIONAL (Red) ---
    { ids: [2], name: "Euroguidance", desc: "Agentur für Arbeit. Berufsberatung / Étudier, se former en Allemagne", type: "international", tags: ["international", "allemagne"] },
    { ids: [3], name: "EF Education First", desc: "Séjours linguistiques", type: "international", tags: ["international", "langues"] },

    // --- VIE ÉTUDIANTE (Cyan) ---
    { ids: [4], name: "AFEV Strasbourg", desc: "", type: "vie-etudiante", tags: ["social"] },
    { ids: [6], name: "Pepite Etena", desc: "Entrepreneuriat étudiant", type: "vie-etudiante", tags: ["business"] },
    { ids: [34, 35], name: "Crous de Strasbourg", desc: "Logement, bourses, restauration", type: "vie-etudiante", tags: ["social", "housing"] },
    { ids: [36], name: "Strasbourg aime ses étudiants", desc: "", type: "vie-etudiante", tags: ["social"] },
    { ids: [31], name: "Bibliothèques universitaires", desc: "Unistra", type: "vie-etudiante", tags: ["library"] },
    { ids: [32], name: "Service de l'action culturelle", desc: "Carte Culture", type: "vie-etudiante", tags: ["culture"] },
    { ids: [33], name: "SVU (Service Vie Universitaire)", desc: "Vie étudiante, handicap", type: "vie-etudiante", tags: ["social"] },

    // --- ARTISANAT (Brown/Blue) ---
    { ids: [7, 8, 9], name: "CFA Académique", desc: "Formations par apprentissage", type: "artisanat", tags: ["alternance", "short"], alternance: true },
    { ids: [28], name: "Les Compagnons du Devoir", desc: "Tour de France", type: "artisanat", tags: ["short", "alternance"], alternance: true },
    { ids: [29, 30], name: "Chambre de métiers d'Alsace", desc: "", type: "artisanat", tags: ["short", "alternance"], alternance: true },

    // --- AGRICULTURE & AGROALIMENTAIRE (Green) ---
    { ids: [25], name: "Université de Haute-Alsace (Biopôle Colmar)", desc: "Agronomie, oenologie, viticulture", type: "agriculture", tags: ["science", "agriculture", "long"] },
    { ids: [10, 11, 26, 27], name: "Lycées Agricoles & CFA", desc: "Erstein, Colmar, Obernai, Rouffach, Bouxwiller. Agronomie, paysage, viticulture.", type: "agriculture", tags: ["agriculture", "short", "alternance", "bts"], alternance: true },
    { ids: [13, 14], name: "Lycées Agricoles et CFA (Bourgogne-Franche-Comté)", desc: "Valdoie, Besançon, Vesoul. Aménagements paysagers, forêt.", type: "agriculture", tags: ["agriculture", "short"] },
    { ids: [12], name: "Université de Liège - Gembloux Agro-Bio Tech", desc: "Belgique", type: "agriculture", tags: ["agriculture", "long", "international"] },
    { ids: [15], name: "UniLaSalle", desc: "Institut polytechnique", type: "agriculture", tags: ["agriculture", "engineering", "long", "private"] },

    // --- SCIENCES ET TECHNOLOGIES (Blue) ---
    // Unistra
    { ids: [37, 38, 39], name: "Unistra: Mathématique, info", desc: "UFR Math-Info", type: "science", tags: ["math", "nsi", "science", "long"] },
    { ids: [40], name: "Unistra: Terre et environnement", desc: "EOST", type: "science", tags: ["science", "svt", "long"] },
    { ids: [41, 42], name: "Unistra: Sciences de la vie", desc: "Biologie", type: "science", tags: ["science", "svt", "long"] },
    { ids: [65, 66], name: "Unistra: Physique et ingénierie", desc: "", type: "science", tags: ["science", "phys", "si", "long"] },
    { ids: [67], name: "Unistra: Astrophysique", desc: "", type: "science", tags: ["science", "phys", "long"] },
    { ids: [70, 71], name: "Unistra: Chimie", desc: "", type: "science", tags: ["science", "phys", "long"] },
    { ids: [72], name: "Unistra: CPES", desc: "Cycle pluridisciplinaire", type: "science", tags: ["science", "long"] },
    // UHA
    { ids: [68, 69], name: "UHA: Sciences et techniques", desc: "Maths, Info, MIAGE, Physique, Chimie, EEA, Méca", type: "science", tags: ["math", "nsi", "phys", "si", "long"] },
    // Other Univ
    { ids: [114], name: "Université de Lorraine - IDMC", desc: "Numérique (Nancy)", type: "science", tags: ["nsi", "tech", "long"] },

    // --- IUT (BUT) - TECH (Blue/Tech) ---
    { ids: [43], name: "IUT Louis Pasteur: Génie biologique", desc: "", type: "tech", tags: ["science", "svt", "short", "but"] },
    { ids: [44], name: "IUT Louis Pasteur: Mesures physiques", desc: "", type: "tech", tags: ["phys", "short", "but"] },
    { ids: [45], name: "IUT Louis Pasteur: Génie industriel", desc: "GIM", type: "tech", tags: ["si", "short", "but"] },
    { ids: [50], name: "IUT Haguenau: GEII", desc: "Génie élec et info indus", type: "tech", tags: ["si", "nsi", "short", "but"] },
    { ids: [61], name: "IUT Robert Schuman: Génie civil", desc: "", type: "tech", tags: ["si", "short", "but"] },
    { ids: [62], name: "IUT Robert Schuman: Informatique", desc: "", type: "tech", tags: ["nsi", "short", "but", "alternance"], alternance: true },
    { ids: [63], name: "IUT Robert Schuman: Chimie", desc: "", type: "tech", tags: ["phys", "short", "but"] },
    { ids: [46], name: "IUT Colmar: HSE", desc: "Hygiène Sécurité Env", type: "tech", tags: ["science", "short", "but"] },
    { ids: [47], name: "IUT Colmar: R&T", desc: "Réseaux Télécoms", type: "tech", tags: ["nsi", "short", "but"] },
    { ids: [48], name: "IUT Colmar: MTEE", desc: "Transition énergétique", type: "tech", tags: ["phys", "short", "but"] },
    { ids: [49], name: "IUT Colmar: Génie bio", desc: "Agronomie", type: "tech", tags: ["science", "agriculture", "short", "but"] },
    { ids: [58], name: "IUT Mulhouse: GMP", desc: "Mécanique", type: "tech", tags: ["si", "short", "but"] },
    { ids: [59], name: "IUT Mulhouse: GEII", desc: "Génie élec", type: "tech", tags: ["si", "short", "but"] },
    { ids: [60], name: "IUT Mulhouse: SGM", desc: "Science matériaux", type: "tech", tags: ["phys", "short", "but"] },
    { ids: [51], name: "IUT St-Dié: Informatique", desc: "", type: "tech", tags: ["nsi", "short", "but"] },

    // --- BTS / LYCEES TECH (Short) ---
    { ids: [16, 17, 18], name: "Lycée Heinrich-Nessel (Haguenau)", desc: "Élec, Cybersécu, Fluides", type: "tech", tags: ["si", "nsi", "short", "bts", "alternance"], alternance: true },
    { ids: [19, 20], name: "Pôle Formation UIMM", desc: "Assistance ingénieur, Chaudronnerie, Élec", type: "tech", tags: ["si", "short", "bts", "alternance"], alternance: true },
    { ids: [21], name: "Lycée L. Armand", desc: "Cybersécu, Élec", type: "tech", tags: ["si", "nsi", "short", "bts"] },
    { ids: [22], name: "Lycée J. Mermoz", desc: "Traitement matériaux", type: "tech", tags: ["phys", "short", "bts"] },
    { ids: [23, 24], name: "Lycée J. Rostand", desc: "Bio, Mode, Mesures", type: "tech", tags: ["science", "arts", "short", "bts"] },
    { ids: [52], name: "Lycée du Haut-Barr", desc: "Microtechniques", type: "tech", tags: ["si", "short", "bts"] },
    { ids: [54], name: "Lycée B. Pascal", desc: "Systèmes numériques", type: "tech", tags: ["nsi", "short", "bts"] },
    { ids: [55, 56], name: "Lycée L. Couffignal", desc: "Contrôle industriel, Élec, Bois", type: "tech", tags: ["si", "short", "bts"] },
    { ids: [57], name: "Lycée Le Corbusier", desc: "Bâtiment, Fluides, Énergie", type: "tech", tags: ["si", "short", "bts"] },
    { ids: [189], name: "Lycée Schwilgue", desc: "CFA", type: "tech", tags: ["si", "short", "alternance"], alternance: true },
    { ids: [196, 197, 198, 199, 200, 201], name: "CCI Campus Alsace", desc: "Informatique, Qualité", type: "tech", tags: ["nsi", "business", "short", "alternance"], alternance: true },

    // --- ENGINEERING (Long/Tech) ---
    { ids: [77], name: "ENGEES", desc: "Eau et Environnement (Strasbourg)", type: "tech", tags: ["engineering", "science", "long"] },
    { ids: [78], name: "EOST Ingénieur", desc: "Géophysique", type: "tech", tags: ["engineering", "science", "long"] },
    { ids: [79], name: "Télécom Physique Strasbourg", desc: "", type: "tech", tags: ["engineering", "phys", "nsi", "long"] },
    { ids: [82, 83], name: "CESI", desc: "École d'ingénieurs", type: "tech", tags: ["engineering", "long", "alternance"], alternance: true },
    { ids: [85, 86], name: "ENSAS Architecture", desc: "Architecture Strasbourg", type: "tech", tags: ["arts", "long"] },
    { ids: [92, 93], name: "ICAM", desc: "Ingénieur généraliste", type: "tech", tags: ["engineering", "long"] },
    { ids: [95, 96], name: "INSA Strasbourg", desc: "Ingénieurs et architectes", type: "tech", tags: ["engineering", "long", "math", "phys"] },
    { ids: [98, 99], name: "CESI Pro", desc: "", type: "tech", tags: ["engineering", "long"] },
    { ids: [100, 101], name: "ENSISA", desc: "Sud-Alsace (Mulhouse)", type: "tech", tags: ["engineering", "long"] },
    { ids: [102], name: "ENSCMu", desc: "Chimie Mulhouse", type: "tech", tags: ["engineering", "phys", "long"] },
    { ids: [103], name: "ECPM", desc: "Chimie Polymères", type: "tech", tags: ["engineering", "phys", "long"] },
    { ids: [104], name: "ESBS", desc: "Biotechnologie", type: "tech", tags: ["engineering", "science", "long"] },
    { ids: [80, 81], name: "ITII Alsace", desc: "Techniques d'ingénieur", type: "tech", tags: ["engineering", "alternance", "long"], alternance: true },
    { ids: [88, 89], name: "ESITC Metz", desc: "Construction", type: "tech", tags: ["engineering", "long"] },
    { ids: [110], name: "Polytech Nancy", desc: "", type: "tech", tags: ["engineering", "long"] },
    { ids: [115, 116, 117], name: "EPITA", desc: "Info", type: "tech", tags: ["engineering", "nsi", "long"] },

    // --- CPGE (Long) ---
    { ids: [73, 74, 75], name: "Lycée Kléber", desc: "CPGE Scientifique", type: "science", tags: ["cpge", "math", "phys", "long"] },
    { ids: [76], name: "École ORT", desc: "", type: "tech", tags: ["short"] },
    { ids: [106], name: "Lycée J. Rostand (CPGE)", desc: "", type: "science", tags: ["cpge", "short"] },
    { ids: [107, 108], name: "Lycée Couffignal (CPGE)", desc: "PTSI/PT", type: "tech", tags: ["cpge", "si", "long"] },

    // --- ARMÉES (Forces/Grey) ---
    { ids: [118, 119, 120], name: "Marine Nationale", desc: "", type: "forces", tags: ["army", "short", "long"] },
    { ids: [121], name: "Armée de l'Air", desc: "", type: "forces", tags: ["army"] },
    { ids: [122], name: "Police Nationale", desc: "", type: "forces", tags: ["police"] },
    { ids: [123], name: "Gendarmerie", desc: "", type: "forces", tags: ["police"] },
    { ids: [124, 125, 126], name: "Armée de Terre", desc: "", type: "forces", tags: ["army"] },

    // --- DROIT, ADMIN, SC POL (Purple/Pink) ---
    { ids: [128, 129], name: "UHA: Droit", desc: "Science Po, Admin", type: "law", tags: ["law", "politics", "long"] },
    { ids: [130, 131], name: "Unistra: Droit / AES", desc: "Faculté de Droit", type: "law", tags: ["law", "long"] },
    { ids: [133], name: "CUEJ", desc: "Journalisme", type: "law", tags: ["humanities", "long"] },
    { ids: [134, 135], name: "Sciences Po Strasbourg", desc: "", type: "law", tags: ["politics", "long", "selective"] },
    { ids: [136], name: "IPAG", desc: "Concours administratifs", type: "law", tags: ["law", "long"] },
    { ids: [127], name: "IUT Colmar (Juridique)", desc: "Carrières juridiques", type: "law", tags: ["law", "short", "but"] },
    { ids: [132], name: "Institut notarial (INFN)", desc: "Notariat", type: "law", tags: ["law", "short", "bts"] },
    { ids: [137], name: "INSP", desc: "Service public", type: "law", tags: ["politics", "long"] },

    // --- ÉCONOMIE, GESTION, COMMERCE (Orange) ---
    { ids: [64], name: "CFAU Alsace", desc: "Apprentissage univ", type: "economics", tags: ["alternance"], alternance: true },
    { ids: [142], name: "UHA Business School", desc: "", type: "economics", tags: ["business", "long"] },
    { ids: [143, 144], name: "EM Strasbourg", desc: "Business School", type: "economics", tags: ["business", "long"] },
    { ids: [145], name: "ICN Business School", desc: "", type: "economics", tags: ["business", "long"] },
    { ids: [146, 147], name: "CNAM", desc: "", type: "economics", tags: ["short", "long", "adult"] },
    { ids: [152, 153], name: "Unistra: Économie-Gestion", desc: "Maths-Eco, LEA", type: "economics", tags: ["economics", "math", "long"] },
    { ids: [155], name: "IUT Robert Schuman: Tech de Co", desc: "", type: "economics", tags: ["business", "short", "but"] },
    { ids: [156], name: "IUT RS: Info-Com", desc: "", type: "economics", tags: ["art", "short", "but"] },
    { ids: [158, 159], name: "IUT Louis Pasteur: GEA", desc: "Gestion entreprises", type: "economics", tags: ["business", "short", "but"] },
    { ids: [161, 162], name: "IUT Colmar: Tech de Co", desc: "", type: "economics", tags: ["business", "short", "but"] },
    { ids: [163], name: "IUT Mulhouse: GEA", desc: "Gestion", type: "economics", tags: ["business", "short", "but"] },
    { ids: [148], name: "École Supérieure de la Banque", desc: "", type: "economics", tags: ["business", "short", "bts"] },
    { ids: [175, 176, 177], name: "Lycée R. Cassin", desc: "Banque, Commerce, Compta", type: "economics", tags: ["business", "short", "bts"] },
    { ids: [178], name: "Lycée Mermoz (Assurance)", desc: "", type: "economics", tags: ["business", "short", "bts"] },
    { ids: [181], name: "Lycée Schongauer", desc: "Immobilier", type: "economics", tags: ["business", "short", "bts"] },
    { ids: [184], name: "Lycée Dumas", desc: "Tourisme / Hôtellerie", type: "economics", tags: ["business", "short", "bts"] },
    { ids: [211, 212, 213], name: "CEFPPA", desc: "Hôtellerie", type: "economics", tags: ["business", "short", "alternance"], alternance: true },

    // --- ARTS, LETTRES, LANGUES (Teal/Purple) ---
    { ids: [223], name: "Unistra: Arts plastiques", desc: "Design", type: "arts", tags: ["art", "design", "long"] },
    { ids: [224], name: "Unistra: Arts du spectacle", desc: "Cinéma", type: "arts", tags: ["art", "long"] },
    { ids: [225], name: "Unistra: Musique", desc: "", type: "arts", tags: ["art", "music", "long"] },
    { ids: [246], name: "Unistra: Lettres", desc: "", type: "arts", tags: ["humanities", "hlp", "long"] },
    { ids: [217, 218, 219, 220, 221], name: "Unistra: Langues", desc: "Allemand, Anglais, LEA...", type: "arts", tags: ["humanities", "llce", "long"] },
    { ids: [267], name: "UHA: Lettres Langues", desc: "", type: "arts", tags: ["humanities", "llce", "long"] },
    { ids: [25], name: "Lycée L. Armand (DN MADE)", desc: "Design", type: "arts", tags: ["art", "design", "short"] },
    { ids: [57], name: "Lycée Le Corbusier (DN MADE)", desc: "Design", type: "arts", tags: ["art", "design", "short"] },

    // --- SANTÉ, SOCIAL, SPORT (Pink) ---
    { ids: [257], name: "Démonstration Métiers", desc: "Soins et social", type: "sante", tags: ["health", "social"] },
    { ids: [255], name: "IFSI Erstein", desc: "Soins infirmiers", type: "sante", tags: ["health", "short"] },
    { ids: [256], name: "Diaconat Mulhouse", desc: "", type: "sante", tags: ["health", "short"] },
    { ids: [261], name: "UHA: Sport", desc: "STAPS", type: "sante", tags: ["sport", "long"] },
    { ids: [227], name: "UFA Oberlin / Roosevelt", desc: "Préparateur pharma", type: "sante", tags: ["health", "alternance"], alternance: true },
    { ids: [252, 253], name: "Unistra: Sport", desc: "STAPS", type: "sante", tags: ["sport", "long"] },
    { ids: [275, 276], name: "Unistra: Santé", desc: "Licence Sciences pour la Santé", type: "sante", tags: ["health", "science", "long"] },
    { ids: [277], name: "Unistra: Médecine / Maïeutique", desc: "", type: "sante", tags: ["health", "science", "long"] },
    { ids: [278, 279], name: "Unistra: Pharmacie", desc: "", type: "sante", tags: ["health", "science", "long"] },
    { ids: [280, 281], name: "Unistra: Dentaire", desc: "", type: "sante", tags: ["health", "science", "long"] },
    { ids: [264, 265], name: "INSPE", desc: "Professoral", type: "social", tags: ["social", "long"] },
    { ids: [273, 274], name: "Unistra: Psychologie", desc: "", type: "social", tags: ["social", "long"] },

    // --- UNKNOWN PLACES (Fillers) ---
];

// --- Data extracted from stands.json ---
const newStandData = [
    { "stand": 1, "etablissement": "Espace Orientation & Réussite", "sujet": "Parcoursup, orientation, aide à la réussite", "alternance": "Non", "autres": "Projet Noria, IDIP, Points conseil flash [cite: 781, 784]" },
    { "stand": 2, "etablissement": "Espace International - Euroguidance", "sujet": "Mobilité internationale", "alternance": "Non", "autres": "Conseils pour l'étranger [cite: 786, 787]" },
    { "stand": 3, "etablissement": "Espace International - Agentur für Arbeit", "sujet": "Études et formations en Allemagne", "alternance": "Non", "autres": "Berufsberatung [cite: 787]" },
    { "stand": 4, "etablissement": "Espace International - EF Education First", "sujet": "Séjours linguistiques", "alternance": "Non", "autres": "Cours de langues [cite: 788, 789]" },
    { "stand": 7, "etablissement": "Vie Étudiante - Crous de Strasbourg", "sujet": "Bourses, logement, restauration", "alternance": "Non", "autres": "Accompagnement social [cite: 795, 796]" },
    { "stand": 8, "etablissement": "Vie Étudiante - Unistra / SVU", "sujet": "Culture, Handicap, Vie associative", "alternance": "Non", "autres": "Carte Culture [cite: 802, 803, 804]" },
    { "stand": 10, "etablissement": "Lycées Agricoles / CFA / CFPPA", "sujet": "Métiers du vert, agronomie, cultures", "alternance": "Oui (CFA)", "autres": "Erstein, Colmar, Obernai [cite: 815]" },
    { "stand": 11, "etablissement": "Lycées Agricoles / CFA / CFPPA", "sujet": "Aménagements paysagers, forêt", "alternance": "Oui (CFA)", "autres": "Rouffach, Bouxwiller [cite: 815, 816]" },
    { "stand": 13, "etablissement": "UniLaSalle", "sujet": "Institut polytechnique", "alternance": "Non spécifié", "autres": "Ingénieur [cite: 821]" },
    { "stand": 15, "etablissement": "Université de Liège", "sujet": "Gembloux Agro-Bio Tech", "alternance": "Non", "autres": "Belgique [cite: 820]" },
    { "stand": 16, "etablissement": "Lycée Heinrich-Nessel (Haguenau)", "sujet": "Systèmes automatiques, cybersécurité", "alternance": "Oui (UFA)", "autres": "BTS, CPGE [cite: 865, 867, 883]" },
    { "stand": 17, "etablissement": "Lycée Heinrich-Nessel (Haguenau)", "sujet": "Électrotechnique", "alternance": "Oui (UFA)", "autres": "BTS [cite: 865, 867]" },
    { "stand": 18, "etablissement": "Lycée Heinrich-Nessel (Haguenau)", "sujet": "Fluides, énergies, domotique", "alternance": "Oui (UFA)", "autres": "BTS [cite: 865, 867]" },
    { "stand": 19, "etablissement": "Pôle Formation UIMM - CFAI Alsace", "sujet": "Assistance technique d'ingénieur", "alternance": "Oui (CFAI)", "autres": "Maintenance des systèmes [cite: 824, 867]" },
    { "stand": 20, "etablissement": "Pôle Formation UIMM - CFAI Alsace", "sujet": "Conception de produits industriels", "alternance": "Oui (CFAI)", "autres": "Chaudronnerie [cite: 824, 867]" },
    { "stand": 23, "etablissement": "Lycée Jean Rostand (Strasbourg)", "sujet": "Biologie médicale, Bioanalyses", "alternance": "Non spécifié", "autres": "Biotechnologie [cite: 871]" },
    { "stand": 24, "etablissement": "Lycée Jean Rostand (Strasbourg)", "sujet": "Esthétique, mode, diététique", "alternance": "Non spécifié", "autres": "Cosmétique, parfumerie [cite: 871, 1107, 1108]" },
    { "stand": 25, "etablissement": "Université de Haute-Alsace (UHA)", "sujet": "Biopôle Colmar, agronomie", "alternance": "Non spécifié", "autres": "Enologie, viticulture [cite: 811, 812, 813]" },
    { "stand": 28, "etablissement": "Les Compagnons du Devoir", "sujet": "Artisanat", "alternance": "Oui (Apprentissage)", "autres": "Tour de France [cite: 807]" },
    { "stand": 29, "etablissement": "Chambre de métiers d'Alsace", "sujet": "Artisanat, métiers techniques", "alternance": "Oui", "autres": "Orientation artisanale [cite: 808, 824]" },
    { "stand": 30, "etablissement": "Chambre de métiers d'Alsace", "sujet": "Artisanat", "alternance": "Oui", "autres": "Apprentissage [cite: 808, 824]" },
    { "stand": 37, "etablissement": "Unistra - Faculté des Sciences", "sujet": "Mathématiques", "alternance": "Non", "autres": "Filière universitaire [cite: 827, 828]" },
    { "stand": 38, "etablissement": "Unistra - Faculté des Sciences", "sujet": "Informatique", "alternance": "Non", "autres": "Filière universitaire [cite: 827, 828]" },
    { "stand": 39, "etablissement": "Unistra - Faculté des Sciences", "sujet": "Mathématique, informatique", "alternance": "Non", "autres": "Filière universitaire [cite: 827, 828]" },
    { "stand": 41, "etablissement": "Unistra - Sciences de la vie", "sujet": "Biologie", "alternance": "Non", "autres": "Filière universitaire [cite: 830]" },
    { "stand": 42, "etablissement": "Unistra - Sciences de la vie", "sujet": "Biologie", "alternance": "Non", "autres": "Filière universitaire [cite: 830]" },
    { "stand": 50, "etablissement": "IUT de Haguenau", "sujet": "Génie électrique et info industrielle", "alternance": "Oui (BUT)", "autres": "GEII [cite: 844, 845]" },
    { "stand": 55, "etablissement": "Lycée Couffignal (Strasbourg)", "sujet": "Conception de produits industriels", "alternance": "Non spécifié", "autres": "Processus réalisation [cite: 876, 877]" },
    { "stand": 56, "etablissement": "Lycée Couffignal (Strasbourg)", "sujet": "Électronique, systèmes bois", "alternance": "Non spécifié", "autres": "Systèmes constructifs [cite: 876, 877]" },
    { "stand": 60, "etablissement": "IUT de Mulhouse", "sujet": "Science et génie des matériaux", "alternance": "Oui (BUT)", "autres": "UHA [cite: 856, 861]" },
    { "stand": 65, "etablissement": "Unistra - Physique & Ingénierie", "sujet": "Physique", "alternance": "Non", "autres": "Astrophysique [cite: 831]" },
    { "stand": 66, "etablissement": "Unistra - Physique & Ingénierie", "sujet": "Ingénierie", "alternance": "Non", "autres": "Filière universitaire [cite: 831]" },
    { "stand": 70, "etablissement": "Unistra - Faculté de Chimie", "sujet": "Chimie", "alternance": "Non", "autres": "CPES [cite: 832, 833]" },
    { "stand": 71, "etablissement": "Unistra - Faculté de Chimie", "sujet": "Chimie", "alternance": "Non", "autres": "Cycle pluridisciplinaire [cite: 832, 833]" },
    { "stand": 80, "etablissement": "ITII Alsace", "sujet": "Techniques d'ingénieur de l'industrie", "alternance": "Oui (Apprentissage)", "autres": "Partenaire Alsace Tech [cite: 905]" },
    { "stand": 81, "etablissement": "ITII Alsace", "sujet": "Ingénierie industrielle", "alternance": "Oui (Apprentissage)", "autres": "Strasbourg / Mulhouse [cite: 905]" },
    { "stand": 85, "etablissement": "ENSAS (Architecture)", "sujet": "Architecture", "alternance": "Non spécifié", "autres": "École nationale Strasbourg [cite: 898]" },
    { "stand": 86, "etablissement": "ENSAS (Architecture)", "sujet": "Architecture", "alternance": "Non spécifié", "autres": "Strasbourg [cite: 898]" },
    { "stand": 98, "etablissement": "CESI École d'ingénieurs", "sujet": "Programme professionnel supérieur", "alternance": "Oui", "autres": "Strasbourg [cite: 900]" },
    { "stand": 99, "etablissement": "CESI École d'ingénieurs", "sujet": "Ingénierie", "alternance": "Oui", "autres": "Professionnel supérieur [cite: 900]" },
    { "stand": 112, "etablissement": "Police Nationale", "sujet": "Sécurité", "alternance": "Non", "autres": "Concours et recrutement [cite: 919]" },
    { "stand": 118, "etablissement": "Marine Nationale / Armée de l'Air", "sujet": "Défense", "alternance": "Non", "autres": "Métiers militaires [cite: 917, 918]" },
    { "stand": 119, "etablissement": "Marine Nationale / Armée de l'Air", "sujet": "Défense", "alternance": "Non", "autres": "Armée de l'Air et de l'Espace [cite: 917, 918]" },
    { "stand": 120, "etablissement": "Marine Nationale / Armée de l'Air", "sujet": "Défense", "alternance": "Non", "autres": "Métiers de l'armée [cite: 917, 918]" },
    { "stand": 124, "etablissement": "Armée de Terre", "sujet": "Défense", "alternance": "Non", "autres": "Recrutement [cite: 921]" },
    { "stand": 125, "etablissement": "Armée de Terre", "sujet": "Défense", "alternance": "Non", "autres": "Recrutement [cite: 921]" },
    { "stand": 126, "etablissement": "Armée de Terre", "sujet": "Défense", "alternance": "Non", "autres": "Recrutement [cite: 921]" },
    { "stand": 128, "etablissement": "UHA - Droit", "sujet": "Droit, administration, science politique", "alternance": "Non", "autres": "UHA [cite: 924, 925]" },
    { "stand": 129, "etablissement": "UHA - Droit", "sujet": "Droit, administration", "alternance": "Non", "autres": "UHA [cite: 924, 925]" },
    { "stand": 130, "etablissement": "Unistra - Droit / AES", "sujet": "Droit / Administration économique", "alternance": "Non", "autres": "Faculté de droit [cite: 926, 927]" },
    { "stand": 131, "etablissement": "Unistra - Droit / AES", "sujet": "Droit / Administration sociale", "alternance": "Non", "autres": "Faculté de droit [cite: 926, 927]" },
    { "stand": 134, "etablissement": "Sciences Po Strasbourg", "sujet": "Sciences Politiques", "alternance": "Non", "autres": "Filière d'excellence [cite: 929]" },
    { "stand": 135, "etablissement": "Sciences Po Strasbourg", "sujet": "Sciences Politiques", "alternance": "Non", "autres": "Strasbourg [cite: 929]" },
    { "stand": 143, "etablissement": "EM Strasbourg Business School", "sujet": "Management, gestion", "alternance": "Oui (certains cycles)", "autres": "Unistra [cite: 950, 1029]" },
    { "stand": 144, "etablissement": "EM Strasbourg Business School", "sujet": "Économie, commerce", "alternance": "Oui", "autres": "Unistra [cite: 950, 1029]" },
    { "stand": 146, "etablissement": "CNAM Strasbourg", "sujet": "Gestion, Comptabilité (DCG)", "alternance": "Oui", "autres": "DCG/DSCG [cite: 944, 1022, 1031]" },
    { "stand": 147, "etablissement": "CNAM Strasbourg", "sujet": "Comptabilité, gestion", "alternance": "Oui", "autres": "Strasbourg [cite: 944, 1022, 1031]" },
    { "stand": 149, "etablissement": "Lycée René Cassin", "sujet": "Expertise Comptable (DCG/CPGE)", "alternance": "Non spécifié", "autres": "CPGE [cite: 1018, 1023]" },
    { "stand": 150, "etablissement": "Lycée René Cassin", "sujet": "Comptabilité (DCG)", "alternance": "Non spécifié", "autres": "Expertise [cite: 1018, 1023]" },
    { "stand": 175, "etablissement": "Lycée René Cassin", "sujet": "Banque, commerce international", "alternance": "Non spécifié", "autres": "BTS [cite: 974, 975]" },
    { "stand": 176, "etablissement": "Lycée René Cassin", "sujet": "Communication, comptabilité", "alternance": "Non spécifié", "autres": "BTS [cite: 974, 975]" },
    { "stand": 177, "etablissement": "Lycée René Cassin", "sujet": "Gestion PME, Management commercial", "alternance": "Non spécifié", "autres": "BTS [cite: 974, 975, 976]" },
    { "stand": 184, "etablissement": "Lycée Alexandre Dumas (Illkirch)", "sujet": "Hôtellerie-restauration, Tourisme", "alternance": "Non spécifié", "autres": "Management hôtelier [cite: 985, 986]" },
    { "stand": 196, "etablissement": "CCI Campus Alsace - CFA", "sujet": "Vente, commerce, immobilier", "alternance": "Oui (CFA)", "autres": "Strasbourg [cite: 1002, 1024, 1032]" },
    { "stand": 197, "etablissement": "CCI Campus Alsace - CFA", "sujet": "Gestion, RH, Comptabilité", "alternance": "Oui (CFA)", "autres": "Strasbourg [cite: 1002, 1024, 1032]" },
    { "stand": 198, "etablissement": "CCI Campus Alsace - CFA", "sujet": "Informatique, Web, International", "alternance": "Oui (CFA)", "autres": "Strasbourg [cite: 1002, 1024, 1032]" },
    { "stand": 202, "etablissement": "Lycée Sainte Clotilde", "sujet": "Commerce international, Communication", "alternance": "Non spécifié", "autres": "Marketing digital [cite: 1003]" },
    { "stand": 203, "etablissement": "Lycée Sainte Clotilde", "sujet": "Sanitaire et social, RH", "alternance": "Non spécifié", "autres": "Évènementiel [cite: 1003]" },
    { "stand": 204, "etablissement": "Lycée Sainte Clotilde", "sujet": "Prépa écoles de commerce", "alternance": "Non spécifié", "autres": "BTS divers [cite: 1003]" },
    { "stand": 211, "etablissement": "CEFPPA - CFA hôtelier A. ZELLER", "sujet": "Hôtellerie-restauration", "alternance": "Oui (CFA)", "autres": "Illkirch [cite: 1012, 1013]" },
    { "stand": 212, "etablissement": "CEFPPA - CFA hôtelier A. ZELLER", "sujet": "Hôtellerie", "alternance": "Oui (CFA)", "autres": "Illkirch [cite: 1012]" },
    { "stand": 213, "etablissement": "CEFPPA - CFA hôtelier A. ZELLER", "sujet": "Restauration", "alternance": "Oui (CFA)", "autres": "Illkirch [cite: 1012]" },
    { "stand": 257, "etablissement": "Démonstration Région Grand Est", "sujet": "Métiers du soin et du social", "alternance": "Non spécifié", "autres": "Mise en situation réelle [cite: 1089, 1147]" },
    { "stand": 278, "etablissement": "Unistra - Faculté de Pharmacie", "sujet": "Santé", "alternance": "Non", "autres": "Pharmacie [cite: 1104]" },
    { "stand": 279, "etablissement": "Unistra - Faculté de Pharmacie", "sujet": "Santé", "alternance": "Non", "autres": "Pharmacie [cite: 1104]" },
    { "stand": 280, "etablissement": "Unistra - Chirurgie dentaire", "sujet": "Santé", "alternance": "Non", "autres": "Odontologie [cite: 1105]" },
    { "stand": 281, "etablissement": "Unistra - Chirurgie dentaire", "sujet": "Santé", "alternance": "Non", "autres": "Strasbourg [cite: 1105]" }
];

// Flatten the data for easier access by ID AND Merge
const standMap = new Map();

// 1. Load Old Data (Priority)
standDataRaw.forEach(item => {
    item.ids.forEach(id => {
        standMap.set(id, {
            id: id,
            name: item.name,
            description: item.desc,
            type: item.type,
            tags: item.tags,
            alternance: !!item.alternance
        });
    });
});

// Helper to determine type based on strings
function determineType(name, sujet) {
    const text = (name + " " + sujet).toLowerCase();

    if (text.includes('orientation') || text.includes('reussite') || text.includes('réussite')) return 'social';
    if (text.includes('international') || text.includes('allemagne') || text.includes('linguistique') || text.includes('europe')) return 'international';
    if (text.includes('vie étudiante') || text.includes('crous') || text.includes('bourses') || text.includes('culture')) return 'vie-etudiante';
    if (text.includes('agricole') || text.includes('agronomie') || text.includes('paysage') || text.includes('forêt') || text.includes('vigne') || text.includes('environnement')) return 'agriculture';
    if (text.includes('artisanat') || text.includes('compagnons') || text.includes('métiers')) return 'artisanat';
    if (text.includes('armée') || text.includes('police') || text.includes('défense') || text.includes('sécurité')) return 'forces';
    if (text.includes('droit') || text.includes('juridique') || text.includes('avocat') || text.includes('science politique') || text.includes('admin') || text.includes('sciences po')) return 'law';
    if (text.includes('économie') || text.includes('gestion') || text.includes('commerce') || text.includes('management') || text.includes('banque') || text.includes('business') || text.includes('comptabilité') || text.includes('vente') || text.includes('rh') || text.includes('immobilier') || text.includes('tourisme') || text.includes('hôtellerie')) return 'economics';
    if (text.includes('art') || text.includes('design') || text.includes('mode') || text.includes('musique') || text.includes('cinéma') || text.includes('lettres') || text.includes('langues') || text.includes('communication') || text.includes('culture')) return 'arts';
    if (text.includes('santé') || text.includes('médecine') || text.includes('pharmacie') || text.includes('soin') || text.includes('dentaire') || text.includes('biologie') || text.includes('médicale') || text.includes('social')) return 'sante'; // Priority catch for Sante
    if (text.includes('science') || text.includes('math') || text.includes('physique') || text.includes('chimie') || text.includes('svt')) return 'science';

    return 'tech'; // Default fallback for Lycées/IUTs not caught above
}

newStandData.forEach(item => {
    // Only add if not already present (Old Script Priority)
    if (standMap.has(item.stand)) return;

    const type = determineType(item.etablissement, item.sujet);
    const tags = [];

    // Auto-tagging based on detected keywords for search
    if (item.alternance && item.alternance.toLowerCase().includes('oui')) tags.push('alternance');
    if (type === 'science') tags.push('science', 'math', 'phys');
    if (type === 'tech') tags.push('tech', 'si', 'nsi', 'engineering');
    if (type === 'agriculture') tags.push('agriculture', 'environment');
    if (type === 'sante') tags.push('health', 'social');
    if (type === 'economics') tags.push('business', 'economics');
    if (type === 'law') tags.push('law', 'politics');
    if (type === 'arts') tags.push('art', 'design');

    standMap.set(item.stand, {
        id: item.stand,
        name: item.etablissement,
        description: item.sujet + (item.autres ? " - " + item.autres : ""),
        type: type,
        tags: tags,
        alternance: item.alternance && item.alternance.toLowerCase().includes('oui')
    });
});

// Helper to find data by ID
function getStandDetails(id) {
    if (standMap.has(id)) {
        return standMap.get(id);
    }

    // Default/Fallback
    return {
        id: id,
        name: `Stand ${id}`,
        description: "Information en attente...",
        type: "other",
        tags: [],
        alternance: false
    };
}

// --- DOM Elements ---
const standGrid = document.getElementById('standGrid');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('standModal');
const closeModalBtn = document.getElementById('closeModal');
const toggleQuizBtn = document.getElementById('toggleQuizBtn');
const quizPanel = document.getElementById('quizPanel');
const submitQuizBtn = document.getElementById('submitQuiz');
const resetQuizBtn = document.getElementById('resetQuiz');

// --- Initialization ---
function initMap() {
    standGrid.innerHTML = '';
    // Max 290 stands
    for (let i = 1; i <= 290; i++) {
        const standEl = document.createElement('div');
        const details = getStandDetails(i);

        standEl.classList.add('stand-item');
        standEl.classList.add(details.type);
        standEl.dataset.id = i;
        standEl.textContent = i;

        // If it's a "known" stand (type is not other, or mapped), make it interactive
        // Even 'other' stands are clickable but might be empty

        standEl.addEventListener('click', () => openModal(details));

        standGrid.appendChild(standEl);
    }
}

// --- Modal Logic ---
function openModal(data) {
    document.getElementById('modalStandNumber').textContent = `Stand ${data.id}`;
    document.getElementById('modalTitle').textContent = data.name;
    document.getElementById('modalDescription').textContent = data.description || "Aucune description disponible.";

    const tagsContainer = document.getElementById('modalTags');
    tagsContainer.innerHTML = '';

    // Type Tag
    const typeSpan = document.createElement('span');
    typeSpan.className = 'tag';
    typeSpan.style.backgroundColor = 'var(--text-secondary)';
    typeSpan.style.color = 'white';
    typeSpan.textContent = (typeTranslations[data.type] || data.type).toUpperCase();
    tagsContainer.appendChild(typeSpan);

    if (data.alternance) {
        const altSpan = document.createElement('span');
        altSpan.className = 'tag';
        altSpan.style.backgroundColor = '#2ecc71'; // Greenish
        altSpan.style.color = 'white';
        altSpan.textContent = "ALTERNANCE";
        tagsContainer.appendChild(altSpan);
    }

    data.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = `#${tag}`;
        tagsContainer.appendChild(span);
    });

    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
}

closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
    }
});

// --- Search Logic ---
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const stands = document.querySelectorAll('.stand-item');

    stands.forEach(stand => {
        const id = parseInt(stand.dataset.id);
        const data = getStandDetails(id);

        const match = data.name.toLowerCase().includes(query) ||
            data.description.toLowerCase().includes(query) ||
            data.tags.some(t => t.toLowerCase().includes(query)) ||
            id.toString().includes(query);

        if (query === "") {
            stand.classList.remove('dimmed', 'highlight');
        } else if (match) {
            stand.classList.remove('dimmed');
            stand.classList.add('highlight');
        } else {
            stand.classList.add('dimmed');
            stand.classList.remove('highlight');
        }
    });
});

// --- Quiz Logic ---
toggleQuizBtn.addEventListener('click', () => {
    quizPanel.classList.toggle('hidden');
    toggleQuizBtn.textContent = quizPanel.classList.contains('hidden') ? "Find My Stand (Quiz)" : "Hide Quiz";
});

submitQuizBtn.addEventListener('click', () => {
    // 1. Get Checked Specialties
    const specialtyCheckboxes = document.querySelectorAll('input[name="specialty"]:checked');
    const specialties = Array.from(specialtyCheckboxes).map(cb => cb.value); // ['math', 'nsi', ...]

    // 2. Get Alternance Preference
    const alternanceValue = document.querySelector('input[name="alternance"]:checked').value;

    // 3. Get Duration, Field & Vibe
    const duration = document.getElementById('duration').value;
    const field = document.getElementById('field').value;
    const vibe = document.getElementById('vibe').value;

    if (specialties.length === 0 && !duration && !field && !vibe && alternanceValue === 'any') {
        alert("Veuillez sélectionner au moins une option pour trouver des résultats.");
        return;
    }

    const stands = document.querySelectorAll('.stand-item');
    let hasMatch = false;

    stands.forEach(stand => {
        const id = parseInt(stand.dataset.id);
        const data = getStandDetails(id);
        let score = 0;

        // --- Scoring Logic ---

        // A. Alternance Filter (Strict if Yes)
        if (alternanceValue === 'yes') {
            if (data.alternance || data.tags.includes('alternance') || data.tags.includes('bts')) {
                score += 5;
            } else {
                score -= 10; // Penalize non-alternance options heavily
            }
        }
        if (alternanceValue === 'no') {
            if (data.name.includes("CFA")) {
                score -= 5;
            }
        }

        // B. Duration Match
        if (duration === 'short' && (data.tags.includes('short') || data.tags.includes('bts') || data.tags.includes('but'))) score += 3;
        if (duration === 'long' && (data.tags.includes('long') || data.tags.includes('master') || data.tags.includes('engineering'))) score += 3;

        // C. Field Match (Broad Category)
        if (field && (data.type === field || data.tags.includes(field))) {
            score += 5;
        }

        // D. Vibe Match (New "More Precise" Layer)
        if (vibe === 'builder' && (data.tags.includes('engineering') || data.tags.includes('tech') || data.tags.includes('manual') || data.name.includes('IUT') || data.name.includes('Lycée') || data.name.includes('Compagnons'))) score += 4;
        if (vibe === 'helper' && (data.tags.includes('health') || data.tags.includes('social') || data.tags.includes('education') || data.name.includes('INSPE') || data.name.includes('IFSI'))) score += 4;
        if (vibe === 'analyzer' && (data.tags.includes('law') || data.tags.includes('politics') || data.tags.includes('science') || data.tags.includes('economics'))) score += 3;
        if (vibe === 'creative' && (data.tags.includes('art') || data.tags.includes('design') || data.tags.includes('communication') || data.tags.includes('culture'))) score += 4;
        if (vibe === 'nature' && (data.tags.includes('agriculture') || data.tags.includes('svt') || data.tags.includes('sport') || data.tags.includes('environment'))) score += 4;
        if (vibe === 'action' && (data.tags.includes('army') || data.tags.includes('police') || data.tags.includes('sport') || data.tags.includes('firefighter'))) score += 5;

        // E. Specialty Tag Matching (Nuanced)
        specialties.forEach(spec => {
            if (data.tags.includes(spec)) score += 4;

            // Indirect Maps
            if (spec === 'math' && (data.type === 'science' || data.tags.includes('engineering') || data.tags.includes('economics'))) score += 1;
            if (spec === 'phys' && (data.type === 'science' || data.tags.includes('health') || data.tags.includes('engineering'))) score += 1;
            if (spec === 'nsi' && (data.type === 'tech' || data.tags.includes('engineering'))) score += 2;
            if (spec === 'si' && (data.type === 'tech' || data.tags.includes('engineering'))) score += 2;
            if (spec === 'ses' && (data.type === 'economics' || data.type === 'law' || data.tags.includes('business'))) score += 2;
            if (spec === 'hlp' && (data.type === 'arts' || data.type === 'law' || data.type === 'social')) score += 2;
            if (spec === 'llce' && (data.type === 'arts' || data.type === 'international')) score += 3;
            if (spec === 'arts' && (data.type === 'arts')) score += 3;
        });

        // Threshold
        if (score >= 5) {
            stand.classList.add('highlight');
            stand.classList.remove('dimmed');
            hasMatch = true;
        } else {
            stand.classList.remove('highlight');
            stand.classList.add('dimmed');
        }
    });

    if (hasMatch) {
        standGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        alert("Aucun résultat pertinent trouvé. Essayez d'élargir vos critères.");
        stands.forEach(s => s.classList.remove('dimmed')); // Reset view
    }
});

resetQuizBtn.addEventListener('click', () => {
    // Reset Checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    // Reset Radios
    const anyRadio = document.querySelector('input[name="alternance"][value="any"]');
    if (anyRadio) anyRadio.checked = true;

    document.getElementById('duration').value = "";
    document.getElementById('field').value = "";
    document.getElementById('vibe').value = "";

    const stands = document.querySelectorAll('.stand-item');
    stands.forEach(s => s.classList.remove('highlight', 'dimmed'));
});

initMap();

