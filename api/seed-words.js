const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
    });
  }
  return pool;
}

const WORD_PAIRS = [
  ["OCEAN","FISH","animals","Fish live in the ocean"],
  ["JUNGLE","APE","animals","Apes swing through the jungle"],
  ["STRIPE","WASP","animals","Wasps have stripes"],
  ["BAMBOO","BEAR","animals","Panda bears eat bamboo"],
  ["DESERT","HAWK","animals","Hawks hunt over the desert"],
  ["ARCTIC","SEAL","animals","Seals live in the Arctic"],
  ["FEATHER","BIRD","animals","Birds have feathers"],
  ["BURROW","MOLE","animals","Moles dig burrows"],
  ["SAVANNA","LION","animals","Lions roam the savanna"],
  ["NECTAR","MOTH","animals","Moths drink nectar"],
  ["CORAL","CRAB","animals","Crabs live around coral"],
  ["FOREST","DEER","animals","Deer live in the forest"],
  ["RIVER","FROG","animals","Frogs live by rivers"],
  ["BRANCH","NEST","animals","Birds build nests on branches"],
  ["NIGHT","OWLS","animals","Owls hunt at night"],
  ["SHELL","CLAM","animals","Clams have shells"],
  ["HONEY","HIVE","animals","Bees make honey in the hive"],
  ["SWAMP","NEWT","animals","Newts live in swamps"],
  ["MEADOW","HARE","animals","Hares run through meadows"],
  ["STABLE","FOAL","animals","Foals are born in stables"],
  ["COLONY","ANTS","animals","Ants live in colonies"],
  ["POUCH","JOEY","animals","Joeys ride in pouches"],
  ["KENNEL","PUPS","animals","Pups sleep in kennels"],
  ["CANOPY","SLTH","animals","Sloths hang from the canopy"],
  ["GARDEN","SLUG","animals","Slugs crawl through gardens"],
  ["TUNNEL","WORM","animals","Worms dig tunnels"],
  ["PASTURE","LAMB","animals","Lambs graze in pastures"],
  ["CAVERN","BATS","animals","Bats roost in caverns"],
  ["ISLAND","GULL","animals","Gulls circle islands"],
  ["TUNDRA","WOLF","animals","Wolves roam the tundra"],
  ["MAGMA","LAVA","science","Magma becomes lava above ground"],
  ["PLANET","MARS","science","Mars is a planet"],
  ["FOSSIL","BONE","science","Fossils preserve ancient bones"],
  ["STORM","RAIN","science","Storms bring rain"],
  ["PRISM","GLOW","science","Prisms make light glow in colours"],
  ["NUCLEUS","ATOM","science","Every atom has a nucleus"],
  ["CRATER","MOON","science","The moon is covered in craters"],
  ["TIDAL","WAVE","science","Tidal forces create waves"],
  ["OXYGEN","LUNG","science","Lungs breathe in oxygen"],
  ["MAGNET","POLE","science","Magnets have north and south poles"],
  ["CRYSTAL","GEMS","science","Gems are formed from crystals"],
  ["CIRCUIT","WIRE","science","Wires carry current in a circuit"],
  ["EROSION","SAND","science","Erosion breaks rock into sand"],
  ["GLACIER","MELT","science","Glaciers melt into water"],
  ["GRAVITY","FALL","science","Gravity makes things fall"],
  ["VOLTAGE","BOLT","science","Lightning bolts carry voltage"],
  ["PHOTON","RAYS","science","Rays are streams of photons"],
  ["CARBON","COAL","science","Coal is made of carbon"],
  ["FUSION","CORE","science","Fusion happens in a star's core"],
  ["ENZYME","CELL","science","Enzymes work inside cells"],
  ["THERMAL","HEAT","science","Thermal means relating to heat"],
  ["QUARTZ","ROCK","science","Quartz is a common rock mineral"],
  ["STATIC","ZAPS","science","Static electricity zaps you"],
  ["PLASMA","GLOW","science","Plasma glows when energised"],
  ["POLLEN","SEED","science","Pollen helps plants make seeds"],
  ["CURRENT","FLOW","science","Currents flow through conductors"],
  ["CHEESE","BRIE","food","Brie is a type of cheese"],
  ["DOUGH","ROLL","food","You roll out dough"],
  ["COCOA","CAKE","food","Cocoa is used in cake"],
  ["CREAM","CONE","food","Ice cream comes in a cone"],
  ["SYRUP","DRIP","food","Syrup drips off a spoon"],
  ["PASTRY","TART","food","A tart is a type of pastry"],
  ["GRAIN","RICE","food","Rice is a grain"],
  ["PEPPER","MILD","food","Some peppers are mild"],
  ["CITRUS","LIME","food","Lime is a citrus fruit"],
  ["NOODLE","SOUP","food","Noodles go in soup"],
  ["ICING","BAKE","food","You ice things after you bake them"],
  ["BUTTER","CORN","food","Butter goes on corn"],
  ["CHERRY","STEM","food","Cherries have stems"],
  ["GINGER","ROOT","food","Ginger is a root"],
  ["OVEN","LOAF","food","You bake a loaf in the oven"],
  ["OLIVE","PITS","food","Olives have pits"],
  ["WAFFLE","GRID","food","Waffles have a grid pattern"],
  ["VANILLA","BEAN","food","Vanilla comes from a bean"],
  ["KETTLE","BREW","food","You brew tea in a kettle"],
  ["APRON","CHEF","food","A chef wears an apron"],
  ["SKEWER","MEAT","food","Meat goes on a skewer"],
  ["PANTRY","JARS","food","Jars are stored in the pantry"],
  ["FROSTING","SWRL","food","You swirl frosting on top"],
  ["HARVEST","CROP","food","Crops are gathered at harvest"],
  ["VINEYARD","WINE","food","Wine grapes grow in vineyards"],
  ["SAFFRON","GOLD","food","Saffron has a golden colour"],
  ["SWORD","DUEL","adventure","Swords are used in duels"],
  ["SPELL","WAND","adventure","You cast spells with a wand"],
  ["FLAME","FIRE","adventure","Flames are part of fire"],
  ["CROWN","KING","adventure","A king wears a crown"],
  ["CHEST","GOLD","adventure","Treasure chests hold gold"],
  ["SCROLL","LORE","adventure","Scrolls contain ancient lore"],
  ["ANCHOR","SHIP","adventure","An anchor holds a ship in place"],
  ["TOWER","FORT","adventure","Towers are part of a fort"],
  ["SHIELD","HELM","adventure","Warriors wear shields and helms"],
  ["QUEST","HERO","adventure","A hero goes on a quest"],
  ["RIDDLE","CLUE","adventure","Riddles give you clues"],
  ["VOYAGE","SAIL","adventure","You sail on a voyage"],
  ["DRAGON","LAIR","adventure","Dragons live in lairs"],
  ["DUNGEON","TRAP","adventure","Dungeons are full of traps"],
  ["PIRATE","LOOT","adventure","Pirates hunt for loot"],
  ["CASTLE","MOAT","adventure","Castles are surrounded by moats"],
  ["THRONE","RULE","adventure","You rule from the throne"],
  ["BANDIT","MASK","adventure","Bandits wear masks"],
  ["GOBLIN","CAVE","adventure","Goblins lurk in caves"],
  ["BRIDGE","TOLL","adventure","Trolls charge a toll at the bridge"],
  ["ARROW","MARK","adventure","Arrows hit their mark"],
  ["RANSOM","NOTE","adventure","Ransoms come with a note"],
  ["TEMPLE","IDOL","adventure","Temples hold sacred idols"],
  ["OUTLAW","HIDE","adventure","Outlaws hide from the law"],
  ["COMPASS","MAPS","adventure","You use a compass with maps"],
  ["WIZARD","ROBE","adventure","Wizards wear robes"],
  ["COURT","BALL","sports","You play with a ball on a court"],
  ["PITCH","BOWL","sports","Bowlers bowl from the pitch"],
  ["TRACK","RACE","sports","Races happen on tracks"],
  ["TARGET","DART","sports","You throw darts at a target"],
  ["HELMET","BIKE","sports","You wear a helmet on a bike"],
  ["FIELD","GOAL","sports","You score goals on a field"],
  ["BOXING","RING","sports","Boxing happens in a ring"],
  ["BASKET","HOOP","sports","The basket hangs from the hoop"],
  ["RACKET","LOBS","sports","You lob the ball with a racket"],
  ["TROPHY","WINS","sports","You win trophies for wins"],
  ["RUNNER","MILE","sports","Runners race the mile"],
  ["DIVING","POOL","sports","Divers dive into a pool"],
  ["WHISTLE","FOUL","sports","A whistle is blown for a foul"],
  ["PADDLE","BOAT","sports","You paddle a boat"],
  ["JERSEY","TEAM","sports","Teams wear matching jerseys"],
  ["FINISH","TAPE","sports","Runners break the tape at the finish"],
  ["STUMPS","BATS","sports","You bat in front of the stumps"],
  ["CANVAS","BOUT","sports","Boxers fight a bout on canvas"],
  ["HUDDLE","PLAY","sports","Teams huddle to plan the play"],
  ["SPRINT","DASH","sports","A dash is a short sprint"],
  ["WICKET","SPIN","sports","Spinners aim at the wicket"],
  ["HURDLE","JUMP","sports","You jump over hurdles"],
  ["LEAGUE","RANK","sports","Leagues rank teams by wins"],
  ["DUGOUT","BUNT","sports","Batters bunt from the dugout side"],
  ["BRONZE","MEDAL","sports","Athletes win bronze medals"],
  ["ROCKET","FUEL","space","Rockets need fuel to launch"],
  ["NEBULA","DUST","space","Nebulas are clouds of dust"],
  ["ORBIT","LOOP","space","An orbit is a loop around a body"],
  ["SOLAR","STAR","space","The sun is our solar star"],
  ["COSMO","VOID","space","The cosmos contains the void"],
  ["METEOR","BURN","space","Meteors burn up in the atmosphere"],
  ["LAUNCH","LIFT","space","Rockets lift off at launch"],
  ["COMET","TAIL","space","Comets have a glowing tail"],
  ["GALAXY","SPIN","space","Galaxies spin through space"],
  ["SATURN","RING","space","Saturn has rings"],
  ["HUBBLE","LENS","space","The Hubble uses a giant lens"],
  ["PULSAR","BEAM","space","Pulsars emit beams of light"],
  ["QUASAR","GLOW","space","Quasars glow from far away"],
  ["DEBRIS","JUNK","space","Space junk is orbital debris"],
  ["APOLLO","CREW","space","Apollo missions had a crew"],
  ["EUROPA","MOON","space","Europa is a moon of Jupiter"],
  ["PLUTO","DWRF","space","Pluto is a dwarf planet"],
  ["ZENITH","PEAK","space","Zenith is the peak of the sky"],
  ["PROBE","SCAN","space","Space probes scan distant worlds"],
  ["COSMOS","VAST","space","The cosmos is vast and endless"],
  ["TITAN","HAZE","space","Titan is shrouded in haze"],
  ["VENUS","SMOG","space","Venus is covered in thick smog"],
  ["GUITAR","PICK","music","You play guitar with a pick"],
  ["RHYTHM","BEAT","music","Rhythm is made of beats"],
  ["CHORUS","SING","music","A chorus sings together"],
  ["CYMBAL","BANG","music","Cymbals make a banging sound"],
  ["VIOLIN","BOWS","music","You play violin with a bow"],
  ["RECORD","SPIN","music","Records spin on a turntable"],
  ["MELODY","TUNE","music","A melody is a tune"],
  ["FLUTE","NOTE","music","Flutes play musical notes"],
  ["ENCORE","CLAP","music","The crowd claps for an encore"],
  ["STUDIO","DEMO","music","Demos are recorded in a studio"],
  ["VOLCANO","LAVA","nature","Volcanoes erupt with lava"],
  ["THUNDER","BOOM","nature","Thunder makes a booming sound"],
  ["BLOSSOM","PETAL","nature","Blossoms are made of petals"],
  ["CANYON","GORGE","nature","A canyon is a deep gorge"],
  ["WATERFALL","MIST","nature","Waterfalls create mist"],
  ["AUTUMN","LEAF","nature","Leaves fall in autumn"],
  ["ICEBERG","COLD","nature","Icebergs are extremely cold"],
  ["RAINBOW","ARCH","nature","Rainbows form an arch"],
  ["PRAIRIE","WIND","nature","Wind sweeps across prairies"],
  ["SUNSET","DUSK","nature","Sunset marks the start of dusk"],
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only. Call this once to seed the database.' });
  }

  const db = getPool();
  const client = await db.connect();

  try {
    // Create table
    await client.query(`
      CREATE TABLE IF NOT EXISTS fuzzle_words (
        id SERIAL PRIMARY KEY,
        clue_word VARCHAR(30) NOT NULL,
        mystery_word VARCHAR(10) NOT NULL,
        category VARCHAR(30) NOT NULL,
        connection VARCHAR(100) NOT NULL
      )
    `);

    // Check if already seeded
    const existing = await client.query('SELECT COUNT(*) FROM fuzzle_words');
    if (parseInt(existing.rows[0].count) > 0) {
      return res.json({
        message: `Already seeded with ${existing.rows[0].count} words. Delete rows first to re-seed.`,
        count: parseInt(existing.rows[0].count),
      });
    }

    // Bulk insert
    const values = [];
    const params = [];
    WORD_PAIRS.forEach((pair, i) => {
      const offset = i * 4;
      values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`);
      params.push(pair[0], pair[1], pair[2], pair[3]);
    });

    await client.query(
      `INSERT INTO fuzzle_words (clue_word, mystery_word, category, connection) VALUES ${values.join(', ')}`,
      params
    );

    return res.json({
      message: `Seeded ${WORD_PAIRS.length} word pairs successfully.`,
      count: WORD_PAIRS.length,
    });
  } catch (err) {
    console.error('Seed error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};
