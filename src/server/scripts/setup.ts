import { db } from "~/server/db";

async function setup() {
  console.log("Setting up Campus Compass...");

  // Create UCLA as the pilot university
  const ucla = await db.university.upsert({
    where: { id: "ucla" },
    update: {},
    create: {
      id: "ucla",
      name: "University of California, Los Angeles",
      tz: "America/Los_Angeles",
      centerLat: 34.0689,
      centerLng: -118.4452,
    },
  });

  console.log("Created/updated university:", ucla.name);

  // Create UC Berkeley as a second pilot university
  const berkeley = await db.university.upsert({
    where: { id: "berkeley" },
    update: {},
    create: {
      id: "berkeley",
      name: "University of California, Berkeley",
      tz: "America/Los_Angeles",
      centerLat: 37.8719,
      centerLng: -122.2585,
    },
  });

  console.log("Created/updated university:", berkeley.name);

  // Create San Francisco State University
  const sfsu = await db.university.upsert({
    where: { id: "sfsu" },
    update: {},
    create: {
      id: "sfsu",
      name: "San Francisco State University",
      tz: "America/Los_Angeles",
      centerLat: 37.7238,
      centerLng: -122.4782,
    },
  });

  console.log("Created/updated university:", sfsu.name);

  // Create San José State University
  const sjsu = await db.university.upsert({
    where: { id: "sjsu" },
    update: {},
    create: {
      id: "sjsu",
      name: "San José State University",
      tz: "America/Los_Angeles",
      centerLat: 37.3352,
      centerLng: -121.8811,
    },
  });

  console.log("Created/updated university:", sjsu.name);

  // Create some sample events with coordinates for testing
  const sampleEvents = [
    {
      id: "event-1",
      title: "Computer Science Career Fair",
      description: "Meet top tech companies and explore internship opportunities",
      start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
      location: "Pauley Pavilion",
      coordsLat: 34.0720,
      coordsLng: -118.4441,
      categories: ["Career", "Technology", "Networking"],
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop",
      dedupeKey: "computer-science-career-fair-pauley-pavilion",
      popularity: 85,
    },
    {
      id: "event-2", 
      title: "Free Pizza Night - Engineering Society",
      description: "Join us for free pizza and networking with fellow engineering students",
      start: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      end: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      location: "Engineering VI Building",
      coordsLat: 34.0685,
      coordsLng: -118.4437,
      categories: ["Free Food", "Engineering", "Social"],
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=400&fit=crop",
      dedupeKey: "free-pizza-night-engineering-society",
      popularity: 92,
    },
    {
      id: "event-3",
      title: "UCLA Basketball vs USC",
      description: "Cheer on the Bruins in this rivalry game! Student tickets available.",
      start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      location: "Pauley Pavilion",
      coordsLat: 34.0720,
      coordsLng: -118.4441,
      categories: ["Sports", "Basketball", "School Spirit"],
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=400&fit=crop",
      dedupeKey: "ucla-basketball-vs-usc-pauley-pavilion",
      popularity: 78,
    },
    {
      id: "event-4",
      title: "Study Abroad Information Session",
      description: "Learn about study abroad opportunities and application processes",
      start: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      end: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 1.5 hours later
      location: "Royce Hall",
      coordsLat: 34.0722,
      coordsLng: -118.4427,
      categories: ["Academic", "International", "Information"],
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop",
      dedupeKey: "study-abroad-information-session-royce-hall",
      popularity: 45,
    },
    {
      id: "event-5",
      title: "Greek Life Rush Week Kickoff",
      description: "Meet representatives from all fraternities and sororities on campus",
      start: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      end: new Date(Date.now() + 7 * 60 * 60 * 1000), // 7 hours from now
      location: "Bruin Plaza",
      coordsLat: 34.0709,
      coordsLng: -118.4423,
      categories: ["Greek Life", "Social", "Recruitment"],
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop",
      dedupeKey: "greek-life-rush-week-kickoff-bruin-plaza",
      popularity: 67,
    },
    {
      id: "event-6",
      title: "Meditation and Mindfulness Workshop",
      description: "Learn stress-reduction techniques perfect for college life",
      start: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours from now
      end: new Date(Date.now() + 19 * 60 * 60 * 1000), // 19 hours from now
      location: "Wooden Center",
      coordsLat: 34.0707,
      coordsLng: -118.4448,
      categories: ["Wellness", "Mental Health", "Workshop"],
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
      dedupeKey: "meditation-mindfulness-workshop-wooden-center",
      popularity: 38,
    },
  ];

  for (const eventData of sampleEvents) {
    await db.event.upsert({
      where: { id: eventData.id },
      update: {},
      create: {
        ...eventData,
        universityId: ucla.id,
        sourceIds: [], // No sources for sample data
      },
    });
  }

  console.log(`Created/updated ${sampleEvents.length} sample events for UCLA`);

  // Create some sample events for UC Berkeley
  const berkeleyEvents = [
    {
      id: "berkeley-event-1",
      title: "EECS Career Fair",
      description: "Connect with top tech companies and explore opportunities in electrical engineering and computer science",
      start: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000), // 1.5 days from now
      end: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // 5 hours later
      location: "Memorial Stadium",
      coordsLat: 37.8713,
      coordsLng: -122.2505,
      categories: ["Career", "Technology", "Engineering"],
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop",
      dedupeKey: "eecs-career-fair-memorial-stadium",
      popularity: 90,
    },
    {
      id: "berkeley-event-2",
      title: "Free Burritos - Engineering Student Society",
      description: "Join fellow engineering students for free burritos and networking",
      start: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      end: new Date(Date.now() + 10 * 60 * 60 * 1000), // 10 hours from now
      location: "Soda Hall",
      coordsLat: 37.8758,
      coordsLng: -122.2589,
      categories: ["Free Food", "Engineering", "Social"],
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop",
      dedupeKey: "free-burritos-engineering-student-society",
      popularity: 88,
    },
    {
      id: "berkeley-event-3",
      title: "Cal Bears vs Stanford Cardinal",
      description: "The Big Game! Cheer on the Golden Bears in this historic rivalry match",
      start: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      end: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
      location: "California Memorial Stadium",
      coordsLat: 37.8713,
      coordsLng: -122.2505,
      categories: ["Sports", "Football", "School Spirit"],
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=400&fit=crop",
      dedupeKey: "cal-bears-vs-stanford-cardinal-memorial-stadium",
      popularity: 95,
    },
    {
      id: "berkeley-event-4",
      title: "Study Abroad Fair",
      description: "Explore international study opportunities and exchange programs",
      start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      location: "Wheeler Hall",
      coordsLat: 37.8709,
      coordsLng: -122.2593,
      categories: ["Academic", "International", "Information"],
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop",
      dedupeKey: "study-abroad-fair-wheeler-hall",
      popularity: 52,
    },
    {
      id: "berkeley-event-5",
      title: "Greek Life Meet & Greet",
      description: "Meet representatives from Berkeley's fraternities and sororities",
      start: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
      end: new Date(Date.now() + 15 * 60 * 60 * 1000), // 15 hours from now
      location: "Sproul Plaza",
      coordsLat: 37.8698,
      coordsLng: -122.2585,
      categories: ["Greek Life", "Social", "Recruitment"],
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop",
      dedupeKey: "greek-life-meet-greet-sproul-plaza",
      popularity: 71,
    },
    {
      id: "berkeley-event-6",
      title: "Mindfulness and Stress Relief Workshop",
      description: "Learn meditation and stress management techniques for academic success",
      start: new Date(Date.now() + 20 * 60 * 60 * 1000), // 20 hours from now
      end: new Date(Date.now() + 21.5 * 60 * 60 * 1000), // 1.5 hours later
      location: "Tang Center",
      coordsLat: 37.8692,
      coordsLng: -122.2648,
      categories: ["Wellness", "Mental Health", "Workshop"],
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
      dedupeKey: "mindfulness-stress-relief-workshop-tang-center",
      popularity: 43,
    },
    {
      id: "berkeley-event-7",
      title: "Data Science Club Workshop: Machine Learning Fundamentals",
      description: "Hands-on workshop covering basics of machine learning with Python and scikit-learn",
      start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
      location: "Sutardja Dai Hall",
      coordsLat: 37.8746,
      coordsLng: -122.2587,
      categories: ["Academic", "Technology", "Data Science", "Workshop"],
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop",
      dedupeKey: "data-science-club-ml-workshop-sutardja-dai",
      popularity: 67,
    },
    {
      id: "berkeley-event-8",
      title: "Free Coffee & Pastries - Business School Mixer",
      description: "Network with MBA students and faculty while enjoying free coffee and pastries",
      start: new Date(Date.now() + 14 * 60 * 60 * 1000), // 14 hours from now
      end: new Date(Date.now() + 16 * 60 * 60 * 1000), // 16 hours from now
      location: "Haas School of Business",
      coordsLat: 37.8714,
      coordsLng: -122.2531,
      categories: ["Free Food", "Business", "Networking", "Social"],
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=400&fit=crop",
      dedupeKey: "free-coffee-pastries-business-mixer-haas",
      popularity: 84,
    },
    {
      id: "berkeley-event-9",
      title: "Berkeley Symphony Orchestra Concert",
      description: "Experience beautiful classical music performed by talented Berkeley students",
      start: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
      end: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000), // 2.5 hours later
      location: "Zellerbach Hall",
      coordsLat: 37.8683,
      coordsLng: -122.2595,
      categories: ["Arts", "Music", "Performance", "Culture"],
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
      dedupeKey: "berkeley-symphony-orchestra-concert-zellerbach",
      popularity: 56,
    },
    {
      id: "berkeley-event-10",
      title: "Startup Pitch Competition Finals",
      description: "Watch student entrepreneurs pitch their innovative startups to venture capitalists",
      start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
      location: "Pauley Ballroom",
      coordsLat: 37.8695,
      coordsLng: -122.2598,
      categories: ["Business", "Entrepreneurship", "Competition", "Networking"],
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop",
      dedupeKey: "startup-pitch-competition-finals-pauley-ballroom",
      popularity: 73,
    },
    {
      id: "berkeley-event-11",
      title: "International Food Festival",
      description: "Taste authentic cuisines from around the world prepared by international student organizations",
      start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 6 hours later
      location: "Sproul Plaza",
      coordsLat: 37.8698,
      coordsLng: -122.2585,
      categories: ["Food", "Cultural", "International", "Festival"],
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop",
      dedupeKey: "international-food-festival-sproul-plaza",
      popularity: 91,
    },
    {
      id: "berkeley-event-12",
      title: "Climate Action Research Symposium",
      description: "Learn about cutting-edge research on climate change and sustainability solutions",
      start: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      end: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // 5 hours later
      location: "Li Ka Shing Center",
      coordsLat: 37.8732,
      coordsLng: -122.2655,
      categories: ["Academic", "Research", "Environment", "Science"],
      image: "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800&h=400&fit=crop",
      dedupeKey: "climate-action-research-symposium-li-ka-shing",
      popularity: 49,
    },
    {
      id: "berkeley-event-13",
      title: "Late Night Study Session with Free Snacks",
      description: "Study together during finals week with complimentary coffee, energy bars, and study materials",
      start: new Date(Date.now() + 22 * 60 * 60 * 1000), // 22 hours from now
      end: new Date(Date.now() + 28 * 60 * 60 * 1000), // 28 hours from now (6 hour session)
      location: "Doe Memorial Library",
      coordsLat: 37.8725,
      coordsLng: -122.2593,
      categories: ["Academic", "Study", "Free Food", "Finals"],
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop",
      dedupeKey: "late-night-study-session-doe-library",
      popularity: 78,
    },
    {
      id: "berkeley-event-14",
      title: "Women in STEM Panel Discussion",
      description: "Inspiring panel featuring successful women in science, technology, engineering, and mathematics",
      start: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
      end: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      location: "Pimentel Hall",
      coordsLat: 37.8728,
      coordsLng: -122.2577,
      categories: ["Academic", "STEM", "Women", "Panel", "Career"],
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=400&fit=crop",
      dedupeKey: "women-in-stem-panel-pimentel-hall",
      popularity: 62,
    },
    {
      id: "berkeley-event-15",
      title: "Cal Hiking Club: Mount Tamalpais Adventure",
      description: "Join us for a scenic hike with stunning views of the Bay Area. Transportation provided!",
      start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 8 hours later
      location: "Meet at Sproul Plaza",
      coordsLat: 37.8698,
      coordsLng: -122.2585,
      categories: ["Outdoor", "Recreation", "Hiking", "Adventure"],
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=400&fit=crop",
      dedupeKey: "cal-hiking-club-mount-tamalpais-sproul",
      popularity: 55,
    },
    {
      id: "berkeley-event-16",
      title: "Comedy Night at the Bear's Lair",
      description: "Laugh out loud with stand-up comedy performances by students and local comedians",
      start: new Date(Date.now() + 16 * 60 * 60 * 1000), // 16 hours from now
      end: new Date(Date.now() + 19 * 60 * 60 * 1000), // 19 hours from now
      location: "Bear's Lair Pub",
      coordsLat: 37.8686,
      coordsLng: -122.2601,
      categories: ["Entertainment", "Comedy", "Social", "Performance"],
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
      dedupeKey: "comedy-night-bears-lair-pub",
      popularity: 69,
    },
  ];

  for (const eventData of berkeleyEvents) {
    await db.event.upsert({
      where: { id: eventData.id },
      update: {},
      create: {
        ...eventData,
        universityId: berkeley.id,
        sourceIds: [], // No sources for sample data
      },
    });
  }

  console.log(`Created/updated ${berkeleyEvents.length} sample events for Berkeley`);

  // Create some sample events for San Francisco State University
  const sfsuEvents = [
    {
      id: "sfsu-event-1",
      title: "Tech Career Expo",
      description: "Connect with Bay Area tech companies and explore career opportunities in Silicon Valley",
      start: new Date(Date.now() + 2.5 * 24 * 60 * 60 * 1000), // 2.5 days from now
      end: new Date(Date.now() + 2.5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
      location: "Student Center",
      coordsLat: 37.7225,
      coordsLng: -122.4785,
      categories: ["Career", "Technology", "Networking"],
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop",
      dedupeKey: "tech-career-expo-student-center-sfsu",
      popularity: 82,
    },
    {
      id: "sfsu-event-2",
      title: "Free Tacos - Latino Student Union",
      description: "Celebrate Hispanic Heritage Month with free tacos and cultural activities",
      start: new Date(Date.now() + 10 * 60 * 60 * 1000), // 10 hours from now
      end: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
      location: "Quad",
      coordsLat: 37.7240,
      coordsLng: -122.4780,
      categories: ["Free Food", "Cultural", "Social"],
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop",
      dedupeKey: "free-tacos-latino-student-union-quad",
      popularity: 89,
    },
    {
      id: "sfsu-event-3",
      title: "Gators Basketball vs USF",
      description: "Cheer on the SFSU Gators in this exciting Bay Area rivalry matchup",
      start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      location: "War Memorial Gymnasium",
      coordsLat: 37.7235,
      coordsLng: -122.4775,
      categories: ["Sports", "Basketball", "School Spirit"],
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=400&fit=crop",
      dedupeKey: "gators-basketball-vs-usf-war-memorial-gym",
      popularity: 74,
    },
    {
      id: "sfsu-event-4",
      title: "Creative Writing Workshop",
      description: "Explore your creativity with published authors and fellow writers",
      start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      location: "Humanities Building",
      coordsLat: 37.7245,
      coordsLng: -122.4788,
      categories: ["Academic", "Creative", "Workshop"],
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=400&fit=crop",
      dedupeKey: "creative-writing-workshop-humanities-building",
      popularity: 41,
    },
    {
      id: "sfsu-event-5",
      title: "Golden Gate Park Cleanup",
      description: "Join us for a community service project cleaning up our beautiful neighborhood park",
      start: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
      end: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
      location: "Meet at SFSU Main Entrance",
      coordsLat: 37.7238,
      coordsLng: -122.4782,
      categories: ["Community Service", "Environment", "Volunteer"],
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=400&fit=crop",
      dedupeKey: "golden-gate-park-cleanup-main-entrance",
      popularity: 53,
    },
    {
      id: "sfsu-event-6",
      title: "Mindfulness Meditation Circle",
      description: "Find inner peace and reduce stress with guided meditation sessions",
      start: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      end: new Date(Date.now() + 25 * 60 * 60 * 1000), // 25 hours from now
      location: "Library Quiet Study Room",
      coordsLat: 37.7242,
      coordsLng: -122.4790,
      categories: ["Wellness", "Mental Health", "Meditation"],
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
      dedupeKey: "mindfulness-meditation-circle-library",
      popularity: 36,
    },
    {
      id: "sfsu-event-7",
      title: "Film Festival Screening Night",
      description: "Watch award-winning student films and documentaries from the Cinema Department",
      start: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      end: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
      location: "Creative Arts Building",
      coordsLat: 37.7250,
      coordsLng: -122.4785,
      categories: ["Arts", "Film", "Entertainment", "Student Work"],
      image: "https://images.unsplash.com/photo-1489599510695-42cfde03e0f4?w=800&h=400&fit=crop",
      dedupeKey: "film-festival-screening-creative-arts-building",
      popularity: 58,
    },
    {
      id: "sfsu-event-8",
      title: "Free Coffee & Study Group - Business Students",
      description: "Network with business majors while studying for midterms with free coffee and snacks",
      start: new Date(Date.now() + 15 * 60 * 60 * 1000), // 15 hours from now
      end: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours from now
      location: "Business Building Lounge",
      coordsLat: 37.7232,
      coordsLng: -122.4778,
      categories: ["Free Food", "Business", "Study", "Networking"],
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=400&fit=crop",
      dedupeKey: "free-coffee-study-group-business-building",
      popularity: 76,
    },
  ];

  for (const eventData of sfsuEvents) {
    await db.event.upsert({
      where: { id: eventData.id },
      update: {},
      create: {
        ...eventData,
        universityId: sfsu.id,
        sourceIds: [], // No sources for sample data
      },
    });
  }

  console.log(`Created/updated ${sfsuEvents.length} sample events for SFSU`);

  // Create some sample events for San José State University
  const sjsuEvents = [
    {
      id: "sjsu-event-1",
      title: "Silicon Valley Internship Fair",
      description: "Meet with top Silicon Valley companies offering internships and entry-level positions",
      start: new Date(Date.now() + 1.8 * 24 * 60 * 60 * 1000), // 1.8 days from now
      end: new Date(Date.now() + 1.8 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // 5 hours later
      location: "Student Union Ballroom",
      coordsLat: 37.3360,
      coordsLng: -121.8815,
      categories: ["Career", "Technology", "Internship"],
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop",
      dedupeKey: "silicon-valley-internship-fair-student-union",
      popularity: 93,
    },
    {
      id: "sjsu-event-2",
      title: "Free Boba & Asian Student Association Mixer",
      description: "Connect with the Asian Student Association while enjoying free boba tea and snacks",
      start: new Date(Date.now() + 7 * 60 * 60 * 1000), // 7 hours from now
      end: new Date(Date.now() + 9 * 60 * 60 * 1000), // 9 hours from now
      location: "Student Union Amphitheater",
      coordsLat: 37.3355,
      coordsLng: -121.8810,
      categories: ["Free Food", "Cultural", "Social"],
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
      dedupeKey: "free-boba-asian-student-association-amphitheater",
      popularity: 87,
    },
    {
      id: "sjsu-event-3",
      title: "Spartans Football vs Fresno State",
      description: "Show your Spartan pride at this Mountain West Conference matchup",
      start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
      location: "CEFCU Stadium",
      coordsLat: 37.3340,
      coordsLng: -121.8825,
      categories: ["Sports", "Football", "School Spirit"],
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=400&fit=crop",
      dedupeKey: "spartans-football-vs-fresno-state-cefcu-stadium",
      popularity: 81,
    },
    {
      id: "sjsu-event-4",
      title: "Entrepreneurship Workshop: From Idea to Startup",
      description: "Learn how to turn your business ideas into successful startups with industry mentors",
      start: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      end: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
      location: "Lucas College of Business",
      coordsLat: 37.3365,
      coordsLng: -121.8800,
      categories: ["Business", "Entrepreneurship", "Workshop"],
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop",
      dedupeKey: "entrepreneurship-workshop-lucas-college-business",
      popularity: 65,
    },
    {
      id: "sjsu-event-5",
      title: "Coding Bootcamp: Web Development Basics",
      description: "Learn HTML, CSS, and JavaScript fundamentals in this hands-on coding workshop",
      start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
      location: "Computer Science Building",
      coordsLat: 37.3370,
      coordsLng: -121.8795,
      categories: ["Technology", "Programming", "Workshop"],
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop",
      dedupeKey: "coding-bootcamp-web-dev-computer-science-building",
      popularity: 72,
    },
    {
      id: "sjsu-event-6",
      title: "Mental Health Awareness Week Kickoff",
      description: "Join us for activities promoting mental health awareness and campus resources",
      start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      location: "Paseo de César Chávez",
      coordsLat: 37.3348,
      coordsLng: -121.8808,
      categories: ["Wellness", "Mental Health", "Awareness"],
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop",
      dedupeKey: "mental-health-awareness-week-paseo-cesar-chavez",
      popularity: 44,
    },
    {
      id: "sjsu-event-7",
      title: "International Night Cultural Show",
      description: "Experience diverse cultures through music, dance, and food from around the world",
      start: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
      end: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
      location: "Morris Dailey Auditorium",
      coordsLat: 37.3358,
      coordsLng: -121.8812,
      categories: ["Cultural", "International", "Performance", "Food"],
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop",
      dedupeKey: "international-night-cultural-show-morris-dailey",
      popularity: 85,
    },
    {
      id: "sjsu-event-8",
      title: "Free Pizza Study Session - Engineering Club",
      description: "Study for finals with fellow engineering students while enjoying free pizza",
      start: new Date(Date.now() + 26 * 60 * 60 * 1000), // 26 hours from now
      end: new Date(Date.now() + 30 * 60 * 60 * 1000), // 30 hours from now
      location: "Engineering Building",
      coordsLat: 37.3375,
      coordsLng: -121.8790,
      categories: ["Free Food", "Engineering", "Study", "Finals"],
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=400&fit=crop",
      dedupeKey: "free-pizza-study-session-engineering-building",
      popularity: 90,
    },
    {
      id: "sjsu-event-9",
      title: "Sustainability Fair: Green Campus Initiative",
      description: "Learn about sustainability practices and how to make SJSU more environmentally friendly",
      start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
      location: "Tower Lawn",
      coordsLat: 37.3350,
      coordsLng: -121.8805,
      categories: ["Environment", "Sustainability", "Education"],
      image: "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800&h=400&fit=crop",
      dedupeKey: "sustainability-fair-green-campus-tower-lawn",
      popularity: 47,
    },
    {
      id: "sjsu-event-10",
      title: "Spartan Volleyball vs UC Davis",
      description: "Cheer on the Spartans volleyball team in this exciting conference match",
      start: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      end: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      location: "Spartan Gym",
      coordsLat: 37.3345,
      coordsLng: -121.8820,
      categories: ["Sports", "Volleyball", "School Spirit"],
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=400&fit=crop",
      dedupeKey: "spartan-volleyball-vs-uc-davis-spartan-gym",
      popularity: 63,
    },
  ];

  for (const eventData of sjsuEvents) {
    await db.event.upsert({
      where: { id: eventData.id },
      update: {},
      create: {
        ...eventData,
        universityId: sjsu.id,
        sourceIds: [], // No sources for sample data
      },
    });
  }

  console.log(`Created/updated ${sjsuEvents.length} sample events for SJSU`);
}

setup()
  .then(() => {
    console.log("setup.ts complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
